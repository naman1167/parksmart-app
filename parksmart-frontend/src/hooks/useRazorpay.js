import { useEffect } from 'react';
import { CreditCard } from 'lucide-react';

const useRazorpay = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);
};

const RazorpayPayment = ({ amount, onSuccess, onFailure, bookingData }) => {
    useRazorpay();

    const handlePayment = () => {
        // TODO: Replace with your actual Razorpay keys
        const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID';

        const options = {
            key: RAZORPAY_KEY_ID,
            amount: amount * 100, // Convert to paise
            currency: 'INR',
            name: 'ParkSmart',
            description: `Parking booking for ${bookingData?.spotNumber || 'Spot'}`,
            image: '/logo.png', // Add your logo
            handler: function (response) {
                // Payment successful
                onSuccess({
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id,
                    signature: response.razorpay_signature,
                });
            },
            prefill: {
                name: bookingData?.userName || '',
                email: bookingData?.userEmail || '',
                contact: bookingData?.userPhone || '',
            },
            notes: {
                spot: bookingData?.spotNumber || '',
                startTime: bookingData?.startTime || '',
                endTime: bookingData?.endTime || '',
            },
            theme: {
                color: '#6366f1', // Indigo color
            },
            modal: {
                ondismiss: function () {
                    onFailure({ error: 'Payment cancelled by user' });
                },
            },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', function (response) {
            onFailure({
                error: response.error.description,
                code: response.error.code,
                source: response.error.source,
                step: response.error.step,
                reason: response.error.reason,
            });
        });

        razorpay.open();
    };

    return { handlePayment };
};

export default RazorpayPayment;
