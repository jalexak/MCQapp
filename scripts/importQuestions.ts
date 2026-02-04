/**
 * Import questions from ALL_QUESTIONS_REMEDIATED.json into PostgreSQL
 * Updated for V5 format with new metadata fields and deduplication
 *
 * Usage: npx tsx scripts/importQuestions.ts
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface QuestionJSON {
  id: string
  stem: string
  options: {
    A: string
    B: string
    C: string
    D: string
    E: string
  }
  correct_answer: string
  explanation: string
  explanation_matrix: Record<string, {
    supports: string[]
    excludes: string[]
    why_not_best: string[]
  }>
  subtopic: string
  difficulty: string
  modality?: string
  learning_point?: string
  // V5 New Fields
  module?: string
  system?: string
  age_group?: string
  clinical_context?: string
  question_type?: string
  imaging_phase?: string | null
  task?: string
  discriminator_used?: string
}

// V5 wrapper format
interface V5Wrapper {
  version?: string
  created_at?: string
  total_count?: number
  questions: QuestionJSON[]
  remediated_at?: string
  remediation_note?: string
}

/**
 * Check for duplicate questions by ID and similar stems
 */
function deduplicateQuestions(questions: QuestionJSON[]): QuestionJSON[] {
  console.log('\n=== Deduplication Check ===')

  // Check for duplicate IDs
  const idCounts = new Map<string, number>()
  for (const q of questions) {
    idCounts.set(q.id, (idCounts.get(q.id) || 0) + 1)
  }

  const duplicateIds = [...idCounts.entries()].filter(([_, count]) => count > 1)
  if (duplicateIds.length > 0) {
    console.log(`Found ${duplicateIds.length} duplicate IDs:`)
    duplicateIds.forEach(([id, count]) => console.log(`  ${id}: ${count} occurrences`))
  } else {
    console.log('No duplicate IDs found')
  }

  // Remove duplicates by ID (keep first occurrence)
  const seen = new Set<string>()
  const unique = questions.filter(q => {
    if (seen.has(q.id)) return false
    seen.add(q.id)
    return true
  })

  // Check for near-duplicate stems (very similar questions)
  const stemHashes = new Map<string, string>()
  let nearDuplicates = 0

  for (const q of unique) {
    // Normalize stem for comparison (lowercase, remove extra whitespace)
    const normalizedStem = q.stem.toLowerCase().replace(/\s+/g, ' ').trim()
    const shortHash = normalizedStem.slice(0, 100) // First 100 chars as hash

    if (stemHashes.has(shortHash)) {
      nearDuplicates++
      if (nearDuplicates <= 5) {
        console.log(`  Near-duplicate: ${q.id} similar to ${stemHashes.get(shortHash)}`)
      }
    } else {
      stemHashes.set(shortHash, q.id)
    }
  }

  if (nearDuplicates > 0) {
    console.log(`Found ${nearDuplicates} potential near-duplicate stems (keeping all - manual review recommended)`)
  } else {
    console.log('No near-duplicate stems detected')
  }

  console.log(`After deduplication: ${unique.length} unique questions`)
  return unique
}

async function main() {
  const prisma = new PrismaClient()

  try {
    console.log('Reading questions file...')
    const questionsPath = join(__dirname, '..', 'ALL_QUESTIONS_REMEDIATED.json')
    const rawData = readFileSync(questionsPath, 'utf-8')
    const parsed = JSON.parse(rawData)

    // Handle both V5 wrapper format and flat array format
    let questions: QuestionJSON[]
    if (Array.isArray(parsed)) {
      questions = parsed
      console.log('Format: Flat array')
    } else if (parsed.questions && Array.isArray(parsed.questions)) {
      questions = parsed.questions
      console.log(`Format: V5 wrapper (version: ${parsed.version || 'unknown'})`)
      if (parsed.remediation_note) {
        console.log(`Note: ${parsed.remediation_note}`)
      }
    } else {
      throw new Error('Unknown JSON format - expected array or {questions: [...]}')
    }

    console.log(`Found ${questions.length} questions to import`)

    // Deduplication
    questions = deduplicateQuestions(questions)

    // Clear existing questions
    console.log('\nClearing existing questions...')
    await prisma.question.deleteMany({})

    // Import in batches for performance
    const batchSize = 100
    let imported = 0

    console.log('\nImporting questions...')
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize)

      await prisma.question.createMany({
        data: batch.map(q => ({
          id: q.id,
          stem: q.stem,
          optionA: q.options.A,
          optionB: q.options.B,
          optionC: q.options.C,
          optionD: q.options.D,
          optionE: q.options.E,
          correctAnswer: q.correct_answer,
          explanation: q.explanation || '',
          explanationMatrix: q.explanation_matrix || {},
          subtopic: q.subtopic || 'Uncategorised',
          difficulty: q.difficulty || 'medium',
          modality: q.modality || null,
          learningPoint: q.learning_point || null,
          // V5 New Fields
          module: q.module || null,
          system: q.system || null,
          ageGroup: q.age_group || null,
          clinicalContext: q.clinical_context || null,
          questionType: q.question_type || null,
          imagingPhase: q.imaging_phase || null,
          task: q.task || null,
          discriminatorUsed: q.discriminator_used || null
        }))
      })

      imported += batch.length
      console.log(`Imported ${imported}/${questions.length} questions`)
    }

    // Update subtopics table
    console.log('\nUpdating subtopics...')
    const subtopicCounts = await prisma.question.groupBy({
      by: ['subtopic'],
      _count: { id: true }
    })

    await prisma.subtopic.deleteMany({})
    await prisma.subtopic.createMany({
      data: subtopicCounts.map(s => ({
        name: s.subtopic,
        questionCount: s._count.id
      }))
    })

    console.log(`Created ${subtopicCounts.length} subtopic entries`)

    // Print summary
    const difficultyCounts = await prisma.question.groupBy({
      by: ['difficulty'],
      _count: { id: true }
    })

    const moduleCounts = await prisma.question.groupBy({
      by: ['module'],
      _count: { id: true }
    })

    console.log('\n=== Import Complete ===')
    console.log(`Total questions: ${questions.length}`)
    console.log('\nBy difficulty:')
    difficultyCounts.forEach(d => {
      console.log(`  ${d.difficulty}: ${d._count.id}`)
    })
    console.log('\nBy module:')
    moduleCounts.forEach(m => {
      console.log(`  ${m.module || 'null'}: ${m._count.id}`)
    })
    console.log(`\nSubtopics: ${subtopicCounts.length}`)

  } catch (error) {
    console.error('Import failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
