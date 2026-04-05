import {Request,Response, NextFunction } from 'express';
import { loginUser, registerUser,refreshTokenService,userLogoutService } from '../Service/authService.js';


export const userRegistration=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        console.log("Received registration request with body:", req.body); 
        const {email, password}=req.body;

        if(!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }



        const user = await registerUser(email, password);
        res.status(201).json({ message: "User registered successfully", user });

        
    } catch (error) {
        
        next(error);
    }
}

export const userLogin=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {email, password}=req.body;

        if(!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
    

        const {user, accessToken, refreshToken} = await loginUser(email, password);
        res.status(200).json({ message: "Login successful", user, accessToken, refreshToken });
        
    } catch (error) {
        next(error);
    }
}

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token is required" });
        }

        // verify Token in service and generate new access token
        const newAccessToken = await refreshTokenService(refreshToken);
        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        next(error);
    }
      
}

export const userLogout=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        console.log("Received logout request with body:", req.body);
        const { refreshToken } = req.body;
        if (!refreshToken) {

            return res.status(400).json({ message: "Refresh token is required" });
        }
       
        const result = await userLogoutService(refreshToken);
        if(result) {
            res.status(200).json({ message: "Logout successful" });
        } else {
            res.status(400).json({ message: "Invalid refresh token" });
        }
    } catch (error) {
        next(error);
    }
}


