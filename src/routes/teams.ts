import express from 'express';
import teamsController from '../controller/teamsController';

const router = express.Router();

// API endpoint for creating a new team
router.post('/', teamsController.createTeam);

// API endpoint for adding a user to a team
router.post('/:teamCode/members', teamsController.addMemberToTeam);

// API endpoint for removing a user from a team
router.delete('/:teamCode/members/:userId', teamsController.removeMemberFromTeam);

// API endpoint for getting all teams
router.get('/all', teamsController.getAllTeams);

export default router;
