const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`);
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error("Error:", err.message);
    if (err.cause) {
      console.error("Cause:", err.cause);
    }
  }
}
run();
