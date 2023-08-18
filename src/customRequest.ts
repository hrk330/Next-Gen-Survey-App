import { Request } from 'express';

// Define a custom interface for the Request object
interface CustomRequest extends Request {
  user?: {
    userId: string;
  };
}

export default CustomRequest;

