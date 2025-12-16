import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Pages
// Pages
import LandingPage from '../pages/LandingPage';
import Dashboard from '../pages/Dashboard';
import ParkingSpots from '../pages/spots/ParkingSpots';
import MyBookings from '../pages/bookings/MyBookings';
import NewBooking from '../pages/bookings/NewBooking';
import Receipt from '../pages/bookings/Receipt';
import UserInbox from '../pages/bookings/UserInbox';
import BatchIdChecker from '../pages/bookings/BatchIdChecker';
import AdminDashboard from '../pages/admin/AdminDashboard';
import Users from '../pages/admin/Users';
import NewSpot from '../pages/spots/NewSpot';
import EditSpot from '../pages/spots/EditSpot';
import SpotSwap from '../pages/swap/SpotSwap';
import FindMyCarAR from '../pages/ar/FindMyCarAR';

// Protected Route
import ProtectedRoute from './ProtectedRoute';

const AppRouter = () => {
    const { isAuthenticated, isAdmin } = useAuth();

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace /> : <Login />}
                />
                <Route
                    path="/register"
                    element={isAuthenticated ? <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace /> : <Register />}
                />

                {/* Protected Routes */}
                <Route
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="admin/users" element={<Users />} />
                    <Route path="admin/spots/new" element={<NewSpot />} />
                    <Route path="admin/spots/edit/:id" element={<EditSpot />} />
                    <Route path="parking-spots" element={<ParkingSpots />} />
                    <Route path="bookings/new" element={<NewBooking />} />
                    <Route path="bookings" element={<MyBookings />} />
                    <Route path="/swap" element={<SpotSwap />} />
                    <Route path="/ar/find-car" element={<FindMyCarAR />} />
                    <Route path="bookings/receipt/:id" element={<Receipt />} />
                    <Route path="inbox" element={<UserInbox />} />
                    <Route path="find-spot" element={<BatchIdChecker />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
