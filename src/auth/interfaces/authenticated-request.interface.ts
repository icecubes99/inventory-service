import { Request } from 'express';
import { User as PrismaUser } from '@prisma/client'; // Import PrismaUser type

// Define a type for the user object that will be attached to the request
// This might only contain a subset of PrismaUser fields, e.g., id, role
export interface AuthenticatedUser {
  id: string;
  role: PrismaUser['role']; // Use the Role enum from PrismaUser
  // Add other fields from PrismaUser that your JWT strategy might include in req.user
  username?: string;
  email?: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
