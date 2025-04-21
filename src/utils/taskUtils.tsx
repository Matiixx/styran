import { TaskPriority, TaskStatus, type TaskType } from "@prisma/client";
import { tailwindColors } from "~/styles/colors";

import { Bookmark, Bug, Lightbulb, Vote } from "lucide-react";

const taskStatusToString = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.TODO:
      return "To Do";
    case TaskStatus.IN_PROGRESS:
      return "In Progress";
    case TaskStatus.IN_REVIEW:
      return "In Review";
    case TaskStatus.DONE:
      return "Done";
  }
};

const getColorByPriority = (priority: TaskPriority) => {
  switch (priority) {
    case "NONE":
      return {
        background: "bg-gray-500",
        foreground: "text-gray-500",
        color: tailwindColors.gray[500],
      };
    case "LOW":
      return {
        background: "bg-green-500",
        foreground: "text-green-500",
        color: tailwindColors.green[500],
      };
    case "MEDIUM":
      return {
        background: "bg-yellow-500",
        foreground: "text-yellow-500",
        color: tailwindColors.yellow[500],
      };
    case "HIGH":
      return {
        background: "bg-red-500",
        foreground: "text-red-500",
        color: tailwindColors.red[500],
      };
  }
};

const getColorByStatus = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.IN_PROGRESS:
      return "bg-blue-200 text-blue-700";
    case TaskStatus.IN_REVIEW:
      return "bg-blue-500 text-blue-100";
    case TaskStatus.DONE:
      return "bg-green-200 text-green-800";
    case TaskStatus.TODO:
    default:
      return "bg-gray-300 text-gray-900";
  }
};

const TaskTypeIcon: Record<TaskType, React.ReactNode> = {
  BUG: <Bug className="text-red-500" />,
  FEATURE: <Lightbulb className="text-yellow-500" />,
  STORY: <Bookmark className="text-green-500" />,
  TASK: <Vote className="text-blue-500" />,
};

const priorityToString = (priority: TaskPriority | null) => {
  switch (priority) {
    case TaskPriority.LOW:
      return "Low";
    case TaskPriority.MEDIUM:
      return "Medium";
    case TaskPriority.HIGH:
      return "High";
    case TaskPriority.NONE:
    default:
      return "None";
  }
};

export {
  TaskTypeIcon,
  getColorByStatus,
  priorityToString,
  taskStatusToString,
  getColorByPriority,
};
