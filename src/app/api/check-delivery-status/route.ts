import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
    try {
        const { trackingNumber, orderId } = await request.json();

        if (!trackingNumber) {
            return NextResponse.json(
                { error: 'Tracking number is required' },
                { status: 400 }
            );
        }

        // Call Nova Poshta API to check delivery status
        const novaPoshtaApiKey = process.env.NOVA_POSHTA_API_KEY;
        
        if (!novaPoshtaApiKey) {
            console.error('Nova Poshta API key not configured');
            return NextResponse.json(
                { error: 'Nova Poshta API not configured' },
                { status: 500 }
            );
        }

        const novaPoshtaResponse = await fetch('https://api.novaposhta.ua/v2.0/json/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                apiKey: novaPoshtaApiKey,
                modelName: 'TrackingDocument',
                calledMethod: 'getStatusDocuments',
                methodProperties: {
                    Documents: [
                        {
                            DocumentNumber: trackingNumber,
                            Phone: '' // Optional: can add customer phone for verification
                        }
                    ]
                }
            })
        });

        const novaPoshtaData = await novaPoshtaResponse.json();

        if (!novaPoshtaData.success || !novaPoshtaData.data || novaPoshtaData.data.length === 0) {
            return NextResponse.json(
                { 
                    error: 'Failed to get tracking info',
                    details: novaPoshtaData.errors || 'No data returned'
                },
                { status: 400 }
            );
        }

        const trackingInfo = novaPoshtaData.data[0];
        const statusCode = trackingInfo.StatusCode;

        // Nova Poshta status codes:
        // 9 - Delivered (Отримана)
        // 10 - Delivered and paid (Отримана і оплачена)
        // 11 - Delivered and paid to sender (Отримана і оплачена відправнику)
        // 106 - Delivered (Вручена)
        
        const isDelivered = ['9', '10', '11', '106'].includes(statusCode);

        // If delivered and we have orderId, update the order status
        if (isDelivered && orderId) {
            const { error: updateError } = await supabaseAdmin
                .from('orders')
                .update({ status: 'delivered' })
                .eq('id', orderId)
                .eq('tracking_number', trackingNumber); // Extra safety check

            if (updateError) {
                console.error('Error updating order status:', updateError);
            }
        }

        return NextResponse.json({
            success: true,
            isDelivered,
            statusCode,
            statusText: trackingInfo.Status,
            trackingInfo: {
                number: trackingInfo.Number,
                status: trackingInfo.Status,
                statusCode: trackingInfo.StatusCode,
                recipientDateTime: trackingInfo.RecipientDateTime,
                scheduledDeliveryDate: trackingInfo.ScheduledDeliveryDate,
                actualDeliveryDate: trackingInfo.ActualDeliveryDate,
                city: trackingInfo.CityRecipient,
                warehouse: trackingInfo.WarehouseRecipient
            }
        });

    } catch (error: any) {
        console.error('Error checking delivery status:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
