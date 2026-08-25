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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type PeriodType = 'month' | 'quarter' | 'year';

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

const QUARTERS = [
  { value: 1, label: 'Q1' },
  { value: 2, label: 'Q2' },
  { value: 3, label: 'Q3' },
  { value: 4, label: 'Q4' },
];

const quarterStartMonth = (quarter: number) => (quarter - 1) * 3 + 1;
const quarterEndMonth = (quarter: number) => quarter * 3;

// The three period types all express themselves through the existing
// startYear/startMonth/endYear/endMonth URL params, so the server action
// is untouched: month → start only; quarter → its three months; year →
// January through December.
function derivePeriod(params: DateRangeDialogProps['currentParams']): {
  type: PeriodType;
  month: number;
  quarter: number;
  year: number;
} {
  const { startYear, startMonth, endYear, endMonth } = params;
  if (endYear && endMonth && endYear === startYear) {
    if (startMonth === 1 && endMonth === 12) {
      return { type: 'year', month: startMonth, quarter: 1, year: startYear };
    }
    if (startMonth % 3 === 1 && endMonth === startMonth + 2) {
      return {
        type: 'quarter',
        month: startMonth,
        quarter: Math.floor(startMonth / 3) + 1,
        year: startYear,
      };
    }
  }
  return {
    type: 'month',
    month: startMonth,
    quarter: Math.floor((startMonth - 1) / 3) + 1,
    year: startYear,
  };
}

const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';
const primaryButtonClass =
  'h-auto w-full rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[11px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover) disabled:bg-(--action-primary-disabled) disabled:opacity-100';
const toggleBaseClass =
  'h-auto rounded-(--radius-control) border px-4 py-[7px] text-[14.5px] font-normal shadow-none';
const toggleSelectedClass =
  'border-(--action-primary) bg-(--action-primary) text-(--text-on-chrome) hover:bg-(--action-primary-hover) hover:text-(--text-on-chrome)';
const toggleUnselectedClass =
  'border-(--action-primary) bg-(--surface-card) text-(--action-primary) hover:bg-(--action-selected) hover:text-(--action-primary)';
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
  const prevOpenRef = useRef(false);

  const initial = derivePeriod(currentParams);
  const [periodType, setPeriodType] = useState<PeriodType>(initial.type);
  const [selectedMonth, setSelectedMonth] = useState(initial.month);
  const [selectedQuarter, setSelectedQuarter] = useState(initial.quarter);
  const [selectedYear, setSelectedYear] = useState(initial.year);

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

  const isMonthAvailable = useCallback(
    (year: number, month: number) => {
      return getAvailableMonths(year).some(m => m.value === month);
    },
    [getAvailableMonths],
  );

  const getFirstAvailableMonth = useCallback(
    (year: number) => {
      const availableMonths = getAvailableMonths(year);
      return availableMonths.length > 0 ? availableMonths[0].value : 1;
    },
    [getAvailableMonths],
  );

  // Quarters that overlap the available data range for a given year
  const getAvailableQuarters = useCallback(
    (year: number) => {
      return QUARTERS.filter(quarter => {
        if (year === minYear && quarterEndMonth(quarter.value) < minMonth) {
          return false;
        }
        if (year === maxYear && quarterStartMonth(quarter.value) > maxMonth) {
          return false;
        }
        return true;
      });
    },
    [minYear, maxYear, minMonth, maxMonth],
  );

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    if (!isMonthAvailable(newYear, selectedMonth)) {
      setSelectedMonth(getFirstAvailableMonth(newYear));
    }
    const quarters = getAvailableQuarters(newYear);
    if (!quarters.some(q => q.value === selectedQuarter)) {
      setSelectedQuarter(quarters[0]?.value ?? 1);
    }
  };

  // Reset to current params when dialog opens
  useEffect(() => {
    // Only run when dialog transitions from closed to open
    if (open && !prevOpenRef.current) {
      const init = derivePeriod(currentParams);

      // Clamp to available years/months if out of range
      const validYear = availableYears.includes(init.year)
        ? init.year
        : maxYear;
      const validMonth = isMonthAvailable(validYear, init.month)
        ? init.month
        : getFirstAvailableMonth(validYear);
      const quarters = getAvailableQuarters(validYear);
      const validQuarter = quarters.some(q => q.value === init.quarter)
        ? init.quarter
        : (quarters[0]?.value ?? 1);

      setPeriodType(init.type);
      setSelectedYear(validYear);
      setSelectedMonth(validMonth);
      setSelectedQuarter(validQuarter);
    }

    prevOpenRef.current = open;
  }, [
    open,
    currentParams,
    availableYears,
    maxYear,
    isMonthAvailable,
    getFirstAvailableMonth,
    getAvailableQuarters,
  ]);

  const handleSubmit = () => {
    const params = new URLSearchParams();
    params.set('startYear', String(selectedYear));

    if (periodType === 'month') {
      params.set('startMonth', String(selectedMonth));
    } else if (periodType === 'quarter') {
      params.set('startMonth', String(quarterStartMonth(selectedQuarter)));
      params.set('endYear', String(selectedYear));
      params.set('endMonth', String(quarterEndMonth(selectedQuarter)));
    } else {
      params.set('startMonth', '1');
      params.set('endYear', String(selectedYear));
      params.set('endMonth', '12');
    }

    startTransition(() => {
      router.push(`/reports/monthly?${params.toString()}`);
      setOpen(false);
    });
  };

  const yearField = (
    <div className="space-y-1">
      <Label htmlFor="periodYear" className={subLabelClass}>
        Year
      </Label>
      <Select
        value={String(selectedYear)}
        onValueChange={value => handleYearChange(parseInt(value))}
      >
        <SelectTrigger id="periodYear" className={selectTriggerClass}>
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
          Choose the period for your activity report.
        </p>

        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label className={subLabelClass}>Period Type</Label>
            <div className="flex gap-2">
              {(
                [
                  { value: 'month', label: 'Month' },
                  { value: 'quarter', label: 'Quarter' },
                  { value: 'year', label: 'Year' },
                ] as const
              ).map(option => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={periodType === option.value}
                  onClick={() => setPeriodType(option.value)}
                  className={cn(
                    'cursor-pointer',
                    toggleBaseClass,
                    periodType === option.value
                      ? toggleSelectedClass
                      : toggleUnselectedClass,
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {periodType === 'month' && (
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <Label htmlFor="periodMonth" className={subLabelClass}>
                  Month
                </Label>
                <Select
                  value={String(selectedMonth)}
                  onValueChange={value => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger
                    id="periodMonth"
                    className={selectTriggerClass}
                  >
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
              {yearField}
            </div>
          )}

          {periodType === 'quarter' && (
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <Label htmlFor="periodQuarter" className={subLabelClass}>
                  Quarter
                </Label>
                <Select
                  value={String(selectedQuarter)}
                  onValueChange={value => setSelectedQuarter(parseInt(value))}
                >
                  <SelectTrigger
                    id="periodQuarter"
                    className={selectTriggerClass}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableQuarters(selectedYear).map(quarter => (
                      <SelectItem
                        key={quarter.value}
                        value={String(quarter.value)}
                      >
                        {quarter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {yearField}
            </div>
          )}

          {periodType === 'year' && yearField}

          <Button
            type="button"
            disabled={isPending}
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
