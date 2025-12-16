import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAvailableSpots } from '../../api/spots';
import { createBooking } from '../../api/bookings';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Card from '../../components/common/Card';

const NewBooking = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [spots, setSpots] = useState([]);
    const [formData, setFormData] = useState({
        spot: searchParams.get('spot') || '',
        vehicleNumber: '',
        startTime: '',
        endTime: '',
        amountPaid: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    useEffect(() => {
        loadSpots();
    }, []);

    const loadSpots = async () => {
        try {
            const response = await getAvailableSpots();
            setSpots(response.data);
        } catch (error) {
            console.error('Error loading spots:', error);
        }
    };

    useEffect(() => {
        calculateTotal();
    }, [formData.spot, formData.startTime, formData.endTime]);

    const calculateTotal = () => {
        if (!formData.spot || !formData.startTime || !formData.endTime) {
            setFormData(prev => ({ ...prev, amountPaid: '' }));
            return;
        }

        const selectedSpot = spots.find(s => s._id === formData.spot);
        if (!selectedSpot) return;

        const start = new Date(formData.startTime);
        const end = new Date(formData.endTime);
        const now = new Date();

        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return;
        }

        // Check if end time is after start time
        if (end <= start) {
            setFormData(prev => ({ ...prev, amountPaid: 0 })); // Or show validation error
            return;
        }

        // Calculate hours difference
        const diffInMs = end - start;
        const diffInHours = Math.ceil(diffInMs / (1000 * 60 * 60));

        // Minimum 1 hour charge
        const hoursToCharge = diffInHours < 1 ? 1 : diffInHours;
        const total = hoursToCharge * selectedSpot.pricePerHour;

        setFormData(prev => ({ ...prev, amountPaid: total }));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handlePayment = async (paymentData) => {
        setLoading(true);
        try {
            // Submit booking with payment info
            const bookingPayload = {
                ...formData,
                paymentId: paymentData.paymentId,
                orderId: paymentData.orderId,
                paymentSignature: paymentData.signature,
                paymentStatus: 'completed',
            };

            const response = await createBooking(bookingPayload);
            setSuccess('Booking created successfully!');
            setTimeout(() => navigate(`/bookings/receipt/${response.data._id}`), 1000);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    const handleSkipPayment = async () => {
        // For presentation purposes - skip payment
        setLoading(true);
        try {
            const bookingPayload = {
                ...formData,
                paymentStatus: 'demo',
            };

            const response = await createBooking(bookingPayload);
            setSuccess('Booking created successfully! (Demo Mode - Payment Skipped)');
            setTimeout(() => navigate(`/bookings/receipt/${response.data._id}`), 1000);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Validate all fields
        if (!formData.spot || !formData.vehicleNumber || !formData.startTime || !formData.endTime || !formData.amountPaid) {
            setError('Please fill in all required fields');
            return;
        }

        if (parseFloat(formData.amountPaid) <= 0) {
            setError('Invalid amount calculated');
            return;
        }

        // Show payment options
        setShowPaymentModal(true);
    };

    const handleRazorpayPayment = () => {
        const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID';

        const options = {
            key: RAZORPAY_KEY_ID,
            amount: formData.amountPaid * 100, // Convert to paise
            currency: 'INR',
            name: 'ParkSmart',
            description: 'Parking Spot Booking',
            handler: function (response) {
                handlePayment({
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id,
                });
            },
            prefill: {
                name: '',
                email: '',
                contact: '',
            },
            theme: {
                color: '#6366f1',
            },
            modal: {
                ondismiss: function () {
                    setShowPaymentModal(false);
                },
            },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Booking</h1>
            <p className="text-gray-500 mb-8">Reserve your perfect parking spot</p>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} />}

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select Parking Spot <span className="text-pink-400">*</span>
                        </label>
                        <select
                            name="spot"
                            value={formData.spot}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-gray-900 shadow-sm"
                            required
                        >
                            <option value="" className="text-gray-500">Choose a spot...</option>
                            {spots.map((spot) => (
                                <option key={spot._id} value={spot._id}>
                                    {spot.spotNumber} - {spot.location.name} (₹{spot.pricePerHour}/hr)
                                </option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Vehicle Number (License Plate)"
                        type="text"
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                        placeholder="e.g., MH01AB1234"
                        required
                    />

                    <Input
                        label="Start Time"
                        type="datetime-local"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="End Time"
                        type="datetime-local"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                    />

                    <div>
                        <Input
                            label="Total Amount (₹)"
                            type="number"
                            name="amountPaid"
                            value={formData.amountPaid}
                            readOnly
                            placeholder="Calculated automatically"
                            className="bg-gray-100 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            * Charged based on hourly rate (rounded up)
                        </p>
                    </div>

                    <div className="flex space-x-4">
                        <Button type="submit" className="flex-1 gradient-primary" loading={loading}>
                            Create Booking
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate('/parking-spots')}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-md w-full">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Payment Method</h2>
                        <p className="text-gray-600 mb-6">
                            Total Amount: <span className="text-2xl font-bold text-indigo-600">₹{formData.amountPaid}</span>
                        </p>

                        <div className="space-y-3">
                            <Button
                                onClick={handleRazorpayPayment}
                                className="w-full gradient-primary flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                                </svg>
                                Pay with Razorpay
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-400">For Presentation</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleSkipPayment}
                                variant="outline"
                                className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                                loading={loading}
                            >
                                Skip Payment (Demo Mode)
                            </Button>

                            <Button
                                onClick={() => setShowPaymentModal(false)}
                                variant="secondary"
                                className="w-full"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default NewBooking;
