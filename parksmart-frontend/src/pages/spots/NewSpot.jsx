import { useState } from 'react';
import { CheckCircle, Sparkles, Info, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createSpot } from '../../api/spots';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import LocationPicker from '../../components/map/LocationPicker';

const NewSpot = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
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
        setLoading(true);
        setError('');

        // Validation
        if (!formData.spotNumber || !formData.locationName || !formData.locationAddress || !formData.pricePerHour) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        if (parseFloat(formData.pricePerHour) <= 0) {
            setError('Price per hour must be greater than 0');
            setLoading(false);
            return;
        }

        if (!selectedLocation) {
            setError('Please select a location on the map');
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
                        coordinates: [selectedLocation.lng, selectedLocation.lat], // Leaflet is {lat, lng}, Mongo needs [lng, lat]
                    },
                },
                pricePerHour: parseFloat(formData.pricePerHour),
                isAvailable: formData.isAvailable,
                difficultyLevel: formData.difficultyLevel,
                difficultyReasons: formData.difficultyReasons,
                difficultyNotes: formData.difficultyNotes,
            };

            await createSpot(spotData);
            setSuccess(true);

            // Show success message for 1.5 seconds then redirect
            setTimeout(() => {
                navigate('/parking-spots');
            }, 1500);
        } catch (err) {
            console.error('Error creating spot:', err);
            setError(err.response?.data?.message || 'Failed to create parking spot');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gradient mb-2">Add New Parking Spot</h1>
                <p className="text-gray-600">Create a new parking spot in the system</p>
            </div >

            {/* Success Alert */}
            {success && (
                <Alert
                    type="success"
                    message="Parking spot created successfully! Redirecting..."
                    className="mb-6"
                />
            )}

            {/* Error Alert */}
            {error && (
                <Alert
                    type="error"
                    message={error}
                    onClose={() => setError('')}
                    className="mb-6"
                />
            )}

            {/* Form Card */}
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Spot Number */}
                    <Input
                        label="Spot Number"
                        type="text"
                        name="spotNumber"
                        value={formData.spotNumber}
                        onChange={handleChange}
                        placeholder="e.g., A-101, B-205"
                        required
                        disabled={loading || success}
                    />

                    {/* Location Name */}
                    <Input
                        label="Location Name"
                        type="text"
                        name="locationName"
                        value={formData.locationName}
                        onChange={handleChange}
                        placeholder="e.g., Downtown Mall, Airport Parking"
                        required
                        disabled={loading || success}
                    />

                    {/* Location Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location Address *
                        </label>
                        <textarea
                            name="locationAddress"
                            value={formData.locationAddress}
                            onChange={handleChange}
                            placeholder="e.g., 123 Main St, City Center"
                            required
                            disabled={loading || success}
                            rows={2}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Map Location Picker */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-indigo-600" />
                            Pin Exact Location on Map *
                        </label>
                        <LocationPicker
                            onLocationSelect={handleLocationSelect}
                            initialLocation={selectedLocation}
                        />
                        <p className="text-xs text-gray-500 mt-2 italic">
                            Click on the map to place the pin at the exact parking entrance.
                        </p>
                    </div>

                    {/* Price Per Hour */}
                    <Input
                        label="Price Per Hour (₹)"
                        type="number"
                        name="pricePerHour"
                        value={formData.pricePerHour}
                        onChange={handleChange}
                        placeholder="e.g., 50"
                        min="1"
                        step="1"
                        required
                        disabled={loading || success}
                    />

                    {/* Difficulty Assessment */}
                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-4">
                        <h3 className="font-semibold text-orange-800 flex items-center gap-2">
                            Parking Difficulty Assessment
                        </h3>

                        {/* Difficulty Level */}
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
                                            disabled={loading || success}
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

                        {/* Difficulty Reasons */}
                        {formData.difficultyLevel !== 'Easy' && (
                            <div className="animate-fade-in">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reasons (Select all that apply)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Narrow space', 'Pillar nearby', 'Basement sharp turn', 'Low ceiling', 'Steep ramp', 'Tight corner'].map((reason) => (
                                        <label key={reason} className="flex items-center gap-2 p-2 border border-orange-100 rounded-lg hover:bg-orange-100/50 cursor-pointer bg-white">
                                            <input
                                                type="checkbox"
                                                checked={formData.difficultyReasons.includes(reason)}
                                                onChange={(e) => {
                                                    const newReasons = e.target.checked
                                                        ? [...formData.difficultyReasons, reason]
                                                        : formData.difficultyReasons.filter(r => r !== reason);
                                                    setFormData({ ...formData, difficultyReasons: newReasons });
                                                }}
                                                className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                                                disabled={loading || success}
                                            />
                                            <span className="text-sm text-gray-700">{reason}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Admin Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes (Optional)</label>
                            <input
                                type="text"
                                name="difficultyNotes"
                                value={formData.difficultyNotes}
                                onChange={handleChange}
                                placeholder="e.g., Best for compact cars"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm"
                                disabled={loading || success}
                            />
                        </div>
                    </div>

                    {/* Availability Checkbox */}
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                        <input
                            type="checkbox"
                            name="isAvailable"
                            checked={formData.isAvailable}
                            onChange={handleChange}
                            disabled={loading || success}
                            id="isAvailable"
                            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:cursor-not-allowed"
                        />
                        <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Mark as available immediately
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <Button
                            type="submit"
                            className="flex-1 gradient-primary flex items-center justify-center gap-2"
                            loading={loading}
                            disabled={success}
                        >
                            {loading ? 'Creating...' : success ? <><CheckCircle className="w-5 h-5" /> Created!</> : <><Sparkles className="w-5 h-5" /> Create Parking Spot</>}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/parking-spots')}
                            disabled={loading || success}
                            className="px-8 bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Info Card */}
            <Card className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-start gap-3">
                    <Info className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-700">
                        <p className="font-semibold mb-1">Tips:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            <li>Use clear, unique spot numbers (e.g., A-101, B-205)</li>
                            <li>Provide detailed location information for better user experience</li>
                            <li><strong>Pin the exact location</strong> on the map where the car should park</li>
                            <li>Set competitive pricing based on location and amenities</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default NewSpot;
