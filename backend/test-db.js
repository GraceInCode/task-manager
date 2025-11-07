const { PrismaClient } = require('./prisma/generated/client');
const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log('Connected successfully!');
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashed'  // Hash in real code
      }
    });
    console.log('User created:', user);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();