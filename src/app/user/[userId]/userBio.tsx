import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type UserBioProps = {
  firstName: string;
  bio: string | null;
};

const UserBio = ({ firstName, bio }: UserBioProps) => {
  return (
    <Card disableHover className="col-span-2">
      <CardHeader>
        <CardTitle>About {firstName}</CardTitle>
      </CardHeader>
      <CardContent>
        {bio ?? `${firstName} doesn't fill information about himself`}
      </CardContent>
    </Card>
  );
};

export default UserBio;
