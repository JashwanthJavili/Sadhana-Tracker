/**
 * Error Monitoring and Recovery System
 * Comprehensive error handling with user-friendly feedback
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  AUTHENTICATION = 'AUTH',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  timestamp: number;
  userId?: string;
  context?: any;
}

// Error logger with batching
class ErrorLogger {
  private errors: AppError[] = [];
  private readonly maxErrors = 50;

  log(error: AppError): void {
    this.errors.push(error);
    
    // Limit stored errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 Error logged:', error);
    }
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        error_type: error.type
      });
    }
  }

  getErrors(): AppError[] {
    return [...this.errors];
  }

  clear(): void {
    this.errors = [];
  }

  getErrorCount(type?: ErrorType): number {
    if (type) {
      return this.errors.filter(e => e.type === type).length;
    }
    return this.errors.length;
  }
}

export const errorLogger = new ErrorLogger();

/**
 * Classify error type
 */
export function classifyError(error: Error): ErrorType {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return ErrorType.NETWORK;
  }
  
  if (message.includes('firebase') || message.includes('database') || message.includes('permission')) {
    return ErrorType.DATABASE;
  }
  
  if (message.includes('auth') || message.includes('unauthorized') || message.includes('login')) {
    return ErrorType.AUTHENTICATION;
  }
  
  if (message.includes('invalid') || message.includes('required') || message.includes('validation')) {
    return ErrorType.VALIDATION;
  }
  
  return ErrorType.UNKNOWN;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: AppError): string {
  switch (error.type) {
    case ErrorType.NETWORK:
      return '🌐 Network issue detected. Please check your internet connection and try again.';
    
    case ErrorType.DATABASE:
      return '💾 Unable to save your data right now. Your changes will be retried automatically.';
    
    case ErrorType.AUTHENTICATION:
      return '🔐 Authentication issue. Please sign in again to continue.';
    
    case ErrorType.VALIDATION:
      return '⚠️ Please check your input and try again.';
    
    default:
      return '❌ Something went wrong. We\'re working on it!';
  }
}

/**
 * Error Recovery Strategies
 */
export class ErrorRecovery {
  /**
   * Retry with exponential backoff
   */
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        const errorType = classifyError(lastError);
        
        // Don't retry validation errors
        if (errorType === ErrorType.VALIDATION) {
          throw lastError;
        }
        
        // Log error
        errorLogger.log({
          type: errorType,
          message: lastError.message,
          originalError: lastError,
          timestamp: Date.now(),
          context: { attempt, maxRetries }
        });
        
        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * Fallback to cached data
   */
  static async withFallback<T>(
    primary: () => Promise<T>,
    fallback: () => T | null
  ): Promise<T | null> {
    try {
      return await primary();
    } catch (error) {
      console.warn('Primary operation failed, using fallback:', error);
      return fallback();
    }
  }

  /**
   * Queue operation for retry
   */
  static queueForRetry<T>(
    operation: () => Promise<T>,
    onSuccess?: (result: T) => void
  ): void {
    setTimeout(async () => {
      try {
        const result = await this.retryOperation(operation);
        if (onSuccess) {
          onSuccess(result);
        }
      } catch (error) {
        console.error('Queued operation failed:', error);
      }
    }, 5000);
  }
}

/**
 * React Error Boundary Component
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const errorType = classifyError(error);
    
    errorLogger.log({
      type: errorType,
      message: error.message,
      originalError: error,
      timestamp: Date.now(),
      context: errorInfo
    });
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">😕</span>
              </div>
              <h2 className="text-2xl font-bold text-stone-800 mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-stone-600">
                Don't worry, your data is safe. Let's try refreshing the page.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 border-2 border-stone-300 text-stone-700 rounded-xl font-semibold hover:bg-stone-50 transition-all"
              >
                Refresh Page
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-stone-500 hover:text-stone-700">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-2 p-3 bg-stone-100 rounded text-xs overflow-auto max-h-40">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Global error handler
 */
export function initializeErrorHandling(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    
    errorLogger.log({
      type: classifyError(error),
      message: error.message,
      originalError: error,
      timestamp: Date.now(),
      context: { type: 'unhandledRejection' }
    });
    
    console.error('Unhandled promise rejection:', error);
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    errorLogger.log({
      type: ErrorType.UNKNOWN,
      message: event.message,
      timestamp: Date.now(),
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  });
}

/**
 * Toast notification for errors (requires toast library)
 */
export function showErrorToast(error: AppError): void {
  const message = getUserFriendlyMessage(error);
  
  // You can integrate with a toast library here
  console.error(message);
  
  // Simple alert fallback
  if (error.type === ErrorType.AUTHENTICATION || error.type === ErrorType.DATABASE) {
    // Only show critical errors to user
    // Non-critical errors are logged silently
  }
}
