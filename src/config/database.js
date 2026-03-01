const { PrismaClient } = require('@prisma/client');

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
