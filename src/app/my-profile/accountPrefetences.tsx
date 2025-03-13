import { CardContent, CardDescription, CardHeader } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";

const AccountPreferences = () => {
  return (
    <>
      <CardHeader className="mb-1 text-lg font-bold">
        Notification Preferences
      </CardHeader>
      <CardDescription>
        Manage how you receive notifications here
      </CardDescription>
      <CardContent className="mt-6">
        <div className="flex justify-between gap-1 border-b py-4">
          <div className="font-medium">Email notifications</div>
          <Switch />
        </div>
        <div className="flex justify-between gap-1 border-b py-4">
          <div className="font-medium">Push notifications</div>
          <Switch />
        </div>
        <div className="flex justify-between gap-1 border-b py-4">
          <div className="font-medium">Marketing emails</div>
          <Switch />
        </div>
      </CardContent>
    </>
  );
};

export { AccountPreferences };
