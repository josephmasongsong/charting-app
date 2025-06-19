import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ActionsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-52" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center space-x-2 p-3 rounded border"
            >
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
