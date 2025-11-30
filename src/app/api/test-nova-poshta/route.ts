import { NextRequest, NextResponse } from 'next/server';

// Test endpoint to verify Nova Poshta API configuration
export async function GET(request: NextRequest) {
    try {
        const novaPoshtaApiKey = process.env.NOVA_POSHTA_API_KEY;
        
        if (!novaPoshtaApiKey) {
            return NextResponse.json({
                success: false,
                error: 'NOVA_POSHTA_API_KEY not found in environment variables',
                hint: 'Add NOVA_POSHTA_API_KEY to your .env.local file'
            });
        }

        if (novaPoshtaApiKey === 'your_nova_poshta_api_key_here') {
            return NextResponse.json({
                success: false,
                error: 'NOVA_POSHTA_API_KEY is still set to placeholder value',
                hint: 'Replace "your_nova_poshta_api_key_here" with your actual API key from https://my.novaposhta.ua/settings/index#apikeys'
            });
        }

        // Test API key by getting cities
        const testResponse = await fetch('https://api.novaposhta.ua/v2.0/json/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                apiKey: novaPoshtaApiKey,
                modelName: 'Address',
                calledMethod: 'getCities',
                methodProperties: {
                    FindByString: 'Київ',
                    Limit: 1
                }
            })
        });

        const testData = await testResponse.json();

        if (testData.success) {
            return NextResponse.json({
                success: true,
                message: 'Nova Poshta API key is valid and working!',
                apiKeyPreview: `${novaPoshtaApiKey.substring(0, 8)}...${novaPoshtaApiKey.substring(novaPoshtaApiKey.length - 4)}`,
                testResult: 'Successfully connected to Nova Poshta API'
            });
        } else {
            return NextResponse.json({
                success: false,
                error: 'Nova Poshta API returned an error',
                details: testData.errors || testData.errorCodes || 'Unknown error',
                hint: 'Your API key might be invalid or expired. Get a new one from https://my.novaposhta.ua/settings/index#apikeys'
            });
        }

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: 'Failed to test Nova Poshta API',
            details: error.message
        });
    }
}
