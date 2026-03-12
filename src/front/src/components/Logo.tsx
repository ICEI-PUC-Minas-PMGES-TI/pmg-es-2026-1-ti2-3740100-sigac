'use client';

import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 180 48"
      fill="none"
      aria-label="SIGAC"
      className="h-10 w-auto"
      {...props}
    >
      <g fill="currentColor">
        <path d="M8 20v20h8V20H8zm0-4h8l-4-6-4 6z" />
        <path d="M20 12v28h8V12h-8zm0-4h8l-4-8-4 8z" />
        <rect x="4" y="40" width="28" height="4" rx="1" />
        <path d="M14 24h4v4h-4v-4zm6 0h4v4h-4v-4zm-6 8h4v4h-4v-4zm6 0h4v4h-4v-4z" opacity="0.7" />
      </g>
      <text x="44" y="32" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="24" fill="currentColor" letterSpacing="0.02em">
        SIGAC
      </text>
    </svg>
  );
}
