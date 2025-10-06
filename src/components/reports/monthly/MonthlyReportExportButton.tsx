// @/components/reports/monthly/MonthlyReportExportButton.tsx

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { MonthlyActivityReportData } from './types';
import * as XLSX from 'xlsx';

interface MonthlyReportExportButtonProps {
  data: MonthlyActivityReportData;
}

export function MonthlyReportExportButton({
  data,
}: MonthlyReportExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Prepare Activity Types by Region data
      const activityHeaders = [
        'Region',
        'Activity Type',
        'Events',
        'New Participants',
        'Returning Participants',
        'Total Cost',
      ];

      const activityRows = data.activityTypesByRegion.map(activity => [
        activity.region,
        activity.activityTypeName,
        activity.eventCount,
        activity.newParticipants,
        activity.returningParticipants,
        activity.totalCost,
      ]);

      // Create worksheet data with summary section
      const worksheetData: any[][] = [
        ['Monthly Activity Report'],
        ['Report Period:', data.reportMonth],
        [],
        ['Summary Statistics'],
        ['Total Events:', data.totalEvents],
        ['Total Participants:', data.totalParticipants],
        ['New Participants:', data.totalNewParticipants],
        ['Returning Participants:', data.totalReturningParticipants],
        [
          'Total Event Duration (hrs):',
          Math.round(data.totalEventDuration / 60),
        ],
        [
          'Total Admin Duration (hrs):',
          Math.round(data.totalAdminDuration / 60),
        ],
        ['Total Cost:', `$${data.totalCost.toFixed(2)}`],
        [],
        ['Activity Types by Region'],
        activityHeaders,
        ...activityRows,
      ];

      // Add supply distributions if they exist
      if (data.supplyDistributions && data.supplyDistributions.length > 0) {
        const supplyHeaders = [
          'Supply Name',
          'Total Quantity Distributed',
          'Total Cost',
          'Distribution Count',
        ];

        const supplyRows = data.supplyDistributions.map(supply => [
          supply.supplyName,
          supply.totalQuantityDistributed,
          supply.totalCost,
          supply.distributionCount,
        ]);

        // Add spacing and supply distribution section
        worksheetData.push(
          [],
          [],
          ['Supply Distributions'],
          supplyHeaders,
          ...supplyRows
        );
      }

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 20 }, // Region/Label column
        { wch: 25 }, // Activity Type/Value column
        { wch: 10 }, // Events column
        { wch: 18 }, // New Participants column
        { wch: 20 }, // Returning Participants column
        { wch: 15 }, // Total Cost column
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Monthly Report');

      // Generate filename
      const filename = `monthly-report-${data.reportMonth.replace(/\s+/g, '-').toLowerCase()}.xlsx`;

      // Write workbook and trigger download
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('An error occurred while exporting the report.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isExporting}
      onClick={handleExportExcel}
    >
      <FileSpreadsheet className="h-4 w-4 mr-2" />
      {isExporting ? 'Exporting...' : 'Export to Excel'}
    </Button>
  );
}
