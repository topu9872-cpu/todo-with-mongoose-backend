import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title is requered"],
      trim: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "In process", "Completed"],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    dueDate: {
      type: Date,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    userId: {
      type: String,
      required: false,
    },
  },

  {
    timestamps: true,
  },
);

const Task = mongoose.model("Task", taskSchema, "Task");

export default Task;
