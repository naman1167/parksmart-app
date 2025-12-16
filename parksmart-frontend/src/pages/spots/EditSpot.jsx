import { useState, useEffect } from 'react';
import { CheckCircle, Sparkles, Info, MapPin, ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSpotById, updateSpot } from '../../api/spots';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import LocationPicker from '../../components/map/LocationPicker';
import Loader from '../../components/common/Loader';

const EditSpot = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Coordinates state
    const [selectedLocation, setSelectedLocation] = useState(null);

    const [formData, setFormData] = useState({
        spotNumber: '',
        locationName: '',
        locationAddress: '',
        pricePerHour: '',
        isAvailable: true,
        difficultyLevel: 'Easy',
        difficultyReasons: [],
        difficultyNotes: '',
    });

    useEffect(() => {
        loadSpot();
    }, [id]);

    const loadSpot = async () => {
        try {
            const spot = await getSpotById(id);
            setFormData({
                spotNumber: spot.spotNumber,
                locationName: spot.location.name,
                locationAddress: spot.location.address,
                pricePerHour: spot.pricePerHour,
                isAvailable: spot.isAvailable,
                difficultyLevel: spot.difficultyLevel || 'Easy',
                difficultyReasons: spot.difficultyReasons || [],
                difficultyNotes: spot.difficultyNotes || '',
            });

            // Set location coordinates if available [lng, lat]
            if (spot.location.coordinates && spot.location.coordinates.coordinates) {
                const [lng, lat] = spot.location.coordinates.coordinates;
                setSelectedLocation({ lat, lng });
            }
        } catch (err) {
            console.error('Error loading spot:', err);
            setError('Failed to load spot details');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        setError('');
    };

    const handleLocationSelect = (latlng) => {
        setSelectedLocation(latlng);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        if (!selectedLocation) {
            setError('Please confirm the location on the map');
            setSubmitting(false);
            return;
        }

        try {
            const spotData = {
                spotNumber: formData.spotNumber.trim(),
                location: {
                    name: formData.locationName.trim(),
                    address: formData.locationAddress.trim(),
                    coordinates: {
                        type: 'Point',
                        coordinates: [selectedLocation.lng, selectedLocation.lat],
                    },
                },
                pricePerHour: parseFloat(formData.pricePerHour),
                isAvailable: formData.isAvailable,
                difficultyLevel: formData.difficultyLevel,
                difficultyReasons: formData.difficultyReasons,
                difficultyNotes: formData.difficultyNotes,
            };

            await updateSpot(id, spotData);
            setSuccess(true);

            setTimeout(() => {
                navigate('/parking-spots');
            }, 1000);
        } catch (err) {
            console.error('Error updating spot:', err);
            setError(err.response?.data?.message || 'Failed to update parking spot');
            setSubmitting(false);
        }
    };

    if (loading) return <Loader fullScreen />;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <Button
                    variant="text"
                    onClick={() => navigate('/parking-spots')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 pl-0 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Spots
                </Button>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Spot {formData.spotNumber}</h1>
                <p className="text-gray-600">Update parking spot details</p>
            </div>

            {success && (
                <Alert
                    type="success"
                    message="Spot updated successfully! Redirecting..."
                    className="mb-6"
                />
            )}

            {error && (
                <Alert
                    type="error"
                    message={error}
                    onClose={() => setError('')}
                    className="mb-6"
                />
            )}

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Spot Number"
                        type="text"
                        name="spotNumber"
                        value={formData.spotNumber}
                        onChange={handleChange}
                        required
                        disabled={submitting || success}
                    />

                    <Input
                        label="Location Name"
                        type="text"
                        name="locationName"
                        value={formData.locationName}
                        onChange={handleChange}
                        required
                        disabled={submitting || success}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location Address *
                        </label>
                        <textarea
                            name="locationAddress"
                            value={formData.locationAddress}
                            onChange={handleChange}
                            required
                            disabled={submitting || success}
                            rows={2}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white text-gray-900 disabled:bg-gray-100 placeholder:text-gray-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-indigo-600" />
                            Update Location on Map
                        </label>
                        <LocationPicker
                            onLocationSelect={handleLocationSelect}
                            initialLocation={selectedLocation}
                        />
                    </div>

                    <Input
                        label="Price Per Hour (₹)"
                        type="number"
                        name="pricePerHour"
                        value={formData.pricePerHour}
                        onChange={handleChange}
                        min="1"
                        required
                        disabled={submitting || success}
                    />

                    {/* Difficulty Assessment */}
                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-4">
                        <h3 className="font-semibold text-orange-800 flex items-center gap-2">
                            Parking Difficulty Assessment
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                            <div className="flex gap-4">
                                {['Easy', 'Medium', 'Hard'].map((level) => (
                                    <label key={level} className="flex-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="difficultyLevel"
                                            value={level}
                                            checked={formData.difficultyLevel === level}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                            disabled={submitting || success}
                                        />
                                        <div className={`text-center py-2 rounded-lg border transition-all 
                                            active:scale-95 peer-checked:ring-2 peer-checked:ring-offset-1
                                            ${level === 'Easy' ? 'border-green-200 peer-checked:bg-green-100 peer-checked:border-green-500 peer-checked:text-green-700 text-green-600 hover:bg-green-50' :
                                                level === 'Medium' ? 'border-yellow-200 peer-checked:bg-yellow-100 peer-checked:border-yellow-500 peer-checked:text-yellow-700 text-yellow-600 hover:bg-yellow-50' :
                                                    'border-red-200 peer-checked:bg-red-100 peer-checked:border-red-500 peer-checked:text-red-700 text-red-600 hover:bg-red-50'
                                            }
                                        `}>
                                            {level}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                        <input
                            type="checkbox"
                            name="isAvailable"
                            checked={formData.isAvailable}
                            onChange={handleChange}
                            disabled={submitting || success}
                            id="isAvailable"
                            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Mark as available immediately
                        </label>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            type="submit"
                            className="flex-1 gradient-primary flex items-center justify-center gap-2"
                            loading={submitting}
                            disabled={success}
                        >
                            {submitting ? 'Saving...' : success ? <><CheckCircle className="w-5 h-5" /> Saved!</> : <><Save className="w-5 h-5" /> Save Changes</>}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/parking-spots')}
                            disabled={submitting || success}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default EditSpot;
