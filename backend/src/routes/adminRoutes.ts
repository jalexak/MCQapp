import { Router } from 'express'
import * as adminController from '../controllers/adminController.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { requireAdmin } from '../middleware/adminMiddleware.js'

const router = Router()

// All admin routes require authentication and admin role
router.use(authenticate)
router.use(requireAdmin)

// Question Management
router.get('/questions', adminController.getQuestions)
router.get('/questions/:id', adminController.getQuestion)
router.put('/questions/:id', adminController.updateQuestion)
router.delete('/questions/:id', adminController.deleteQuestion)
router.post('/questions', adminController.createQuestion)
router.post('/questions/import', adminController.importQuestions)

// User Management
router.get('/users', adminController.getUsers)
router.get('/users/:id', adminController.getUser)
router.put('/users/:id', adminController.updateUser)
router.delete('/users/:id', adminController.deleteUser)

// Analytics
router.get('/analytics/overview', adminController.getOverviewStats)
router.get('/analytics/exams', adminController.getExamStats)
router.get('/analytics/questions', adminController.getQuestionStats)

export default router
