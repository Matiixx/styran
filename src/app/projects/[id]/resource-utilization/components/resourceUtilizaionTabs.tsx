"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ResourceUtilizationDuration } from "~/lib/resourceUtilization/durations";

type ResourceUtilizationTabsProps = {
  duration: ResourceUtilizationDuration;
  hasActiveSprint: boolean;
};

const ResourceUtilizationTabs = ({
  duration,
  hasActiveSprint,
}: ResourceUtilizationTabsProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set("tab", value);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );
  return (
    <Tabs value={duration} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value={ResourceUtilizationDuration.WEEK}>Week</TabsTrigger>
        <TabsTrigger value={ResourceUtilizationDuration.MONTH}>
          Month
        </TabsTrigger>
        <TabsTrigger
          value={ResourceUtilizationDuration.SPRINT}
          disabled={!hasActiveSprint}
        >
          Sprint
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export { ResourceUtilizationTabs };
