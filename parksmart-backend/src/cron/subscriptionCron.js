const cron = require('node-cron');
const Subscription = require('../models/Subscription');

/**
 * Cron job to disable expired subscriptions
 * Runs daily at midnight (00:00)
 */
const disableExpiredSubscriptions = cron.schedule('0 0 * * *', async () => {
    try {
        console.log('🔄 Running subscription expiry check...');

        const now = new Date();

        // Find all active subscriptions that have expired
        const expiredSubscriptions = await Subscription.find({
            isActive: true,
            endDate: { $lte: now },
        });

        if (expiredSubscriptions.length === 0) {
            console.log('✅ No expired subscriptions found');
            return;
        }

        // Disable expired subscriptions
        for (const subscription of expiredSubscriptions) {
            subscription.isActive = false;
            await subscription.save();
            console.log(`   Disabled subscription for user: ${subscription.user}`);
        }

        console.log(`✅ Disabled ${expiredSubscriptions.length} expired subscription(s)`);
    } catch (error) {
        console.error('❌ Error in subscription expiry cron job:', error.message);
    }
});

/**
 * Start the cron job
 */
const startCronJobs = () => {
    disableExpiredSubscriptions.start();
    console.log('⏰ Subscription expiry cron job started (runs daily at midnight)');
};

/**
 * Stop all cron jobs (useful for graceful shutdown)
 */
const stopCronJobs = () => {
    disableExpiredSubscriptions.stop();
    console.log('⏰ Cron jobs stopped');
};

module.exports = {
    startCronJobs,
    stopCronJobs,
};
