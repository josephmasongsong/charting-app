import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 p-3">
              <Skeleton className="h-4 w-4 rounded-full flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                {i % 2 === 0 && <Skeleton className="h-4 w-16" />}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
