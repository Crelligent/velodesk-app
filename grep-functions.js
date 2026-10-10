const fs = require('fs');
const files = fs.readdirSync('supabase').filter(f => f.endsWith('.sql'));
for (const file of files) {
  const content = fs.readFileSync(`supabase/${file}`, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('create function') || lines[i].toLowerCase().includes('exec_sql')) {
      console.log(`${file}:${i+1}: ${lines[i].trim()}`);
    }
  }
}
