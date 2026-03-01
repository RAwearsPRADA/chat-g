// lib/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export function generateToken(nick: string, email: string) {
  return jwt.sign(
    { nick, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
