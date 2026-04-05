// import { TASK_STATUS } from '@/utils/constants';

import { ta } from "zod/locales";
import prisma from "../../../Config/db.js";
import { AppError } from "../../../Utils/AppError.js";
import { TaskStatus } from "../../../generated/prisma/enums.js";


export const  createTaskService = async (userId: string,title: string, description?: string ) => {
console.log(title, description);
    const newTask = await prisma.task.create({
    data: {
        title,
        description,
        userId,
    },
});
// console.log("New Task Created:", newTask);
return newTask;
}


export const getTaskService = async (userId: string, page: number, limit: number, status?: string, search?: string) => {
    const skip = (page - 1) * limit;

    const where:any= { userId };
    
    if (status) {
        where.status=status;
    }
    if (search) {
        where.title={
            contains: search,
            mode: "insensitive",
        }
    }

    const alltask = await prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
            createdAt: "desc",
        },
    });
    console.log("Tasks retrieved:", alltask);
    const total = await prisma.task.count({ where });
    return { total, tasks: alltask };
  
}

export const deleteTaskService = async (userId: string, taskId: string) => {

    const taskExist = await prisma.task.findFirst({
        where: {
            id: taskId,
            userId,
        },
    });
    // console.log("Task existence check:", taskExist);
    if(!taskExist) {
        throw new AppError("Task not found", 404);
    }

    const task = await prisma.task.deleteMany({ where:
         { id: taskId,
            userId
         }
         });

         return task;
}

export const updateTaskService = async (userId: string, taskId: string, dataToUpdate: { title?: string; description?: string; status?: TaskStatus }) => {

    const taskExist = await prisma.task.findFirst({
        where: {
            id: taskId,
            userId,
        },
    });
    console.log(taskExist);
    if(!taskExist) {
        throw new AppError("Task not found", 404);
    }
    const updtsk = await prisma.task.updateMany({
        where: {
            id: taskId,
            userId,
        },
        data: dataToUpdate,
    });
    console.log("Updated Task:",);
    return updtsk;
}


export const toggleTaskStatusService = async (userId: string, taskId: string) => {
    const taskExist = await prisma.task.findFirst({
        where: {
            id: taskId,
            userId,
        },
    });
    if(!taskExist) {
        throw new AppError("Task not found", 404);
    }
    const newStatus = taskExist.status === "PENDING" ? "COMPLETED" : "PENDING";
    const status = await prisma.task.updateMany({
        where: {
            id: taskId,
            userId,
        },
        data: {
            status: newStatus,
        },
    });
    return status;
}

