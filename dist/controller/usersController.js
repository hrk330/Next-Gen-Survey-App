"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.switchTeam = exports.joinTeam = exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
const Team_1 = __importDefault(require("../models/Team"));
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
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, teamCode, password, confirmPassword } = req.body;
        // Check if the email is already registered
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }
        // Check if the password and confirm password match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        // Hash the password before saving it to the database
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create a new user record in the database
        const newUser = new User_1.default({
            email,
            password: hashedPassword,
        });
        // Find the team based on the provided team code
        const team = yield Team_1.default.findOne({ teamCode });
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }
        // Add the user to the team
        team.members.push(newUser);
        yield team.save();
        yield newUser.save();
        return res
            .status(201)
            .json({ message: "User registered and added to the team successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.registerUser = registerUser;
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
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find the user by email
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Compare the provided password with the hashed password in the database
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }
        // Generate a JWT token with the user's ID and other data
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        // Send the token as a response
        return res.status(200).json({ message: "Login successful", token });
    }
    catch (error) {
        next(error);
    }
});
exports.loginUser = loginUser;
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
const joinTeam = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teamCode } = req.body;
        const { userId } = req.body;
        // Find the team
        const team = yield Team_1.default.findOne({ teamCode });
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }
        // Find the user
        const user = yield User_1.default.findById(userId);
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
        yield team.save();
        return res
            .status(200)
            .json({ message: "User added to the team successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.joinTeam = joinTeam;
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
const switchTeam = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { teamCode } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Find the team by team code
        const team = yield Team_1.default.findOne({ teamCode });
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
        const updatedUser = yield User_1.default.findByIdAndUpdate(userId, { currentTeam: team._id }, { new: true });
        return res
            .status(200)
            .json({ message: "User switched teams successfully", user: updatedUser });
    }
    catch (error) {
        next(error);
    }
});
exports.switchTeam = switchTeam;
// Export the controller functions
exports.default = { registerUser: exports.registerUser, loginUser: exports.loginUser, joinTeam: exports.joinTeam, switchTeam: exports.switchTeam };
//# sourceMappingURL=usersController.js.map