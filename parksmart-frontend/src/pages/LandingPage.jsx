import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Car, Shield, Clock, MapPin, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '../hooks/useGSAP';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    const containerRef = useRef(null);
    const navRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline();

        // Navbar Animation
        tl.fromTo(navRef.current,
            { y: -100, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
        );

        // Hero Content Animation
        tl.fromTo('.hero-text',
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power3.out' },
            '-=0.4'
        );

        // Hero Image/Graphics Animation
        tl.fromTo('.hero-graphic',
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1, ease: 'elastic.out(1, 0.6)' },
            '-=0.6'
        );

        // Features Scroll Animation
        const features = gsap.utils.toArray('.feature-card');
        features.forEach((card, i) => {
            gsap.fromTo(card,
                { y: 100, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    },
                    delay: i * 0.1
                }
            );
        });

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="min-h-screen bg-slate-50 overflow-x-hidden">
            {/* Navbar */}
            <nav ref={navRef} className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="flex items-center gap-2">
                                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg">
                                    <Car className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                    ParkSmart
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {isAuthenticated ? (
                                <Link to={isAdmin ? "/admin/dashboard" : "/dashboard"}>
                                    <button className="px-6 py-2 rounded-full bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all font-sans">
                                        Go to Dashboard
                                    </button>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="text-slate-600 font-medium hover:text-indigo-600 transition-colors">
                                        Login
                                    </Link>
                                    <Link to="/register">
                                        <button className="px-6 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5">
                                            Get Started
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-purple-200/30 rounded-full blur-3xl -z-10 animate-blob"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-3xl -z-10 animate-blob animation-delay-2000"></div>

                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="hero-text text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
                        Parking Made <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                            Smart & Seamless
                        </span>
                    </h1>
                    <p className="hero-text text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Find, book, and park in seconds. Experience the future of urban mobility with the most advanced parking management system.
                    </p>
                    <div className="hero-text flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                            <button className="px-8 py-4 rounded-full bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 transition-all hover:shadow-xl hover:shadow-slate-900/20 flex items-center gap-2 group">
                                Start Parking Now
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                        <Link to="#features">
                            <button className="px-8 py-4 rounded-full bg-white text-slate-700 font-bold text-lg border border-slate-200 hover:bg-slate-50 transition-all hover:border-slate-300">
                                Learn More
                            </button>
                        </Link>
                    </div>

                    {/* Hero Graphic / Map Preview */}
                    <div className="hero-graphic mt-20 relative mx-auto max-w-5xl">
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-purple-500/20 blur-2xl -z-10 transform scale-95"></div>
                        <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl p-4 transform rotate-x-12 perspective-1000">
                            <img
                                src="https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=2000"
                                alt="Dashboard Preview"
                                className="rounded-xl shadow-inner w-full h-auto opacity-90"
                            />
                            {/* Floating Elements */}
                            <div className="absolute -right-8 top-10 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-float">
                                <div className="bg-green-100 p-2 rounded-full">
                                    <Check className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Spot Booked</p>
                                    <p className="text-xs text-slate-500">Just now</p>
                                </div>
                            </div>
                            <div className="absolute -left-8 bottom-20 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-float animation-delay-2000">
                                <div className="bg-indigo-100 p-2 rounded-full">
                                    <MapPin className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Location Found</p>
                                    <p className="text-xs text-slate-500">2 mins away</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Choose ParkSmart?</h2>
                        <p className="text-lg text-slate-600">Everything you need for a stress-free parking experience</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <MapPin className="w-8 h-8 text-indigo-600" />,
                                title: "Real-time Availability",
                                description: "Find available spots instantly on our interactive live map."
                            },
                            {
                                icon: <Shield className="w-8 h-8 text-purple-600" />,
                                title: "Secure Payments",
                                description: "Seamless and secure transactions with digital wallet integration."
                            },
                            {
                                icon: <Clock className="w-8 h-8 text-pink-600" />,
                                title: "Smart Reservations",
                                description: "Book in advance and save time. No more circling the block."
                            }
                        ].map((feature, index) => (
                            <div key={index} className="feature-card p-8 rounded-2xl bg-slate-50 border border-slate-100/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all hover:-translate-y-1 group">
                                <div className="bg-white w-16 h-16 rounded-xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-900"></div>
                {/* Decorative Gradients */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-indigo-600/20 to-purple-600/20"></div>

                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to transform your parking experience?</h2>
                    <p className="text-xl text-slate-300 mb-10">Join thousands of happy users who save time and money with ParkSmart.</p>
                    <Link to="/register">
                        <button className="px-10 py-4 rounded-full bg-white text-slate-900 font-bold text-lg hover:bg-indigo-50 transition-colors shadow-lg hover:shadow-white/20">
                            Create Free Account
                        </button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 py-12 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center opacity-60">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <Car className="w-5 h-5 text-indigo-600" />
                        <span className="font-bold text-slate-900">ParkSmart</span>
                    </div>
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} ParkSmart. All rights reserved.
                    </p>
                </div>
            </footer>

            {/* CSS for animations */}
            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
