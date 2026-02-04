#!/usr/bin/env npx tsx

/**
 * Script to promote a user to admin role
 * Usage: npx tsx scripts/makeAdmin.ts <email>
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('Usage: npx tsx scripts/makeAdmin.ts <email>')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  })

  if (!user) {
    console.error(`User with email "${email}" not found`)
    process.exit(1)
  }

  if (user.role === 'admin') {
    console.log(`User "${email}" is already an admin`)
    process.exit(0)
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: 'admin' }
  })

  console.log(`Successfully promoted "${email}" to admin role`)
}

main()
  .catch((error) => {
    console.error('Error:', error.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
