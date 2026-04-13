const { Client } = require('pg');

async function verify() {
  const client = new Client({
    host: 'ep-wild-pine-an83rwas.c-6.us-east-1.aws.neon.tech',
    user: 'neondb_owner',
    password: 'npg_c1koOGfJrY4e',
    database: 'neondb',
    ssl: true,
  });

  try {
    await client.connect();
    const res = await client.query('SELECT COUNT(*) as count FROM "Job"');
    const count = res.rows[0].count;
    console.log('\n✅ Migration Verification:');
    console.log(`📊 Total jobs in Neon: ${count}`);
    
    if (count > 0) {
      const sample = await client.query('SELECT id, title, company FROM "Job" LIMIT 3');
      console.log('\n📋 Sample jobs:');
      sample.rows.forEach((r, i) => {
        console.log(`   ${i+1}. [${r.id}] ${r.title} @ ${r.company}`);
      });
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

verify();
