import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Task from "./taskSchema";
import { getTasks } from "./controllers/taskController";
import { taskDetails } from "./controllers/taskDetailsController";

dotenv.config();

const app = express();
const port: number = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

// ১. Mongoose দিয়ে ডাটাবেজ কানেকশন

dotenv.config();

const connectDatabase = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    await mongoose.connect(uri, {
      dbName: "Todo-App",
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

// গ্লোবাল এরর হ্যান্ডলার
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  },
);

const startServer = async (): Promise<void> => {
  await connectDatabase();

  app.get("/tasks", getTasks);
  app.get("/my-tasks", getTasks);

  app.get("/tasks/:id", taskDetails);

  app.post("/tasks", async (req: Request, res: Response) => {
    try {
      const result = await Task.create(req.body);

      return res.status(201).json({
        success: true,
        result,
      });
    } catch (error) {
      console.error("MongoDB error:", error);

      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/", (_req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: "TypeScript API Running",
    });
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();
