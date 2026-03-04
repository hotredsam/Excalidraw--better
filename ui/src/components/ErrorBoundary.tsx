import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div
          style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-0)',
            padding: 'var(--s-lg)',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              backgroundColor: 'var(--bg-1)',
              border: '1px solid var(--border-0)',
              borderRadius: 'var(--r-md)',
              padding: 'var(--s-xl)',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 700,
                margin: '0 0 var(--s-md) 0',
                color: 'var(--text-0)',
              }}
            >
              Something went wrong
            </h1>

            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-1)',
                margin: '0 0 var(--s-lg) 0',
                lineHeight: '1.5',
              }}
            >
              An unexpected error occurred. Please reload the application.
            </p>

            {isDevelopment && this.state.error && (
              <div
                style={{
                  backgroundColor: 'var(--bg-2)',
                  border: '1px solid var(--border-1)',
                  borderRadius: 'var(--r-sm)',
                  padding: 'var(--s-md)',
                  marginBottom: 'var(--s-lg)',
                  textAlign: 'left',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}
              >
                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--orange-600)',
                    margin: '0 0 var(--s-sm) 0',
                    fontWeight: 600,
                  }}
                >
                  Error Details (Development Only):
                </p>
                <pre
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-2)',
                    margin: 0,
                    fontFamily: 'Monaco, Courier New, monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </div>
            )}

            <button
              onClick={this.handleReload}
              style={{
                backgroundColor: 'var(--orange-600)',
                color: 'var(--text-0)',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: 'var(--r-pill)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.18s ease-out',
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
