'use client'
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'white' | 'gray';
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'blue',
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}></div>
    </div>
  );
}

interface LoadingButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingButton({
  loading = false,
  children,
  onClick,
  disabled = false,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = ''
}: LoadingButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:bg-blue-300',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-foreground dark:text-white focus:ring-gray-500 disabled:bg-gray-100',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 disabled:bg-red-300'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {loading && (
        <LoadingSpinner size="sm" color="white" className="mr-2" />
      )}
      {children}
    </button>
  );
}

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

export function Skeleton({ 
  className = '', 
  width = '100%', 
  height = '1rem',
  rounded = false 
}: SkeletonProps) {
  return (
    <div 
      className={`bg-gray-200 animate-pulse ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      style={{ width, height }}
    />
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="1.5rem" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} height="1rem" />
          ))}
        </div>
      ))}
    </div>
  );
}

interface CardSkeletonProps {
  hasImage?: boolean;
  lines?: number;
}

export function CardSkeleton({ hasImage = false, lines = 3 }: CardSkeletonProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow border">
      {hasImage && (
        <Skeleton className="mb-4" height="12rem" />
      )}
      
      <div className="space-y-3">
        <Skeleton height="1.5rem" width="75%" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} height="1rem" width={i === lines - 1 ? '50%' : '100%'} />
        ))}
      </div>
      
      <div className="flex space-x-3 mt-6">
        <Skeleton height="2.5rem" width="5rem" />
        <Skeleton height="2.5rem" width="4rem" />
      </div>
    </div>
  );
}

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Carregando...' }: PageLoaderProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

interface OverlayLoaderProps {
  visible: boolean;
  message?: string;
}

export function OverlayLoader({ visible, message = 'Processando...' }: OverlayLoaderProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-xl max-w-sm w-full mx-4">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-700 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}

interface ProgressBarProps {
  progress: number; // 0-100
  color?: 'blue' | 'green' | 'red' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

export function ProgressBar({ 
  progress, 
  color = 'blue',
  size = 'md',
  showPercentage = false,
  className = ''
}: ProgressBarProps) {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600', 
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  };

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={className}>
      {showPercentage && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progresso</span>
          <span>{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div 
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
