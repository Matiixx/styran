"use client";

import { Button } from "~/components/ui/button";
import { CardContent, CardDescription, CardHeader } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const AccountInfo = () => {
  return (
    <>
      <CardHeader className="mb-1 text-xl font-bold">
        Account Information
      </CardHeader>
      <CardDescription>Update your personal information here</CardDescription>

      <CardContent className="mt-6">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>First Name</Label>
              <Input defaultValue="John" />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input defaultValue="Doe" />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input defaultValue="email@wp.pl" />
          </div>
          <div>
            <Label>Phone Number</Label>
            <Input placeholder="Enter your phone number" />
          </div>
          <div>
            <Label>Bio</Label>
            <textarea
              className="min-h-[100px] w-full rounded-md border p-2"
              placeholder="Tell us about yourself"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </CardContent>
    </>
  );
};

export { AccountInfo };
