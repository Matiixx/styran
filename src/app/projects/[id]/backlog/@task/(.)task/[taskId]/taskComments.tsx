import { useCallback, useState } from "react";

import dayjs from "dayjs";

import { Edit, Ellipsis, Send, Trash } from "lucide-react";

import map from "lodash/map";
import noop from "lodash/noop";

import { api } from "~/trpc/react";
import { type TaskCommentsRouterOutput } from "~/server/api/routers/taskComments";

import { Button } from "~/components/ui/button";
import { Input, InputWithLabel } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import { UserAvatar } from "~/app/_components/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export type Comment = TaskCommentsRouterOutput["getComments"][number];

type TaskCommentsProps = {
  userId: string;
  taskId: string;
  comments: Comment[];
  projectId: string;
};

export default function TaskComments({
  userId,
  taskId,
  comments,
  projectId,
}: TaskCommentsProps) {
  const utils = api.useUtils();
  const [newComment, setNewComment] = useState("");

  const onSuccess = useCallback(
    () =>
      Promise.all([
        utils.taskComments.getComments.invalidate({ taskId, projectId }),
        utils.tasks.getTask.invalidate({ taskId, projectId }),
      ]),
    [utils, taskId, projectId],
  );

  const { mutateAsync: addComment } = api.taskComments.addComment.useMutation({
    onSuccess,
  });
  const { mutateAsync: deleteComment } =
    api.taskComments.deleteComment.useMutation({ onSuccess });
  const { mutateAsync: updateComment } =
    api.taskComments.editComment.useMutation({ onSuccess });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewComment(value);
  };

  const handleAddComment = () => {
    return addComment({ taskId, content: newComment, projectId }).then(() =>
      setNewComment(""),
    );
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <span className="text-sm font-medium">Comments</span>
      {map(comments, (comment, index) => {
        const isAuthor = userId === comment.userId;

        return (
          <CommentCard
            key={index}
            comment={comment}
            isAuthor={isAuthor}
            onEdit={(content) =>
              updateComment({ commentId: comment.id, content }).then(noop)
            }
            onDelete={() => deleteComment({ commentId: comment.id }).then(noop)}
          />
        );
      })}
      <div className="relative mt-2 w-full">
        <InputWithLabel
          label="Add a comment"
          value={newComment}
          className="w-full"
          onChange={handleChange}
        />
        <Button
          variant="outline"
          size="iconSm"
          className="absolute bottom-2 right-2 h-auto p-1"
          disabled={!newComment.trim()}
          onClick={handleAddComment}
        >
          <Send size={8} />
        </Button>
      </div>
    </div>
  );
}

const CommentCard = ({
  comment,
  isAuthor,
  onEdit,
  onDelete,
}: {
  comment: Comment;
  isAuthor: boolean;
  onEdit: (newContent: string) => Promise<void>;
  onDelete: () => Promise<void>;
}) => {
  const [editComment, setEditComment] = useState("");

  return (
    <Card className="flex flex-col p-1">
      <div className="gap flex flex-row gap-2">
        <UserAvatar user={comment.user} />

        <div className="flex-1">
          <div className="flex flex-row items-center justify-between gap-2">
            <div className="flex flex-row items-center gap-2">
              <span className="font-bold">
                {comment.user.firstName} {comment.user.lastName}
              </span>
              <span className="text-xs text-muted-foreground">
                {dayjs(comment.createdAt).fromNow()}
              </span>
            </div>

            {isAuthor && (
              <CommentDropdown
                onEditClick={() => setEditComment(comment.content)}
                onDeleteClick={onDelete}
              />
            )}
          </div>
          {editComment ? (
            <div className="flex w-full flex-row gap-2">
              <Input
                value={editComment}
                className="flex-1 p-1 text-sm"
                onChange={(e) => setEditComment(e.currentTarget.value)}
              />
              <Button
                variant="default"
                size="sm"
                className="p-1"
                disabled={!editComment.trim()}
                onClick={() =>
                  onEdit(editComment).then(() => setEditComment(""))
                }
              >
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="p-1"
                onClick={() => setEditComment("")}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <span className="text-sm">{comment.content}</span>
          )}
        </div>
      </div>
    </Card>
  );
};

const CommentDropdown = ({
  onEditClick,
  onDeleteClick,
}: {
  onEditClick: () => void;
  onDeleteClick: () => Promise<void>;
}) => {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleDeleteClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    return onDeleteClick().finally(() => setOpen(false));
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="iconSm">
          <Ellipsis size={8} />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEditClick}>
          <Edit size={8} />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleDeleteClick}
        >
          <Trash size={8} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
