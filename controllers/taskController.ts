import type { Request, Response } from "express";
import Task from "../taskSchema";

export const getTasks = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const search = String(req.query.search ?? "").trim();
    const userId = String(req.query.userId);
    const filter = {
      ...(search && { title: { $regex: search, $options: "i" } }),
      ...(userId && { userId: userId }),
    };

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Task.countDocuments(filter);

    return res.status(200).json({
      success: true,
      tasks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        limit,
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
};
