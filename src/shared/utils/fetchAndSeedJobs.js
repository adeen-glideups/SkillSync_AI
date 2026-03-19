// scripts/fetchAndSeedJobs.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─────────────────────────────────────────────────────────
// Greenhouse board tokens
// ─────────────────────────────────────────────────────────
const GREENHOUSE_COMPANIES = [
  'stripe', 'notion', 'figma', 'vercel', 'linear',
  'openai', 'anthropic', 'supabase', 'planetscale',
  'canva', 'miro', 'invision', 'framer',
  'hubspot', 'mailchimp', 'buffer', 'semrush',
  'lattice', 'rippling', 'deel', 'oysterhr',
  'brex', 'mercury', 'plaid', 'ramp', 'wise',
  'shopify', 'klaviyo', 'gorgias', 'postscript',
  'ro', 'noom', 'calm', 'headspace',
  'duolingo', 'coursera', 'masterclass', 'brilliant',
  'airbnb', 'dropbox', 'zendesk', 'intercom', 'asana',
];

// ─────────────────────────────────────────────────────────
// SKILL EXTRACTOR
// tags = real skills extracted from job description
// ─────────────────────────────────────────────────────────
function extractSkills(title, description) {
  const text = ((title || '') + ' ' + (description || '')).toLowerCase();

  const skillMap = {
    // Languages
    'JavaScript':        /\bjavascript\b/,
    'TypeScript':        /\btypescript\b/,
    'Python':            /\bpython\b/,
    'Java':              /\bjava\b(?!script)/,
    'Go':                /\bgolang\b|\bgo lang\b/,
    'Ruby':              /\bruby\b/,
    'PHP':               /\bphp\b/,
    'Swift':             /\bswift\b/,
    'Kotlin':            /\bkotlin\b/,
    'Rust':              /\brust\b/,
    'C++':               /\bc\+\+\b/,
    'C#':                /\bc#\b|\.net\b/,
    'Scala':             /\bscala\b/,
    'R':                 /\br programming\b|\blanguage r\b/,

    // Frontend
    'React':             /\breact\.?js\b|\breact\b/,
    'Vue.js':            /\bvue\.?js\b|\bvuejs\b/,
    'Angular':           /\bangular\b/,
    'Next.js':           /\bnext\.?js\b/,
    'Svelte':            /\bsvelte\b/,
    'HTML':              /\bhtml\b/,
    'CSS':               /\bcss\b/,
    'Sass':              /\bsass\b|\bscss\b/,
    'Tailwind CSS':      /\btailwind\b/,
    'Redux':             /\bredux\b/,
    'jQuery':            /\bjquery\b/,

    // Backend
    'Node.js':           /\bnode\.?js\b/,
    'Express':           /\bexpress\.?js\b|\bexpress\b/,
    'Django':            /\bdjango\b/,
    'FastAPI':           /\bfastapi\b/,
    'Flask':             /\bflask\b/,
    'Spring Boot':       /\bspring boot\b|\bspring\b/,
    'Laravel':           /\blaravel\b/,
    'Ruby on Rails':     /\bruby on rails\b|\brails\b/,
    'GraphQL':           /\bgraphql\b/,
    'REST API':          /\brest api\b|\brestful\b/,
    'gRPC':              /\bgrpc\b/,

    // Databases
    'PostgreSQL':        /\bpostgresql\b|\bpostgres\b/,
    'MySQL':             /\bmysql\b/,
    'MongoDB':           /\bmongodb\b/,
    'Redis':             /\bredis\b/,
    'Elasticsearch':     /\belasticsearch\b/,
    'Prisma':            /\bprisma\b/,
    'SQLite':            /\bsqlite\b/,
    'Snowflake':         /\bsnowflake\b/,
    'BigQuery':          /\bbigquery\b/,

    // Cloud & DevOps
    'AWS':               /\baws\b|\bamazon web services\b/,
    'GCP':               /\bgcp\b|\bgoogle cloud\b/,
    'Azure':             /\bazure\b/,
    'Docker':            /\bdocker\b/,
    'Kubernetes':        /\bkubernetes\b|\bk8s\b/,
    'CI/CD':             /\bci\/cd\b|\bgithub actions\b|\bcircle ?ci\b/,
    'Terraform':         /\bterraform\b/,
    'Linux':             /\blinux\b|\bunix\b/,
    'Git':               /\bgit\b/,

    // Data & ML
    'Machine Learning':  /\bmachine learning\b/,
    'Deep Learning':     /\bdeep learning\b/,
    'TensorFlow':        /\btensorflow\b/,
    'PyTorch':           /\bpytorch\b/,
    'Pandas':            /\bpandas\b/,
    'NumPy':             /\bnumpy\b/,
    'SQL':               /\bsql\b/,
    'Tableau':           /\btableau\b/,
    'Power BI':          /\bpower bi\b/,
    'dbt':               /\bdbt\b/,
    'Spark':             /\bapache spark\b|\bpyspark\b/,
    'Airflow':           /\bairflow\b/,

    // Design Tools
    'Figma':             /\bfigma\b/,
    'Sketch':            /\bsketch\b/,
    'Adobe XD':          /\badobe xd\b/,
    'Photoshop':         /\bphotoshop\b/,
    'Illustrator':       /\billustrator\b/,
    'After Effects':     /\bafter effects\b/,
    'InDesign':          /\bindesign\b/,
    'Webflow':           /\bwebflow\b/,
    'Framer':            /\bframer\b/,
    'Canva':             /\bcanva\b/,
    'Procreate':         /\bprocreate\b/,
    'Blender':           /\bblender\b/,
    'Cinema 4D':         /\bcinema 4d\b/,

    // Marketing Tools
    'Google Analytics':  /\bgoogle analytics\b/,
    'HubSpot':           /\bhubspot\b/,
    'Salesforce':        /\bsalesforce\b/,
    'Mailchimp':         /\bmailchimp\b/,
    'SEO':               /\bseo\b/,
    'SEM':               /\bsem\b|\bgoogle ads\b|\bppc\b/,
    'Facebook Ads':      /\bfacebook ads\b|\bmeta ads\b/,
    'Google Ads':        /\bgoogle ads\b/,
    'Email Marketing':   /\bemail marketing\b/,
    'Content Marketing': /\bcontent marketing\b/,
    'Social Media':      /\bsocial media\b/,
    'Marketo':           /\bmarketo\b/,
    'Klaviyo':           /\bklaviyo\b/,

    // Writing & Content
    'Copywriting':       /\bcopywriting\b|\bcopywriter\b/,
    'Content Writing':   /\bcontent writ/,
    'Technical Writing': /\btechnical writ/,
    'SEO Writing':       /\bseo writ/,
    'Editing':           /\bediting\b/,
    'Proofreading':      /\bproofreading\b/,
    'WordPress':         /\bwordpress\b/,
    'Storytelling':      /\bstorytelling\b/,
    'Ghost':             /\bghost\b(?= cms| publish)/,

    // HR & People
    'Recruiting':        /\brecruit/,
    'Onboarding':        /\bonboarding\b/,
    'HRIS':              /\bhris\b/,
    'Workday':           /\bworkday\b/,
    'BambooHR':          /\bbamboohr\b/,
    'ATS':               /\bats\b|applicant tracking/,
    'Performance Management': /\bperformance management\b/,
    'Compensation':      /\bcompensation\b/,

    // Finance
    'Excel':             /\bexcel\b|\bspreadsheet\b/,
    'QuickBooks':        /\bquickbooks\b/,
    'Financial Modeling':/\bfinancial model/,
    'Accounting':        /\baccounting\b/,
    'GAAP':              /\bgaap\b/,
    'Forecasting':       /\bforecasting\b/,
    'Budgeting':         /\bbudgeting\b/,

    // Soft / Cross-functional
    'Project Management':/\bproject manag/,
    'Agile':             /\bagile\b/,
    'Scrum':             /\bscrum\b/,
    'Jira':              /\bjira\b/,
    'Notion':            /\bnotion\b/,
    'Slack':             /\bslack\b/,
    'Communication':     /\bcommunication\b/,
    'Leadership':        /\bleadership\b/,
    'Product Roadmap':   /\broadmap\b/,
    'A/B Testing':       /\ba\/b test/,
    'Customer Success':  /\bcustomer success\b/,
    'CRM':               /\bcrm\b/,
  };

  const found = [];
  for (const [skill, regex] of Object.entries(skillMap)) {
    if (regex.test(text)) found.push(skill);
  }

  return found; // empty array is fine — honest is better than fake
}

// ─────────────────────────────────────────────────────────
// CATEGORY INFERRER — stores ONE category label like "engineering"
// ─────────────────────────────────────────────────────────
function inferCategory(title) {
  const t = (title || '').toLowerCase();
  if (/engineer|developer|devops|backend|frontend|fullstack|ios|android|software|programmer|architect/.test(t)) return 'engineering';
  if (/design|ux|ui |product design|visual|brand|creative|motion|graphic/.test(t)) return 'design';
  if (/market|growth|seo|content strat|demand gen|campaign|social media|paid|acquisition/.test(t)) return 'marketing';
  if (/writ|editor|copy|content creat|journalist|author|technical writer/.test(t)) return 'writing';
  if (/product manager|pm |product owner|product lead/.test(t)) return 'product';
  if (/sales|account exec|business dev|revenue|bdr|sdr|account manager/.test(t)) return 'sales';
  if (/\bhr\b|people ops|recruit|talent|human res|people partner/.test(t)) return 'hr';
  if (/finance|accounting|financial|controller|cfo|bookkeep|payroll/.test(t)) return 'finance';
  if (/support|customer success|customer service|\bcx\b|help desk/.test(t)) return 'customer-support';
  if (/data analyst|data eng|analytics|\bbi\b|business intel|data science/.test(t)) return 'data';
  if (/operations|ops|supply chain|logistics|project man/.test(t)) return 'operations';
  if (/legal|counsel|compliance|privacy|paralegal/.test(t)) return 'legal';
  if (/security|cybersec|infosec|penetration|soc analyst/.test(t)) return 'security';
  return 'other';
}

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
    const tags = extractSkills(title, description);       // ← real skills

    return {
      title,
      company: boardToken.charAt(0).toUpperCase() + boardToken.slice(1),
      description,
      tags,                                               // real skills array
      location: j.location?.name || 'Worldwide',
      remote: /remote|worldwide|anywhere/i.test(j.location?.name || ''),
      jobType: 'Full-time',
      category,                                           // single category label
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

        // Remotive gives its own tags — combine with extracted skills
        const remotiveTags = Array.isArray(j.tags) ? j.tags : [];
        const extracted = extractSkills(title, description);
        const tags = [...new Set([...remotiveTags, ...extracted])].slice(0, 15);

        return {
          title,
          company: (j.company_name || '').trim(),
          description,
          tags,
          location: j.candidate_required_location || 'Remote',
          remote: true,
          jobType: j.job_type || 'Full-time',
          category: inferCategory(title),
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

      const remoteokTags = Array.isArray(j.tags) ? j.tags : [];
      const extracted = extractSkills(title, description);
      const tags = [...new Set([...remoteokTags, ...extracted])].slice(0, 15);

      return {
        title,
        company: (j.company || '').trim(),
        description,
        tags,
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

  // 1. Greenhouse
  console.log(`📡 Greenhouse (${GREENHOUSE_COMPANIES.length} companies)...`);
  const greenhouseJobs = [];
  let ghSuccess = 0;

  for (const token of GREENHOUSE_COMPANIES) {
    try {
      const jobs = await fetchGreenhouse(token);
      greenhouseJobs.push(...jobs);
      if (jobs.length) {
        process.stdout.write(`  ✓ ${token}: ${jobs.length} jobs\n`);
        ghSuccess++;
      }
      await sleep(200);
    } catch { /* skip failed company */ }
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

  // 5. Skip already in DB
  const toSeed = [];
  for (const job of unique) {
    const exists = await prisma.job.findUnique({
      where: { sourceApi_externalId: { sourceApi: job.sourceApi, externalId: job.externalId } }
    }).catch(() => null);
    if (!exists) toSeed.push(job);
  }
  console.log(`🆕 New to embed and save: ${toSeed.length}\n`);

  // 6. Category breakdown
  const catCounts = toSeed.reduce((acc, j) => {
    acc[j.category] = (acc[j.category] || 0) + 1;
    return acc;
  }, {});
  console.log('📊 Category breakdown:');
  Object.entries(catCounts).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`   ${cat.padEnd(20)} ${count} jobs`);
  });
  console.log();

  // 7. Embed and save
  let saved = 0, failed = 0;

  for (let i = 0; i < toSeed.length; i++) {
    const job = toSeed[i];
    try {
      process.stdout.write(
        `[${String(i + 1).padStart(4)}/${toSeed.length}] [${job.category.padEnd(14)}] "${job.title.slice(0, 38)}"...`
      );

      const embedText = `
        Job Title: ${job.title}
        Company: ${job.company}
        Category: ${job.category}
        Skills: ${job.tags.join(', ')}
        Description: ${job.description.slice(0, 5000)}
      `.trim();

      const embedding = await generateEmbedding(embedText);

      await prisma.job.create({
        data: {
          title:       job.title,
          company:     job.company,
          description: job.description,
          tags:        job.tags,
          location:    job.location,
          remote:      job.remote,
          jobType:     job.jobType,
          category:    job.category,
          sourceApi:   job.sourceApi,
          sourceUrl:   job.sourceUrl,
          externalId:  job.externalId,
          postedAt:    job.postedAt,
          embedding:   embedding,
          embeddedAt:  new Date(),
        },
      });

      console.log(' ✓');
      saved++;
      await sleep(2500);

    } catch (err) {
      failed++;
      console.log(` ✗ ${err.message.slice(0, 60)}`);
      if (err.message.includes('429')) {
        console.log('🕒 Rate limit hit — cooling down 60s...');
        await sleep(60000);
      }
    }
  }

  // 8. Summary
  console.log('\n' + '━'.repeat(50));
  console.log(`✅  Saved:  ${saved}`);
  console.log(`❌  Failed: ${failed}`);
  console.log(`📦  Total in DB: ${await prisma.job.count()}`);
  console.log('━'.repeat(50));

  await prisma.$disconnect();
}

seed().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});