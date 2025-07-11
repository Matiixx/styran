import { TaskPriority, TaskStatus, TaskType } from "@prisma/client";
import { tailwindColors } from "~/styles/colors";

import { Bookmark, Bug, FileCheck, Lightbulb, Vote } from "lucide-react";

import toLower from "lodash/toLower";
import upperFirst from "lodash/upperFirst";
import values from "lodash/values";

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

const getTaskTypeIcon = (type: string): React.ReactNode => {
  switch (type) {
    case TaskType.BUG:
      return <Bug className="text-red-500" />;
    case TaskType.FEATURE:
      return <Lightbulb className="text-yellow-500" />;
    case TaskType.STORY:
      return <Bookmark className="text-green-500" />;
    case TaskType.TASK:
      return <Vote className="text-blue-500" />;
    case TaskType.CUSTOM:
    default:
      return <FileCheck className="text-gray-500" />;
  }
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

const getTaskType = (type: string) => upperFirst(toLower(type));

const combinedTypeKey = (type: TaskType, customType?: string | null) =>
  `${type}_${customType || ""}`;

const splitTypeKey = (type: string) => {
  const [typeValue, customTypeValue] = type.split("_");
  return { type: typeValue as TaskType, customType: customTypeValue };
};

const taskTypesOptions = (
  customTaskTypes: string[],
): Array<{
  type: TaskType;
  value: string;
  customType?: string;
}> => {
  return [
    ...values(TaskType)
      .filter((type) => type !== TaskType.CUSTOM)
      .map((type) => ({ type: type as TaskType, value: `${type}_` })),
    ...customTaskTypes.map((customType) => ({
      type: TaskType.CUSTOM,
      customType,
      value: `${TaskType.CUSTOM}_${customType}`,
    })),
  ];
};

export {
  getTaskType,
  splitTypeKey,
  combinedTypeKey,
  getTaskTypeIcon,
  taskTypesOptions,
  getColorByStatus,
  priorityToString,
  taskStatusToString,
  getColorByPriority,
};
