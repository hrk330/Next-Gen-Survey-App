import express from 'express';
import {
  registerUser,
  loginUser,
  joinTeam,
  switchTeam,
} from '../controller/usersController';
import { submitSurveyResponse } from '../controller/surveysController';
import { authMiddleware } from '../middleware/authMiddleware';
const router = express.Router();

// API endpoint for user registration
router.post('/register', registerUser);

// API endpoint for user login
router.post('/login', loginUser);

// API endpoint for adding a user to a team
router.post('/join-team', authMiddleware, joinTeam);
router.post('/switch-team', authMiddleware, switchTeam);
router.post('/:surveyId/submit', authMiddleware, submitSurveyResponse);

export default router;
