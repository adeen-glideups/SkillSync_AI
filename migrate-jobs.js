const mysql = require('mysql2/promise');
const { Client } = require('pg');

const LOCAL_MYSQL = {
  host: 'localhost',
  user: 'root',
  password: '', // No password for XAMPP
  database: 'skill_sync_ai',
};

const NEON_PG = {
  host: 'ep-wild-pine-an83rwas.c-6.us-east-1.aws.neon.tech',
  user: 'neondb_owner',
  password: 'npg_c1koOGfJrY4e',
  database: 'neondb',
  ssl: true,
};

async function migrate() {
  let mysqlConn, pgClient;

  try {
    console.log('🔗 Connecting to local MySQL...');
    mysqlConn = await mysql.createConnection(LOCAL_MYSQL);
    console.log('✅ MySQL connected');

    console.log('🔗 Connecting to Neon PostgreSQL...');
    pgClient = new Client(NEON_PG);
    await pgClient.connect();
    console.log('✅ Neon connected');

    // Fetch all jobs from MySQL
    console.log('\n📥 Fetching jobs from MySQL...');
    const [jobs] = await mysqlConn.query('SELECT * FROM `Job`');
    console.log(`✅ Found ${jobs.length} jobs in MySQL`);

    if (jobs.length === 0) {
      console.log('⚠️  No jobs found to migrate');
      return;
    }

    // Create tables in Neon if not exist
    console.log('\n🏗️  Creating tables in Neon...');
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS "Job" (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        company VARCHAR(255),
        description TEXT,
        tags JSONB,
        location VARCHAR(255),
        remote BOOLEAN DEFAULT false,
        "jobType" VARCHAR(100),
        "sourceApi" VARCHAR(100) NOT NULL,
        "sourceUrl" TEXT,
        "externalId" VARCHAR(255),
        embedding JSONB,
        "embeddedAt" TIMESTAMP,
        category VARCHAR(100),
        "postedAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("sourceApi", "externalId")
      )
    `);
    console.log('✅ Tables created/verified');

    // Insert jobs into Neon
    console.log('\n📤 Inserting jobs into Neon...');
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const job of jobs) {
      try {
        const {
          id,
          title,
          company,
          description,
          tags,
          location,
          remote,
          jobType,
          sourceApi,
          sourceUrl,
          externalId,
          embedding,
          embeddedAt,
          category,
          postedAt,
          createdAt,
          updatedAt,
        } = job;

        // Skip if no sourceApi or externalId (required for uniqueness)
        if (!sourceApi || !externalId) {
          skippedCount++;
          continue;
        }

        // Convert to JSON safely
        let tagsStr = null;
        let embeddingStr = null;

        if (tags) {
          try {
            tagsStr = typeof tags === 'string' ? tags : JSON.stringify(tags);
          } catch {
            tagsStr = null;
          }
        }

        if (embedding) {
          try {
            embeddingStr = typeof embedding === 'string' ? embedding : JSON.stringify(embedding);
          } catch {
            embeddingStr = null;
          }
        }

        await pgClient.query(
          `INSERT INTO "Job" 
          (id, title, company, description, tags, location, remote, "jobType", 
           "sourceApi", "sourceUrl", "externalId", embedding, "embeddedAt", 
           category, "postedAt", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11, $12::jsonb, $13, $14, $15, $16, $17)
          ON CONFLICT ("sourceApi", "externalId") DO NOTHING`,
          [
            id,
            title,
            company,
            description,
            tagsStr,
            location,
            remote,
            jobType,
            sourceApi,
            sourceUrl,
            externalId,
            embeddingStr,
            embeddedAt,
            category,
            postedAt,
            createdAt,
            updatedAt,
          ]
        );
        successCount++;
        if (successCount % 100 === 0) console.log(`  ✓ ${successCount} jobs inserted...`);
      } catch (err) {
        errorCount++;
      }
    }
    console.log(`\n✅ Inserted ${successCount} jobs into Neon`);
    console.log(`✅ Inserted ${jobs.length} jobs into Neon`);

    // Verify count
    console.log('\n🔍 Verifying migration...');
    const result = await pgClient.query('SELECT COUNT(*) FROM "Job"');
    const neonCount = parseInt(result.rows[0].count);
    console.log(`✅ Neon now has ${neonCount} jobs`);

    if (neonCount > 0) {
      const sample = await pgClient.query('SELECT id, title, company, "sourceApi" FROM "Job" LIMIT 5');
      console.log('\n📋 Sample jobs migrated:');
      sample.rows.forEach((r) => {
        console.log(`  - [${r.id}] ${r.title} @ ${r.company} (${r.sourceApi})`);
      });
    }

    console.log('\n✨ Migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    if (mysqlConn) await mysqlConn.end();
    if (pgClient) await pgClient.end();
  }
}

migrate();
