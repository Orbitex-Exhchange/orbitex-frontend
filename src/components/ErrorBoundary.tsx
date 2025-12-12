'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    override state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public override render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--trading-bg))] p-4">
                    <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] shadow-2xl">
                        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-[hsl(var(--trading-text))]">
                                Something went wrong
                            </h2>
                            <p className="text-[hsl(var(--trading-text-secondary))]">
                                We apologize for the inconvenience. The application encountered an unexpected error.
                            </p>
                        </div>

                        <div className="p-4 rounded-lg bg-black/20 text-left overflow-auto max-h-40 text-xs font-mono text-red-400">
                            {this.state.error?.message || 'Unknown error occurred'}
                        </div>

                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full btn-gradient-primary"
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Reload Application
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
