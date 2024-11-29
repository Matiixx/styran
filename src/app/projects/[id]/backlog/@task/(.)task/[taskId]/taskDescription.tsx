import { useState } from "react";

import { Check } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

type TaskDescriptionProps = {
  description: string | null;
  updateDescription: (description: string | undefined) => Promise<void>;
};

export default function TaskDescription({
  description,
  updateDescription,
}: TaskDescriptionProps) {
  const [localDescription, setLocalDescription] = useState(description ?? "");

  return (
    <div className="relative">
      <Label>Description</Label>
      <Textarea
        placeholder="Type your message here."
        className="min-h-24 resize-none p-2"
        value={localDescription}
        onChange={(e) => setLocalDescription(e.currentTarget.value)}
      />
      <Button
        variant="outline"
        size="iconSm"
        className="absolute bottom-2 right-2 h-auto p-1"
        onClick={() => updateDescription(localDescription)}
      >
        <Check size={8} />
      </Button>
    </div>
  );
}
