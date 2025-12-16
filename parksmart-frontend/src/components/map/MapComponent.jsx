import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { MapPin, Navigation } from 'lucide-react';
import Button from '../common/Button';
import { useEffect } from 'react';

// Fix for Leaflet marker icons in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map view updates
const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15, {
                duration: 1.5
            });
        }
    }, [center, map]);
    return null;
};

const MapComponent = ({ spots, userLocation }) => {
    // Default center (e.g., Delhi) if no user location
    const defaultCenter = [28.6139, 77.2090];

    // Determine priority center:
    // 1. If explicitly one spot (e.g. found booking), focus on it
    // 2. Else User Location
    // 3. Else Default

    let center = defaultCenter;

    if (spots && spots.length === 1 && spots[0].location?.coordinates) {
        const spot = spots[0];
        if (spot.location.coordinates.coordinates) {
            center = [spot.location.coordinates.coordinates[1], spot.location.coordinates.coordinates[0]];
        } else if (spot.location.coordinates.lat) {
            center = [spot.location.coordinates.lat, spot.location.coordinates.lng];
        }
    } else if (userLocation) {
        center = [userLocation.latitude, userLocation.longitude];
    }

    // Helper to extract coordinates safely for markers
    const getCoordinates = (spot) => {
        const defaultSpotCoords = [28.6139, 77.2090];

        if (!spot.location?.coordinates) return defaultSpotCoords;

        const coords = spot.location.coordinates;

        // Handle GeoJSON format { type: 'Point', coordinates: [lng, lat] }
        if (coords.coordinates && Array.isArray(coords.coordinates)) {
            return [coords.coordinates[1], coords.coordinates[0]]; // Leaflet uses [lat, lng]
        }

        // Handle Legacy { lat, lng } format
        if (coords.lat && coords.lng) {
            return [coords.lat, coords.lng];
        }

        return defaultSpotCoords;
    };

    return (
        <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 z-0 relative">
            <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <MapUpdater center={center} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Location Marker */}
                {userLocation && (
                    <Marker position={[userLocation.latitude, userLocation.longitude]}>
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold text-indigo-600 flex items-center gap-2">
                                    <Navigation className="w-4 h-4" /> You are here
                                </h3>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Parking Spots Markers */}
                {spots.map((spot) => (
                    <Marker
                        key={spot._id}
                        position={getCoordinates(spot)}
                    >
                        <Popup>
                            <div className="p-2 min-w-[200px]">
                                <h3 className="font-bold text-gray-900 mb-1">{spot.spotNumber}</h3>
                                <p className="text-sm text-gray-600 mb-2">{spot.location.name}</p>
                                <p className="text-sm font-semibold text-indigo-600 mb-3">₹{spot.pricePerHour}/hr</p>

                                {spot.isAvailable ? (
                                    <Link to={`/bookings/new?spot=${spot._id}`}>
                                        <Button size="sm" className="w-full gradient-primary text-xs">
                                            Book Now
                                        </Button>
                                    </Link>
                                ) : (
                                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">
                                        Occupied
                                    </span>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
