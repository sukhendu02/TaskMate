// import { jwt } from 'jsonwebtoken';


import bcrypt from 'bcrypt';
// import { PrismaClient } from '../../';
import prisma from "../../../Config/db.js";
import { generateRefreshToken, generateToken } from '../../../Utils/jwt.js';

import jwt from 'jsonwebtoken';
import { AppError } from '../../../Utils/AppError.js';

export const registerUser = async (email: string, password: string) => {
    try {
        const userExist =await prisma.user.findUnique({ where: { email } });
      
        if (userExist) {
            console.log("User already exists with email:", email);
            throw new AppError("User already exists", 400);
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });
        return newUser;
        
    } catch (error) {
        throw error;
    }
}



export const loginUser = async (email: string, password: string) => {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error("Invalid email or password");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }

       
     
        const accessToken = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 
            },

        })
        return {user, accessToken, refreshToken };

    } catch (error) {
        
        throw error;
    }
}

export const refreshTokenService = async (refreshToken: string) => {
    try {

        const secret = process.env.JWT_REFRESH_SECRET as jwt.Secret;
        let decoded
         decoded = jwt.verify(
            refreshToken,
            secret
        ) as { userId: string };

        const storedToken = await prisma.refreshToken.findFirst({
            where: { token: refreshToken },
        });

        if(!storedToken) {
            throw new Error("Invalid refresh token");
        }
         const newAccessToken = generateToken(decoded.userId);

  return newAccessToken;
  
    } catch (error) {
        throw error;
    }
}

export const userLogoutService = async(refreshToken:string )=>{
    try {
        if(!refreshToken){
            throw new AppError("Refresh token is required",400);   
        }

        await prisma.refreshToken.deleteMany(
            {
                where: {token: refreshToken},
            })
        return true;
        
    } catch (error) {
        throw error;
    }
}