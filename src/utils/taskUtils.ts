import { type TaskPriority, TaskStatus } from "@prisma/client";
import { tailwindColors } from "~/styles/colors";

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

export { taskStatusToString, getColorByPriority };
