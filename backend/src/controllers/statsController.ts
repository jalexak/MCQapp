import { Request, Response } from 'express'
import * as statsService from '../services/statsService.js'

/**
 * Get statistics for a specific question
 */
export async function getQuestionStats(req: Request, res: Response) {
  try {
    const questionId = req.params.questionId as string

    if (!questionId) {
      res.status(400).json({ error: 'Question ID is required' })
      return
    }

    const stats = await statsService.getQuestionStats(questionId)

    res.json({
      questionId: stats.questionId,
      totalAttempts: stats.totalAttempts,
      correctCount: stats.correctCount,
      difficultyRate: Math.round((1 - stats.successRate) * 100) / 100 // Inverted: higher = harder
    })
  } catch (error) {
    console.error('Error fetching question stats:', error)
    res.status(500).json({ error: 'Failed to fetch question statistics' })
  }
}

/**
 * Get ranking for a specific exam session
 */
export async function getRanking(req: Request, res: Response) {
  try {
    const sessionId = req.params.sessionId as string

    if (!sessionId) {
      res.status(400).json({ error: 'Session ID is required' })
      return
    }

    const ranking = await statsService.getRanking(sessionId)

    if (!ranking) {
      res.status(404).json({ error: 'Ranking not available. Exam may not be completed.' })
      return
    }

    res.json({
      relativeScore: ranking.relativeScore,
      percentile: ranking.percentile,
      totalCandidates: ranking.totalCandidates,
      rank: ranking.rank
    })
  } catch (error) {
    console.error('Error fetching ranking:', error)
    res.status(500).json({ error: 'Failed to fetch ranking' })
  }
}
