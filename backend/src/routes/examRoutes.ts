import { Router } from 'express'
import { examController } from '../controllers/index.js'

const router = Router()

// Question endpoints
router.get('/questions/subtopics', examController.getSubtopics)
router.get('/questions/count', examController.getQuestionCount)

// Exam endpoints
router.post('/exam/start', examController.startExam)
router.get('/exam/:sessionId', examController.getExamSession)
router.post('/exam/:sessionId/answer', examController.submitAnswer)
router.post('/exam/:sessionId/flag', examController.toggleFlag)
router.post('/exam/:sessionId/time', examController.updateTime)
router.post('/exam/:sessionId/complete', examController.completeExam)
router.get('/exam/:sessionId/results', examController.getExamResults)

export default router
