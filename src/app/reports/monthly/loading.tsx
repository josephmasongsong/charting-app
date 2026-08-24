import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-(--surface-page) px-6 pt-8 pb-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex items-center justify-center py-12">
          <Card className="w-full max-w-md gap-0 rounded-(--radius-card) border-(--border-default) bg-(--surface-card) shadow-(--shadow-card)">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-(--action-primary)" />
              <h3 className="mb-2 text-lg font-semibold">Loading Report</h3>
              <p className="text-center text-(--text-muted)">
                Fetching your activity data...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
