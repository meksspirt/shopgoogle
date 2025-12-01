import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
    try {
        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
        }

        // Fetch order details
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        // Get Nova Poshta API key from settings or environment variable
        const { data: settings } = await supabaseAdmin
            .from('settings')
            .select('value')
            .eq('key', 'nova_poshta_api_key')
            .single();

        const apiKey = settings?.value || process.env.NOVA_POSHTA_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ 
                success: false, 
                error: 'API ключ Нової Пошти не налаштовано. Додайте в Налаштування → Нова Пошта або в змінні оточення NOVA_POSHTA_API_KEY' 
            }, { status: 400 });
        }

        // Get sender settings
        const { data: senderSettings } = await supabaseAdmin
            .from('settings')
            .select('key, value')
            .in('key', [
                'nova_poshta_sender_city_ref',
                'nova_poshta_sender_warehouse_ref',
                'nova_poshta_sender_contact_ref',
                'nova_poshta_sender_phone'
            ]);

        const senderData: { [key: string]: string } = {};
        senderSettings?.forEach(setting => {
            senderData[setting.key] = setting.value || '';
        });

        // Validate sender data
        if (!senderData.nova_poshta_sender_city_ref || 
            !senderData.nova_poshta_sender_warehouse_ref || 
            !senderData.nova_poshta_sender_contact_ref || 
            !senderData.nova_poshta_sender_phone) {
            return NextResponse.json({ 
                success: false, 
                error: 'Дані відправника не налаштовані. Перейдіть в Налаштування → Дані відправника НП' 
            }, { status: 400 });
        }

        // Validate recipient data
        if (!order.nova_poshta_warehouse_id) {
            return NextResponse.json({ 
                success: false, 
                error: 'У замовленні відсутній ID відділення Нової Пошти' 
            }, { status: 400 });
        }

        // Get order items to calculate weight and cost
        const { data: orderItems } = await supabaseAdmin
            .from('order_items')
            .select('*, products(*)')
            .eq('order_id', orderId);

        const totalWeight = (orderItems?.length || 0) * 0.5; // Assume 0.5 kg per book
        const cost = order.total_amount;

        // Create waybill via Nova Poshta API
        const waybillData = {
            apiKey: apiKey,
            modelName: 'InternetDocument',
            calledMethod: 'save',
            methodProperties: {
                PayerType: 'Recipient', // Recipient pays
                PaymentMethod: 'Cash', // Cash on delivery
                CargoType: 'Cargo',
                VolumeGeneral: '0.01',
                Weight: totalWeight.toString(),
                ServiceType: 'WarehouseWarehouse',
                SeatsAmount: '1',
                Description: 'Книги',
                Cost: cost.toString(),
                CitySender: senderData.nova_poshta_sender_city_ref,
                SenderAddress: senderData.nova_poshta_sender_warehouse_ref,
                ContactSender: senderData.nova_poshta_sender_contact_ref,
                SendersPhone: senderData.nova_poshta_sender_phone,
                RecipientCityName: order.customer_city,
                RecipientArea: '',
                RecipientAreaRegions: '',
                RecipientAddressName: order.nova_poshta_warehouse_id,
                RecipientHouse: '',
                RecipientFlat: '',
                RecipientName: order.customer_name,
                RecipientType: 'PrivatePerson',
                RecipientsPhone: order.customer_phone,
                DateTime: new Date().toISOString().split('T')[0], // Today's date
            }
        };

        console.log('Creating waybill with data:', JSON.stringify(waybillData, null, 2));

        const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(waybillData)
        });

        const result = await response.json();

        console.log('Nova Poshta API response:', JSON.stringify(result, null, 2));

        if (!result.success) {
            const errors = result.errors || [];
            const errorMessage = errors.join(', ') || 'Невідома помилка';
            return NextResponse.json({ 
                success: false, 
                error: `Помилка API Нової Пошти: ${errorMessage}`,
                details: result
            }, { status: 400 });
        }

        const trackingNumber = result.data[0]?.IntDocNumber;

        if (!trackingNumber) {
            return NextResponse.json({ 
                success: false, 
                error: 'Не вдалося отримати номер накладної',
                details: result
            }, { status: 400 });
        }

        // Update order with tracking number and set status to shipped
        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({ 
                tracking_number: trackingNumber,
                status: 'shipped'
            })
            .eq('id', orderId);

        if (updateError) {
            console.error('Error updating order:', updateError);
            return NextResponse.json({ 
                success: false, 
                error: 'Накладна створена, але не вдалося оновити замовлення'
            }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            trackingNumber,
            message: 'Накладна успішно створена!'
        });

    } catch (error: any) {
        console.error('Error creating waybill:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Помилка створення накладної'
        }, { status: 500 });
    }
}
