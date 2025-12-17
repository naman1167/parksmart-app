import { useState } from 'react';
import { Search, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { getBookingByBatchId } from '../../api/bookings';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import MapComponent from '../../components/map/MapComponent';

const BatchIdChecker = () => {
    const [batchId, setBatchId] = useState('');
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!batchId.trim()) {
            setError('Please enter a Batch ID');
            return;
        }

        setLoading(true);
        setError('');
        setSearched(false);

        try {
            const data = await getBookingByBatchId(batchId);
            setBooking(data.data);
            setSearched(true);
        } catch (err) {
            console.error('Error searching batch ID:', err);
            setError(err.response?.data?.message || 'Booking not found with this Batch ID');
            setBooking(null);
            setSearched(true);
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

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <Search className="w-10 h-10 text-indigo-600" />
                    Find Your Spot
                </h1>
                <p className="text-gray-500">Enter your Batch ID to locate your parking spot</p>
            </div>

            {/* Search Form */}
            <div className="max-w-2xl mx-auto mb-12">
                <Card className="p-2 glass-card shadow-2xl border-indigo-100">
                    <form onSubmit={handleSearch} className="flex gap-2 items-center p-1">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Enter Batch ID (e.g., PSM-ABC123)"
                                value={batchId}
                                onChange={(e) => setBatchId(e.target.value.toUpperCase())}
                                className="block w-full pl-12 pr-4 py-4 bg-transparent border-0 text-gray-900 placeholder-gray-400 focus:ring-0 text-lg font-medium"
                                autoComplete="off"
                            />
                        </div>
                        <Button
                            type="submit"
                            loading={loading}
                            className="gradient-primary px-8 py-4 h-full rounded-xl shadow-md hover:shadow-lg transition-all"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </Button>
                    </form>
                </Card>
            </div>

            {/* Error */}
            {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />}

            {/* Results */}
            {searched && booking && (
                <div className="space-y-6">
                    {/* Booking Details */}
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-green-900">Booking Found!</h2>
                                <p className="text-green-700">Batch ID: {booking.referenceCode}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="bg-white p-4 rounded-lg border border-green-200">
                                <p className="text-sm text-gray-500 mb-1">Parking Spot</p>
                                <p className="text-xl font-bold text-gray-900">{booking.spot?.spotNumber}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-green-200">
                                <p className="text-sm text-gray-500 mb-1">Location</p>
                                <p className="text-lg font-semibold text-gray-900">{booking.spot?.location?.name}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-green-200">
                                <p className="text-sm text-gray-500 mb-1">Start Time</p>
                                <p className="text-sm font-medium text-gray-900">{formatDate(booking.startTime)}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-green-200">
                                <p className="text-sm text-gray-500 mb-1">End Time</p>
                                <p className="text-sm font-medium text-gray-900">{formatDate(booking.endTime)}</p>
                            </div>
                        </div>

                        <div className="mt-4 bg-white p-4 rounded-lg border border-green-200">
                            <p className="text-sm text-gray-500 mb-1">Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold 
                                ${booking.status === 'active' ? 'bg-green-100 text-green-700' :
                                    booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'}`}>
                                {booking.status.toUpperCase()}
                            </span>
                        </div>
                    </Card>

                    {/* Map */}
                    {booking.spot && (
                        <Card>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-indigo-600" />
                                Spot Location
                            </h3>
                            <MapComponent
                                spots={[booking.spot]}
                                userLocation={null}
                            />
                            {booking.spot.location?.address && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        <strong>Address:</strong> {booking.spot.location.address}
                                    </p>
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            )}

            {/* No Results */}
            {searched && !booking && !error && (
                <Card className="text-center py-12 bg-gray-50">
                    <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No booking found with this Batch ID</p>
                </Card>
            )}
        </div>
    );
};

export default BatchIdChecker;
