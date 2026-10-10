const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  const sqlPath = path.resolve(__dirname, 'supabase/2026-10-velodesk-fixes.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // We will try several common RPC names and argument names for running raw SQL.
  const rpcs = ['exec_sql', 'execute_sql', 'run_sql', 'execute'];
  const argNames = ['query', 'sql', 'sql_string', 'statement', 'query_text'];

  let success = false;

  for (const rpc of rpcs) {
    if (success) break;
    for (const argName of argNames) {
      console.log(`Trying rpc ${rpc} with argument ${argName}...`);
      const { data, error } = await supabase.rpc(rpc, { [argName]: sql });
      
      if (error) {
        // If the error is about the function not existing or invalid argument, we continue.
        // If it's a syntax error in our SQL, we should probably fail.
        if (error.code === 'PGRST202' || error.message.includes('Could not find') || error.message.includes('fetch failed')) {
          console.log(`Failed ${rpc}(${argName}): ${error.message}`);
          
          // If fetch fails entirely (e.g. timeout), there's no point in trying other RPCs.
          if (error.message.includes('fetch failed') || error.message.includes('timeout')) {
             console.error("Network error: Cannot reach Supabase API. Aborting.");
             return;
          }
        } else {
          console.error(`Error executing ${rpc}(${argName}):`, error);
          // Might be a real SQL error, but we'll try other args just in case
        }
      } else {
        console.log(`Migration applied successfully using ${rpc}(${argName})!`);
        success = true;
        break;
      }
    }
  }

  if (!success) {
    console.error("Failed to apply migration. No suitable RPC found.");
  }
}

runMigration().catch(err => {
  console.error("Unexpected error:", err);
});
