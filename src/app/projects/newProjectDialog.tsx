import { Plus } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

import { NewProjectForm } from "./newProjectForm";

type AddNewProjectDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const AddNewProjectDialog = ({ open, setOpen }: AddNewProjectDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card
          className="flex w-full max-w-sm cursor-pointer flex-col items-center justify-center border-dashed hover:border-primary"
          disableHover
        >
          <CardContent className="flex items-center justify-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Plus className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
          <CardHeader className="flex flex-col gap-2 text-center">
            <CardTitle className="truncate">Add new project</CardTitle>
            <CardDescription>
              Start a new project and invite your team members
            </CardDescription>
          </CardHeader>
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
