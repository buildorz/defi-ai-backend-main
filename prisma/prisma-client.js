const { PrismaClient } = require('@prisma/client');

const prismaClientService = new PrismaClient();

module.exports = { prismaClientService };
