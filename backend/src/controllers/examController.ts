import { Request, Response } from 'express'
import { examService, questionService } from '../services/index.js'
import { StartExamSchema, AnswerSchema, FlagSchema } from '../types/index.js'
import { ZodError } from 'zod'

/**
 * Get available subtopics
 */
export async function getSubtopics(_req: Request, res: Response) {
  try {
    const subtopics = await questionService.getSubtopics()
    res.json({ subtopics })
  } catch (error) {
    console.error('Error fetching subtopics:', error)
    res.status(500).json({ error: 'Failed to fetch subtopics' })
  }
}

/**
 * Get question count for given criteria
 */
export async function getQuestionCount(req: Request, res: Response) {
  try {
    const subtopics = req.query.subtopics
      ? (req.query.subtopics as string).split(',')
      : undefined
    const difficulties = req.query.difficulties
      ? (req.query.difficulties as string).split(',')
      : undefined

    const count = await questionService.getQuestionCount(subtopics, difficulties)
    res.json({ count })
  } catch (error) {
    console.error('Error getting question count:', error)
    res.status(500).json({ error: 'Failed to get question count' })
  }
}

/**
 * Start a new exam session
 */
export async function startExam(req: Request, res: Response) {
  try {
    const validated = StartExamSchema.parse(req.body)
    const session = await examService.startExam(validated)

    // Also fetch the questions for the session
    const questions = await questionService.getQuestionsForExam(session.questionIds)

    res.status(201).json({
      session,
      questions
    })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Invalid request', details: error.errors })
      return
    }
    if (error instanceof Error && error.message.includes('Not enough questions')) {
      res.status(400).json({ error: error.message })
      return
    }
    console.error('Error starting exam:', error)
    res.status(500).json({ error: 'Failed to start exam' })
  }
}

/**
 * Get exam session with questions
 */
export async function getExamSession(req: Request, res: Response) {
  try {
    const sessionId = req.params.sessionId as string
    const session = await examService.getExamSession(sessionId)

    if (!session) {
      res.status(404).json({ error: 'Session not found' })
      return
    }

    // Fetch questions for the session
    const questions = await questionService.getQuestionsForExam(session.questionIds)

    res.json({
      session,
      questions
    })
  } catch (error) {
    console.error('Error fetching exam session:', error)
    res.status(500).json({ error: 'Failed to fetch exam session' })
  }
}

/**
 * Submit an answer
 */
export async function submitAnswer(req: Request, res: Response) {
  try {
    const sessionId = req.params.sessionId as string
    const validated = AnswerSchema.parse(req.body)

    const session = await examService.submitAnswer(
      sessionId,
      validated.questionId,
      validated.selected,
      req.body.timeSpent
    )

    if (!session) {
      res.status(404).json({ error: 'Session not found or already completed' })
      return
    }

    res.json({ session })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Invalid request', details: error.errors })
      return
    }
    console.error('Error submitting answer:', error)
    res.status(500).json({ error: 'Failed to submit answer' })
  }
}

/**
 * Toggle question flag
 */
export async function toggleFlag(req: Request, res: Response) {
  try {
    const sessionId = req.params.sessionId as string
    const validated = FlagSchema.parse(req.body)

    const session = await examService.toggleFlag(
      sessionId,
      validated.questionId,
      validated.flagged
    )

    if (!session) {
      res.status(404).json({ error: 'Session not found or already completed' })
      return
    }

    res.json({ session })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Invalid request', details: error.errors })
      return
    }
    console.error('Error toggling flag:', error)
    res.status(500).json({ error: 'Failed to toggle flag' })
  }
}

/**
 * Update time remaining
 */
export async function updateTime(req: Request, res: Response) {
  try {
    const sessionId = req.params.sessionId as string
    const { timeRemaining } = req.body

    if (typeof timeRemaining !== 'number' || timeRemaining < 0) {
      res.status(400).json({ error: 'Invalid timeRemaining' })
      return
    }

    await examService.updateTimeRemaining(sessionId, timeRemaining)
    res.json({ success: true })
  } catch (error) {
    console.error('Error updating time:', error)
    res.status(500).json({ error: 'Failed to update time' })
  }
}

/**
 * Complete exam and get results
 */
export async function completeExam(req: Request, res: Response) {
  try {
    const sessionId = req.params.sessionId as string
    const { timeRemaining } = req.body

    const results = await examService.completeExam(sessionId, timeRemaining)

    if (!results) {
      res.status(404).json({ error: 'Session not found' })
      return
    }

    res.json({ results })
  } catch (error) {
    console.error('Error completing exam:', error)
    res.status(500).json({ error: 'Failed to complete exam' })
  }
}

/**
 * Get results for a completed exam
 */
export async function getExamResults(req: Request, res: Response) {
  try {
    const sessionId = req.params.sessionId as string
    const results = await examService.getExamResults(sessionId)

    if (!results) {
      res.status(404).json({ error: 'Results not found or exam not completed' })
      return
    }

    res.json({ results })
  } catch (error) {
    console.error('Error fetching results:', error)
    res.status(500).json({ error: 'Failed to fetch results' })
  }
}
