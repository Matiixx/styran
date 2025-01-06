import { useState } from "react";

import { Check } from "lucide-react";

import { Button } from "~/components/ui/button";
import { InputWithLabel } from "~/components/ui/input";

type TaskStoryPointsProps = {
  storyPoints: string | null;
  updateStoryPoints: (storyPoints: number | null) => Promise<void>;
};

export default function TaskStoryPoints({
  storyPoints,
  updateStoryPoints,
}: TaskStoryPointsProps) {
  const [localStoryPoints, setLocalStoryPoints] = useState(storyPoints ?? "-");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setLocalStoryPoints(value);
    }
  };

  const hasChanged =
    (localStoryPoints !== storyPoints && localStoryPoints !== "-") ||
    (localStoryPoints === "-" && storyPoints !== null);

  return (
    <div className="relative w-min">
      <InputWithLabel
        label="Storypoints"
        value={localStoryPoints}
        className="w-min"
        onChange={handleChange}
      />
      {hasChanged && (
        <Button
          variant="outline"
          size="iconSm"
          className="absolute bottom-2 right-2 h-auto p-1"
          onClick={() => {
            const value =
              !localStoryPoints || localStoryPoints === "-"
                ? null
                : parseInt(localStoryPoints);
            return updateStoryPoints(value);
          }}
        >
          <Check size={8} />
        </Button>
      )}
    </div>
  );
}
