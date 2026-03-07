/**
 * Loading spinner with pulsing glow animation.
 */
export default function Spinner({ size = 'md', className = '' }) {
    const sizeClass = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    }[size];

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`${sizeClass} border-[var(--color-border-default)] border-t-[var(--color-accent-primary)] rounded-full animate-spin`}
            />
        </div>
    );
}
