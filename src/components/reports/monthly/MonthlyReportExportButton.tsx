// @/components/reports/monthly/MonthlyReportExportButton.tsx

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { MonthlyActivityReportData } from './types';

interface MonthlyReportExportButtonProps {
  data: MonthlyActivityReportData;
}

export function MonthlyReportExportButton({
  data,
}: MonthlyReportExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // TODO: Implement PDF export logic
      console.log('Exporting PDF...', data);

      // Placeholder for actual implementation
      // You might want to use a library like jsPDF or call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('PDF export would happen here');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // Create CSV content
      const headers = [
        'Region',
        'Activity Type',
        'Events',
        'Participants',
        'New Participants',
        'Returning Participants',
        'Total Cost',
      ];
      const rows = data.activityTypesByRegion.map(activity => [
        activity.region,
        activity.activityTypeName,
        activity.eventCount,
        activity.participantsServed,
        activity.newParticipants,
        activity.returningParticipants,
        activity.totalCost.toFixed(2),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `monthly-report-${data.reportMonth.replace(/\s+/g, '-')}.csv`
      );
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
