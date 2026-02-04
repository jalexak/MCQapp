/**
 * Backup database state before migrations
 *
 * Usage: npx tsx scripts/backupDatabase.ts
 */

import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function backup() {
  const prisma = new PrismaClient()
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)

  try {
    console.log('Starting database backup...')

    // Export all questions
    const questions = await prisma.question.findMany()
    console.log(`Found ${questions.length} questions`)

    // Export subtopics
    const subtopics = await prisma.subtopic.findMany()
    console.log(`Found ${subtopics.length} subtopics`)

    // Export exam sessions (for analytics preservation)
    const examSessions = await prisma.examSession.findMany()
    console.log(`Found ${examSessions.length} exam sessions`)

    const backup = {
      exportedAt: new Date().toISOString(),
      version: 'pre-V5-migration',
      counts: {
        questions: questions.length,
        subtopics: subtopics.length,
        examSessions: examSessions.length
      },
      questions,
      subtopics,
      examSessions
    }

    const backupPath = join(__dirname, '..', `backup_${timestamp}.json`)
    writeFileSync(backupPath, JSON.stringify(backup, null, 2))
    console.log(`\nBackup saved to: ${backupPath}`)
    console.log(`\nBackup complete!`)
    console.log(`  Questions: ${questions.length}`)
    console.log(`  Subtopics: ${subtopics.length}`)
    console.log(`  Exam Sessions: ${examSessions.length}`)

  } catch (error) {
    console.error('Backup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

backup()
