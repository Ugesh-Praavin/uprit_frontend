import { useState, useEffect } from 'react';

/**
 * ThemeToggle — dark/light mode switch.
 * Toggles .light class on <html> element.
 */
export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('uprit-theme') !== 'light';
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.remove('light');
            localStorage.setItem('uprit-theme', 'dark');
        } else {
            document.documentElement.classList.add('light');
            localStorage.setItem('uprit-theme', 'light');
        }
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg bg-[var(--color-bg-glass)] border border-[var(--color-border-default)] hover:bg-[var(--color-bg-glass-hover)] transition-all duration-200 cursor-pointer text-lg"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {isDark ? '☀️' : '🌙'}
        </button>
    );
}
