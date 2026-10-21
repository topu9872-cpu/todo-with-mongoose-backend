import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Task from "./taskSchema";

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

  // app.get("/tasks", async (req: Request, res: Response) => {
  //   try {
  //     const tasks = await Task.find();

  //     res.status(200).json({
  //       success: true,
  //       tasks,
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       success: false,
  //       message: error instanceof Error ? error.message : "Unknown error",
  //     });
  //   }
  // });

  app.get("/tasks", async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page);
      const limit = Number(req.query.limit);
      const search = String(req.query.search ?? "").trim();

      const filter = search
        ? {
            title: {
              $regex: search,
              $options: "i",
            },
          }
        : {};

      const [tasks, total] = await Promise.all([
        Task.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Task.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        tasks,
        pagination: {
          currentPage: page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch tasks",
      });
    }
  });

  app.get("/tasks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await Task.findById(id);
      res.json(result);
    } catch (error) {
      console.error(error);
    }
  });

  app.post("/tasks", async (req: Request, res: Response) => {
    try {
      const query = req.body;
      const result = await Task.create(query);
      res.json({
        success: true,
        result,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error(error);
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
