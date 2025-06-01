import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Users, DollarSign, UserCheck } from 'lucide-react';

interface StepTwoProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: Record<string, string>;
  loading: boolean;
}

export default function StepTwo({
  formData,
  setFormData,
  errors,
  loading,
}: StepTwoProps) {
  // Helper function to handle duration changes
  const handleDurationChange = (
    durationType: 'eventDuration' | 'adminDuration',
    field: 'hours' | 'minutes',
    value: string
  ) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    const maxValue = field === 'hours' ? 23 : 59;
    const clampedValue = Math.min(numValue, maxValue);

    setFormData({
      ...formData,
      [durationType]: {
        ...formData[durationType],
        [field]: clampedValue,
      },
    });
  };

  // Helper function to handle participant changes
  const handleParticipantChange = (field: string, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setFormData({ ...formData, [field]: numValue });
  };

  return (
    <div className="space-y-6">
      {/* Duration Fields - Now on same line */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Duration */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Event Duration *
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label
                htmlFor="eventDurationHours"
                className="text-xs text-muted-foreground"
              >
                Hours
              </Label>
              <Input
                id="eventDurationHours"
                type="number"
                min="0"
                max="23"
                value={formData.eventDuration?.hours || 0}
                onChange={e =>
                  handleDurationChange('eventDuration', 'hours', e.target.value)
                }
                disabled={loading}
                className={
                  errors['eventDuration.hours'] ? 'border-red-500' : ''
                }
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="eventDurationMinutes"
                className="text-xs text-muted-foreground"
              >
                Minutes
              </Label>
              <Input
                id="eventDurationMinutes"
                type="number"
                min="0"
                max="59"
                value={formData.eventDuration?.minutes || 0}
                onChange={e =>
                  handleDurationChange(
                    'eventDuration',
                    'minutes',
                    e.target.value
                  )
                }
                disabled={loading}
                className={
                  errors['eventDuration.minutes'] ? 'border-red-500' : ''
                }
                placeholder="0"
              />
            </div>
          </div>
          {(errors['eventDuration.hours'] ||
            errors['eventDuration.minutes'] ||
            errors.eventDuration) && (
            <p className="text-sm text-red-500">
              {errors['eventDuration.hours'] ||
                errors['eventDuration.minutes'] ||
                errors.eventDuration}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Duration of the actual event
          </p>
        </div>

        {/* Admin Duration */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Admin Duration *
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label
                htmlFor="adminDurationHours"
                className="text-xs text-muted-foreground"
              >
                Hours
              </Label>
              <Input
                id="adminDurationHours"
                type="number"
                min="0"
                max="23"
                value={formData.adminDuration?.hours || 0}
                onChange={e =>
                  handleDurationChange('adminDuration', 'hours', e.target.value)
                }
                disabled={loading}
                className={
                  errors['adminDuration.hours'] ? 'border-red-500' : ''
                }
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="adminDurationMinutes"
                className="text-xs text-muted-foreground"
              >
                Minutes
              </Label>
              <Input
                id="adminDurationMinutes"
                type="number"
                min="0"
                max="59"
                value={formData.adminDuration?.minutes || 0}
                onChange={e =>
                  handleDurationChange(
                    'adminDuration',
                    'minutes',
                    e.target.value
                  )
                }
                disabled={loading}
                className={
                  errors['adminDuration.minutes'] ? 'border-red-500' : ''
                }
                placeholder="0"
              />
            </div>
          </div>
          {(errors['adminDuration.hours'] ||
            errors['adminDuration.minutes'] ||
            errors.adminDuration) && (
            <p className="text-sm text-red-500">
              {errors['adminDuration.hours'] ||
                errors['adminDuration.minutes'] ||
                errors.adminDuration}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Time spent on setup, cleanup, etc.
          </p>
        </div>
      </div>

      {/* Participants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="newParticipants" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            New Participants *
          </Label>
          <Input
            id="newParticipants"
            type="number"
            min="0"
            value={formData.newParticipants || 0}
            onChange={e =>
              handleParticipantChange('newParticipants', e.target.value)
            }
            disabled={loading}
            className={errors.newParticipants ? 'border-red-500' : ''}
            placeholder="0"
          />
          {errors.newParticipants && (
            <p className="text-sm text-red-500">{errors.newParticipants}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Number of first-time participants
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="returningParticipants"
            className="flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Returning Participants *
          </Label>
          <Input
            id="returningParticipants"
            type="number"
            min="0"
            value={formData.returningParticipants || 0}
            onChange={e =>
              handleParticipantChange('returningParticipants', e.target.value)
            }
            disabled={loading}
            className={errors.returningParticipants ? 'border-red-500' : ''}
            placeholder="0"
          />
          {errors.returningParticipants && (
            <p className="text-sm text-red-500">
              {errors.returningParticipants}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Number of repeat participants
          </p>
        </div>
      </div>

      {/* Cost */}
      <div className="space-y-2">
        <Label htmlFor="totalCost" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Total Cost *
        </Label>
        <Input
          id="totalCost"
          type="number"
          min="0"
          step="0.01"
          value={formData.totalCost || '0.00'}
          onChange={e =>
            setFormData({ ...formData, totalCost: e.target.value })
          }
          disabled={loading}
          className={errors.totalCost ? 'border-red-500' : ''}
          placeholder="0.00"
        />
        {errors.totalCost && (
          <p className="text-sm text-red-500">{errors.totalCost}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Total cost of the event in dollars (e.g., 25.50)
        </p>
      </div>

      {/* Youth Focused */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="eventIsYouthFocused"
          checked={formData.eventIsYouthFocused || false}
          onCheckedChange={checked =>
            setFormData({
              ...formData,
              eventIsYouthFocused: checked as boolean,
            })
          }
          disabled={loading}
        />
        <Label
          htmlFor="eventIsYouthFocused"
          className="text-sm font-medium cursor-pointer"
        >
          This event is youth-focused
        </Label>
      </div>
      <p className="text-xs text-muted-foreground ml-6">
        Check this if the event is specifically designed for or targets young
        people
      </p>
    </div>
  );
}
