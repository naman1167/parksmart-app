import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, PlusCircle, Settings, BarChart3, Search, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getAllSpots } from '../api/spots';
import { useSocket } from '../context/SocketContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import MapComponent from '../components/map/MapComponent';
import gsap from 'gsap';
import { useGSAP } from '../hooks/useGSAP';

const Dashboard = () => {
    const { user, isAdmin } = useAuth();
    const [spots, setSpots] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const socket = useSocket();
    const containerRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline();

        // Header animation
        tl.fromTo('.dashboard-header',
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: 'power3.out'
            }
        )
            .fromTo('.map-section',
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power2.out'
                }, '-=0.4')
            .fromTo('.dashboard-card',
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'back.out(1.2)'
                }, '-=0.4');

    }, { scope: containerRef, dependencies: [user, spots] });

    useEffect(() => {
        loadData();
        getUserLocation();

        if (socket) {
            socket.on('spot:updated', () => loadData());
        }

        return () => {
            if (socket) socket.off('spot:updated');
        };
    }, [socket]);

    const loadData = async () => {
        try {
            const response = await getAllSpots({ available: 'true' });
            setSpots(response.data);
        } catch (error) {
            console.error('Error loading spots:', error);
        }
    };

    const getUserLocation = () => {
        setIsLocating(true);
        setLocationError(null);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    setIsLocating(false);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    let errorMessage = 'Unable to retrieve your location';
                    if (error.code === error.PERMISSION_DENIED) {
                        errorMessage = 'Location permission denied. Please enable it in your browser settings.';
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        errorMessage = 'Location information is unavailable.';
                    } else if (error.code === error.TIMEOUT) {
                        errorMessage = 'The request to get user location timed out.';
                    }
                    setLocationError(errorMessage);
                    setIsLocating(false);
                }
            );
        } else {
            setLocationError('Geolocation is not supported by this browser.');
            setIsLocating(false);
        }
    };

    const quickActions = [
        {
            title: 'Browse Parking Spots',
            icon: <MapPin className="w-8 h-8 mb-4 text-indigo-600" />,
            description: 'Find and book available parking spots near you',
            link: '/parking-spots',
            variant: 'gradient',
            buttonText: 'View Spots',
            buttonVariant: 'primary'
        },
        {
            title: 'My Inbox',
            icon: <Calendar className="w-8 h-8 mb-4 text-blue-600" />,
            description: 'View all your parking tickets and receipts',
            link: '/inbox',
            buttonText: 'View Inbox',
            buttonVariant: 'secondary'
        },
        {
            title: 'Find My Spot',
            icon: <Search className="w-8 h-8 mb-4 text-purple-600" />,
            description: 'Locate your parking spot using your Batch ID',
            link: '/find-spot',
            buttonText: 'Find Spot',
            buttonVariant: 'outline'
        },
        {
            title: 'New Booking',
            icon: <PlusCircle className="w-8 h-8 mb-4 text-emerald-600" />,
            description: 'Create a new parking reservation instantly',
            link: '/bookings/new',
            buttonVariant: 'success'
        },
        {
            title: 'Spot Swap',
            icon: <RefreshCw className="w-8 h-8 mb-4 text-orange-500" />,
            description: 'Match with leaving users',
            link: '/swap',
            buttonText: 'Swap Now',
            buttonVariant: 'gradient'
        },
    ];

    const adminActions = [
        {
            title: 'Manage Spots',
            icon: <Settings className="w-8 h-8 mb-4 text-purple-600" />,
            description: 'Add, edit, or delete parking spots',
            link: '/admin/spots/new',
            buttonText: 'Add New Spot',
            buttonVariant: 'outline'
        },
        {
            title: 'All Bookings',
            icon: <BarChart3 className="w-8 h-8 mb-4 text-purple-600" />,
            description: 'View all bookings across the system',
            link: '/admin/bookings',
            buttonText: 'View All',
            buttonVariant: 'outline'
        },
    ];

    return (
        <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="text-center mb-12 pt-8 dashboard-header">
                <h1 className="text-5xl font-bold mb-4 text-slate-900">
                    Welcome back, <span className="text-gradient">{user?.name}</span>!
                </h1>
                <p className="text-xl text-slate-500 mb-8">Manage your parking experience with ease</p>

                {/* Interactive Map */}
                <div className="mb-12 map-section neon-border rounded-xl overflow-hidden glass-card p-2">
                    <div className="flex justify-between items-center px-4 pt-2 mb-4">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <MapPin className="w-6 h-6 text-indigo-600" /> Live Parking Map
                        </h2>
                        <Button
                            onClick={getUserLocation}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 text-sm"
                            disabled={isLocating}
                        >
                            <MapPin className={`w-4 h-4 ${isLocating ? 'animate-bounce' : ''}`} />
                            {isLocating ? 'Locating...' : 'Locate Me'}
                        </Button>
                    </div>

                    {locationError && (
                        <div className="mx-4 mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                            <span className="font-bold">Error:</span> {locationError}
                        </div>
                    )}

                    <div className="rounded-lg overflow-hidden h-[400px] relative">
                        <MapComponent spots={spots} userLocation={userLocation} />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {quickActions.map((action, index) => (
                    <Card key={index} gradient={action.variant === 'gradient'} className="group dashboard-card card-hover h-full">
                        <div className="h-full flex flex-col items-start">
                            {action.icon}
                            <h3 className="text-2xl font-bold mb-3 text-slate-900 group-hover:text-indigo-600 transition-all">
                                {action.title}
                            </h3>
                            <p className="text-slate-500 mb-6 flex-grow">
                                {action.description}
                            </p>
                            <Link to={action.link} className="mt-auto w-full">
                                <Button className="w-full" variant={action.buttonVariant}>
                                    {action.buttonText}
                                </Button>
                            </Link>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Admin Section */}
            {isAdmin && (
                <>
                    <div className="flex items-center mb-6 dashboard-header">
                        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-50"></div>
                        <span className="px-4 text-purple-600 font-semibold bg-white rounded-full py-1 border border-purple-100 shadow-sm mx-4">Admin Controls</span>
                        <div className="flex-grow h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-50"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                        {adminActions.map((action, index) => (
                            <Card key={index} className="group border-purple-200 dashboard-card card-hover h-full">
                                <div className="h-full flex flex-col items-start">
                                    {action.icon}
                                    <h3 className="text-2xl font-bold mb-3 text-purple-700 group-hover:text-purple-600 transition-all">
                                        {action.title}
                                    </h3>
                                    <p className="text-slate-500 mb-6 flex-grow">
                                        {action.description}
                                    </p>
                                    <Link to={action.link} className="mt-auto w-full">
                                        <Button className="w-full" variant={action.buttonVariant}>
                                            {action.buttonText}
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
