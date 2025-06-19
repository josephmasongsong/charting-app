import React from 'react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  metrics,
  table,
  activity,
  analytics,
  actions,
}: {
  metrics: React.ReactNode;
  table: React.ReactNode;
  activity: React.ReactNode;
  analytics: React.ReactNode;
  actions: React.ReactNode;
}) {
  return (
    <div className="min-h-screen ">
      {/* Header */}
      <header className="border-b">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button size="sm">Add Product</Button>
          </div>
        </div>
      </header>

      {/* Main Content with Suspense */}
      <main className="flex-1 space-y-6 p-6">
        {/* Metrics Grid with Suspense */}

        {metrics}

        {/* Parallel Routes Layout with Suspense */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* @table slot - Takes up 2 columns */}
          <div className="lg:col-span-2">{table}</div>

          {/* @activity slot - Takes up 1 column */}
          <div className="lg:col-span-1">{activity}</div>
        </div>

        {/* Additional Parallel Routes with Suspense */}
        <div className="grid gap-6 md:grid-cols-2">
          {analytics}

          {actions}
        </div>
      </main>
    </div>
  );
}
