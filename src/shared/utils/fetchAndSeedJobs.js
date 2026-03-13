// scripts/fetchAndSeedJobs.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─────────────────────────────────────────────────────────
// Greenhouse board tokens — real companies, all public,
// deliberately picked for DIVERSITY across professions
// ─────────────────────────────────────────────────────────
const GREENHOUSE_COMPANIES = [
  // Tech (has design, writing, marketing, HR roles inside too)
  'stripe', 'notion', 'figma', 'vercel', 'linear',
  'openai', 'anthropic', 'supabase', 'planetscale', 'Railway',
  // Design-heavy companies
  'canva', 'miro', 'sketch', 'invision', 'framer',
  // Marketing / Content / Media
  'hubspot', 'mailchimp', 'buffer', 'semrush', 'ahrefs',
  // HR / People / Talent
  'lattice', 'rippling', 'deel', 'remote', 'oysterhr',
  // Finance / Fintech
  'brex', 'mercury', 'plaid', 'ramp', 'wise',
  // eCommerce / General Business
  'shopify', 'klaviyo', 'gorgias', 'rechargepayments', 'postscript',
  // Healthcare / Content
  'ro', 'hims', 'noom', 'calm', 'headspace',
  // Education / Writing
  'duolingo', 'coursera', 'kahoot', 'masterclass', 'brilliant',
  // General large employers (massive variety of roles)
  'airbnb', 'dropbox', 'zendesk', 'intercom', 'asana',
];

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n• ')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ').trim();
}

// Detect non-English text — returns true if text looks English
function isEnglish(text) {
  const sample = (text || '').slice(0, 400).toLowerCase();
  const nonEnglish = [
    /\b(und|oder|mit|für|die|der|das|wir|sind|wird|werden|können|müssen)\b/g,
    /\b(nous|vous|pour|avec|dans|sur|est|les|des)\b/g,
    /\b(para|con|por|los|las|del|una|como|más)\b/g,
  ];
  const hits = nonEnglish.reduce((n, re) => n + (sample.match(re)?.length || 0), 0);
  return hits < 5;
}

// Infer job category from title for better filtering later
function inferCategory(title) {
  const t = (title || '').toLowerCase();
  if (/engineer|developer|devops|backend|frontend|fullstack|ios|android|data scientist|ml |ai /.test(t)) return 'engineering';
  if (/design|ux|ui |product design|visual|brand|creative/.test(t)) return 'design';
  if (/market|growth|seo|content strateg|demand gen|campaign|social media/.test(t)) return 'marketing';
  if (/writ|editor|copy|content creat|journalist|author/.test(t)) return 'writing';
  if (/product manager|pm |product owner/.test(t)) return 'product';
  if (/sales|account exec|business dev|revenue|bdr|sdr/.test(t)) return 'sales';
  if (/hr |people ops|recruit|talent|human res/.test(t)) return 'hr';
  if (/finance|accounting|analyst|controller|cfo|bookkeep/.test(t)) return 'finance';
  if (/support|customer success|customer service|cx /.test(t)) return 'customer-support';
  if (/data analyst|data eng|analytics|bi |business intel/.test(t)) return 'data';
  if (/operations|ops|supply chain|logistics|project man/.test(t)) return 'operations';
  if (/legal|counsel|compliance|privacy/.test(t)) return 'legal';
  return 'other';
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent(text.slice(0, 8000));
  return result.embedding.values;
}

// ─────────────────────────────────────────────────────────
// Fetchers
// ─────────────────────────────────────────────────────────
async function fetchGreenhouse(boardToken) {
  const url = `https://api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'SkillSync-AI/1.0' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return [];
  const data = await res.json();

  return (data.jobs || []).map(j => {
    const description = stripHtml(j.content || '');
    const title = (j.title || '').trim();
    if (!title || !description || description.length < 80) return null;
    if (!isEnglish(title + ' ' + description.slice(0, 300))) return null;

    const category = inferCategory(title);

    return {
      title,
      company: boardToken.charAt(0).toUpperCase() + boardToken.slice(1), // fallback
      description,
      tags: [category],
      skills: category,
      location: j.location?.name || 'Worldwide',
      remote: /remote|worldwide|anywhere/i.test(j.location?.name || ''),
      jobType: 'Full-time',
      category,
      sourceApi: 'greenhouse',
      sourceUrl: j.absolute_url || null,
      externalId: j.id?.toString(),
      postedAt: j.updated_at ? new Date(j.updated_at) : new Date(),
    };
  }).filter(Boolean);
}

async function fetchRemotive() {
  const CATEGORIES = [
    'software-dev', 'design', 'marketing', 'writing',
    'product', 'customer-support', 'sales', 'hr', 'data',
  ];
  const jobs = [];
  for (const cat of CATEGORIES) {
    try {
      const res = await fetch(`https://remotive.com/api/remote-jobs?category=${cat}&limit=50`);
      if (!res.ok) continue;
      const data = await res.json();
      const mapped = (data.jobs || []).map(j => {
        const description = stripHtml(j.description || '');
        const title = (j.title || '').trim();
        if (!title || description.length < 80) return null;
        return {
          title,
          company: (j.company_name || '').trim(),
          description,
          tags: Array.isArray(j.tags) ? j.tags.slice(0, 8) : [],
          skills: Array.isArray(j.tags) ? j.tags.join(', ') : '',
          location: j.candidate_required_location || 'Remote',
          remote: true,
          jobType: j.job_type || 'Full-time',
          category: cat,
          sourceApi: 'remotive',
          sourceUrl: j.url,
          externalId: j.id?.toString(),
          postedAt: j.publication_date ? new Date(j.publication_date) : new Date(),
        };
      }).filter(Boolean);
      jobs.push(...mapped);
      await sleep(1200);
    } catch { /* skip failed category */ }
  }
  return jobs;
}

async function fetchRemoteOK() {
  try {
    const res = await fetch('https://remoteok.com/api', {
      headers: { 'User-Agent': 'SkillSync-AI/1.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.slice(1).map(j => {
      const description = stripHtml(j.description || '');
      const title = (j.position || '').trim();
      if (!title || description.length < 80) return null;
      return {
        title,
        company: (j.company || '').trim(),
        description,
        tags: Array.isArray(j.tags) ? j.tags.slice(0, 8) : [],
        skills: Array.isArray(j.tags) ? j.tags.join(', ') : '',
        location: j.location || 'Remote',
        remote: true,
        jobType: 'Full-time',
        category: inferCategory(title),
        sourceApi: 'remoteok',
        sourceUrl: j.url,
        externalId: j.id?.toString(),
        postedAt: j.epoch ? new Date(j.epoch * 1000) : new Date(),
      };
    }).filter(Boolean);
  } catch { return []; }
}

// ─────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────
async function seed() {
  console.log('🚀 SkillSync AI — General Purpose Job Seeder');
  console.log('━'.repeat(50) + '\n');

  // 1. Greenhouse — hit all companies
  console.log(`📡 Greenhouse (${GREENHOUSE_COMPANIES.length} companies)...`);
  const greenhouseJobs = [];
  let ghSuccess = 0, ghFail = 0;

  for (const token of GREENHOUSE_COMPANIES) {
    try {
      const jobs = await fetchGreenhouse(token);
      greenhouseJobs.push(...jobs);
      if (jobs.length) {
        process.stdout.write(`  ✓ ${token}: ${jobs.length} jobs\n`);
        ghSuccess++;
      }
      await sleep(200); // light delay — Greenhouse is not rate limited but be polite
    } catch {
      ghFail++;
    }
  }
  console.log(`  → ${greenhouseJobs.length} total from ${ghSuccess} companies\n`);

  // 2. Remotive
  console.log('📡 Remotive (9 categories)...');
  const remotiveJobs = await fetchRemotive();
  console.log(`  → ${remotiveJobs.length} jobs\n`);

  // 3. RemoteOK
  console.log('📡 RemoteOK...');
  const remoteokJobs = await fetchRemoteOK();
  console.log(`  → ${remoteokJobs.length} jobs\n`);

  // 4. Combine & deduplicate
  const allJobs = [...greenhouseJobs, ...remotiveJobs, ...remoteokJobs];
  console.log(`📦 Total raw: ${allJobs.length}`);

  const seen = new Set();
  const unique = allJobs.filter(j => {
    if (!j.externalId) return false;
    const key = `${j.sourceApi}:${j.externalId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log(`🔑 After dedup: ${unique.length}`);

  // 5. Filter already in DB
  const toSeed = [];
  for (const job of unique) {
    const exists = await prisma.job.findUnique({
      where: { sourceApi_externalId: { sourceApi: job.sourceApi, externalId: job.externalId } }
    }).catch(() => null);
    if (!exists) toSeed.push(job);
  }
  console.log(`🆕 New to embed and save: ${toSeed.length}\n`);

  // 6. Print category breakdown before embedding
  const catCounts = toSeed.reduce((acc, j) => {
    acc[j.category] = (acc[j.category] || 0) + 1;
    return acc;
  }, {});
  console.log('📊 Category breakdown:');
  Object.entries(catCounts).sort((a,b) => b[1]-a[1]).forEach(([cat, count]) => {
    console.log(`   ${cat.padEnd(20)} ${count} jobs`);
  });
  console.log();

// 7. Embed and save
  let saved = 0, failed = 0;
  const totalToProcess = toSeed.length; // Corrected variable

  for (let i = 0; i < totalToProcess; i++) {
    const jobData = toSeed[i]; // Corrected variable
    try {
      process.stdout.write(`[${i + 1}/${totalToProcess}] [${jobData.category}] "${jobData.title.slice(0, 30)}"...`);

      // 1. Embedding generate karein
      const embedText = `${jobData.title} ${jobData.description}`.slice(0, 8000);
      const embedding = await generateEmbedding(embedText);

      // 2. Database mein save karein
      await prisma.job.create({
        data: {
          title: jobData.title,
          company: jobData.company,
          description: jobData.description,
          tags: jobData.tags || [],
          location: jobData.location,
          remote: jobData.remote || false,
          jobType: jobData.jobType,
          sourceApi: jobData.sourceApi,
          sourceUrl: jobData.sourceUrl,
          externalId: jobData.externalId,
          category: jobData.category,
          postedAt: jobData.postedAt,
          embedding: embedding,
          embeddedAt: new Date(),
        },
      });

      console.log(" ✓");
      saved++; // Counter update

      // 3. RATE LIMIT PROTECTION
      await sleep(2500); 

    } catch (err) {
      failed++; // Counter update
      console.log(` ✗`);
      console.error(`   Error: ${err.message.slice(0, 80)}`);
      
      if (err.message.includes('429')) {
        console.log("🕒 Rate limit hit. Cooling down for 60 seconds...");
        await sleep(60000);
      }
    }
  }

  // 8. Summary
  console.log('\n' + '━'.repeat(50));
  console.log(`✅  Saved: ${saved}`);
  console.log(`❌  Failed: ${failed}`);
  console.log(`📦  Total in DB: ${await prisma.job.count()}`);
  console.log('━'.repeat(50));

  await prisma.$disconnect();
}

seed().catch(err => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});

seed();