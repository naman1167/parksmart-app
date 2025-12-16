import { useState, useRef } from 'react';
import { Key } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import gsap from 'gsap';
import { useGSAP } from '../../hooks/useGSAP';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const containerRef = useRef(null);

    useGSAP(() => {
        gsap.from('.auth-card', {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        });

        gsap.from('.auth-content', {
            y: 20,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out',
            delay: 0.2
        });
    }, { scope: containerRef });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(formData);

        if (result.success) {
            // Redirect based on user role
            const redirectPath = result.data.role === 'admin' ? '/admin/dashboard' : '/dashboard';
            navigate(redirectPath);
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div ref={containerRef} className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
            <div className="max-w-md w-full relative auth-card">
                {/* Clean white card */}
                <div className="bg-white rounded-xl shadow-xl p-8 border border-white/20 glass-card">
                    {/* Logo section */}
                    <div className="text-center mb-8 auth-content">
                        <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 mb-4 shadow-lg shadow-indigo-500/30">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <h2 className="text-4xl font-bold mb-2">
                            <span className="text-gradient">ParkSmart</span>
                        </h2>
                        <p className="text-slate-500">Welcome back! Sign in to continue</p>
                    </div>

                    {error && <div className="auth-content"><Alert type="error" message={error} onClose={() => setError('')} /></div>}

                    <form onSubmit={handleSubmit} className="space-y-6 auth-content">
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />

                        <Button type="submit" className="w-full gradient-primary hover:opacity-90 shadow-indigo-500/20 hover:shadow-indigo-500/40" loading={loading}>
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-6 text-center auth-content">
                        <p className="text-sm text-slate-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 transition">
                                Sign up
                            </Link>
                        </p>
                    </div>

                    {/* Demo credentials */}
                    <div className="mt-8 p-4 rounded-xl bg-indigo-50 border border-indigo-100 auth-content">
                        <div className="flex items-center gap-2 mb-2">
                            <Key className="w-4 h-4 text-indigo-700" />
                            <p className="text-xs text-indigo-700 font-semibold">Demo Credentials:</p>
                        </div>
                        <p className="text-xs text-slate-600 ml-6">Admin: admin@parksmart.com / admin123</p>
                        <p className="text-xs text-slate-600 ml-6">User: john@example.com / password123</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
