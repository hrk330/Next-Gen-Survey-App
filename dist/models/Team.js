"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const teamSchema = new mongoose_1.default.Schema({
    teamCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    members: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    surveys: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Survey', // Make sure this references the correct model name 'Survey'
        },
    ],
});
const Team = mongoose_1.default.model('Team', teamSchema);
exports.default = Team;
//# sourceMappingURL=Team.js.map