import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

/**
 * Layout — wraps protected pages with Sidebar + Navbar.
 */
export default function Layout() {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)]">
            <Sidebar />
            <Navbar />
            {/* Main content area with sidebar offset */}
            <main className="ml-64 mt-16 p-8">
                <Outlet />
            </main>
        </div>
    );
}
