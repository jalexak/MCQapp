import { Router } from 'express'
import * as statsController from '../controllers/statsController.js'

const router = Router()

// Question statistics endpoint
router.get('/question/:questionId', statsController.getQuestionStats)

// Ranking endpoint
router.get('/ranking/:sessionId', statsController.getRanking)

export default router
