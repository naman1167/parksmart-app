import { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, Calendar, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import gsap from 'gsap';
import { useGSAP } from '../../hooks/useGSAP';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const navRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline();

        tl.from(navRef.current, {
            y: -100,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        })
            .from('.nav-item', {
                y: -20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: 'back.out(1.7)'
            }, '-=0.4');
    }, []);

    return (
        <nav ref={navRef} className="glass sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center space-x-8">
                        {/* Logo */}
                        <Link to="/" className="nav-item flex items-center group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mr-3 group-hover:scale-110 transition shadow-lg shadow-indigo-500/30">
                                <Car className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gradient">ParkSmart</span>
                        </Link>

                        {/* Nav Links */}
                        <div className="hidden md:flex space-x-1">
                            <Link
                                to="/parking-spots"
                                className={`nav-item flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${location.pathname === '/parking-spots' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`}
                            >
                                <Car className="w-5 h-5" />
                                Parking Spots
                            </Link>
                            <Link
                                to="/bookings"
                                className={`nav-item flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${location.pathname.startsWith('/bookings') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`}
                            >
                                <Calendar className="w-5 h-5" />
                                My Bookings
                            </Link>
                            {isAdmin && (
                                <Link
                                    to="/admin/dashboard"
                                    className={`nav-item flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${location.pathname.startsWith('/admin') ? 'text-purple-600 bg-purple-50' : 'text-purple-500 hover:text-purple-700 hover:bg-purple-50'}`}
                                >
                                    <Settings className="w-5 h-5" />
                                    Admin
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* User section */}
                    <div className="nav-item flex items-center space-x-4">
                        {user && (
                            <>
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                    <p className="text-xs text-indigo-500 font-medium">{user.role}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={logout}
                                    className="px-4 py-2 text-sm"
                                >
                                    Logout
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
