import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle, Home, Printer, Copy } from 'lucide-react';
import { getMyBookings } from '../../api/bookings';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const Receipt = () => {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadBooking();
    }, [id]);

    const loadBooking = async () => {
        try {
            // In a real app, we might have a specific getBookingById endpoint
            // For now, we'll fetch my bookings and find the one
            // NOTE: This assumes the user is logged in and owns the booking
            const response = await getMyBookings();
            const foundBooking = response.data.find(b => b._id === id);

            if (foundBooking) {
                setBooking(foundBooking);
            } else {
                setError('Booking not found or access denied');
            }
        } catch (err) {
            console.error('Error loading receipt:', err);
            setError('Failed to load receipt details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader fullScreen />;

    if (error) {
        return (
            <div className="max-w-md mx-auto mt-20 text-center">
                <Card className="border-red-100">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link to="/bookings">
                        <Button variant="secondary">Go to My Bookings</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    if (!booking) return null;

    return (
        <div className="max-w-lg mx-auto px-4 py-12">
            <Card className="text-center relative border-gray-200 shadow-xl">
                {/* Success Header */}
                <div className="bg-emerald-50 -mx-8 -mt-8 p-8 mb-8 border-b border-emerald-100 rounded-t-2xl">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-emerald-900 mb-1">Booking Confirmed!</h1>
                    <p className="text-emerald-700">Thank you for using ParkSmart</p>
                </div>

                {/* QR Code Section */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
                        <QRCodeSVG
                            value={booking.referenceCode || booking._id}
                            size={180}
                            level="H"
                            includeMargin={true}
                        />
                    </div>
                    <p className="text-sm text-gray-500 mb-2">Scan at entry terminal</p>

                    <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Batch ID</span>
                        <code className="text-lg font-mono font-bold text-indigo-600">
                            {booking.referenceCode || 'N/A'}
                        </code>
                        <button
                            className="text-gray-400 hover:text-indigo-600 transition"
                            onClick={() => navigator.clipboard.writeText(booking.referenceCode)}
                            title="Copy Batch ID"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-4 mb-8 text-left bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Parking Spot</span>
                        <span className="font-semibold text-gray-900">{booking.spot?.spotNumber || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Vehicle Number</span>
                        <span className="font-semibold text-gray-900">{booking.vehicleNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Location</span>
                        <span className="font-semibold text-gray-900 text-right">{booking.spot?.location?.name || 'Unknown'}</span>
                    </div>
                    <div className="h-px bg-gray-200 my-2"></div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Start Time</span>
                        <span className="font-semibold text-gray-900 text-right">
                            {new Date(booking.startTime).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">End Time</span>
                        <span className="font-semibold text-gray-900 text-right">
                            {new Date(booking.endTime).toLocaleString()}
                        </span>
                    </div>
                    <div className="h-px bg-gray-200 my-2"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium">Amount Paid</span>
                        <span className="text-2xl font-bold text-indigo-600">₹{booking.amountPaid}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <Link to="/" className="flex-1">
                        <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                            <Home className="w-4 h-4" /> Home
                        </Button>
                    </Link>
                    <Button
                        onClick={() => window.print()}
                        className="flex-1 gradient-primary flex items-center justify-center gap-2"
                    >
                        <Printer className="w-4 h-4" /> Print
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default Receipt;
