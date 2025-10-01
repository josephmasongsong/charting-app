// import { MonthlyActivityReport } from '@/components/MonthlyActivityReport';
import MonthlyActivityReport from '@/components/reports/monthly';
import { generateMonthlyActivityReport } from '@/server/actions/reports';
import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{
    startYear?: string;
    startMonth?: string;
    endYear?: string;
    endMonth?: string;
  }>;
}

function ReportSkeleton() {
  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Generating Report</h3>
            <p className="text-muted-foreground text-center">
              Please wait while we compile your activity data...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function ReportContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const now = new Date();
  const startYear = params.startYear
    ? parseInt(params.startYear)
    : now.getFullYear();
  const startMonth = params.startMonth
    ? parseInt(params.startMonth)
    : now.getMonth() + 1;
  const endYear = params.endYear
    ? parseInt(params.endYear)
    : undefined;
  const endMonth = params.endMonth
    ? parseInt(params.endMonth)
    : undefined;

  try {
    const reportData = await generateMonthlyActivityReport(
      startYear,
      startMonth,
      endYear,
      endMonth
    );

    return (
      <div className="max-w-7xl mx-auto py-6">
        <MonthlyActivityReport
          data={reportData}
          currentParams={{ startYear, startMonth, endYear, endMonth }}
        />
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Error Loading Report
              </h2>
              <p className="text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : 'An unexpected error occurred'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default function MonthlyReportPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<ReportSkeleton />}>
      <ReportContent searchParams={searchParams} />
    </Suspense>
  );
}
