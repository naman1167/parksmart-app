import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, X, Pencil, MapPin, Trash2 } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { getAllSpots, deleteSpot } from '../../api/spots';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import gsap from 'gsap';
import { useGSAP } from '../../hooks/useGSAP';

const ParkingSpots = () => {
    const [spots, setSpots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [error, setError] = useState('');
    const { isAdmin } = useAuth();
    const socket = useSocket();
    const containerRef = useRef(null);

    // Initial animation when spots are loaded
    useGSAP(() => {
        if (!loading && spots.length > 0) {
            gsap.from('.spot-card', {
                y: 50,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power2.out',
                clearProps: 'all' // Clear props after animation to avoid conflicts
            });
        }
    }, [loading, spots, filter]); // Re-run when loading finishes or spots/filter changes

    useEffect(() => {
        loadSpots();

        if (socket) {
            socket.on('spot:updated', () => {
                loadSpots();
            });

            return () => {
                socket.off('spot:updated');
            };
        }
    }, [socket]);

    useEffect(() => {
        loadSpots();
    }, [filter]);

    const loadSpots = async () => {
        // Only set loading true if it's the initial load or a deliberate refresh, 
        // not for every socket update to avoid flickering
        if (spots.length === 0) setLoading(true);

        try {
            setError('');
            const params = filter === 'available' ? { available: 'true' } : {};
            const response = await getAllSpots(params);
            setSpots(response.data);
        } catch (error) {
            console.error('Error loading spots:', error);
            setError('Failed to load parking spots. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && spots.length === 0) return <Loader fullScreen />;

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Alert type="error" message={error} />
                <div className="mt-4 text-center">
                    <Button onClick={loadSpots} className="gradient-primary">
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Parking Spots</h1>
                    <p className="text-slate-500">Find your perfect parking space</p>
                </div>
                {isAdmin && (
                    <Link to="/admin/spots/new">
                        <Button className="gradient-primary flex items-center gap-2">
                            <Plus className="w-5 h-5" /> Add New Spot
                        </Button>
                    </Link>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3 mb-8">
                <Button
                    variant={filter === 'all' ? 'primary' : 'secondary'}
                    onClick={() => setFilter('all')}
                    className={filter === 'all' ? '' : 'bg-white text-slate-600 border border-slate-200'}
                >
                    All Spots ({spots.length})
                </Button>
                <Button
                    variant={filter === 'available' ? 'primary' : 'secondary'}
                    onClick={() => setFilter('available')}
                    className={`flex items-center gap-2 ${filter === 'available' ? '' : 'bg-white text-slate-600 border border-slate-200'}`}
                >
                    <Check className="w-4 h-4" /> Available Only
                </Button>
            </div>

            {/* Spots Grid */}
            {spots.length === 0 ? (
                <Card className="text-center py-12 glass-card">
                    <svg className="mx-auto h-16 w-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xl text-slate-500">No parking spots found</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                    {spots.map((spot) => (
                        <Card key={spot._id} className="spot-card card-hover border-slate-100">
                            {/* Spot Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-start justify-between w-full">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                            {spot.spotNumber}
                                        </h3>
                                        <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                                            <MapPin className="w-3 h-3" /> {spot.location.name}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${spot.isAvailable
                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                            : 'bg-red-100 text-red-700 border border-red-200'
                                            }`}>
                                            {spot.isAvailable ? 'Available' : 'Booked'}
                                        </span>

                                        {/* Difficulty Badge */}
                                        {spot.difficultyLevel && (
                                            <div className="relative group/tooltip">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider cursor-help border ${spot.difficultyLevel === 'Easy' ? 'bg-green-50 text-green-600 border-green-200' :
                                                    spot.difficultyLevel === 'Medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                                        'bg-red-50 text-red-600 border-red-200'
                                                    }`}>
                                                    {spot.difficultyLevel} Parking
                                                </span>

                                                {/* Tooltip */}
                                                {spot.difficultyReasons && spot.difficultyReasons.length > 0 && (
                                                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10">
                                                        <p className="font-semibold mb-1 border-b border-slate-700 pb-1">Note:</p>
                                                        <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                                                            {spot.difficultyReasons.map((r, i) => (
                                                                <li key={i}>{r}</li>
                                                            ))}
                                                        </ul>
                                                        {spot.difficultyNotes && (
                                                            <p className="mt-1 italic text-slate-400">"{spot.difficultyNotes}"</p>
                                                        )}
                                                        <div className="absolute bottom-[-4px] right-4 w-2 h-2 bg-slate-800 rotate-45"></div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Spot Details */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-start text-sm text-slate-500">
                                    <MapPin className="w-5 h-5 mr-2 flex-shrink-0 text-indigo-500" />
                                    <span>{spot.location.address}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <span className="text-sm text-slate-500">Price per hour</span>
                                    <span className="text-2xl font-bold text-indigo-600">₹{spot.pricePerHour}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                {spot.isAvailable && (
                                    <Link to={`/bookings/new?spot=${spot._id}`} className="flex-1">
                                        <Button className="w-full gradient-success shadow-emerald-500/20 hover:shadow-emerald-500/40">
                                            Book Now
                                        </Button>
                                    </Link>
                                )}{/* Only show booking button if available */}
                                {isAdmin && (
                                    <>
                                        <Link to={`/admin/spots/edit/${spot._id}`}>
                                            <Button variant="outline" className="px-4 border-slate-200 hover:bg-slate-50 text-slate-600">
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        </Link>

                                        <Button
                                            variant="outline"
                                            className="px-4 border-red-200 hover:bg-red-50 text-red-600"
                                            onClick={async () => {
                                                if (window.confirm(`Are you sure you want to delete spot ${spot.spotNumber}? This action cannot be undone.`)) {
                                                    try {
                                                        await deleteSpot(spot._id);
                                                        setSpots(spots.filter(s => s._id !== spot._id));
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert('Failed to delete spot');
                                                    }
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ParkingSpots;
