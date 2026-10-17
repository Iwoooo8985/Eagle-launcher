import React from 'react';

interface EagleLogoProps {
  size?: number;
  className?: string;
  badgeSize?: 'sm' | 'md' | 'lg';
}

export function EagleLogo({ size = 16, className = '', badgeSize = 'md' }: EagleLogoProps) {
  const badgeClasses = {
    sm: 'w-5 h-5 rounded-md p-0.5',
    md: 'w-6 h-6 rounded-lg p-1',
    lg: 'w-8 h-8 rounded-xl p-1.5',
  }[badgeSize];

  return (
    <div
      className={`bg-[#2c2d33] border border-[#3e4049] flex items-center justify-center shrink-0 shadow-sm select-none ${badgeClasses} ${className}`}
      title="Eagle Launcher"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white drop-shadow-sm"
      >
        {/* Stylized Majestic Eagle Silhouette with white fill & outline */}
        <path
          d="M12 2C11.5 3 10.8 4 9.8 4.6C8.6 4.3 7.4 3.9 6.2 3.5C6.8 5.2 7.1 7 6.6 8.7C5.1 7.6 3.4 6.8 1.6 6.3C2.8 8.2 3.4 10.4 3.2 12.6C1.7 12.1 0.8 11.9 0 12C1.7 13.8 3.2 15.5 5.1 16.6C6.2 17.2 7.7 17.6 9 17.6C9.5 18.6 9.8 19.8 10 21.2L12 23L14 21.2C14.2 19.8 14.5 18.6 15 17.6C16.3 17.6 17.8 17.2 18.9 16.6C20.8 15.5 22.3 13.8 24 12C23.2 11.9 22.3 12.1 20.8 12.6C20.6 10.4 21.2 8.2 22.4 6.3C20.6 6.8 18.9 7.6 17.4 8.7C16.9 7 17.2 5.2 17.8 3.5C16.6 3.9 15.4 4.3 14.2 4.6C13.2 4 12.5 3 12 2Z"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="0.6"
          strokeLinejoin="round"
        />
        {/* Eagle Beak & Head Accents */}
        <path
          d="M12 4C12.6 4.8 13.2 5.4 14 5.8C13.6 6.2 13.1 6.8 13.2 7.4C13.3 8.2 14 8.6 13.6 9.2C13 9.6 12.2 9.2 11.7 8.6C11.3 8 11 6.8 11.3 5.7C11.6 5 11.8 4.4 12 4Z"
          fill="#E4E4E7"
          stroke="#FFFFFF"
          strokeWidth="0.3"
        />
      </svg>
    </div>
  );
}
