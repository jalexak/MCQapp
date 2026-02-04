/**
 * Verify V5 question import
 *
 * Usage: npx tsx scripts/verifyV5.ts
 */

import { PrismaClient } from '@prisma/client'

async function verify() {
  const prisma = new PrismaClient()

  try {
    console.log('=== V5 Import Verification ===\n')

    // Count total questions
    const total = await prisma.question.count()
    console.log(`Total questions: ${total}`)
    console.log(total === 2499 ? '  ✓ Expected count (2499)' : `  ✗ Expected 2499, got ${total}`)

    // Verify V5 fields populated
    const withModule = await prisma.question.count({ where: { module: { not: null } } })
    const withSystem = await prisma.question.count({ where: { system: { not: null } } })
    const withAgeGroup = await prisma.question.count({ where: { ageGroup: { not: null } } })
    const withClinicalContext = await prisma.question.count({ where: { clinicalContext: { not: null } } })
    const withQuestionType = await prisma.question.count({ where: { questionType: { not: null } } })

    console.log('\nV5 field population:')
    console.log(`  module: ${withModule} (${Math.round(withModule / total * 100)}%)`)
    console.log(`  system: ${withSystem} (${Math.round(withSystem / total * 100)}%)`)
    console.log(`  ageGroup: ${withAgeGroup} (${Math.round(withAgeGroup / total * 100)}%)`)
    console.log(`  clinicalContext: ${withClinicalContext} (${Math.round(withClinicalContext / total * 100)}%)`)
    console.log(`  questionType: ${withQuestionType} (${Math.round(withQuestionType / total * 100)}%)`)

    // Check for duplicates
    const ids = await prisma.question.findMany({ select: { id: true } })
    const uniqueIds = new Set(ids.map(q => q.id))
    const hasDuplicates = uniqueIds.size !== ids.length

    console.log('\nDuplicate check:')
    console.log(hasDuplicates
      ? `  ✗ Found ${ids.length - uniqueIds.size} duplicate IDs!`
      : '  ✓ No duplicate IDs found')

    // Difficulty distribution
    const difficultyStats = await prisma.question.groupBy({
      by: ['difficulty'],
      _count: { id: true }
    })

    console.log('\nDifficulty distribution:')
    difficultyStats.forEach(d => {
      console.log(`  ${d.difficulty}: ${d._count.id}`)
    })

    // Module distribution
    const moduleStats = await prisma.question.groupBy({
      by: ['module'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    })

    console.log('\nModule distribution:')
    moduleStats.forEach(m => {
      console.log(`  ${m.module || 'null'}: ${m._count.id}`)
    })

    // Sample a question to show V5 fields
    const sample = await prisma.question.findFirst({
      where: { module: { not: null } }
    })

    if (sample) {
      console.log('\nSample question with V5 fields:')
      console.log(`  ID: ${sample.id}`)
      console.log(`  Module: ${sample.module}`)
      console.log(`  System: ${sample.system}`)
      console.log(`  Age Group: ${sample.ageGroup}`)
      console.log(`  Clinical Context: ${sample.clinicalContext}`)
      console.log(`  Question Type: ${sample.questionType}`)
      console.log(`  Imaging Phase: ${sample.imagingPhase}`)
      console.log(`  Task: ${sample.task}`)
    }

    // Subtopic count
    const subtopicCount = await prisma.subtopic.count()
    console.log(`\nSubtopics: ${subtopicCount}`)

    console.log('\n=== Verification Complete ===')

    // Summary status
    const allGood = total === 2499 && !hasDuplicates && withModule > 0
    console.log(allGood
      ? '\n✓ All checks passed!'
      : '\n✗ Some checks failed - review above')

  } catch (error) {
    console.error('Verification failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verify()
