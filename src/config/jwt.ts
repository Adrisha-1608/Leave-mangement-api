import * as jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET;

// if (!JWT_SECRET) {
//   throw new Error("JWT_SECRET is not defined in environment variables");
// }

// export const generateToken = (payload: object): string => {
//   return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Optional: add expiresIn
// };

// export const verifyToken = (token: string): any => {
//   return jwt.verify(token, JWT_SECRET);
// };
export const generateToken = (payload: object): string => {
  const secret = process.env.JWT_SECRET!;
  if (!secret) throw new Error('JWT_SECRET is not defined in environment variables');
  return jwt.sign(payload, secret);
};

export const verifyToken = (token: string): any => {
  const secret = process.env.JWT_SECRET!;
  if (!secret) throw new Error('JWT_SECRET is not defined in environment variables');
  return jwt.verify(token, secret);
};
