import express from "express";
import cors from "cors";
import authRoute from './modules/auth/Route/authRoute.js';
import taskRoutes from "./modules/tasks/Route/taskRoutes.js";
const app = express();

// CORS configuration
app.use(
  cors({
    origin: "*", 
    credentials: true,
  })
);


// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use("/auth", authRoute);
app.use("/tasks", taskRoutes);


// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date(), 

  });
});

app.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route working",
    user: (req as any).user,
  });
});



app.get("/", (req, res) => {
  res.send("API is running...");
});


// Error handling middleware
import { errorHandler } from "./middleware/error.middleware.js";
import { authMiddleware } from "./middleware/authMiddleware.js";

app.use(errorHandler);


export default app;