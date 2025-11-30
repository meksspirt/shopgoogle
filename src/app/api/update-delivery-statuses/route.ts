import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// This endpoint can be called by a cron job to check all shipped orders
export async function POST(request: NextRequest) {
    try {
        // Optional: Add authentication/secret key check for security
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
        
        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get all orders with status 'shipped' that have tracking numbers
        const { data: orders, error: fetchError } = await supabaseAdmin
            .from('orders')
            .select('id, tracking_number, customer_phone')
            .eq('status', 'shipped')
            .not('tracking_number', 'is', null);

        if (fetchError) {
            throw fetchError;
        }

        if (!orders || orders.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No shipped orders to check',
                checked: 0,
                updated: 0
            });
        }

        const novaPoshtaApiKey = process.env.NOVA_POSHTA_API_KEY;
        
        if (!novaPoshtaApiKey) {
            return NextResponse.json(
                { error: 'Nova Poshta API key not configured' },
                { status: 500 }
            );
        }

        let updatedCount = 0;
        const results = [];

        // Check each order (in batches to avoid rate limits)
        for (const order of orders) {
            try {
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
                                    DocumentNumber: order.tracking_number,
                                    Phone: order.customer_phone || ''
                                }
                            ]
                        }
                    })
                });

                const novaPoshtaData = await novaPoshtaResponse.json();

                if (novaPoshtaData.success && novaPoshtaData.data && novaPoshtaData.data.length > 0) {
                    const trackingInfo = novaPoshtaData.data[0];
                    const statusCode = trackingInfo.StatusCode;
                    
                    // Check if delivered
                    const isDelivered = ['9', '10', '11', '106'].includes(statusCode);

                    if (isDelivered) {
                        // Update order status to delivered
                        const { error: updateError } = await supabaseAdmin
                            .from('orders')
                            .update({ status: 'delivered' })
                            .eq('id', order.id);

                        if (!updateError) {
                            updatedCount++;
                            results.push({
                                orderId: order.id,
                                trackingNumber: order.tracking_number,
                                status: 'updated to delivered',
                                novaPoshtaStatus: trackingInfo.Status
                            });
                        } else {
                            results.push({
                                orderId: order.id,
                                trackingNumber: order.tracking_number,
                                status: 'error updating',
                                error: updateError.message
                            });
                        }
                    } else {
                        results.push({
                            orderId: order.id,
                            trackingNumber: order.tracking_number,
                            status: 'still in transit',
                            novaPoshtaStatus: trackingInfo.Status
                        });
                    }
                } else {
                    results.push({
                        orderId: order.id,
                        trackingNumber: order.tracking_number,
                        status: 'tracking info not found',
                        error: novaPoshtaData.errors
                    });
                }

                // Add small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error: any) {
                console.error(`Error checking order ${order.id}:`, error);
                results.push({
                    orderId: order.id,
                    trackingNumber: order.tracking_number,
                    status: 'error',
                    error: error.message
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Checked ${orders.length} orders, updated ${updatedCount} to delivered`,
            checked: orders.length,
            updated: updatedCount,
            results
        });

    } catch (error: any) {
        console.error('Error updating delivery statuses:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
