// app/admin/events/components/Loading.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TableLoading() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );
}

export function FormLoading() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
