import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons in React
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle clicks on the map
function LocationMarker({ position, setPosition }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

// Component to update map view when position changes externally
const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15);
        }
    }, [center, map]);
    return null;
};

const LocationPicker = ({ onLocationSelect, initialLocation }) => {
    const [position, setPosition] = useState(initialLocation || null);

    // Default center (Delhi)
    const defaultCenter = [28.6139, 77.2090];
    const center = position ? [position.lat, position.lng] : defaultCenter;

    useEffect(() => {
        if (position) {
            onLocationSelect(position);
        }
    }, [position]);

    return (
        <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 z-0 relative">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} />
                <MapUpdater center={position ? [position.lat, position.lng] : null} />
            </MapContainer>

            <div className="absolute top-4 right-4 z-[1000]">
                <button
                    type="button"
                    onClick={() => {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                                (pos) => {
                                    const { latitude, longitude } = pos.coords;
                                    setPosition({ lat: latitude, lng: longitude });
                                },
                                (err) => {
                                    alert("Could not fetch location: " + err.message);
                                }
                            );
                        } else {
                            alert("Geolocation is not supported by your browser");
                        }
                    }}
                    className="bg-white hover:bg-gray-50 text-indigo-600 font-semibold py-2 px-4 rounded-xl shadow-lg border border-gray-200 flex items-center gap-2 transition-all active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                    Use My Location
                </button>
            </div>

            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-gray-200 shadow-lg z-[1000] text-center text-sm font-medium text-gray-700">
                {position ? 'Location Selected ✅' : '👆 Click on the map to set the precise location'}
            </div>
        </div>
    );
};

export default LocationPicker;
