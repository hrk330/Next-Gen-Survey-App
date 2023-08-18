import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Team from '../models/Team'; 
import User from '../models/User';
import Survey ,{ISurvey} from '../models/Survey';
import usersController from './usersController';
import mongoose from 'mongoose';


const adminId = 'your-admin-id';


/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: APIs related to managing teams
 */




/**
 * @swagger
 * /api/admin/teams:
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: [] 
 *     parameters: 
 *       - name: Authorization
 *         in: header
 *         description: Bearer Token
 *         required: false
 *         type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teamCode:
 *                 type: string
 *             example:
 *               teamCode: "team-456"
 *     responses:
 *       201:
 *         description: Team created successfully
 *       403:
 *         description: User is not a member of the target team
 *       400:
 *         description: Team code already exists
 *     securityDefinitions:
 *       bearerAuth:
 *        type: apiKey
 *        name: Authorization
 *        in: header
 */

// Controller function for creating a new team
export const createTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamCode } = req.body;

    // Check if the team code is already taken
    const existingTeam = await Team.findOne({ teamCode });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team code already exists' });
    }

    // Create the new team
    const newTeam = new Team({
      teamCode,
      members: [],
    });

    await newTeam.save();

    return res.status(201).json({ message: 'Team created successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/teams/count:
 *   get:
 *     summary: Get the total number of teams
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: [] 
 *     parameters: 
 *       - name: Authorization
 *         in: header
 *         description: Bearer Token
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Total number of teams
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTeams:
 *                   type: number
 *             example:
 *               totalTeams: 5
 */
export const getTotalNumberOfTeams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalTeams = await Team.countDocuments();
    return res.status(200).json({ totalTeams });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/users/count:
 *   get:
 *     summary: Get the total number of users
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: [] 
 *     parameters: 
 *       - name: Authorization
 *         in: header
 *         description: Bearer Token
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: Total number of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: number
 *             example:
 *               totalUsers: 10
 *     securityDefinitions:
 *       bearerAuth:
 *        type: apiKey
 *        name: Authorization
 *        in: header
 */
export const getTotalNumberOfUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalUsers = await User.countDocuments();
    return res.status(200).json({ totalUsers });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/teams/{teamCode}/members:
 *   post:
 *     summary: Add a user to a team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Bearer Token
 *         required: false
 *         type: string
 *       - in: path
 *         name: teamCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The team code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *             example:
 *               userId: "user-123"
 *     responses:
 *       200:
 *         description: User added to the team successfully
 *       400:
 *         description: Bad Request - User is already a member of the team or invalid user ID
 *       404:
 *         description: Not Found - Team not found or User not found
 *       401:
 *         description: Unauthorized - Missing or invalid bearer token
 */
export const addMemberToTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamCode } = req.params;
    const { userId } = req.body;

    // Find the team
    const team = await Team.findOne({ teamCode });
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Find the user
    let user;
    try {
      user = await User.findById(userId);
    } catch (error) {
      // Handle error when userId is invalid or not found
      return res.status(400).json({ message: 'Invalid user ID or user not found' });
    }

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if member is already in the team
    if (team.members.includes(user._id)) {
      return res.status(400).json({ message: 'User is already a member of the team' });
    }

    // Add the user to the team
    team.members.push(user._id);
    await team.save();

    return res.status(200).json({ message: 'User added to the team successfully' });
  } catch (error) {
    next(error);
  }
};
/**
 * @swagger
 * /api/admin/teams/{teamCode}/members/{userId}:
 *   delete:
 *     summary: Remove a user from a team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Bearer Token
 *         required: false
 *         type: string
 *       - in: path
 *         name: teamCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The team code
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User removed from the team successfully
 *       404:
 *         description: Team not found or user not found
 */


export const removeMemberFromTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamCode, userId } = req.params;

    // Find the team
    const team = await Team.findOne({ teamCode });
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Validate if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Remove the user from the team
    const userIdObject = new mongoose.Types.ObjectId(userId);
    if (team.members.includes(userIdObject)) {
      team.members.pull(userIdObject);
      await team.save();
      return res.status(200).json({ message: 'User removed from the team successfully' });
    } else {
      return res.status(404).json({ message: 'User not found in the team' });
    }
  } catch (error) {
    next(error);
  }
};



/**
 * @swagger
 * /api/admin/teams/{teamCode}/survey-time-frame:
 *   put:
 *     summary: Set the survey time frame for a team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Bearer Token
 *         required: true
 *         type: string
 *       - in: path
 *         name: teamCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The team code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *             example:
 *               startTime: "2023-08-10T08:00:00Z"
 *               endTime: "2023-08-15T18:00:00Z"
 *     responses:
 *       200:
 *         description: Survey time frame set successfully
 *       404:
 *         description: Team not found
 */
export const setSurveyTimeFrame = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamCode } = req.params;
    const { startTime, endTime } = req.body;

    // Find the team
    const team = await Team.findOne({ teamCode });
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Update the survey time frame for the team
    team.surveyStartTime = startTime;
    team.surveyEndTime = endTime;
    await team.save();

    return res.status(200).json({ message: 'Survey time frame set successfully' });
  } catch (error) {
    next(error);
  }
};



/**
 * @swagger
 * /api/admin/teams/{teamCode}/survey-data:
 *   get:
 *     summary: Get survey data for a team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: Bearer Token
 *         required: true
 *         type: string
 *       - in: path
 *         name: teamCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The team code
 *     responses:
 *       200:
 *         description: Survey data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 team:
 *                   type: object
 *                   properties:
 *                     teamCode:
 *                       type: string
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           email:
 *                             type: string
 *                 surveys:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       responses:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             userId:
 *                               type: string
 *                             answers:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   questionIndex:
 *                                     type: number
 *                                   response:
 *                                     type: number
 */
export const getSurveyData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamCode } = req.params;

    // Find the team and its associated survey data in the database
    const team = await Team.findOne({ teamCode }).populate('members', 'email');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Retrieve survey data for the team from the database
    const surveys = await Survey.find({ _id: { $in: team.surveys } }, 'title responses');

    // Return the survey data to the client in the desired format
    return res.status(200).json({ team, surveys });
  } catch (error) {
    next(error);
  }
};


/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: [] 
 *     parameters: 
 *       - name: Authorization
 *         in: header
 *         description: Bearer Token
 *         required: false
 *         type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               email: "admin@example.com"
 *               password: "admin123"
 *     responses:
 *       200:
 *         description: Admin login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *             example:
 *               message: "Admin login successful"
 *               token: "your-jwt-token"
 *       401:
 *         description: Admin login failed
 */
export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Perform admin authentication logic (e.g., check credentials)
    // Replace this with your actual authentication logic
    if (email === 'hrk3341@gmail.com' && password === '123456789') {
      // Authentication successful

      // Generate a JWT token
      const token = jwt.sign({ userId: adminId, isAdmin: true }, process.env.JWT_SECRET!, { expiresIn: '1h' });

      return res.status(200).json({ message: 'Admin login successful', token });
    } else {
      // Authentication failed
      return res.status(401).json({ message: 'Admin login failed' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/responses/count:
 *   get:
 *     summary: Get the total number of survey responses
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: [] 
 *     parameters: 
 *       - name: Authorization
 *         in: header
 *         description: Bearer Token
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Total number of survey responses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalResponses:
 *                   type: number
 *             example:
 *               totalResponses: 50
 */


export const getTotalSurveyResponses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Count the total number of survey responses in the Survey model
    const totalResponses = await Survey.aggregate([
      { $project: { numResponses: { $size: "$responses" } } },
      { $group: { _id: null, totalResponses: { $sum: "$numResponses" } } }
    ]);

    return res.status(200).json({ totalResponses: totalResponses.length > 0 ? totalResponses[0].totalResponses : 0 });
  } catch (error) {
    next(error);
  }
};



/**
 * @swagger
 * /api/admin/teams/info:
 *   get:
 *     summary: Get information about all teams
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: [] 
 *     parameters: 
 *       - name: Authorization
 *         in: header
 *         description: Bearer Token
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Team information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teamInfo:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       teamCode:
 *                         type: string
 *                       numMembers:
 *                         type: number
 *                       totalSurveySubmissions:
 *                         type: number
 *                       numPendingResponses:
 *                         type: number
 *             example:
 *               teamInfo:
 *                 - teamCode: "team-1"
 *                   numMembers: 10
 *                   totalSurveySubmissions: 30
 *                   numPendingResponses: 5
 *                 - teamCode: "team-2"
 *                   numMembers: 8
 *                   totalSurveySubmissions: 20
 *                   numPendingResponses: 2
 */


export const getTeamInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Find all teams
    const teams = await Team.find({});

    // Create an array to hold team info
    const teamInfo = [];

    // Iterate through each team
    for (const team of teams) {
      // Populate the surveys for the team
      const populatedTeam = await Team.findOne({ _id: team._id }).populate({
        path: 'surveys',
        populate: {
          path: 'responses.userId',
          model: 'User',
        },
      });

      if (!populatedTeam) {
        return res.status(404).json({ message: 'Team not found' });
      }

      const teamSurveys: ISurvey[] = populatedTeam.surveys as ISurvey[];

      // Calculate the number of members
      const numMembers = team.members.length;

      // Calculate the total number of survey submissions
      const totalSurveySubmissions = teamSurveys.reduce(
        (total: number, survey: ISurvey) => total + survey.responses.length,
        0
      );

      // Calculate the number of pending responses (responses with fewer answers than questions)
      const numPendingResponses = teamSurveys
        .map((survey: ISurvey) =>
          survey.responses.some(
            (response) => response.answers.length < survey.questions.length
          )
        )
        .filter((hasPendingResponse: boolean) => hasPendingResponse).length;

      // Create an object with team info
      const teamInfoItem = {
        teamCode: team.teamCode,
        numMembers,
        totalSurveySubmissions,
        numPendingResponses,
      };

      // Push the team info to the array
      teamInfo.push(teamInfoItem);
    }

    // Return the team info array
    return res.status(200).json({ teamInfo });
  } catch (error) {
    next(error);
  }
};


