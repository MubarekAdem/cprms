import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingCard({ className = "h-[150px]" }) {
  return (
    <Card>
      <CardContent
        className={`p-6 ${className} flex items-center justify-center`}
      >
        <div className="w-full space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full mt-4" />
        </div>
      </CardContent>
    </Card>
  );
}
