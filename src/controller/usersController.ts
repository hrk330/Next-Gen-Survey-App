import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User, { IUser } from "../models/User";
import Team, { ITeam } from "../models/Team";
import CustomRequest from "../customRequest";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: APIs related to managing users
 */

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user and add to a team
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               teamCode:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *             example:
 *               email: "user@example.com"
 *               teamCode: "team-123"
 *               password: "password123"
 *               confirmPassword: "password123"
 *     responses:
 *       201:
 *         description: User registered and added to the team successfully
 *       400:
 *         description: Email already registered or passwords do not match
 *       404:
 *         description: Team not found
 */
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, teamCode, password, confirmPassword } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Check if the password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user record in the database
    const newUser = new User({
      email,
      password: hashedPassword,
    });

    // Find the team based on the provided team code
    const team = await Team.findOne({ teamCode });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Add the user to the team
    team.members.push(newUser);
    await team.save();

    await newUser.save();

    return res
      .status(201)
      .json({ message: "User registered and added to the team successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: User login
 *     tags: [Users]
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
 *               email: "user@example.com"
 *               password: "password123"
 *     responses:
 *       200:
 *         description: Login successful
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
 *               message: "Login successful"
 *               token: "your-jwt-token"
 *       401:
 *         description: User not found or invalid password
 */
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate a JWT token with the user's ID and other data
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    // Send the token as a response
    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/user/join-team:
 *   post:
 *     summary: Join a team
 *     tags: [Users]
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
 *               userId:
 *                 type: string
 *             example:
 *               teamCode: "team-123"
 *               userId: "user-123"
 *     responses:
 *       200:
 *         description: User added to the team successfully
 *       400:
 *         description: User is already a member of the team or user not found
 *       404:
 *         description: Team not found
 *     securityDefinitions:
 *       bearerAuth:
 *        type: apiKey
 *        name: Authorization
 *        in: header
 */
export const joinTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { teamCode } = req.body;
    const { userId } = req.body;

    // Find the team
    const team = await Team.findOne({ teamCode });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is already a member of the team
    if (team.members.includes(user._id)) {
      return res
        .status(400)
        .json({ message: "User is already a member of this team" });
    }

    // Add the user to the team
    team.members.push(user._id);
    await team.save();

    return res
      .status(200)
      .json({ message: "User added to the team successfully" });
  } catch (error) {
    next(error);
  }
};

interface TokenPayload {
  userId: string;
}

/**
 * @swagger
 * /api/user/switch-team:
 *   post:
 *     summary: Switch to a different team
 *     tags: [Users]
 *     security:
 *       - bearerAuth: [] 
 *     parameters: 
 *       - name: Authorization
 *         in: header
 *         description: Bearer Token
 *         required: true
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
 *       200:
 *         description: User switched teams successfully
 *       403:
 *         description: User is not a member of the target team
 *       404:
 *         description: Team not found
 *     securityDefinitions:
 *       bearerAuth:
 *        type: apiKey
 *        name: Authorization
 *        in: header
 */
export const switchTeam = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { teamCode } = req.body;
    const userId = req.user?.userId;

    // Find the team by team code
    const team = await Team.findOne({ teamCode });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if the user is a member of the team
    const isMember = team.members.some((member) => member.equals(userId));
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "User is not a member of the target team" });
    }

    // Update user's teams
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { currentTeam: team._id },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "User switched teams successfully", user: updatedUser });
  } catch (error) {
    next(error);
  }
};

// Export the controller functions
export default { registerUser, loginUser, joinTeam, switchTeam };
