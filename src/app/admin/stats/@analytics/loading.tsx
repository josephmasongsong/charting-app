import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyticsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
