'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import './globals.css';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Global error:', error);
    }, [error]);

    return (
        <html lang="en">
            <body className="font-sans">
                <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 text-white">
                    <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl bg-[#1a1a1a] border border-[#333] shadow-2xl">
                        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">
                                Critical Error
                            </h2>
                            <p className="text-gray-400">
                                A critical error occurred preventing the application from loading.
                            </p>
                        </div>

                        <div className="p-4 rounded-lg bg-black/20 text-left overflow-auto max-h-40 text-xs font-mono text-red-400">
                            {error.message || 'Unknown error occurred'}
                        </div>

                        <Button
                            onClick={() => reset()}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                    </div>
                </div>
            </body>
        </html>
    );
}
