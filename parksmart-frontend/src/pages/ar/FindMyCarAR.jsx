import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { ArrowUp, Navigation, MapPin, X } from 'lucide-react';

const FindMyCarAR = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Target location (Car)
    const targetLat = parseFloat(searchParams.get('lat'));
    const targetLng = parseFloat(searchParams.get('lng'));
    const spotLabel = searchParams.get('spot') || 'Your Car';

    const [hasPermission, setHasPermission] = useState(false);
    const [heading, setHeading] = useState(0); // Device heading (0-360)
    const [bearing, setBearing] = useState(0); // Bearing to car (0-360)
    const [distance, setDistance] = useState(0); // Distance in meters
    const [error, setError] = useState('');
    const [debugInfo, setDebugInfo] = useState('');

    useEffect(() => {
        if (!targetLat || !targetLng) {
            setError('Invalid target location provided.');
            return;
        }
        startCamera();
        startSensors();

        return () => {
            stopCamera();
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, [targetLat, targetLng]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setHasPermission(true);
            }
        } catch (err) {
            console.error('Camera Error:', err);
            setError('Camera access denied. Cannot use AR mode.');
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
    };

    const startSensors = () => {
        if (window.DeviceOrientationEvent) {
            // Request permission for iOS 13+
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                // Permission must be requested by a user gesture generally
                setError('Please click "Start AR" to enable sensors.');
            } else {
                window.addEventListener('deviceorientation', handleOrientation);
            }
        } else {
            setError('Device orientation not supported on this device.');
        }

        // Also track user position for distance/bearing calculation
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                updatePosition,
                (err) => console.error('Geo Error:', err),
                { enableHighAccuracy: true }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    };

    const updatePosition = (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Calculate Distance (Haversine)
        const d = calculateDistance(userLat, userLng, targetLat, targetLng);
        setDistance(Math.round(d)); // meters

        // Calculate Bearing
        const b = calculateBearing(userLat, userLng, targetLat, targetLng);
        setBearing(b);
    };

    const handleOrientation = (event) => {
        let compass = event.webkitCompassHeading || Math.abs(event.alpha - 360);
        setHeading(compass);
    };

    // Helper: Haversine Formula for distance
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    // Helper: Bearing calculation
    const calculateBearing = (startLat, startLng, destLat, destLng) => {
        const startLatRad = startLat * Math.PI / 180;
        const startLngRad = startLng * Math.PI / 180;
        const destLatRad = destLat * Math.PI / 180;
        const destLngRad = destLng * Math.PI / 180;

        const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
        const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
            Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
        const brng = Math.atan2(y, x);
        const brngDeg = (brng * 180 / Math.PI + 360) % 360; // 0-360
        return brngDeg;
    };

    const requestIOSPermission = async () => {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const response = await DeviceOrientationEvent.requestPermission();
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                    setError('');
                } else {
                    setError('Permission denied');
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    // Calculate Arrow Rotation
    // If bearing is 90 (East) and Heading is 0 (North), Arrow should point Right (90deg)
    const arrowRotation = (bearing - heading + 360) % 360;

    return (
        <div className="fixed inset-0 z-50 bg-black">
            {/* Camera Feed */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay UI */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 z-10 pointer-events-none">
                {/* Header */}
                <div className="flex justify-between items-start pointer-events-auto">
                    <div className="bg-black/50 backdrop-blur-md p-4 rounded-xl text-white">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <MapPin className="text-emerald-400" /> {spotLabel}
                        </h2>
                        <p className="text-emerald-300 font-mono text-xl">{distance}m away</p>
                    </div>
                    <Button variant="secondary" onClick={() => navigate(-1)} className="bg-white/20 hover:bg-white/30 backdrop-blur border-none text-white">
                        <X />
                    </Button>
                </div>

                {/* AR Arrow */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div
                        className="w-32 h-32 bg-emerald-500/80 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-transform duration-200 ease-out backdrop-blur-sm border-4 border-white/30"
                        style={{ transform: `translateX(-50%) translateY(-50%) rotate(${arrowRotation}deg)` }}
                    >
                        <ArrowUp className="w-16 h-16 text-white" />
                    </div>
                </div>

                {/* Footer / Debug */}
                <div className="bg-black/50 backdrop-blur-md p-4 rounded-xl text-white text-xs font-mono pointer-events-auto text-center">
                    {error ? (
                        <div>
                            <p className="text-red-400 mb-2">{error}</p>
                            {error.includes('Start AR') && (
                                <Button onClick={requestIOSPermission} size="sm">Enable Compass</Button>
                            )}
                        </div>
                    ) : (
                        <p>Keep your phone level. Follow the arrow.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FindMyCarAR;
