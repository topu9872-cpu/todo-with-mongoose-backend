import type { Request, Response } from "express";
import Task from "../taskSchema";

export const taskDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id).lean();

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Task details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch task details",
    });
  }
};
