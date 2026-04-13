const { PrismaClient } = require('@prisma/client');

const sanitizeDatabaseEnv = () => {
  const normalize = (value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    // Vercel env values are sometimes pasted with wrapping quotes.
    return trimmed.replace(/^['\"]|['\"]$/g, '');
  };

  if (process.env.DATABASE_URL) {
    process.env.DATABASE_URL = normalize(process.env.DATABASE_URL);
  }

  if (process.env.DIRECT_URL) {
    process.env.DIRECT_URL = normalize(process.env.DIRECT_URL);
  }
};

sanitizeDatabaseEnv();

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('📦 Connected to MySQL database');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

const disconnectDatabase = async () => {
  await prisma.$disconnect();
  console.log('📦 Disconnected from database');
};

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase,
};
