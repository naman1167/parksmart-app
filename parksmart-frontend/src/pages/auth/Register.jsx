import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import gsap from 'gsap';
import { useGSAP } from '../../hooks/useGSAP';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user', // Default to 'user'
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
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
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        const { confirmPassword, ...userData } = formData;
        const result = await register(userData);

        if (result.success) {
            // Redirect based on user role
            const redirectPath = result.data.role === 'admin' ? '/admin/dashboard' : '/dashboard';
            navigate(redirectPath);
        } else {
            setErrors({ general: result.error });
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
                        <p className="text-slate-500">Create your account to get started</p>
                    </div>

                    {errors.general && <div className="auth-content"><Alert type="error" message={errors.general} onClose={() => setErrors({})} /></div>}

                    <form onSubmit={handleSubmit} className="space-y-6 auth-content">
                        <Input
                            label="Full Name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            error={errors.name}
                            required
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            error={errors.email}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            error={errors.password}
                            required
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            error={errors.confirmPassword}
                            required
                        />

                        {/* Admin Role Toggle */}
                        <div className="flex items-center p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                            <input
                                type="checkbox"
                                id="adminToggle"
                                checked={formData.role === 'admin'}
                                onChange={(e) => setFormData({ ...formData, role: e.target.checked ? 'admin' : 'user' })}
                                className="w-5 h-5 rounded bg-white border-2 border-indigo-400 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                            />
                            <label htmlFor="adminToggle" className="ml-3 flex-1 cursor-pointer">
                                <span className="text-sm font-semibold text-indigo-900">Register as Admin</span>
                                <p className="text-xs text-slate-500 mt-0.5">Get access to administrative features and management tools</p>
                            </label>
                            {formData.role === 'admin' && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-600 border border-indigo-200">
                                    Admin Mode
                                </span>
                            )}
                        </div>

                        <Button type="submit" className="w-full gradient-primary hover:opacity-90 shadow-indigo-500/20 hover:shadow-indigo-500/40" loading={loading}>
                            Create Account
                        </Button>
                    </form>

                    <div className="mt-6 text-center auth-content">
                        <p className="text-sm text-slate-500">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
