import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './User';

interface IResponse {
  userId: IUser['_id'];
  answers: {
    questionIndex: number;
    response: number;
  }[];
}

export interface ISurvey extends Document {
  title: string;
  questions: string[];
  responses: IResponse[];
}

const surveySchema: Schema = new mongoose.Schema({
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
        type: mongoose.Schema.Types.ObjectId,
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

const Survey = mongoose.model<ISurvey>('Survey', surveySchema);


export default Survey;
