"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const surveySchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    questions: [
        {
            type: String,
            required: true,
            trim: true,
        },
    ],
    responses: [
        {
            userId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            answers: [
                {
                    questionIndex: {
                        type: Number,
                        required: true,
                    },
                    response: {
                        type: Number,
                        required: true,
                    },
                },
            ],
        },
    ],
});
const Survey = mongoose_1.default.model('Survey', surveySchema);
exports.default = Survey;
//# sourceMappingURL=Survey.js.map