const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function main() {
    const { data, error } = await supabase.auth.admin.createUser({
        email: 'admin@crelligent.com',
        password: 'Password123!',
        email_confirm: true
    });
    if (error) {
        if (error.message.includes("already registered")) {
            console.log("Admin user already exists.");
        } else {
            console.error(error);
        }
    } else {
        console.log('Admin user created successfully');
    }
}
main();
