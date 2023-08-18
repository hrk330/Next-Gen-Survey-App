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
exports.removeMemberFromTeam = exports.addMemberToTeam = exports.createTeam = exports.getAllTeams = void 0;
const Team_1 = __importDefault(require("../models/Team")); // Make sure to import your Team model
const User_1 = __importDefault(require("../models/User")); // Make sure to import your User model
// Controller function for creating a new team
const getAllTeams = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find all teams in the database
        const teams = yield Team_1.default.find({});
        // If no teams are found, return a 404 status with an error message
        if (teams.length === 0) {
            return res.status(404).json({ message: 'No teams found' });
        }
        // Return the list of teams as a JSON response
        return res.status(200).json(teams);
    }
    catch (error) {
        // If there is an error, pass it to the error handling middleware
        next(error);
    }
});
exports.getAllTeams = getAllTeams;
const createTeam = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teamCode } = req.body;
        // Check if the team code is already taken
        const existingTeam = yield Team_1.default.findOne({ teamCode });
        if (existingTeam) {
            return res.status(400).json({ message: 'Team code already exists' });
        }
        // Create the new team
        const newTeam = new Team_1.default({
            teamCode,
            members: [], // Initially, there are no members in the team
        });
        yield newTeam.save();
        return res.status(201).json({ message: 'Team created successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.createTeam = createTeam;
// Controller function for adding a user to a team
const addMemberToTeam = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teamCode } = req.params;
        const { userId } = req.body;
        // Find the team
        const team = yield Team_1.default.findOne({ teamCode });
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        // Find the user
        const user = yield User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if the user is already a member of the team
        const isMember = team.members.some((member) => member.equals(user._id));
        if (isMember) {
            return res.status(400).json({ message: 'User is already a member of the team' });
        }
        // Add the user to the team
        team.members.push(user);
        yield team.save();
        return res.status(200).json({ message: 'User added to the team successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.addMemberToTeam = addMemberToTeam;
// Controller function for removing a user from a team
const removeMemberFromTeam = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teamCode, userId } = req.params;
        // Find the team
        const team = yield Team_1.default.findOne({ teamCode });
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        // Find the user and check if they are a member of the team
        const userIndex = team.members.findIndex((member) => member.toString() === userId);
        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found in the team' });
        }
        // Remove the user from the team
        team.members.splice(userIndex, 1);
        yield team.save();
        return res.status(200).json({ message: 'User removed from the team successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.removeMemberFromTeam = removeMemberFromTeam;
// Export the controller functions
exports.default = { createTeam: exports.createTeam, addMemberToTeam: exports.addMemberToTeam, removeMemberFromTeam: exports.removeMemberFromTeam, getAllTeams: exports.getAllTeams };
//# sourceMappingURL=teamsController.js.map