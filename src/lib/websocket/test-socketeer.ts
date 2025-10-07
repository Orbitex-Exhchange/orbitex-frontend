// Test script for Socketeer WebSocket integration
import { socketeerClient } from './socketeer-client';

export async function testSocketeerConnection() {
  console.log('🔌 Testing Socketeer WebSocket connection...');
  
  try {
    // Test public connection
    await socketeerClient.connectPublic();
    console.log('✅ Public connection established');
    
    // Test subscription
    socketeerClient.on('btcusd.trades', (data) => {
      console.log('📊 Received BTC/USD trade data:', data);
    });
    
    socketeerClient.subscribe(['btcusd.trades', 'btcusd.ticker']);
    console.log('📡 Subscribed to BTC/USD streams');
    
    // Test market subscription
    socketeerClient.subscribeToMarket('ethusd', (data) => {
      console.log('📈 Received ETH/USD market data:', data);
    });
    
    console.log('🎯 Socketeer integration test completed successfully!');
    
    return {
      success: true,
      publicConnected: socketeerClient.isPublicConnected(),
      privateConnected: socketeerClient.isPrivateConnected(),
      status: socketeerClient.getConnectionStatus()
    };
    
  } catch (error) {
    console.error('❌ Socketeer test failed:', error);
    return {
      success: false,
      error: error.message,
      status: socketeerClient.getConnectionStatus()
    };
  }
}

// Auto-run test in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Run test after a short delay to ensure DOM is ready
  setTimeout(() => {
    testSocketeerConnection().then(result => {
      console.log('🧪 Socketeer Test Result:', result);
    });
  }, 1000);
}
