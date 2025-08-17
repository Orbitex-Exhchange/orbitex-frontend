import { NextRequest, NextResponse } from 'next/server';

// Mock beneficiaries data
const mockBeneficiaries = [
  {
    id: 1,
    currency: 'BTC',
    name: 'My Bitcoin Wallet',
    description: 'Personal Bitcoin wallet for receiving payments',
    data: {
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    },
    state: 'active',
  },
  {
    id: 2,
    currency: 'ETH',
    name: 'My Ethereum Wallet',
    description: 'Personal Ethereum wallet',
    data: {
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    },
    state: 'active',
  },
  {
    id: 3,
    currency: 'USD',
    name: 'My Bank Account',
    description: 'Primary bank account for USD transfers',
    data: {
      bank_name: 'Example Bank',
      full_name: 'John Doe',
      account_number: '1234567890',
    },
    state: 'active',
  },
  {
    id: 4,
    currency: 'EUR',
    name: 'European Bank Account',
    description: 'European bank account for EUR transfers',
    data: {
      bank_name: 'European Bank',
      full_name: 'John Doe',
      account_number: '9876543210',
    },
    state: 'pending',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency');
    const state = searchParams.get('state');

    // TODO: Add authentication check
    // TODO: Add real database query with filtering
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Filter by currency if specified
    let filteredBeneficiaries = mockBeneficiaries;
    if (currency) {
      filteredBeneficiaries = mockBeneficiaries.filter(item => 
        item.currency.toLowerCase() === currency.toLowerCase()
      );
    }

    // Filter by state if specified
    if (state) {
      filteredBeneficiaries = filteredBeneficiaries.filter(item => 
        item.state === state
      );
    }

    return NextResponse.json(filteredBeneficiaries, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error fetching beneficiaries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch beneficiaries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currency, name, description, data } = body;

    // TODO: Add authentication check
    // TODO: Add validation
    // TODO: Add real database insert
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Create new beneficiary
    const newBeneficiary = {
      id: Math.floor(Math.random() * 10000) + 1000,
      currency,
      name,
      description,
      data,
      state: 'pending', // New beneficiaries start as pending
    };

    return NextResponse.json(newBeneficiary, {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating beneficiary:', error);
    return NextResponse.json(
      { error: 'Failed to create beneficiary' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
