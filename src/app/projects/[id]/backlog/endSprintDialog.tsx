import { toast } from "sonner";

import { api } from "~/trpc/react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export const EndSprintModal = ({
  isOpen,
  sprintId,
  projectId,
  closeDialog,
}: {
  isOpen: boolean;
  sprintId: string;
  projectId: string;
  closeDialog: () => void;
}) => {
  const utils = api.useUtils();
  const { mutateAsync: endSprint } = api.sprint.endSprint.useMutation({
    onSuccess: () => {
      toast("Sprint ended");
      return Promise.all([
        utils.tasks.getTasks.invalidate({ projectId }),
        utils.projects.getProject.invalidate({ id: projectId }),
      ]);
    },
    onError: () => {
      toast.error("Error ending sprint");
    },
  });

  const onSubmit = () => {
    return endSprint({ projectId, sprintId }).then(() => {
      closeDialog();
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent
        onAnimationEnd={(e) => {
          if (e.animationName === "exit") {
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>End sprint</DialogTitle>
        </DialogHeader>

        <DialogDescription>
          Are you sure you want to end the sprint?
        </DialogDescription>

        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onSubmit}>
            End
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
