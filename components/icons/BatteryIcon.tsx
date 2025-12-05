import React from 'react';

interface BatteryIconProps {
  className?: string;
  size?: number;
}

export const BatteryIcon: React.FC<BatteryIconProps> = ({
  className = '',
  size = 24
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M23 13V11C23 9.89543 22.1046 9 21 9H3C1.89543 9 1 9.89543 1 11V13C1 14.1046 1.89543 15 3 15H21C22.1046 15 23 14.1046 23 13Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1 11V13C1 14.1046 1.89543 15 3 15H21C22.1046 15 23 14.1046 23 13V11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 9V7C4 5.89543 4.89543 5 6 5H18C19.1046 5 20 5.89543 20 7V9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="7"
        y="10"
        width="6"
        height="4"
        rx="1"
        fill="currentColor"
      />
      <path
        d="M23 12V12.5V13.5V14C23 15.1046 22.1046 16 21 16H3C1.89543 16 1 15.1046 1 14V12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
