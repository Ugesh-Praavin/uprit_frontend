import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNav from './MobileNav';

/**
 * Layout — responsive wrapper with sidebar on desktop, bottom nav on mobile.
 */
export default function Layout() {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)]">
            {/* Desktop sidebar — hidden on mobile */}
            <Sidebar />
            <Navbar />

            {/* Main content: ml-64 on desktop, full-width on mobile */}
            <main className="md:ml-64 mt-16 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
                <Outlet />
            </main>

            {/* Mobile bottom nav */}
            <MobileNav />
        </div>
    );
}
