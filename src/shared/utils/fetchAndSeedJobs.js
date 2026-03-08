// scripts/fetchAndSeedJobs.js
// Usage: node scripts/fetchAndSeedJobs.js

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Helpers ───────────────────────────────────────────────

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function buildEmbedText(job) {
  return `
    Job Title: ${job.title}
    Company: ${job.company}
    Location: ${job.location || "Remote"}
    Tags: ${Array.isArray(job.tags) ? job.tags.join(", ") : ""}
    Description: ${stripHtml(job.description).slice(0, 6000)}
  `.trim();
}

async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Fetchers (one per API) ────────────────────────────────

async function fetchArbeitnow(pages = 3) {
  const jobs = [];
  for (let page = 1; page <= pages; page++) {
    const res = await fetch(
      `https://www.arbeitnow.com/api/job-board-api?page=${page}`
    );
    const data = await res.json();
    if (!data.data?.length) break;

    const mapped = data.data.map((j) => ({
      title: j.title,
      company: j.company_name,
      description: j.description,
      tags: j.tags || [],
      location: j.location || null,
      remote: j.remote || false,
      jobType: j.job_types?.[0] || null,
      sourceApi: "arbeitnow",
      sourceUrl: j.url,
      externalId: j.slug,
      postedAt: j.created_at ? new Date(j.created_at * 1000) : null,
    }));

    jobs.push(...mapped);
    console.log(`  Arbeitnow page ${page}: ${mapped.length} jobs fetched`);
    await sleep(500); // be polite to free API
  }
  return jobs;
}

async function fetchHimalayas(limit = 100) {
  const res = await fetch(`https://himalayas.app/jobs/api?limit=${limit}`);
  const data = await res.json();

  return (data.jobs || []).map((j) => ({
    title: j.title,
    company: j.company?.name || "Unknown",
    description: j.description || j.descriptionPlain || "",
    tags: j.categories || [],
    location: j.locationRestrictions?.join(", ") || "Remote",
    remote: true, // Himalayas is remote-only
    jobType: j.type || null,
    sourceApi: "himalayas",
    sourceUrl: j.applicationLink || j.url || null,
    externalId: j.id?.toString() || j.slug || null,
    postedAt: j.publishedAt ? new Date(j.publishedAt) : null,
  }));
}

// ── Main: Fetch → Embed → Save ────────────────────────────

async function seedJobs() {
  console.log("🚀 Starting job seeding...\n");

  // 1. Fetch from all sources
  console.log("📡 Fetching from Arbeitnow...");
  const arbeitnowJobs = await fetchArbeitnow(3); // 3 pages ~= 300 jobs

  console.log("📡 Fetching from Himalayas...");
  const himalayasJobs = await fetchHimalayas(100);

  const allJobs = [...arbeitnowJobs, ...himalayasJobs];
  console.log(`\n📦 Total fetched: ${allJobs.length} jobs`);

  // 2. Filter out jobs that already exist in DB
  let newJobs = [];
  for (const job of allJobs) {
    if (!job.externalId) continue;
    const exists = await prisma.job.findUnique({
      where: { sourceApi_externalId: { sourceApi: job.sourceApi, externalId: job.externalId } },
    });
    if (!exists) newJobs.push(job);
  }
  console.log(`🆕 New jobs to embed & save: ${newJobs.length}\n`);

  // 3. Embed + save one by one
  let saved = 0;
  let failed = 0;

  for (let i = 0; i < newJobs.length; i++) {
    const job = newJobs[i];
    try {
      process.stdout.write(`[${i + 1}/${newJobs.length}] Embedding: "${job.title}"...`);

      const embedText = buildEmbedText(job);
      const embedding = await generateEmbedding(embedText);

      await prisma.job.create({
        data: {
          ...job,
          embedding,
          embeddedAt: new Date(),
        },
      });

      console.log(` ✓`);
      saved++;

      // 300ms delay between embedding calls to stay safe on free tier
      await sleep(300);
    } catch (err) {
      console.log(` ✗ ${err.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Done! Saved: ${saved} | Failed: ${failed}`);
  await prisma.$disconnect();
}

seedJobs();