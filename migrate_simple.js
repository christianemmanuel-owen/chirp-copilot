
const fs = require('fs');
const path = require('path');

const envPath = 'c:/Users/ADMIN/Documents/chirp-mvp-3/.env';
const envContent = fs.readFileSync(envPath, 'utf-8');

const getEnv = (key) => {
    const match = envContent.match(new RegExp(`^${key}="?([^"\\r\\n]*)"?`, 'm'));
    return match ? match[1] : null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const migrate = async () => {
    console.log('Migrating orders...');
    const url = `${supabaseUrl}/rest/v1/orders?status=eq.For%20Delivery`;

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ status: 'Out for Delivery' })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Error:', error);
            process.exit(1);
        }

        console.log('Migration successful!');
    } catch (e) {
        console.error('Fetch error:', e);
        process.exit(1);
    }
};

migrate();
