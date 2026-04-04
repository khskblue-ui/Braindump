'use client';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = 'h-6 w-6', size }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
    >
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="url(#logo-bg)" />
      <path
        d="M10 8h6c2.2 0 4 1.8 4 4 0 1.5-.8 2.7-2 3.4 1.6.6 2.8 2.2 2.8 4.1 0 2.5-2 4.5-4.5 4.5H10V8z
        M13 11v3.5h2.5c1 0 1.7-.8 1.7-1.75S16.5 11 15.5 11H13z
        M13 17.5V21h3c1.1 0 2-.9 2-1.75s-.9-1.75-2-1.75H13z"
        fill="white"
      />
    </svg>
  );
}
