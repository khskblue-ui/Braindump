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
      <rect width="32" height="32" rx="8" fill="#1A73E8" />
      <path
        d="M10 8h6c2.2 0 4 1.8 4 4 0 1.5-.8 2.7-2 3.4 1.6.6 2.8 2.2 2.8 4.1 0 2.5-2 4.5-4.5 4.5H10V8z
        M13 11v3.5h2.5c1 0 1.7-.8 1.7-1.75S16.5 11 15.5 11H13z
        M13 17.5V21h3c1.1 0 2-.9 2-1.75s-.9-1.75-2-1.75H13z"
        fill="white"
      />
      <circle cx="23" cy="9" r="2.5" fill="#4FC3F7" />
    </svg>
  );
}
