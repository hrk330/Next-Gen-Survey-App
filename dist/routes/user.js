"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usersController_1 = require("../controller/usersController");
const surveysController_1 = require("../controller/surveysController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// API endpoint for user registration
router.post('/register', usersController_1.registerUser);
// API endpoint for user login
router.post('/login', usersController_1.loginUser);
// API endpoint for adding a user to a team
router.post('/join-team', authMiddleware_1.authMiddleware, usersController_1.joinTeam);
router.post('/switch-team', authMiddleware_1.authMiddleware, usersController_1.switchTeam);
router.post('/:surveyId/submit', authMiddleware_1.authMiddleware, surveysController_1.submitSurveyResponse);
exports.default = router;
//# sourceMappingURL=user.js.map