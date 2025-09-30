// @/components/reports/monthly/DateRangeDialog.tsx

'use client';

import React, { useState, useTransition } from 'react';
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

export function DateRangeDialog({
  currentParams,
  availableDateRange,
}: DateRangeDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isRange, setIsRange] = useState(
    !!(currentParams.endYear && currentParams.endMonth)
  );
  const [open, setOpen] = useState(false);
  const [selectedStartYear, setSelectedStartYear] = useState(
    currentParams.startYear
  );
  const [selectedStartMonth, setSelectedStartMonth] = useState(
    currentParams.startMonth
  );
  const [selectedEndYear, setSelectedEndYear] = useState(
    currentParams.endYear || currentParams.startYear
  );
  const [selectedEndMonth, setSelectedEndMonth] = useState(
    currentParams.endMonth || currentParams.startMonth
  );
  const [validationError, setValidationError] = useState('');

  const minDate = new Date(availableDateRange.minDate);
  const maxDate = new Date(availableDateRange.maxDate);

  const minYear = minDate.getFullYear();
  const maxYear = maxDate.getFullYear();
  const minMonth = minDate.getMonth() + 1;
  const maxMonth = maxDate.getMonth() + 1;

  const availableYears = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i
  );

  const months = [
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

  const getAvailableMonths = (year: number) => {
    return months.filter(month => {
      if (year === minYear && year === maxYear) {
        return month.value >= minMonth && month.value <= maxMonth;
      } else if (year === minYear) {
        return month.value >= minMonth;
      } else if (year === maxYear) {
        return month.value <= maxMonth;
      }
      return true;
    });
  };

  const validateDateRange = (
    startYear: number,
    startMonth: number,
    endYear: number,
    endMonth: number
  ) => {
    if (!isRange) return true;
    const startDate = new Date(startYear, startMonth - 1);
    const endDate = new Date(endYear, endMonth - 1);
    return startDate <= endDate;
  };

  React.useEffect(() => {
    if (
      isRange &&
      !validateDateRange(
        selectedStartYear,
        selectedStartMonth,
        selectedEndYear,
        selectedEndMonth
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
  ]);

  const handleSubmit = () => {
    if (
      isRange &&
      !validateDateRange(
        selectedStartYear,
        selectedStartMonth,
        selectedEndYear,
        selectedEndMonth
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
              onChange={e => setIsRange(e.target.checked)}
              className="h-4 w-4"
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
                    className="w-full p-2 text-sm border rounded"
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
                      setSelectedStartYear(parseInt(e.target.value))
                    }
                    className="w-full p-2 text-sm border rounded"
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
                      className="w-full p-2 text-sm border rounded"
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
                        setSelectedEndYear(parseInt(e.target.value))
                      }
                      className="w-full p-2 text-sm border rounded"
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
