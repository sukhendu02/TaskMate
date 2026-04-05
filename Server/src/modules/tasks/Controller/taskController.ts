import {Request,Response, NextFunction, json } from 'express';
import { createTaskService,getTaskService,deleteTaskService,updateTaskService, toggleTaskStatusService } from '../Service/taskService.js';
import prisma from '../../../Config/db.js';

export const  createTask=async(req:Request,res:Response,next:NextFunction)=>{
    try {
            const {title, description}=req.body;
            console.log("Received create task request with body:", req.body);
            if(!title) {
                return res.status(400).json({error: "Title and description are required"});
            }

            const userId = (req as any).user?.userId;
            if(!userId) {
                return res.status(401).json({error: "Unauthorized"});
            }
            const newTask= await createTaskService(userId,title, description);
            res.status(201).json({message: "Task created successfully", task: newTask});
    } catch (error) {
        next(error);
    }

}

export const  getTask=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const userId = (req as any).user?.userId;
        console.log("User ID from request:", userId);

        if(!userId) {
            return res.status(401).json({error: "Unauthorized"});
        }
        const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;

        const {total,tasks}= await getTaskService(userId,page,limit,status,search);
         res.json({
      page,
      limit,
      total,
      data: tasks,
    });
    } catch (error) {
        console.log("Error in getTask controller:", error);
        next(error);
    }
}

export const updateTask=async(req:Request,res:Response,next:NextFunction)=>{

    try {
        const userId = (req as any).user?.userId;
        if(!userId) {
            return res.status(401).json({error: "Unauthorized"});
        }
        const taskId = req.params.id as string;

        if(!taskId) {
            return res.status(400).json({error: "Task ID is required"});
        }

        const dataToUpdate = req.body;
        const updatedTask= await updateTaskService(userId, taskId, dataToUpdate);
        if(!updatedTask) {
            return res.status(404).json({error: "Task not found"});
        }
        res.status(200).json({message: "Task updated successfully", task: updatedTask});

    } catch (error) {
        next(error);
    }

}
export const deleteTask=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const userId = (req as any).user?.userId;
        if(!userId) {
            return res.status(401).json({error: "Unauthorized"});
        }
        const taskId = req.params.id as string;
        // console.log("Task ID to delete:", taskId);
        if(!taskId) {
            return res.status(400).json({error: "Task ID is required"});
        }

        const deletedTask = await deleteTaskService(userId, taskId);
       
       
        if(!deletedTask) {
            return res.status(404).json({error: "Task not found"});
        }
        res.status(200).json({message: "Task deleted successfully"});
    } catch (error) {
        next(error);
    }
}

export const toggleTaskStatus=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const userId = (req as any).user?.userId;
        if(!userId) {
            return res.status(401).json({error: "Unauthorized"});
        }
        const taskId = req.params.id as string;
        if(!taskId) {
            return res.status(400).json({error: "Task ID is required"});
        }
     
      const toggleTask= await toggleTaskStatusService(userId, taskId);
        if(!toggleTask) {
            return res.status(404).json({error: "Task not found"});
        }
        res.status(200).json({message: "Task updated successfully", task: toggleTask});
    } catch (error) {
        next(error);
    }
}
