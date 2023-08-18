import { Request, Response, NextFunction } from 'express';
import Survey, { ISurvey } from '../models/Survey';


/**
 * @swagger
 * tags:
 *   name: Surveys
 *   description: APIs related to managing surveys
 */
/**
 * @swagger
 * /api/admin/createSurvey:
 *   post:
 *     summary: Create a new survey
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               questions:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               title: "Survey Title"
 *               questions: ["Question 1", "Question 2"]
 *     responses:
 *       201:
 *         description: Survey created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 surveyId:
 *                   type: string
 *       401:
 *         description: Unauthorized - Missing or invalid bearer token
 */
export const createSurvey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, questions } = req.body;

    // Create the new survey
    const newSurvey = new Survey({
      title,
      questions,
      responses: [],
    });

    await newSurvey.save();

    return res.status(201).json({ message: 'Survey created successfully', surveyId: newSurvey._id });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/getallsurveys:
 *   get:
 *     summary: Get a list of all surveys
 *     tags: [Surveys]
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
 *         description: List of surveys
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                 example:
 *                   - title: "Survey 1"
 *                   - title: "Survey 2"
 */
export const getAllSurveys = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const surveys = await Survey.find({}, 'title');
    return res.status(200).json(surveys);
  } catch (error) {
    next(error);
  }
};


/**
 * @swagger
 * /api/admin/getallsurveys:
 *   get:
 *     summary: Get a list of all surveys
 *     tags: [Surveys]
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
 *         description: List of surveys
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Survey'
 */
export const getAllSurveyData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Fetch all surveys with their responses
    const surveysWithResponses = await Survey.find().populate('responses.userId');

    return res.status(200).json({ surveys: surveysWithResponses });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/surveyById/{surveyId}:
 *   get:
 *     summary: Get a specific survey by ID
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: surveyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the survey to retrieve
 *     responses:
 *       200:
 *         description: Survey details
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/Survey'
 *       401:
 *         description: Unauthorized - Missing or invalid bearer token
 *       404:
 *         description: Survey not found
 */
export const getSurveyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { surveyId } = req.params;
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }
    return res.status(200).json(survey);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/user/{surveyId}/submit:
 *   post:
 *     summary: Submit a survey response
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: surveyId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the survey for which the response is being submitted
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionIndex:
 *                       type: number
 *                     response:
 *                       type: number
 *             example:
 *               userId: "user-123"
 *               answers: [{ questionIndex: 0, response: 2 }, { questionIndex: 1, response: 1 }]
 *     responses:
 *       200:
 *         description: Survey response submitted successfully
 *       400:
 *         description: User has already submitted a response for this survey or survey not found
 */
export const submitSurveyResponse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { surveyId } = req.params;
    const { userId, answers } = req.body;

    // Find the survey
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    // Check if the user has already submitted a response for this survey
    const existingResponse = survey.responses.find((response) => response.userId.toString() === userId);
    if (existingResponse) {
      return res.status(400).json({ message: 'User has already submitted a response for this survey' });
    }

    // Add the new response to the survey
    const newResponse = {
      userId,
      answers,
    };

    survey.responses.push(newResponse);
    await survey.save();

    return res.status(200).json({ message: 'Survey response submitted successfully' });
  } catch (error) {
    next(error);
  }
};


export default { createSurvey, getAllSurveys, getSurveyById, submitSurveyResponse ,getAllSurveyData};