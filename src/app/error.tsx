'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Page error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--trading-bg))] p-4">
            <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] shadow-2xl">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-[hsl(var(--trading-text))]">
                        Page Error
                    </h2>
                    <p className="text-[hsl(var(--trading-text-secondary))]">
                        There was an error loading this page.
                    </p>
                </div>

                <div className="p-4 rounded-lg bg-black/20 text-left overflow-auto max-h-40 text-xs font-mono text-red-400">
                    {error.message || 'Unknown error occurred'}
                </div>

                <Button
                    onClick={() => reset()}
                    className="w-full btn-gradient-primary"
                >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Try Again
                </Button>
            </div>
        </div>
    );
}
