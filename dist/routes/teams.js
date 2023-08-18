"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const teamsController_1 = __importDefault(require("../controller/teamsController"));
const router = express_1.default.Router();
// API endpoint for creating a new team
router.post('/', teamsController_1.default.createTeam);
// API endpoint for adding a user to a team
router.post('/:teamCode/members', teamsController_1.default.addMemberToTeam);
// API endpoint for removing a user from a team
router.delete('/:teamCode/members/:userId', teamsController_1.default.removeMemberFromTeam);
// API endpoint for getting all teams
router.get('/all', teamsController_1.default.getAllTeams);
exports.default = router;
//# sourceMappingURL=teams.js.map