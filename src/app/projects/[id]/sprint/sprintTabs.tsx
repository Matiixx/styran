import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import CurrentSprintPanel from "./currentSprintPanel";

const SprintTabs = ({ projectId }: { projectId: string }) => {
  return (
    <Tabs defaultValue="current">
      <TabsList>
        <TabsTrigger value="current">Current Sprint</TabsTrigger>
        <TabsTrigger value="history" disabled>
          History
        </TabsTrigger>
      </TabsList>
      <TabsContent value="current">
        <Card disableHover>
          <CurrentSprintPanel projectId={projectId} />
        </Card>
      </TabsContent>
      <TabsContent value="history">
        <Card disableHover>xd</Card>
      </TabsContent>
    </Tabs>
  );
};

export default SprintTabs;
