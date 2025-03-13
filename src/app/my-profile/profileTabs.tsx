import { type Session } from "next-auth";

import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import { AccountInfo } from "./accountInfo";
import { AccountSecurity } from "./acountSecurity";
import { AccountPreferences } from "./accountPrefetences";

type ProfileTabsProps = {
  session: Session;
};

const ProfileTabs = ({ session }: ProfileTabsProps) => {
  return (
    <Tabs defaultValue="account" className="col-span-2 w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card disableHover>
          <AccountInfo />
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
