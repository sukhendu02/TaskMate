import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

import { NextFunction, Request, Response } from 'express';
import { AppError } from '../Utils/AppError.js';

export const authMiddleware = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        // console.log("HEADER:", req.headers.authorization);
        if(!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const secret = process.env.JWT_ACCESS_SECRET as jwt.Secret;
        const token= authHeader.split(" ")[1];
        // console.log("TOKEN:", token);
        const decodedToken = jwt.verify(
            token,
             secret) as { userId: string };
        (req as any).user = { userId: decodedToken.userId };
        

    next();
    } catch (error) {
        // console.error("Authentication error:", error);
        next(new AppError("Unauthorized",401));
    }
}