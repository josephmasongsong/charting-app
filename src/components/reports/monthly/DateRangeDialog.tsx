'use client';

import React, {
  useState,
  useTransition,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';
const primaryButtonClass =
  'h-auto w-full rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[11px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover) disabled:bg-(--action-primary-disabled) disabled:opacity-100';
const selectTriggerClass =
  'w-full rounded-(--radius-control) border-(--border-input) bg-(--surface-card) shadow-none';
const subLabelClass = 'text-[12.5px] font-semibold text-(--text-muted)';

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
      const validStartMonth = isMonthAvailable(
        validStartYear,
        currentParams.startMonth,
      )
        ? currentParams.startMonth
        : getFirstAvailableMonth(validStartYear);

      setSelectedStartYear(validStartYear);
      setSelectedStartMonth(validStartMonth);

      // Clamp end year to available years if out of range
      const validEndYear =
        currentParams.endYear && availableYears.includes(currentParams.endYear)
          ? currentParams.endYear
          : validStartYear;

      // Clamp end month to available months for the valid end year
      const validEndMonth =
        currentParams.endMonth &&
        isMonthAvailable(validEndYear, currentParams.endMonth)
          ? currentParams.endMonth
          : validStartMonth;

      setSelectedEndYear(validEndYear);
      setSelectedEndMonth(validEndMonth);
      setIsRange(!!(currentParams.endYear && currentParams.endMonth));
      setValidationError('');
    }

    prevOpenRef.current = open;
  }, [
    open,
    currentParams,
    availableYears,
    maxYear,
    isMonthAvailable,
    getFirstAvailableMonth,
  ]);

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

  const monthYearFields = (
    which: 'start' | 'end',
    selectedMonth: number,
    selectedYear: number,
    onMonth: (value: number) => void,
    onYear: (value: number) => void,
  ) => (
    <div className="grid grid-cols-2 gap-3.5">
      <div className="space-y-1">
        <Label htmlFor={`${which}Month`} className={subLabelClass}>
          Month
        </Label>
        <Select
          value={String(selectedMonth)}
          onValueChange={value => onMonth(parseInt(value))}
        >
          <SelectTrigger id={`${which}Month`} className={selectTriggerClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {getAvailableMonths(selectedYear).map(month => (
              <SelectItem key={month.value} value={String(month.value)}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${which}Year`} className={subLabelClass}>
          Year
        </Label>
        <Select
          value={String(selectedYear)}
          onValueChange={value => onYear(parseInt(value))}
        >
          <SelectTrigger id={`${which}Year`} className={selectTriggerClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map(year => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className={outlineButtonClass}
      >
        <Calendar className="h-4 w-4" />
        Change Period
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Select Report Period"
        className="sm:max-w-[480px]"
      >
        <p className="text-[13.5px] text-(--text-muted)">
          Choose the date range for your monthly activity report.
        </p>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="isRange"
              checked={isRange}
              onCheckedChange={checked =>
                handleRangeModeToggle(checked as boolean)
              }
            />
            <Label htmlFor="isRange" className="text-sm font-semibold">
              Date Range Mode
            </Label>
          </div>

          {validationError && (
            <div className="rounded-[2px] border-l-[5px] border-l-(--danger) bg-(--danger-surface) p-3 text-sm text-(--danger)">
              {validationError}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-[13.5px] font-bold">
              {isRange ? 'Start Date' : 'Month & Year'}
            </Label>
            {monthYearFields(
              'start',
              selectedStartMonth,
              selectedStartYear,
              setSelectedStartMonth,
              handleStartYearChange,
            )}
          </div>

          {isRange && (
            <div className="space-y-1.5">
              <Label className="text-[13.5px] font-bold">End Date</Label>
              {monthYearFields(
                'end',
                selectedEndMonth,
                selectedEndYear,
                setSelectedEndMonth,
                handleEndYearChange,
              )}
            </div>
          )}

          <Button
            type="button"
            disabled={isPending || !!validationError}
            className={primaryButtonClass}
            onClick={handleSubmit}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </Modal>
    </>
  );
}
