// lib/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export function generateToken(nick: string, id: number) {
  return jwt.sign(
    { nick, id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
