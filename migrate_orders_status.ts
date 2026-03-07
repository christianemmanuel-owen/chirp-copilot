
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: 'c:/Users/ADMIN/Documents/chirp-mvp-3/.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrate() {
    console.log('Fetching orders with status "For Delivery"...')
    const { data: orders, error: fetchError } = await supabase
        .from('orders')
        .select('id')
        .eq('status', 'For Delivery')

    if (fetchError) {
        console.error('Error fetching orders:', fetchError)
        process.exit(1)
    }

    if (!orders || orders.length === 0) {
        console.log('No orders found with status "For Delivery".')
        return
    }

    console.log(`Found ${orders.length} orders. Updating to "Out for Delivery"...`)

    const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'Out for Delivery' })
        .eq('status', 'For Delivery')

    if (updateError) {
        console.error('Error updating orders:', updateError)
        process.exit(1)
    }

    console.log('Migration successful!')
}

migrate()
