'use client';

import { useState, useEffect } from 'react';
import { Settings, Activity, Database, Wifi, TrendingUp, RefreshCw } from 'lucide-react';

interface SystemStatus {
  backend: 'loading' | 'online' | 'offline';
  database: 'loading' | 'online' | 'offline';
  websocket: 'loading' | 'online' | 'offline';
}

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  timestamp: string;
}

export default function ApiTestPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    backend: 'loading',
    database: 'loading',
    websocket: 'loading'
  });
  const [selectedMarket, setSelectedMarket] = useState('SUI-USDC');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [activeTab, setActiveTab] = useState<'integration' | 'endpoints'>('integration');
  const [markets, setMarkets] = useState<any[]>([]);
  const [ticker, setTicker] = useState<any>(null);
  const [orderBook, setOrderBook] = useState<any>(null);

  // Check system status based on real API responses
  useEffect(() => {
    const checkSystemStatus = async () => {
      const baseUrl = 'http://localhost:3100';
      
      // Check backend health
      try {
        const response = await fetch(`${baseUrl}/health`);
        if (response.ok) {
          const data = await response.json();
          console.log('Backend health check - response:', response.status, data);
          setSystemStatus(prev => ({ ...prev, backend: 'online' }));
        } else {
          console.log('Backend health check failed - status:', response.status);
          setSystemStatus(prev => ({ ...prev, backend: 'offline' }));
        }
      } catch (error) {
        console.log('Backend health check error:', error);
        setSystemStatus(prev => ({ ...prev, backend: 'offline' }));
      }

      // Check database health by testing a database-dependent endpoint
      try {
        const response = await fetch(`${baseUrl}/api/v2/public/markets`);
        if (response.ok) {
          const data = await response.json();
          // If we get a response (even empty array), database connection is working
          console.log('Database health check - response:', response.status, data);
          setSystemStatus(prev => ({ ...prev, database: 'online' }));
        } else {
          console.log('Database health check failed - status:', response.status);
          setSystemStatus(prev => ({ ...prev, database: 'offline' }));
        }
      } catch (error) {
        console.log('Database health check error:', error);
        setSystemStatus(prev => ({ ...prev, database: 'offline' }));
      }

      // Check WebSocket connection
      try {
        // Test WebSocket connection to the backend
        const wsUrl = baseUrl.replace('https://', 'wss://').replace('http://', 'ws://');
        const ws = new WebSocket(`${wsUrl}/ws`);
        
        const wsTimeout = setTimeout(() => {
          ws.close();
          setSystemStatus(prev => ({ ...prev, websocket: 'offline' }));
        }, 5000);
        
        ws.onopen = () => {
          clearTimeout(wsTimeout);
          setSystemStatus(prev => ({ ...prev, websocket: 'online' }));
          ws.close();
        };
        
        ws.onerror = () => {
          clearTimeout(wsTimeout);
          setSystemStatus(prev => ({ ...prev, websocket: 'offline' }));
        };
      } catch (error) {
        setSystemStatus(prev => ({ ...prev, websocket: 'offline' }));
      }

      // Load markets data
      try {
        const response = await fetch(`${baseUrl}/api/v2/public/markets`);
        if (response.ok) {
          const data = await response.json();
          setMarkets(data.markets || []);
        }
      } catch (error) {
        console.error('Failed to load markets:', error);
      }
    };

    checkSystemStatus();
  }, []);

  // Load ticker and orderbook data when market changes
  useEffect(() => {
    const loadMarketData = async () => {
      const baseUrl = 'http://localhost:3100';
      
      try {
        const response = await fetch(`${baseUrl}/api/v2/public/markets/${selectedMarket}/tickers`);
        if (response.ok) {
          const data = await response.json();
          setTicker(data);
        }
      } catch (error) {
        console.error('Failed to load ticker:', error);
      }

      try {
        const response = await fetch(`${baseUrl}/api/v2/public/markets/${selectedMarket}/order-book`);
        if (response.ok) {
          const data = await response.json();
          setOrderBook(data);
        }
      } catch (error) {
        console.error('Failed to load orderbook:', error);
      }
    };

    if (selectedMarket) {
      loadMarketData();
    }
  }, [selectedMarket]);

  const runIntegrationTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    const baseUrl = 'http://localhost:3100';

    const tests = [
      {
        name: 'Backend Health Check',
        test: async () => {
          try {
            const response = await fetch(`${baseUrl}/health`);
            const data = await response.json();
            return { success: response.ok, data };
          } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
          }
        }
      },
      {
        name: 'Markets Data Fetch',
        test: async () => {
          try {
            const response = await fetch(`${baseUrl}/api/v2/public/markets`);
            const data = await response.json();
            return { success: response.ok, data };
          } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
          }
        }
      },
      {
        name: 'Market Ticker Data',
        test: async () => {
          try {
            const response = await fetch(`${baseUrl}/api/v2/public/markets/${selectedMarket}/tickers`);
            const data = await response.json();
            return { success: response.ok, data };
          } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
          }
        }
      },
      {
        name: 'OrderBook Data',
        test: async () => {
          try {
            const response = await fetch(`${baseUrl}/api/v2/public/markets/${selectedMarket}/order-book`);
            const data = await response.json();
            return { success: response.ok, data };
          } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
          }
        }
      },
      {
        name: 'Currencies Data',
        test: async () => {
          try {
            const response = await fetch(`${baseUrl}/api/v2/public/currencies`);
            const data = await response.json();
            return { success: response.ok, data };
          } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
          }
        }
      },
      {
        name: 'WebSocket Connection',
        test: async () => {
          try {
            return new Promise((resolve) => {
              const wsUrl = baseUrl.replace('https://', 'wss://').replace('http://', 'ws://');
              const ws = new WebSocket(`${wsUrl}/ws`);
              
              const timeout = setTimeout(() => {
                ws.close();
                resolve({ success: false, error: 'WebSocket connection timeout' });
              }, 5000);
              
              ws.onopen = () => {
                clearTimeout(timeout);
                ws.close();
                resolve({ success: true, data: { connected: true } });
              };
              
              ws.onerror = () => {
                clearTimeout(timeout);
                resolve({ success: false, error: 'WebSocket connection failed' });
              };
            });
          } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
          }
        }
      }
    ];

    for (const test of tests) {
      const result = await test.test() as { success: boolean; data?: any; error?: string };
      const testResult: TestResult = {
        success: result.success,
        message: result.success ? `${test.name} passed` : `${test.name} failed: ${result.error}`,
        data: result.data,
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => [...prev, testResult]);
      await new Promise(resolve => setTimeout(resolve, 300)); // Small delay between tests
    }

    setIsRunningTests(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Activity className="h-4 w-4 text-green-500 animate-pulse" />;
      case 'offline':
        return <Activity className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500 animate-pulse" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-100 text-green-800">Online</span>;
      case 'offline':
        return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-red-100 text-red-800">Offline</span>;
      default:
        return <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-gray-100 text-gray-800">Loading...</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="container mx-auto space-y-6 bg-gray-800 text-white">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">API Integration Testing</h1>
            <p className="text-gray-300">Test the integration between frontend and backend trading functionality</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">Environment:</span>
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-blue-600 text-white border-blue-500">
              Production
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="rounded-lg border border-gray-600 shadow-sm bg-gray-700">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-white">
              <Settings className="h-5 w-5" />
              System Status
            </h3>
            <p className="text-sm text-gray-300">Current status of backend services and APIs</p>
          </div>
          <div className="p-6 pt-0 text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Backend API */}
              <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg bg-gray-600 text-white">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="font-medium text-white">Backend API</p>
                    <p className="text-sm text-gray-300">Health check</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(systemStatus.backend)}
                  {getStatusBadge(systemStatus.backend)}
                </div>
              </div>

              {/* Database */}
              <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg bg-gray-600 text-white">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="font-medium text-white">Database</p>
                    <p className="text-sm text-gray-300">Connection status</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(systemStatus.database)}
                  {getStatusBadge(systemStatus.database)}
                </div>
              </div>

              {/* WebSocket */}
              <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg bg-gray-600 text-white">
                <div className="flex items-center gap-3">
                  <Wifi className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="font-medium text-white">WebSocket</p>
                    <p className="text-sm text-gray-300">Real-time data</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(systemStatus.websocket)}
                  {getStatusBadge(systemStatus.websocket)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-700 p-1 rounded-lg border border-gray-600">
          <button
            onClick={() => setActiveTab('integration')}
            className={`justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md px-3 flex items-center gap-2 ${
              activeTab === 'integration'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
          >
            <Activity className="h-4 w-4" />
            Integration Tests
          </button>
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md px-3 flex items-center gap-2 ${
              activeTab === 'endpoints'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            API Endpoints
          </button>
        </div>

        <div className="shrink-0 bg-gray-600 h-[1px] w-full"></div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'integration' && (
            <div className="rounded-lg border border-gray-600 bg-gray-700 shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-white">
                  <Activity className="h-5 w-5" />
                  Trading Integration Test
                </h3>
                <p className="text-sm text-gray-300">Test the integration between frontend and backend trading functionality</p>
              </div>
              <div className="p-6 pt-0 space-y-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={runIntegrationTests}
                    disabled={isRunningTests}
                    className="justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRunningTests ? 'animate-spin' : ''}`} />
                    Run Integration Tests
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Market:</span>
                    <select
                      value={selectedMarket}
                      onChange={(e) => setSelectedMarket(e.target.value)}
                      className="px-2 py-1 border border-gray-500 rounded text-sm bg-gray-600 text-white"
                    >
                      {markets?.map((market: any) => (
                        <option key={market.symbol} value={market.symbol}>
                          {market.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="shrink-0 bg-gray-600 h-[1px] w-full"></div>

                {/* Real-time Data Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-gray-600 rounded-lg bg-gray-600">
                    <h4 className="font-medium mb-2 text-white">Markets</h4>
                    <p className="text-sm text-gray-300">
                      {markets.length > 0 ? `${markets.length} markets` : 'Loading...'}
                    </p>
                  </div>
                  <div className="p-4 border border-gray-600 rounded-lg bg-gray-600">
                    <h4 className="font-medium mb-2 text-white">Ticker</h4>
                    <p className="text-sm text-gray-300">
                      {ticker ? ticker.last_price || 'N/A' : 'Loading...'}
                    </p>
                  </div>
                  <div className="p-4 border border-gray-600 rounded-lg bg-gray-600">
                    <h4 className="font-medium mb-2 text-white">OrderBook</h4>
                    <p className="text-sm text-gray-300">
                      {orderBook ? `${orderBook.bids?.length || 0} bids` : 'Loading...'}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        result.success
                          ? 'bg-green-900 border-green-600 text-green-100'
                          : 'bg-red-900 border-red-600 text-red-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{result.message}</span>
                        <span className="text-sm opacity-75">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'endpoints' && (
            <div className="rounded-lg border border-gray-600 bg-gray-700 shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5" />
                  API Endpoints
                </h3>
                <p className="text-sm text-gray-300">Available API endpoints and their status</p>
              </div>
              <div className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-600 rounded-lg bg-gray-600">
                      <h4 className="font-medium mb-2 text-white">Health Check</h4>
                      <code className="text-sm bg-gray-800 p-2 rounded block text-green-300">GET /health</code>
                      <code className="text-sm bg-gray-800 p-2 rounded block text-green-300 mt-1">GET /api/v2/health</code>
                    </div>
                    <div className="p-4 border border-gray-600 rounded-lg bg-gray-600">
                      <h4 className="font-medium mb-2 text-white">Markets</h4>
                      <code className="text-sm bg-gray-800 p-2 rounded block text-green-300">GET /api/v2/public/markets</code>
                    </div>
                    <div className="p-4 border border-gray-600 rounded-lg bg-gray-600">
                      <h4 className="font-medium mb-2 text-white">Tickers</h4>
                      <code className="text-sm bg-gray-800 p-2 rounded block text-green-300">GET /api/v2/public/markets/{'{market}'}/tickers</code>
                      <code className="text-sm bg-gray-800 p-2 rounded block text-green-300 mt-1">GET /api/v2/public/markets/{'{market}'}/tickers</code>
                    </div>
                    <div className="p-4 border border-gray-600 rounded-lg bg-gray-600">
                      <h4 className="font-medium mb-2 text-white">Order Book</h4>
                      <code className="text-sm bg-gray-800 p-2 rounded block text-green-300">GET /api/v2/public/markets/{'{market}'}/order-book</code>
                    </div>
                    <div className="p-4 border border-gray-600 rounded-lg bg-gray-600">
                      <h4 className="font-medium mb-2 text-white">Market Depth</h4>
                      <code className="text-sm bg-gray-800 p-2 rounded block text-green-300">GET /api/v2/public/markets/{'{market}'}/depth</code>
                    </div>
                    <div className="p-4 border border-gray-600 rounded-lg bg-gray-600">
                      <h4 className="font-medium mb-2 text-white">Recent Trades</h4>
                      <code className="text-sm bg-gray-800 p-2 rounded block text-green-300">GET /api/v2/public/markets/{'{market}'}/trades</code>
                    </div>
                    <div className="p-4 border border-gray-600 rounded-lg bg-gray-600">
                      <h4 className="font-medium mb-2 text-white">Currencies</h4>
                      <code className="text-sm bg-gray-800 p-2 rounded block text-green-300">GET /api/v2/public/currencies</code>
                    </div>
                    <div className="p-4 border border-gray-600 rounded-lg bg-gray-600">
                      <h4 className="font-medium mb-2 text-white">Trading Fees</h4>
                      <code className="text-sm bg-gray-800 p-2 rounded block text-green-300">GET /api/v2/public/trading_fees</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
