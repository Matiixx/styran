import { Plus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Icon } from "~/components/ui/icon";

import { NewProjectForm } from "./newProjectForm";

type AddNewProjectDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const AddNewProjectDialog = ({ open, setOpen }: AddNewProjectDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="w-full max-w-sm cursor-pointer" variant="muted">
          <CardHeader>
            <CardTitle className="truncate">Add new project</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <Icon size="lg">
              <Plus />
            </Icon>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new project</DialogTitle>
          <DialogDescription>
            Create a new project to start tracking your time.
          </DialogDescription>
        </DialogHeader>

        <NewProjectForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
};

export default AddNewProjectDialog;
