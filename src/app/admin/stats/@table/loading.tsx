import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-80" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Table Header */}
          <div className="flex space-x-4 pb-4 border-b">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          {/* Table Rows */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4 py-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
