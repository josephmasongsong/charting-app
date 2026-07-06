// @/components/reports/monthly/DateRangeDialog.tsx

'use client';

import React, { useState, useTransition, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar, Loader2, Search } from 'lucide-react';

interface DateRangeDialogProps {
  currentParams: {
    startYear: number;
    startMonth: number;
    endYear?: number;
    endMonth?: number;
  };
  availableDateRange: { minDate: string; maxDate: string };
}

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export function DateRangeDialog({
  currentParams,
  availableDateRange,
}: DateRangeDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [isRange, setIsRange] = useState(
    !!(currentParams.endYear && currentParams.endMonth),
  );
  const prevOpenRef = useRef(false);

  const [selectedStartYear, setSelectedStartYear] = useState(
    currentParams.startYear,
  );
  const [selectedStartMonth, setSelectedStartMonth] = useState(
    currentParams.startMonth,
  );
  const [selectedEndYear, setSelectedEndYear] = useState(
    currentParams.endYear || currentParams.startYear,
  );
  const [selectedEndMonth, setSelectedEndMonth] = useState(
    currentParams.endMonth || currentParams.startMonth,
  );
  const [validationError, setValidationError] = useState('');

  // Parse available date range
  const minDate = new Date(availableDateRange.minDate);
  const maxDate = new Date(availableDateRange.maxDate);
  const minYear = minDate.getFullYear();
  const maxYear = maxDate.getFullYear();
  const minMonth = minDate.getMonth() + 1;
  const maxMonth = maxDate.getMonth() + 1;

  const availableYears = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i,
  );

  // Get available months for a given year
  const getAvailableMonths = useCallback(
    (year: number) => {
      return MONTHS.filter(month => {
        if (year === minYear && year === maxYear) {
          return month.value >= minMonth && month.value <= maxMonth;
        } else if (year === minYear) {
          return month.value >= minMonth;
        } else if (year === maxYear) {
          return month.value <= maxMonth;
        }
        return true;
      });
    },
    [minYear, maxYear, minMonth, maxMonth],
  );

  // Check if a month is available for a given year
  const isMonthAvailable = useCallback(
    (year: number, month: number) => {
      const availableMonths = getAvailableMonths(year);
      return availableMonths.some(m => m.value === month);
    },
    [getAvailableMonths],
  );

  // Get the first available month for a year
  const getFirstAvailableMonth = useCallback(
    (year: number) => {
      const availableMonths = getAvailableMonths(year);
      return availableMonths.length > 0 ? availableMonths[0].value : 1;
    },
    [getAvailableMonths],
  );

  // Get the last available month for a year
  const getLastAvailableMonth = useCallback(
    (year: number) => {
      const availableMonths = getAvailableMonths(year);
      return availableMonths.length > 0
        ? availableMonths[availableMonths.length - 1].value
        : 12;
    },
    [getAvailableMonths],
  );

  // Validate date range
  const validateDateRange = useCallback(
    (
      startYear: number,
      startMonth: number,
      endYear: number,
      endMonth: number,
    ) => {
      if (!isRange) return true;

      const startDate = new Date(startYear, startMonth - 1);
      const endDate = new Date(endYear, endMonth - 1);

      return startDate <= endDate;
    },
    [isRange],
  );

  // Handle start year change
  const handleStartYearChange = (newYear: number) => {
    setSelectedStartYear(newYear);

    // Adjust start month if it's not available in the new year
    if (!isMonthAvailable(newYear, selectedStartMonth)) {
      const newMonth = getFirstAvailableMonth(newYear);
      setSelectedStartMonth(newMonth);
    }
  };

  // Handle end year change
  const handleEndYearChange = (newYear: number) => {
    setSelectedEndYear(newYear);

    // Adjust end month if it's not available in the new year
    if (!isMonthAvailable(newYear, selectedEndMonth)) {
      const newMonth = getLastAvailableMonth(newYear);
      setSelectedEndMonth(newMonth);
    }
  };

  // Handle range mode toggle
  const handleRangeModeToggle = (checked: boolean) => {
    setIsRange(checked);

    if (checked) {
      // When enabling range mode, set end date to start date if not already set
      if (!currentParams.endYear || !currentParams.endMonth) {
        setSelectedEndYear(selectedStartYear);
        setSelectedEndMonth(selectedStartMonth);
      }
    }
  };

  // Validate whenever relevant state changes
  useEffect(() => {
    if (
      isRange &&
      !validateDateRange(
        selectedStartYear,
        selectedStartMonth,
        selectedEndYear,
        selectedEndMonth,
      )
    ) {
      setValidationError('Start date must be before or equal to end date');
    } else {
      setValidationError('');
    }
  }, [
    selectedStartYear,
    selectedStartMonth,
    selectedEndYear,
    selectedEndMonth,
    isRange,
    validateDateRange,
  ]);

  // Reset to current params when dialog opens
  useEffect(() => {
    // Only run when dialog transitions from closed to open
    if (open && !prevOpenRef.current) {
      // Clamp start year to available years if out of range
      const validStartYear = availableYears.includes(currentParams.startYear)
        ? currentParams.startYear
        : maxYear;

      // Clamp start month to available months for the valid year
      const validStartMonth = isMonthAvailable(validStartYear, currentParams.startMonth)
        ? currentParams.startMonth
        : getFirstAvailableMonth(validStartYear);

      setSelectedStartYear(validStartYear);
      setSelectedStartMonth(validStartMonth);

      // Clamp end year to available years if out of range
      const validEndYear = currentParams.endYear && availableYears.includes(currentParams.endYear)
        ? currentParams.endYear
        : validStartYear;

      // Clamp end month to available months for the valid end year
      const validEndMonth = currentParams.endMonth && isMonthAvailable(validEndYear, currentParams.endMonth)
        ? currentParams.endMonth
        : validStartMonth;

      setSelectedEndYear(validEndYear);
      setSelectedEndMonth(validEndMonth);
      setIsRange(!!(currentParams.endYear && currentParams.endMonth));
      setValidationError('');
    }

    prevOpenRef.current = open;
  }, [open, currentParams, availableYears, maxYear, isMonthAvailable, getFirstAvailableMonth]);

  const handleSubmit = () => {
    // Final validation check
    if (
      isRange &&
      !validateDateRange(
        selectedStartYear,
        selectedStartMonth,
        selectedEndYear,
        selectedEndMonth,
      )
    ) {
      setValidationError('Start date must be before or equal to end date');
      return;
    }

    const params = new URLSearchParams();
    params.set('startYear', selectedStartYear.toString());
    params.set('startMonth', selectedStartMonth.toString());

    if (isRange) {
      params.set('endYear', selectedEndYear.toString());
      params.set('endMonth', selectedEndMonth.toString());
    }

    startTransition(() => {
      router.push(`/reports/monthly?${params.toString()}`);
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          Change Period
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Report Period</DialogTitle>
          <DialogDescription>
            Choose the date range for your monthly activity report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              id="isRange"
              type="checkbox"
              checked={isRange}
              onChange={e => handleRangeModeToggle(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isRange" className="text-sm font-medium">
              Date Range Mode
            </Label>
          </div>

          <div className="space-y-4">
            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{validationError}</p>
              </div>
            )}

            {/* Start Date */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                {isRange ? 'Start Date' : 'Month & Year'}
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor="startMonth"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Month
                  </Label>
                  <select
                    id="startMonth"
                    name="startMonth"
                    value={selectedStartMonth}
                    onChange={e =>
                      setSelectedStartMonth(parseInt(e.target.value))
                    }
                    className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    {getAvailableMonths(selectedStartYear).map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label
                    htmlFor="startYear"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Year
                  </Label>
                  <select
                    id="startYear"
                    name="startYear"
                    value={selectedStartYear}
                    onChange={e =>
                      handleStartYearChange(parseInt(e.target.value))
                    }
                    className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* End Date */}
            {isRange && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  End Date
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="endMonth"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Month
                    </Label>
                    <select
                      id="endMonth"
                      name="endMonth"
                      value={selectedEndMonth}
                      onChange={e =>
                        setSelectedEndMonth(parseInt(e.target.value))
                      }
                      className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {getAvailableMonths(selectedEndYear).map(month => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label
                      htmlFor="endYear"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Year
                    </Label>
                    <select
                      id="endYear"
                      name="endYear"
                      value={selectedEndYear}
                      onChange={e =>
                        handleEndYearChange(parseInt(e.target.value))
                      }
                      className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {availableYears.map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="button"
              disabled={isPending || !!validationError}
              className="w-full"
              onClick={handleSubmit}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
