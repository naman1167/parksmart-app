import { useState, useEffect } from 'react';
import { getMyBookings } from '../../api/bookings';
import { createPanicRequest } from '../../api/panicApi';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { AlertTriangle, X, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPanicModal, setShowPanicModal] = useState(false);
    const [selectedBookingForPanic, setSelectedBookingForPanic] = useState(null);
    const [panicIssue, setPanicIssue] = useState('Car not starting');
    const [panicMessage, setPanicMessage] = useState('');
    const [panicLoading, setPanicLoading] = useState(false);
    const [panicSuccess, setPanicSuccess] = useState(false);
    const [panicError, setPanicError] = useState('');

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const response = await getMyBookings();
            setBookings(response.data);
        } catch (error) {
            console.error('Error loading bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };

    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/50',
            completed: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/50',
            cancelled: 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border border-red-500/50',
        };
        return colors[status] || 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border border-gray-500/50';
    };

    const handlePanicSubmit = async (e) => {
        e.preventDefault();
        setPanicLoading(true);
        setPanicError('');

        try {
            await createPanicRequest({
                bookingId: selectedBookingForPanic._id,
                issueType: panicIssue,
                message: panicMessage,
                // location: could be added here if we had lat/lng
            });
            setPanicSuccess(true);
            setTimeout(() => {
                setShowPanicModal(false);
                setPanicSuccess(false);
                setPanicMessage('');
                setPanicIssue('Car not starting');
            }, 2000);
        } catch (err) {
            console.error(err);
            setPanicError(err.response?.data?.message || 'Failed to send request');
        } finally {
            setPanicLoading(false);
        }
    };

    if (loading) return <Loader fullScreen />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Bookings</h1>
            <p className="text-gray-500 mb-8">View and manage all your parking reservations</p>

            {bookings.length === 0 ? (
                <Card>
                    <p className="text-center text-gray-500 py-8">
                        You haven't made any bookings yet.
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <Card key={booking._id} className="card-hover">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {booking.spot?.spotNumber || 'N/A'}
                                        </h3>
                                        <span className={`ml-4 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                                            {booking.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p>
                                            <span className="font-medium text-indigo-600">Location:</span> {booking.spot?.location.name}
                                        </p>
                                        <p>
                                            <span className="font-medium text-indigo-600">Start:</span> {formatDate(booking.startTime)}
                                        </p>
                                        <p>
                                            <span className="font-medium text-indigo-600">End:</span> {formatDate(booking.endTime)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-3">
                                    <p className="text-2xl font-bold text-indigo-600">₹{booking.amountPaid}</p>

                                    {/* Actions */}
                                    <div className="flex flex-col items-end gap-2 mt-2">
                                        {/* Find with AR */}
                                        <Link
                                            to={`/ar/find-car?lat=${booking.spot?.location?.coordinates?.[1] || 19.0760}&lng=${booking.spot?.location?.coordinates?.[0] || 72.8777}&spot=${booking.spot?.spotNumber}`}
                                            className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-indigo-200"
                                        >
                                            <Navigation className="w-4 h-4" /> AR Find Car
                                        </Link>

                                        {/* Panic Button for Active Bookings */}
                                        {booking.status === 'active' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedBookingForPanic(booking);
                                                    setShowPanicModal(true);
                                                }}
                                                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-red-200 animate-pulse"
                                            >
                                                <AlertTriangle className="w-4 h-4" /> Need Help?
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Panic Modal */}
            {showPanicModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in relative">
                        <button
                            onClick={() => setShowPanicModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Emergency Assistance</h2>
                            <p className="text-gray-500 mt-2">
                                Use this if you are stuck or facing issues with your parking spot.
                            </p>
                        </div>

                        {panicSuccess ? (
                            <Alert type="success" message="Request sent! Help is on the way." className="mb-4" />
                        ) : (
                            <form onSubmit={handlePanicSubmit} className="space-y-4">
                                {panicError && <Alert type="error" message={panicError} />}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
                                    <select
                                        value={panicIssue}
                                        onChange={(e) => setPanicIssue(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-red-500 focus:border-red-500 outline-none"
                                    >
                                        <option>Car not starting</option>
                                        <option>Exit blocked</option>
                                        <option>Lost ticket</option>
                                        <option>Safety concern</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                                    <textarea
                                        value={panicMessage}
                                        onChange={(e) => setPanicMessage(e.target.value)}
                                        placeholder="Describe your issue..."
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-red-500 focus:border-red-500 outline-none"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    loading={panicLoading}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white shadow-red-500/20"
                                >
                                    Send Panic Request
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBookings;
