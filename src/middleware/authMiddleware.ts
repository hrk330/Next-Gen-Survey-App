import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import CustomRequest from '../customRequest'; // Import your updated CustomRequest interface
import path from 'path';

interface TokenPayload {
  userId: string;
  isAdmin: boolean;
}
export const authMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // Exclude the authMiddleware check for the admin login route
  if (req.path === '/api/admin/login') {
    return next();
  }

  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token not found' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export const adminAuthMiddleware = (
  req: CustomRequest, // Use the CustomRequest interface
  res: Response,
  next: NextFunction
) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token not found' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    // Check if the user is an admin
    if (!decodedToken.isAdmin) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};
