import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ActivityTypeByRegion {
  activityTypeId: string;
  activityTypeName: string;
  programGoalName: string;
  region: string;
  eventCount: number;
  participantsServed: number;
  newParticipants: number;
  returningParticipants: number;
  totalAdminDuration: number;
  totalCost: number;
}

interface SupplyDistributionSummary {
  supplyId: string;
  supplyName: string;
  totalQuantityDistributed: number;
  totalCost: number;
  distributionCount: number;
}

interface MonthlyActivityReportData {
  reportMonth: string;
  totalEvents: number;
  totalParticipants: number;
  totalNewParticipants: number;
  totalReturningParticipants: number;
  totalCost: number;
  totalEventDuration: number;
  totalAdminDuration: number;
  activityTypesByRegion: ActivityTypeByRegion[];
  supplyDistributions: SupplyDistributionSummary[];
}

export function MonthlyReportExportButton({
  data,
}: {
  data: MonthlyActivityReportData;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fileName, setFileName] = useState(
    `Monthly_Report_${data.reportMonth.replace(/\s+/g, '_')}`
  );
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsDialogOpen(true);
  };

  const handleConfirmExport = () => {
    setIsExporting(true);

    try {
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Summary
      const summaryData = [
        ['Monthly Activity Report'],
        ['Period', data.reportMonth],
        [''],
        ['Key Metrics'],
        ['Total Events', data.totalEvents],
        ['Total Participants', data.totalParticipants],
        ['New Participants', data.totalNewParticipants],
        ['Returning Participants', data.totalReturningParticipants],
        ['Total Cost', `$${data.totalCost.toFixed(2)}`],
        ['Total Event Duration (min)', data.totalEventDuration],
        ['Total Admin Duration (min)', data.totalAdminDuration],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Sheet 2: Activity Types by Region
      if (data.activityTypesByRegion.length > 0) {
        const activitiesData = data.activityTypesByRegion.map(activity => ({
          Region: activity.region,
          'Activity Type': activity.activityTypeName,
          'Program Goal': activity.programGoalName,
          Events: activity.eventCount,
          'Participants Served': activity.participantsServed,
          'New Participants': activity.newParticipants,
          'Returning Participants': activity.returningParticipants,
          'Admin Duration (min)': activity.totalAdminDuration,
          'Total Cost': parseFloat(activity.totalCost.toFixed(2)),
        }));
        const activitiesSheet = XLSX.utils.json_to_sheet(activitiesData);
        XLSX.utils.book_append_sheet(
          workbook,
          activitiesSheet,
          'Activities by Region'
        );
      }

      // Sheet 3: Regional Summary
      if (data.activityTypesByRegion.length > 0) {
        const regionGroups = data.activityTypesByRegion.reduce(
          (acc, activity) => {
            if (!acc[activity.region]) {
              acc[activity.region] = {
                region: activity.region,
                events: 0,
                participants: 0,
                newParticipants: 0,
                returningParticipants: 0,
                adminDuration: 0,
                cost: 0,
              };
            }
            acc[activity.region].events += activity.eventCount;
            acc[activity.region].participants += activity.participantsServed;
            acc[activity.region].newParticipants += activity.newParticipants;
            acc[activity.region].returningParticipants +=
              activity.returningParticipants;
            acc[activity.region].adminDuration += activity.totalAdminDuration;
            acc[activity.region].cost += activity.totalCost;
            return acc;
          },
          {} as Record<string, any>
        );

        const regionalData = Object.values(regionGroups).map(region => ({
          Region: region.region,
          'Total Events': region.events,
          'Total Participants': region.participants,
          'New Participants': region.newParticipants,
          'Returning Participants': region.returningParticipants,
          'Admin Duration (min)': region.adminDuration,
          'Total Cost': parseFloat(region.cost.toFixed(2)),
        }));
        const regionalSheet = XLSX.utils.json_to_sheet(regionalData);
        XLSX.utils.book_append_sheet(
          workbook,
          regionalSheet,
          'Regional Summary'
        );
      }

      // Sheet 4: Supply Distributions
      if (data.supplyDistributions.length > 0) {
        const suppliesData = data.supplyDistributions.map(supply => ({
          'Supply Name': supply.supplyName,
          Distributions: supply.distributionCount,
          'Quantity Distributed': supply.totalQuantityDistributed,
          'Total Cost': parseFloat(supply.totalCost.toFixed(2)),
        }));
        const suppliesSheet = XLSX.utils.json_to_sheet(suppliesData);
        XLSX.utils.book_append_sheet(
          workbook,
          suppliesSheet,
          'Supply Distributions'
        );
      }

      // Generate and download the file
      const finalFileName =
        fileName.trim() ||
        `Monthly_Report_${data.reportMonth.replace(/\s+/g, '_')}`;
      XLSX.writeFile(workbook, `${finalFileName}.xlsx`);

      setIsDialogOpen(false);
      setIsExporting(false);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      // You could add error handling UI here
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setFileName(`Monthly_Report_${data.reportMonth.replace(/\s+/g, '_')}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isExporting) {
      handleConfirmExport();
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="h-4 w-4 mr-2" />
        Export XLS
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Report to Excel</DialogTitle>
            <DialogDescription>
              Enter a filename for your Excel export. The report will include
              summary data, activities by region, regional totals, and supply
              distributions.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="filename" className="text-right">
                Filename
              </Label>
              <Input
                id="filename"
                value={fileName}
                onChange={e => setFileName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="col-span-3"
                placeholder="Enter filename..."
                autoFocus
                disabled={isExporting}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
