import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Loading Report</h3>
            <p className="text-muted-foreground text-center">
              Fetching your activity data...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
