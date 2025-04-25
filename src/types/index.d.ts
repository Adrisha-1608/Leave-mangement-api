// express.d.ts
import { User } from './models/user.model'; // Import your User model or define the structure of `user`

declare global {
  namespace Express {
    interface Request {
      user?: User; // Add the user property to Request, where User is the type of the user object
    }
  }
}
