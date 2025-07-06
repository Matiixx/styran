import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

type UserBioProps = {
  firstName: string | null;
  bio: string | null;
};

const UserBio = ({ firstName, bio }: UserBioProps) => {
  return (
    <Card disableHover className="col-span-2">
      {firstName ? (
        <>
          <CardHeader>
            <CardTitle>About {firstName}</CardTitle>
          </CardHeader>
          <CardContent>
            {bio ? bio : `${firstName} doesn't fill information about himself`}
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>

          <CardContent>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </>
      )}
    </Card>
  );
};

export default UserBio;
