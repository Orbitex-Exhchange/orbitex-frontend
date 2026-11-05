import { publicApiService } from './src/services/publicService';

async function runTests() {
  process.env.NEXT_PUBLIC_API_URL = "https://orbitex-backend-976099405307.us-central1.run.app";
  
  console.log("Testing Public SDK Integration...");
  try {
    const timestamp = await publicApiService.getTimestamp();
    console.log("✅ getTimestamp:", timestamp);
    
    const version = await publicApiService.getVersion();
    console.log("✅ getVersion:", version);

    const markets = await publicApiService.getMarkets();
    console.log(`✅ getMarkets: Retrieved ${markets.length} markets`);

    console.log("Integration Tests Passed!");
  } catch (error) {
    console.error("Integration Tests Failed!", error);
    process.exit(1);
  }
}

runTests();
