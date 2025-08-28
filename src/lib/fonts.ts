// src/lib/fonts.ts
// Safe font loading with fallbacks for CI/build environments

import localFont from 'next/font/local';

// Use local font files to avoid network dependency during build
export const geistSans = localFont({
  variable: "--font-geist-sans",
  src: [
    {
      path: '../../public/fonts/geist-latin.woff2',
      weight: '100 900',
      style: 'normal',
    }
  ],
  display: 'swap',
  fallback: [
    'ui-sans-serif', 
    'system-ui', 
    '-apple-system', 
    'BlinkMacSystemFont', 
    'Segoe UI', 
    'Roboto', 
    'Arial', 
    'sans-serif'
  ],
});

export const geistMono = localFont({
  variable: "--font-geist-mono",
  src: [
    {
      path: '../../public/fonts/geist-mono-latin.woff2',
      weight: '100 900', 
      style: 'normal',
    }
  ],
  display: 'swap',
  fallback: [
    'ui-monospace', 
    'SFMono-Regular', 
    'Menlo', 
    'Monaco', 
    'Consolas', 
    'monospace'
  ],
});