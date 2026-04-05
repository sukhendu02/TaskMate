import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateToken = (userId: string) => {
  const secret = process.env.JWT_ACCESS_SECRET as jwt.Secret;
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"];

  return jwt.sign(
    { userId },
    secret,
    { expiresIn }
  );
};
export const generateRefreshToken = (userId: string) => {
  const secret = process.env.JWT_REFRESH_SECRET as jwt.Secret;
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"];

  return jwt.sign(
    { userId },
    secret,
    { expiresIn }
  );
};