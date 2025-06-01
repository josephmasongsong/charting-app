'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface StepOneProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: Record<string, string>;
  loading: boolean;
}

export default function StepOne({
  formData,
  setFormData,
  errors,
  loading,
}: StepOneProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Convert string date to Date object for calendar
  const selectedDate = formData.eventDate
    ? new Date(formData.eventDate)
    : undefined;

  const handleDateSelect = (date: Date | undefined) => {
    setFormData({
      ...formData,
      eventDate: date,
    });
    setCalendarOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Event Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Event Title *
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter event title"
          disabled={loading}
          className={errors.title ? 'border-red-500' : ''}
          maxLength={255}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
        <p className="text-xs text-muted-foreground">
          {formData.title.length}/255 characters
        </p>
      </div>

      {/* Event Date */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          Event Date *
        </Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !selectedDate && 'text-muted-foreground',
                errors.eventDate && 'border-red-500'
              )}
              disabled={loading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, 'PPP')
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              defaultMonth={new Date()}
              today={new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.eventDate && (
          <p className="text-sm text-red-500">{errors.eventDate}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Select the date when the event will take place
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Event Description *
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={e =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Describe the event, its purpose, activities, and any other relevant details..."
          disabled={loading}
          className={errors.description ? 'border-red-500' : ''}
          rows={6}
          maxLength={5000}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {formData.description.length}/5000 characters
        </p>
      </div>
    </div>
  );
}
