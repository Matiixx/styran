import { type FC } from "react";
import { type Session } from "next-auth";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ChangePassword } from "./changePassword";

type Props = {
  session: Session;
};

const MyProfilePage: FC<Props> = ({ session }) => {
  return (
    <Card disableHover className="mt-4 w-full max-w-2xl">
      <CardHeader>
        <CardTitle>My Profile </CardTitle>
      </CardHeader>
      <CardContent>
        <div>Email: {session.user.email}</div>
        <ChangePassword />
      </CardContent>
    </Card>
  );
};

export default MyProfilePage;
