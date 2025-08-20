'use client';

import { useState, useEffect } from 'react';

export default function ApiTestPage() {
  const [backendData, setBackendData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testBackendConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Test health endpoint
      const healthResponse = await fetch('http://localhost:3000/health');
      const healthData = await healthResponse.json();
      
      // Test markets endpoint
      const marketsResponse = await fetch('http://localhost:3000/api/v2/markets');
      const marketsData = await marketsResponse.json();
      
      // Test orderbook endpoint
      const orderbookResponse = await fetch('http://localhost:3000/api/v2/markets/BTC-USD/orderbook');
      const orderbookData = await orderbookResponse.json();
      
      setBackendData({
        health: healthData,
        markets: marketsData,
        orderbook: orderbookData
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testBackendConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Backend API Connection Test</h1>
        
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Connection Status</h2>
          
          {loading && (
            <div className="text-[#00ff88] mb-4">
              🔄 Testing backend connection...
            </div>
          )}
          
          {error && (
            <div className="text-red-400 mb-4">
              ❌ Error: {error}
            </div>
          )}
          
          {backendData && (
            <div className="text-green-400 mb-4">
              ✅ Successfully connected to backend!
            </div>
          )}
          
          <button
            onClick={testBackendConnection}
            disabled={loading}
            className="bg-[#00ff88] text-black px-4 py-2 rounded-md font-medium hover:bg-[#00cc6a] transition-colors disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        {backendData && (
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Health Check</h3>
              <pre className="bg-[#0f0f0f] p-4 rounded text-sm text-[#d1d5db] overflow-auto">
                {JSON.stringify(backendData.health, null, 2)}
              </pre>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Markets Data</h3>
              <pre className="bg-[#0f0f0f] p-4 rounded text-sm text-[#d1d5db] overflow-auto">
                {JSON.stringify(backendData.markets, null, 2)}
              </pre>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Orderbook Data (BTC-USD)</h3>
              <pre className="bg-[#0f0f0f] p-4 rounded text-sm text-[#d1d5db] overflow-auto">
                {JSON.stringify(backendData.orderbook, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
