import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './User';
import { ISurvey } from './Survey'; 

export interface ITeam extends Document {
  teamCode: string;
  members: Types.Array<IUser['_id']>;
  surveyStartTime?: Date;
  surveyEndTime?: Date;
  surveys: Types.Array<ISurvey['_id']>; // Corrected type definition
}
const teamSchema: Schema = new mongoose.Schema({
  teamCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  surveys: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Survey', // Make sure this references the correct model name 'Survey'
    },
  ],
});

const Team = mongoose.model<ITeam>('Team', teamSchema);

export default Team;
