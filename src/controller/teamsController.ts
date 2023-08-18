import { Request, Response, NextFunction } from 'express';
import Team, { ITeam } from '../models/Team'; // Make sure to import your Team model
import User, { IUser } from '../models/User'; // Make sure to import your User model

// Controller function for creating a new team


export const getAllTeams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Find all teams in the database
    const teams = await Team.find({});

    // If no teams are found, return a 404 status with an error message
    if (teams.length === 0) {
      return res.status(404).json({ message: 'No teams found' });
    }

    // Return the list of teams as a JSON response
    return res.status(200).json(teams);
  } catch (error) {
    // If there is an error, pass it to the error handling middleware
    next(error);
  }
};


export const createTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamCode } = req.body;

    // Check if the team code is already taken
    const existingTeam = await Team.findOne({ teamCode });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team code already exists' });
    }

    // Create the new team
    const newTeam = new Team({
      teamCode,
      members: [], // Initially, there are no members in the team
    });

    await newTeam.save();

    return res.status(201).json({ message: 'Team created successfully' });
  } catch (error) {
    next(error);
  }
};

// Controller function for adding a user to a team
export const addMemberToTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamCode } = req.params;
    const { userId } = req.body;

    // Find the team
    const team = await Team.findOne({ teamCode });
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Find the user
    const user = await User.findById(userId);
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
    await team.save();

    return res.status(200).json({ message: 'User added to the team successfully' });
  } catch (error) {
    next(error);
  }
};


// Controller function for removing a user from a team
export const removeMemberFromTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamCode, userId } = req.params;

    // Find the team
    const team = await Team.findOne({ teamCode });
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
    await team.save();

    return res.status(200).json({ message: 'User removed from the team successfully' });
  } catch (error) {
    next(error);
  }
};



// Export the controller functions
export default { createTeam, addMemberToTeam, removeMemberFromTeam, getAllTeams };
