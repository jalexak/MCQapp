import { Request, Response } from 'express'
import { ZodError } from 'zod'
import * as adminService from '../services/adminService.js'
import { UserRole } from '@prisma/client'

// Question Management

export async function getQuestions(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const subtopic = req.query.subtopic as string | undefined
    const difficulty = req.query.difficulty as string | undefined
    const search = req.query.search as string | undefined

    const result = await adminService.getQuestions({ page, limit, subtopic, difficulty, search })
    res.json(result)
  } catch (error) {
    console.error('Error getting questions:', error)
    res.status(500).json({ error: 'Failed to get questions' })
  }
}

export async function getQuestion(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const question = await adminService.getQuestion(id)

    if (!question) {
      res.status(404).json({ error: 'Question not found' })
      return
    }

    res.json({ question })
  } catch (error) {
    console.error('Error getting question:', error)
    res.status(500).json({ error: 'Failed to get question' })
  }
}

export async function updateQuestion(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const validated = adminService.UpdateQuestionSchema.parse(req.body)
    const question = await adminService.updateQuestion(id, validated)
    res.json({ question })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Invalid request', details: error.errors })
      return
    }
    console.error('Error updating question:', error)
    res.status(500).json({ error: 'Failed to update question' })
  }
}

export async function deleteQuestion(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    await adminService.deleteQuestion(id)
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting question:', error)
    res.status(500).json({ error: 'Failed to delete question' })
  }
}

export async function createQuestion(req: Request, res: Response) {
  try {
    const validated = adminService.CreateQuestionSchema.parse(req.body)
    const question = await adminService.createQuestion(validated)
    res.status(201).json({ question })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Invalid request', details: error.errors })
      return
    }
    console.error('Error creating question:', error)
    res.status(500).json({ error: 'Failed to create question' })
  }
}

export async function importQuestions(req: Request, res: Response) {
  try {
    const { questions } = req.body

    if (!Array.isArray(questions)) {
      res.status(400).json({ error: 'Questions must be an array' })
      return
    }

    const results = await adminService.importQuestions(questions)
    res.json(results)
  } catch (error) {
    console.error('Error importing questions:', error)
    res.status(500).json({ error: 'Failed to import questions' })
  }
}

// User Management

export async function getUsers(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const role = req.query.role as UserRole | undefined
    const search = req.query.search as string | undefined

    const result = await adminService.getUsers({ page, limit, role, search })
    res.json(result)
  } catch (error) {
    console.error('Error getting users:', error)
    res.status(500).json({ error: 'Failed to get users' })
  }
}

export async function getUser(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const user = await adminService.getUser(id)

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({ user })
  } catch (error) {
    console.error('Error getting user:', error)
    res.status(500).json({ error: 'Failed to get user' })
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    const validated = adminService.UpdateUserSchema.parse(req.body)
    const user = await adminService.updateUser(id, validated)
    res.json({ user })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Invalid request', details: error.errors })
      return
    }
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const id = req.params.id as string
    await adminService.deleteUser(id)
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ error: 'Failed to delete user' })
  }
}

// Analytics

export async function getOverviewStats(_req: Request, res: Response) {
  try {
    const stats = await adminService.getOverviewStats()
    res.json(stats)
  } catch (error) {
    console.error('Error getting overview stats:', error)
    res.status(500).json({ error: 'Failed to get overview stats' })
  }
}

export async function getExamStats(req: Request, res: Response) {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined

    const stats = await adminService.getExamStats({ startDate, endDate })
    res.json(stats)
  } catch (error) {
    console.error('Error getting exam stats:', error)
    res.status(500).json({ error: 'Failed to get exam stats' })
  }
}

export async function getQuestionStats(_req: Request, res: Response) {
  try {
    const stats = await adminService.getQuestionStats()
    res.json(stats)
  } catch (error) {
    console.error('Error getting question stats:', error)
    res.status(500).json({ error: 'Failed to get question stats' })
  }
}
