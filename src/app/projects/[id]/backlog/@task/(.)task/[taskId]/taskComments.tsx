import { useState } from "react";

import dayjs from "dayjs";

import { Send } from "lucide-react";

import map from "lodash/map";

import { Button } from "~/components/ui/button";
import { InputWithLabel } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import { type TaskCommentsRouterOutput } from "~/server/api/routers/taskComments";

export type Comment = TaskCommentsRouterOutput["getComments"][number];

type TaskCommentsProps = {
  comments: Comment[];
  addComment: (content: string) => Promise<void>;
  // deleteComment: (commentId: string) => Promise<void>;
  // updateComment: (commentId: string, comment: string) => Promise<void>;
};

export default function TaskComments({
  comments,
  addComment,
}: TaskCommentsProps) {
  const [newComment, setNewComment] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewComment(value);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <span className="text-sm">Comments</span>
      {map(comments, (comment, index) => {
        return <CommentCard key={index} comment={comment} />;
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
          onClick={() => addComment(newComment).then(() => setNewComment(""))}
        >
          <Send size={8} />
        </Button>
      </div>
    </div>
  );
}

const CommentCard = ({ comment }: { comment: Comment }) => {
  return (
    <Card className="flex flex-col p-1">
      <div className="gap flex flex-row items-center justify-between">
        <span className="font-bold">
          {comment.user.firstName} {comment.user.lastName}
        </span>
        <span className="text-xs text-muted-foreground">
          {dayjs(comment.createdAt).fromNow()}
        </span>
      </div>
      <span className="text-sm">{comment.content}</span>
    </Card>
  );
};
