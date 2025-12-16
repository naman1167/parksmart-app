import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardStats, getRecentActivity } from '../../api/stats';
import { getActivePanicRequests, resolvePanicRequest } from '../../api/panicApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import gsap from 'gsap';
import { useGSAP } from '../../hooks/useGSAP';
import {
    Car,
    Calendar,
    Users,
    IndianRupee,
    Settings,
    BarChart3,
    RefreshCw,
    MapPin,
    CreditCard,
    TrendingUp,
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock
} from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [panicRequests, setPanicRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const containerRef = useRef(null);

    useGSAP(() => {
        if (loading) return; // Wait for content to load

        const tl = gsap.timeline();

        tl.fromTo('.admin-header',
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: 'power3.out'
            }
        )
            .fromTo('.stat-card',
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: 'back.out(1.2)'
                }, '-=0.4')
            .fromTo('.action-card',
                { y: 30, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'power2.out'
                }, '-=0.2');

    }, { scope: containerRef, dependencies: [loading] });

    // Fetch dashboard statistics
    const fetchStats = async (isManualRefresh = false) => {
        try {
            if (isManualRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError('');

            const [statsData, activityData] = await Promise.all([
                getDashboardStats(),
                getRecentActivity()
            ]);

            setStats(statsData.data);
            setActivities(activityData.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError(err.response?.data?.message || 'Failed to load dashboard statistics');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchPanicRequests = async () => {
        try {
            const response = await getActivePanicRequests();
            setPanicRequests(response.data.data);
        } catch (error) {
            console.error('Error fetching panic requests:', error);
        }
    };

    const handleResolvePanic = async (id) => {
        try {
            await resolvePanicRequest(id, { adminNotes: 'Resolved by Admin' });
            // State update handled by socket listener usually, but optimistic update is good too
            setPanicRequests(prev => prev.filter(req => req._id !== id));
        } catch (error) {
            console.error('Error resolving panic request:', error);
        }
    };

    // Fetch stats and panic requests on mount
    useEffect(() => {
        fetchStats();
        fetchPanicRequests();
    }, []);

    // Socket listeners
    const socket = useSocket();

    useEffect(() => {
        if (socket) {
            socket.on('booking:new', () => fetchStats(true));
            socket.on('spot:updated', () => fetchStats(true));
            socket.on('panic:new', (newRequest) => {
                setPanicRequests(prev => [newRequest, ...prev]);
                // Optional: Play alert sound
            });

            socket.on('panic:resolved', (resolvedId) => {
                setPanicRequests(prev => prev.filter(req => req._id !== resolvedId));
            });

            return () => {
                socket.off('booking:new');
                socket.off('spot:updated');
                socket.off('panic:new');
                socket.off('panic:resolved');
            };
        }
    }, [socket]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchStats();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, []);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const adminStats = stats ? [
        {
            title: 'Total Parking Spots',
            value: stats.totalSpots?.toString() || '0',
            icon: <Car className="w-8 h-8 text-white" />,
            color: 'from-blue-500 to-cyan-500',
            subtext: `${stats.availableSpots || 0} available`,
        },
        {
            title: 'Total Bookings',
            value: stats.totalBookings?.toString() || '0',
            icon: <Calendar className="w-8 h-8 text-white" />,
            color: 'from-purple-500 to-pink-500',
            subtext: `${stats.activeBookings || 0} active`,
        },
        {
            title: 'Active Users',
            value: stats.activeUsers?.toString() || '0',
            icon: <Users className="w-8 h-8 text-white" />,
            color: 'from-green-500 to-emerald-500',
            subtext: 'Total users who booked',
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            icon: <IndianRupee className="w-8 h-8 text-white" />,
            color: 'from-orange-500 to-red-500',
            subtext: 'From all bookings',
        },
    ] : [];

    const adminActions = [
        {
            title: 'Create Parking Spot',
            icon: <Settings className="w-8 h-8 mb-4 text-indigo-600" />,
            description: 'Add a new parking spot to the system',
            link: '/admin/spots/new',
            buttonText: 'Create Spot',
            buttonVariant: 'primary',
        },
        {
            title: 'Manage Parking Spots',
            icon: <Car className="w-8 h-8 mb-4 text-purple-600" />,
            description: 'View, edit, or remove existing parking spots',
            link: '/parking-spots',
            buttonText: 'Manage Spots',
            buttonVariant: 'secondary',
        },
        {
            title: 'User Management',
            icon: <Users className="w-8 h-8 mb-4 text-blue-500" />,
            description: 'View and manage registered users',
            link: '/admin/users',
            buttonText: 'Manage Users',
            buttonVariant: 'outline',
            disabled: false,
        },
        {
            title: 'System Analytics',
            icon: <BarChart3 className="w-8 h-8 mb-4 text-green-600" />,
            description: 'View detailed analytics and reports',
            link: '#',
            buttonText: 'Coming Soon',
            buttonVariant: 'outline',
            disabled: true,
        },
    ];

    return (
        <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="mb-12 pt-8 admin-header">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 mr-4 shadow-lg shadow-indigo-500/30">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold text-slate-900">
                                <span className="text-gradient">Admin Dashboard</span>
                            </h1>
                            <p className="text-xl text-slate-500 mt-1">Welcome back, {user?.name}!</p>
                        </div>
                    </div>

                    {/* Refresh Button */}
                    <Button
                        onClick={() => fetchStats(true)}
                        variant="outline"
                        className="flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                        loading={refreshing}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>
                <p className="text-slate-500 text-lg">Manage your parking system with powerful administrative tools</p>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="mb-6">
                    <Alert type="error" message={error} onClose={() => setError('')} />
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {loading && !stats ? (
                    // Loading skeletons
                    Array.from({ length: 4 }).map((_, index) => (
                        <Card key={index} className="animate-pulse">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                                    <div className="h-8 bg-slate-300 rounded w-16"></div>
                                </div>
                                <div className="w-12 h-12 bg-slate-200 rounded"></div>
                            </div>
                        </Card>
                    ))
                ) : (
                    // Real stats
                    adminStats.map((stat, index) => (
                        <Card key={index} className="stat-card card-hover border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                                    <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                                    <p className="text-xs text-indigo-500 font-medium">{stat.subtext}</p>
                                </div>
                                <div className={`text-5xl bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                                    {stat.icon}
                                </div>
                            </div>
                            <div className={`mt-4 h-2 rounded-full bg-gradient-to-r ${stat.color} opacity-30`}></div>
                        </Card>
                    ))
                )}
            </div>

            {/* Last Updated */}
            {stats?.updatedAt && (
                <div className="text-center text-sm text-slate-400 mb-8">
                    Last updated: {new Date(stats.updatedAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    })} • Auto-refreshes every 30 seconds
                </div>
            )}

            {/* Admin Actions */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {adminActions.map((action, index) => (
                        <Card key={index} className="group card-hover border-slate-100 action-card h-full">
                            <div className="h-full flex flex-col items-start">
                                {action.icon}
                                <h3 className="text-2xl font-bold mb-3 text-slate-900 group-hover:text-indigo-600 transition-all">
                                    {action.title}
                                </h3>
                                <p className="text-slate-500 mb-6 flex-grow">
                                    {action.description}
                                </p>
                                {action.disabled ? (
                                    <Button className="w-full bg-slate-100 text-slate-400 cursor-not-allowed" disabled>
                                        {action.buttonText}
                                    </Button>
                                ) : (
                                    <Link to={action.link} className="mt-auto w-full">
                                        <Button className="w-full" variant={action.buttonVariant}>
                                            {action.buttonText}
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Emergency Panel - Only visible if there are active requests */}
            {panicRequests.length > 0 && (
                <div className="mb-8 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-red-100 p-2 rounded-full animate-pulse">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-red-600">Emergency Requests ({panicRequests.length})</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {panicRequests.map((request) => (
                            <div key={request._id} className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 rounded-bl-full -z-0"></div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                                            {request.issueType}
                                        </span>
                                        <span className="text-xs text-red-500 font-mono flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(request.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-gray-900 mb-1">
                                        Spot: {request.spot?.spotNumber || 'Unknown'}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        User: <span className="font-medium">{request.user?.name}</span>
                                    </p>

                                    {request.message && (
                                        <div className="bg-white/60 p-2 rounded mb-3 text-sm italic text-gray-700 border border-red-100">
                                            "{request.message}"
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleResolvePanic(request._id)}
                                        className="w-full bg-white hover:bg-red-100 text-red-600 border border-red-200 font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Mark Resolved
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Recent Activity</h2>
                <Card className="border-slate-100 action-card">
                    {activities.length === 0 ? (
                        <p className="text-slate-500 text-center py-4">No recent activity found</p>
                    ) : (
                        <div className="space-y-4">
                            {activities.map((activity) => (
                                <div key={activity.id} className="flex items-center p-3 rounded-lg bg-slate-50 border border-slate-100/50 hover:bg-white transition shadow-sm">
                                    <div className={`w-2 h-2 rounded-full mr-4 shadow-[0_0_8px_rgba(0,0,0,0.2)] ${activity.color === 'green' ? 'bg-green-500 shadow-green-500/50' :
                                        activity.color === 'blue' ? 'bg-blue-500 shadow-blue-500/50' :
                                            'bg-purple-500 shadow-purple-500/50'
                                        }`}></div>
                                    <div className="flex-1">
                                        <p className="text-slate-900 font-semibold">{activity.title}</p>
                                        <p className="text-sm text-slate-500">{activity.description}</p>
                                    </div>
                                    <span className="text-sm text-slate-400 font-medium">
                                        {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
