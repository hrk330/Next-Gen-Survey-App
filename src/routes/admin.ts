import express from 'express';
import surveysController from '../controller/surveysController';
import * as adminController from '../controller/adminController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminAuthMiddleware } from '../middleware/authMiddleware';



const router = express.Router();

router.post('/login', adminController.adminLogin);

router.use(authMiddleware);

router.use(adminAuthMiddleware);

router.post('/createSurvey', surveysController.createSurvey);

router.post('/teams', adminController.createTeam);

router.post('/teams/:teamCode/members', adminController.addMemberToTeam);

router.put('/teams/:teamCode/survey-time-frame', adminController.setSurveyTimeFrame);

router.get('/teams/:teamCode/survey-data', adminController.getSurveyData);

router.get('/allSurveyData', surveysController.getAllSurveyData);

router.get('/surveyById/:surveyId', surveysController.getSurveyById);

router.get('/teams/count', adminController.getTotalNumberOfTeams);

router.get('/users/count', adminController.getTotalNumberOfUsers);

router.get('/responses/count', adminController.getTotalSurveyResponses);

router.get('/teams/info', adminController.getTeamInfo);

router.get('/getallsurveys', surveysController.getAllSurveys);

router.delete('/teams/:teamCode/members/:userId', adminController.removeMemberFromTeam);

export default router;
