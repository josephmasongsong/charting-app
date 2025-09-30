// app/components/EventForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Calendar as CalIcon } from 'lucide-react';
import { Clock } from 'lucide-react';
import { Users } from 'lucide-react';
import { MapPin } from 'lucide-react';
import { Activity } from 'lucide-react';
import { DollarSign } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import { Copy } from 'lucide-react';
import { Building } from 'lucide-react';
import { FileText } from 'lucide-react';
import { Save } from 'lucide-react';
import { X } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { CheckCircle } from 'lucide-react';
import { Target } from 'lucide-react';
import { Check } from 'lucide-react';
import { ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Options {
  activityTypes: Array<{ id: string; name: string; programGoalName: string }>;
  sites: Array<{ id: string; name: string; address: string }>;
  communityPartners: Array<{ id: string; name: string }>;
}

interface EventFormProps {
  mode: 'create' | 'edit';
  eventId?: string;
  initialData?: any;
  isDuplicated?: boolean; // NEW
  isAdmin?: boolean; // NEW
}

export default function EventForm({
  mode,
  eventId,
  initialData,
  isDuplicated,
  isAdmin,
}: EventFormProps) {
  const router = useRouter();
  const [options, setOptions] = useState<Options>({
    activityTypes: [],
    sites: [],
    communityPartners: [],
  });
  const [optionsLoading, setOptionsLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    eventDate: '',
    description: '',
    eventDuration: '',
    adminDuration: '',
    newParticipants: '',
    returningParticipants: '',
    eventIsYouthFocused: false,
    hasCoHost: false,
    totalCost: '',
    activityTypeId: '',
    siteId: '',
    communityPartnerId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activityTypeOpen, setActivityTypeOpen] = useState(false);
  const [siteOpen, setSiteOpen] = useState(false);
  const [communityPartnerOpen, setCommunityPartnerOpen] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch('/api/events/options');
        const data = await response.json();

        if (response.ok) {
          setOptions(data);
        }
      } catch (error) {
        console.error('Failed to fetch options:', error);
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        title: initialData.title || '',
        eventDate: initialData.eventDate || '',
        description: initialData.description || '',
        eventDuration: initialData.eventDuration?.toString() || '',
        adminDuration: initialData.adminDuration?.toString() || '',
        newParticipants: initialData.newParticipants?.toString() || '',
        returningParticipants:
          initialData.returningParticipants?.toString() || '',
        eventIsYouthFocused: initialData.eventIsYouthFocused || false,
        hasCoHost: initialData.hasCoHost || false,
        totalCost: initialData.totalCost || '',
        activityTypeId: initialData.activityTypeId || '',
        siteId: initialData.siteId || '',
        communityPartnerId: initialData.communityPartnerId || '',
      });
    }
  }, [mode, initialData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCheckboxChange = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.eventDate) newErrors.eventDate = 'Event date is required';
    if (!formData.description.trim())
      newErrors.description = 'Description is required';
    if (!formData.activityTypeId)
      newErrors.activityTypeId = 'Activity type is required';
    if (!formData.siteId) newErrors.siteId = 'Site is required';

    if (formData.eventDuration && parseInt(formData.eventDuration) < 0) {
      newErrors.eventDuration = 'Duration cannot be negative';
    }
    if (formData.adminDuration && parseInt(formData.adminDuration) < 0) {
      newErrors.adminDuration = 'Duration cannot be negative';
    }
    if (formData.newParticipants && parseInt(formData.newParticipants) < 0) {
      newErrors.newParticipants = 'Cannot be negative';
    }
    if (
      formData.returningParticipants &&
      parseInt(formData.returningParticipants) < 0
    ) {
      newErrors.returningParticipants = 'Cannot be negative';
    }
    if (formData.totalCost && parseFloat(formData.totalCost) < 0) {
      newErrors.totalCost = 'Cost cannot be negative';
    }

    if (formData.hasCoHost && !formData.communityPartnerId) {
      newErrors.communityPartnerId = 'Please select a community partner';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitStatus('error');
      return;
    }

    setSubmitStatus('loading');

    const apiData = {
      title: formData.title,
      eventDate: formData.eventDate,
      description: formData.description,
      eventDuration: parseInt(formData.eventDuration) || 0,
      adminDuration: parseInt(formData.adminDuration) || 0,
      newParticipants: parseInt(formData.newParticipants) || 0,
      returningParticipants: parseInt(formData.returningParticipants) || 0,
      eventIsYouthFocused: formData.eventIsYouthFocused,
      hasCoHost: formData.hasCoHost,
      totalCost: formData.totalCost,
      activityTypeId: formData.activityTypeId,
      siteId: formData.siteId,
      communityPartnerId: formData.hasCoHost
        ? formData.communityPartnerId
        : null,
      isFirstSaveAfterDuplication: isDuplicated, // NEW
    };

    try {
      // const url =
      //   mode === 'create' ? '/api/events' : `/api/admin/events/${eventId}`;
      // const method = mode === 'create' ? 'POST' : 'PATCH';

      let url: string;
      let method: string;

      if (mode === 'create') {
        url = '/api/events';
        method = 'POST';
      } else if (isAdmin) {
        url = `/api/admin/events/${eventId}`;
        method = 'PATCH';
      } else {
        url = `/api/events/${eventId}`;
        method = 'PATCH';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus('success');
        const targetEventId = mode === 'create' ? data.event.id : eventId;
        setTimeout(() => {
          router.push(`/events/${targetEventId}`);
        }, 1500);
      } else {
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((err: any) => {
            if (err.path.length > 0) {
              fieldErrors[err.path.join('.')] = err.message;
            }
          });
          setErrors(fieldErrors);
        }
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const totalParticipants =
    (parseInt(formData.newParticipants) || 0) +
    (parseInt(formData.returningParticipants) || 0);
  const totalTime =
    (parseInt(formData.eventDuration) || 0) +
    (parseInt(formData.adminDuration) || 0);

  const selectedDate = formData.eventDate
    ? new Date(formData.eventDate)
    : undefined;
  const selectedActivityType = options.activityTypes.find(
    type => type.id === formData.activityTypeId
  );
  const selectedSite = options.sites.find(site => site.id === formData.siteId);
  const selectedCommunityPartner = options.communityPartners.find(
    partner => partner.id === formData.communityPartnerId
  );

  if (optionsLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === 'create' ? 'Log New Event' : 'Edit Event'}
          </h1>
          <p className="text-muted-foreground">
            Record details of a community event or activity
          </p>
        </div>

        {isDuplicated && (
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-3">
              <Copy className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-semibold text-blue-900">
                  Editing Duplicated Event
                </div>
                <p className="text-sm text-blue-700">
                  This event was duplicated. When you save, it will be logged to
                  the activity feed.
                </p>
              </div>
            </div>
          </div>
        )}

        {!isAdmin && (
          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <div className="font-semibold text-yellow-900">
                  Review Carefully Before Submitting
                </div>
                <p className="text-sm text-yellow-700">
                  Once submitted, you will not be able to edit this event.
                  Please ensure all information is accurate before saving.
                </p>
              </div>
            </div>
          </div>
        )}

        {submitStatus === 'success' && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <div className="font-semibold text-green-900">
                Event {mode === 'create' ? 'logged' : 'updated'} successfully!
              </div>
              <p className="text-sm text-green-700">
                Your event has been {mode === 'create' ? 'recorded' : 'updated'}{' '}
                in the system.
              </p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <div className="font-semibold text-red-900">
                Please fix the errors below
              </div>
              <p className="text-sm text-red-700">
                Some required fields are missing or invalid.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential details about the event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Event Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Community Health Fair"
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-xs text-red-600">{errors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">
                    Event Date <span className="text-red-500">*</span>
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
                      >
                        <CalIcon className="mr-2 h-4 w-4" />
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
                        onSelect={date => {
                          if (date) {
                            handleInputChange(
                              'eventDate',
                              date.toISOString().split('T')[0]
                            );
                          }
                          setCalendarOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.eventDate && (
                    <p className="text-xs text-red-600">{errors.eventDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Site Location <span className="text-red-500">*</span>
                  </Label>
                  <Popover open={siteOpen} onOpenChange={setSiteOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={siteOpen}
                        className={cn(
                          'w-full justify-between',
                          errors.siteId && 'border-red-500'
                        )}
                      >
                        {selectedSite ? selectedSite.name : 'Select site...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search sites..." />
                        <CommandEmpty>No site found.</CommandEmpty>
                        <CommandGroup>
                          {options.sites.map(site => (
                            <CommandItem
                              key={site.id}
                              value={`${site.name} ${site.address}`}
                              onSelect={() => {
                                handleInputChange('siteId', site.id);
                                setSiteOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  formData.siteId === site.id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {site.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.siteId && (
                    <p className="text-xs text-red-600">{errors.siteId}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe what happened during the event, activities, and outcomes..."
                  rows={4}
                  value={formData.description}
                  onChange={e =>
                    handleInputChange('description', e.target.value)
                  }
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-xs text-red-600">{errors.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.description.length} characters
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Classification
              </CardTitle>
              <CardDescription>Program category and type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Activity Type <span className="text-red-500">*</span>
                </Label>
                <Popover
                  open={activityTypeOpen}
                  onOpenChange={setActivityTypeOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={activityTypeOpen}
                      className={cn(
                        'w-full justify-between',
                        errors.activityTypeId && 'border-red-500'
                      )}
                    >
                      {selectedActivityType
                        ? selectedActivityType.name
                        : 'Select activity type...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search activity types..." />
                      <CommandEmpty>No activity type found.</CommandEmpty>
                      <CommandGroup>
                        {options.activityTypes.map(type => (
                          <CommandItem
                            key={type.id}
                            value={`${type.name} ${type.programGoalName}`}
                            onSelect={() => {
                              handleInputChange('activityTypeId', type.id);
                              setActivityTypeOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                formData.activityTypeId === type.id
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {type.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.activityTypeId && (
                  <p className="text-xs text-red-600">
                    {errors.activityTypeId}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="eventIsYouthFocused"
                  checked={formData.eventIsYouthFocused}
                  onChange={() => handleCheckboxChange('eventIsYouthFocused')}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label
                  htmlFor="eventIsYouthFocused"
                  className="font-normal cursor-pointer"
                >
                  This is a youth-focused event
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participation Metrics
              </CardTitle>
              <CardDescription>Track attendance and engagement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newParticipants">New Participants</Label>
                  <Input
                    id="newParticipants"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.newParticipants}
                    onChange={e =>
                      handleInputChange('newParticipants', e.target.value)
                    }
                    className={errors.newParticipants ? 'border-red-500' : ''}
                  />
                  {errors.newParticipants && (
                    <p className="text-xs text-red-600">
                      {errors.newParticipants}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="returningParticipants">
                    Returning Participants
                  </Label>
                  <Input
                    id="returningParticipants"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.returningParticipants}
                    onChange={e =>
                      handleInputChange('returningParticipants', e.target.value)
                    }
                    className={
                      errors.returningParticipants ? 'border-red-500' : ''
                    }
                  />
                  {errors.returningParticipants && (
                    <p className="text-xs text-red-600">
                      {errors.returningParticipants}
                    </p>
                  )}
                </div>
              </div>

              {totalParticipants > 0 && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">
                      Total Participants
                    </span>
                    <Badge className="bg-blue-600">{totalParticipants}</Badge>
                  </div>
                  {formData.newParticipants &&
                    formData.returningParticipants && (
                      <div className="mt-2 text-xs text-blue-700">
                        {(
                          (parseInt(formData.newParticipants) /
                            totalParticipants) *
                          100
                        ).toFixed(1)}
                        % new,{' '}
                        {(
                          (parseInt(formData.returningParticipants) /
                            totalParticipants) *
                          100
                        ).toFixed(1)}
                        % returning
                      </div>
                    )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Allocation
              </CardTitle>
              <CardDescription>Duration in minutes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDuration">
                    Event Duration (minutes)
                  </Label>
                  <Input
                    id="eventDuration"
                    type="number"
                    min="0"
                    placeholder="60"
                    value={formData.eventDuration}
                    onChange={e =>
                      handleInputChange('eventDuration', e.target.value)
                    }
                    className={errors.eventDuration ? 'border-red-500' : ''}
                  />
                  {errors.eventDuration && (
                    <p className="text-xs text-red-600">
                      {errors.eventDuration}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminDuration">
                    Admin Duration (minutes)
                  </Label>
                  <Input
                    id="adminDuration"
                    type="number"
                    min="0"
                    placeholder="30"
                    value={formData.adminDuration}
                    onChange={e =>
                      handleInputChange('adminDuration', e.target.value)
                    }
                    className={errors.adminDuration ? 'border-red-500' : ''}
                  />
                  {errors.adminDuration && (
                    <p className="text-xs text-red-600">
                      {errors.adminDuration}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Setup, cleanup, and planning time
                  </p>
                </div>
              </div>

              {totalTime > 0 && (
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-900">
                      Total Time
                    </span>
                    <Badge className="bg-purple-600">
                      {totalTime} minutes ({(totalTime / 60).toFixed(1)} hours)
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Community Partnership
              </CardTitle>
              <CardDescription>
                Co-hosted events and partnerships
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasCoHost"
                  checked={formData.hasCoHost}
                  onChange={() => handleCheckboxChange('hasCoHost')}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label
                  htmlFor="hasCoHost"
                  className="font-normal cursor-pointer"
                >
                  This event has a community partner co-host
                </Label>
              </div>

              {formData.hasCoHost && (
                <div className="space-y-2 pl-6 border-l-2 border-blue-500">
                  <Label>
                    Community Partner <span className="text-red-500">*</span>
                  </Label>
                  <Popover
                    open={communityPartnerOpen}
                    onOpenChange={setCommunityPartnerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={communityPartnerOpen}
                        className={cn(
                          'w-full justify-between',
                          errors.communityPartnerId && 'border-red-500'
                        )}
                      >
                        {selectedCommunityPartner
                          ? selectedCommunityPartner.name
                          : 'Select community partner...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search community partners..." />
                        <CommandEmpty>No community partner found.</CommandEmpty>
                        <CommandGroup>
                          {options.communityPartners.map(partner => (
                            <CommandItem
                              key={partner.id}
                              value={partner.name}
                              onSelect={() => {
                                handleInputChange(
                                  'communityPartnerId',
                                  partner.id
                                );
                                setCommunityPartnerOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  formData.communityPartnerId === partner.id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {partner.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.communityPartnerId && (
                    <p className="text-xs text-red-600">
                      {errors.communityPartnerId}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Information
              </CardTitle>
              <CardDescription>Event costs and expenses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totalCost">Total Cost ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="totalCost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.totalCost}
                    onChange={e =>
                      handleInputChange('totalCost', e.target.value)
                    }
                    className={`pl-10 ${errors.totalCost ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.totalCost && (
                  <p className="text-xs text-red-600">{errors.totalCost}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Include supplies, food, materials, and other expenses
                </p>
              </div>

              {formData.totalCost && totalParticipants > 0 && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-900">
                      Cost per Participant
                    </span>
                    <Badge className="bg-green-600">
                      $
                      {(
                        parseFloat(formData.totalCost) / totalParticipants
                      ).toFixed(2)}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={submitStatus === 'loading'}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitStatus === 'loading'}
              className="min-w-32"
            >
              {submitStatus === 'loading' ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Event
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
