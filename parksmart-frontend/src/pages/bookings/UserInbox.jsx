import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, FileText, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { getMyBookings } from '../../api/bookings';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';

const UserInbox = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const response = await getMyBookings();
            setBookings(response.data);
        } catch (err) {
            console.error('Error loading inbox:', err);
            setError('Failed to load your tickets');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-700 border-green-300',
            completed: 'bg-blue-100 text-blue-700 border-blue-300',
            cancelled: 'bg-red-100 text-red-700 border-red-300',
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
    };

    if (loading) return <Loader fullScreen />;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <Inbox className="w-10 h-10 text-indigo-600" />
                    Your Inbox
                </h1>
                <p className="text-gray-500">View all your parking tickets and receipts</p>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />}

            {bookings.length === 0 ? (
                <Card className="text-center py-12">
                    <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No tickets found</p>
                    <Link to="/bookings/new">
                        <Button variant="primary">Create New Booking</Button>
                    </Link>
                </Card>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <Card key={booking._id} className="card-hover border-gray-200">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                Ticket #{booking.referenceCode || booking._id.slice(-6)}
                                            </h3>
                                            <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                                                {booking.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-indigo-500" />
                                            <span><strong>Spot:</strong> {booking.spot?.spotNumber} - {booking.spot?.location?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-700">Vehicle:</span>
                                            <span className="bg-gray-100 px-2 rounded text-gray-800 font-mono text-sm">{booking.vehicleNumber || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-indigo-500" />
                                            <span><strong>Start:</strong> {formatDate(booking.startTime)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-indigo-500" />
                                            <span><strong>End:</strong> {formatDate(booking.endTime)}</span>
                                        </div>
                                        <div className="text-lg font-bold text-indigo-600">
                                            ₹{booking.amountPaid}
                                        </div>
                                    </div>
                                </div>

                                <Link to={`/bookings/receipt/${booking._id}`}>
                                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4" />
                                        View Receipt
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserInbox;
