import { type UserRouterOutputs } from "~/server/api/routers/user";
import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import { AccountInfo } from "./accountInfo";
import { AccountSecurity } from "./accountSecurity";
import { AccountPreferences } from "./accountPreferences";

type ProfileTabsProps = {
  userInfo: UserRouterOutputs["getUserInfo"];
};

const ProfileTabs = ({ userInfo }: ProfileTabsProps) => {
  return (
    <Tabs defaultValue="account" className="col-span-2 w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card disableHover>
          <AccountInfo userInfo={userInfo} />
        </Card>
      </TabsContent>
      <TabsContent value="security">
        <Card disableHover>
          <AccountSecurity />
        </Card>
      </TabsContent>
      <TabsContent value="preferences">
        <Card disableHover>
          <AccountPreferences />
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export { ProfileTabs };
