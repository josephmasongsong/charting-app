import MonthlyActivityReport from '@/components/reports/monthly';
import { generateMonthlyActivityReport } from '@/server/actions/reports';
import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Loading from './loading';

interface PageProps {
  searchParams: Promise<{
    startYear?: string;
    startMonth?: string;
    endYear?: string;
    endMonth?: string;
  }>;
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
  const endYear = params.endYear ? parseInt(params.endYear) : undefined;
  const endMonth = params.endMonth ? parseInt(params.endMonth) : undefined;

  try {
    const reportData = await generateMonthlyActivityReport(
      startYear,
      startMonth,
      endYear,
      endMonth,
    );

    return (
      <div className="min-h-screen bg-(--surface-page) px-6 pt-8 pb-12">
        <div className="mx-auto max-w-[1200px]">
          <MonthlyActivityReport
            data={reportData}
            currentParams={{ startYear, startMonth, endYear, endMonth }}
          />
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-(--surface-page) px-6 pt-8 pb-12">
        <div className="mx-auto max-w-[1200px]">
          <Card className="gap-0 rounded-(--radius-card) border-(--border-default) bg-(--surface-card) shadow-(--shadow-card)">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h2 className="mb-4 text-2xl font-bold text-(--danger)">
                  Error Loading Report
                </h2>
                <p className="text-(--text-muted)">
                  {error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}

export default function MonthlyReportPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <ReportContent searchParams={searchParams} />
    </Suspense>
  );
}
