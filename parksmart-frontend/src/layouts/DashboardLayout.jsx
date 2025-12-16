import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

const DashboardLayout = () => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="py-8 relative">
                {/* Decorative background elements */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                    {/* Clean background, no blobs */}
                </div>
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
