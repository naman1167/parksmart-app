const PricingRule = require('../models/PricingRule');

/**
 * Calculate dynamic price based on pricing rules
 * @param {String} spotId - Parking spot ID
 * @param {Date} startTime - Booking start time
 * @param {Number} duration - Duration in hours
 * @param {Number} basePrice - Base price per hour
 * @returns {Promise<Object>} Calculated price and applied rules
 */
const calculateDynamicPrice = async (spotId, startTime, duration, basePrice) => {
    try {
        // Get active pricing rules
        const rules = await PricingRule.find({
            isActive: true,
            $or: [
                { parkingSpot: spotId },
                { parkingSpot: null }, // Global rules
            ],
        }).sort({ priority: -1 });

        let totalMultiplier = 1;
        const appliedRules = [];

        const startHour = new Date(startTime).getHours();
        const dayOfWeek = new Date(startTime).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

        for (const rule of rules) {
            let ruleApplies = true;

            // Check if rule applies to this day
            if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
                if (!rule.daysOfWeek.includes(dayOfWeek)) {
                    ruleApplies = false;
                }
            }

            // Check if rule applies to this hour
            if (ruleApplies && rule.peakHours && rule.peakHours.length > 0) {
                const hourMatches = rule.peakHours.some(range => {
                    if (range.start <= range.end) {
                        return startHour >= range.start && startHour < range.end;
                    } else {
                        // Handles overnight ranges (e.g., 22:00 - 02:00)
                        return startHour >= range.start || startHour < range.end;
                    }
                });

                if (!hourMatches) {
                    ruleApplies = false;
                }
            }

            // Apply multiplier if rule applies
            if (ruleApplies) {
                totalMultiplier *= rule.multiplier;
                appliedRules.push({
                    name: rule.name,
                    multiplier: rule.multiplier,
                });
            }
        }

        const finalPrice = basePrice * duration * totalMultiplier;

        return {
            basePrice,
            duration,
            totalMultiplier,
            finalPrice: parseFloat(finalPrice.toFixed(2)),
            appliedRules,
            isPeakHour: totalMultiplier > 1,
        };
    } catch (error) {
        throw new Error(`Price calculation failed: ${error.message}`);
    }
};

/**
 * Get active pricing rules for a spot
 * @param {String} spotId - Parking spot ID
 * @returns {Promise<Array>} Active rules
 */
const getActiveRules = async (spotId) => {
    const rules = await PricingRule.find({
        isActive: true,
        $or: [
            { parkingSpot: spotId },
            { parkingSpot: null },
        ],
    }).sort({ priority: -1 });

    return rules;
};

/**
 * Check if current time is peak hour
 * @param {Date} time - Time to check
 * @returns {Promise<Boolean>} Is peak hour
 */
const isPeakHour = async (time = new Date()) => {
    const hour = time.getHours();
    const dayOfWeek = time.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    const rules = await PricingRule.find({ isActive: true });

    for (const rule of rules) {
        let ruleApplies = true;

        if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
            if (!rule.daysOfWeek.includes(dayOfWeek)) {
                ruleApplies = false;
            }
        }

        if (ruleApplies && rule.peakHours && rule.peakHours.length > 0) {
            const hourMatches = rule.peakHours.some(range => {
                if (range.start <= range.end) {
                    return hour >= range.start && hour < range.end;
                } else {
                    return hour >= range.start || hour < range.end;
                }
            });

            if (hourMatches && rule.multiplier > 1) {
                return true;
            }
        }
    }

    return false;
};

module.exports = {
    calculateDynamicPrice,
    getActiveRules,
    isPeakHour,
};
