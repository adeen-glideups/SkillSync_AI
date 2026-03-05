/**
 * Script to regenerate all job embeddings using Voyage AI model
 * Run with: node scripts/regenerateJobEmbeddings.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { generateEmbedding } = require('../src/shared/utils/embeddingService');

const prisma = new PrismaClient();

async function regenerateJobEmbeddings() {
  try {
    console.log('🔄 Starting job embedding regeneration with Voyage AI...\n');

    // Fetch all jobs
    const jobs = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        description: true,
      },
    });

    console.log(`📋 Found ${jobs.length} jobs to regenerate embeddings for\n`);

    if (jobs.length === 0) {
      console.log('ℹ️  No jobs found in database');
      process.exit(0);
    }

    let successCount = 0;
    let errorCount = 0;

    // Regenerate embedding for each job
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      try {
        console.log(`[${i + 1}/${jobs.length}] Processing: "${job.title}"...`);

        // Generate embedding for job description
        const embedding = await generateEmbedding(job.description);

        // Update job with new embedding
        await prisma.job.update({
          where: { id: job.id },
          data: {
            embedding: JSON.stringify(embedding),
          },
        });

        console.log(`  ✅ Successfully regenerated embedding (${embedding.length} dimensions)\n`);
        successCount++;
      } catch (error) {
        console.error(`  ❌ Error processing job ID ${job.id}:`, error.message, '\n');
        errorCount++;
      }

      // Rate limiting - add small delay between API calls
      if (i < jobs.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log('\n✨ Regeneration complete!');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

regenerateJobEmbeddings();
