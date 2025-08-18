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
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  eventBasicInfoSchema,
  eventDetailsSchema,
  eventAssociationsSchema,
  eventAssociationsBaseSchema,
} from '@/lib/validations/events';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';

interface Options {
  activityTypes: Array<{ id: string; name: string; programGoalName: string }>;
  sites: Array<{ id: string; name: string; address: string }>;
  communityPartners: Array<{ id: string; name: string }>;
}

interface EventFormProps {
  mode: 'create' | 'edit';
  eventId?: string;
  initialData?: any;
}

const STEPS = [
  {
    id: 1,
    title: 'Basic Information',
    description: 'Event title, date, and description',
  },
  {
    id: 2,
    title: 'Event Details',
    description: 'Duration, participants, and cost',
  },
  {
    id: 3,
    title: 'Associations',
    description: 'Activity type, site, and co-host',
  },
];

export default function EventForm({
  mode,
  eventId,
  initialData,
}: EventFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [options, setOptions] = useState<Options>({
    activityTypes: [],
    sites: [],
    communityPartners: [],
  });
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Helper function to convert minutes to hours/minutes
  const minutesToDuration = (totalMinutes: number) => ({
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  });

  // Initialize form data
  const getInitialFormData = () => {
    if (mode === 'edit' && initialData) {
      return {
        title: initialData.title || '',
        eventDate: initialData.eventDate
          ? new Date(initialData.eventDate)
          : undefined,
        description: initialData.description || '',
        eventDuration: minutesToDuration(initialData.eventDuration || 60),
        adminDuration: minutesToDuration(initialData.adminDuration || 30),
        newParticipants: initialData.newParticipants || 0,
        returningParticipants: initialData.returningParticipants || 0,
        eventIsYouthFocused: initialData.eventIsYouthFocused || false,
        totalCost: initialData.totalCost || '0.00',
        activityTypeId: initialData.activityTypeId || '',
        siteId: initialData.siteId || '',
        hasCoHost: initialData.hasCoHost || false,
        communityPartnerId: initialData.communityPartnerId || '',
      };
    }

    // Default for create mode
    return {
      title: '',
      eventDate: undefined as Date | undefined,
      description: '',
      eventDuration: { hours: 1, minutes: 0 },
      adminDuration: { hours: 0, minutes: 30 },
      newParticipants: 0,
      returningParticipants: 0,
      eventIsYouthFocused: false,
      totalCost: '0.00',
      activityTypeId: '',
      siteId: '',
      hasCoHost: false,
      communityPartnerId: '',
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  // Fetch options for dropdowns
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

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData(getInitialFormData());
    }
  }, [initialData, mode]);

  // Validate current step
  const validateStep = (step: number): boolean => {
    setErrors({});

    try {
      if (step === 1) {
        eventBasicInfoSchema.parse({
          title: formData.title,
          eventDate: formData.eventDate,
          description: formData.description,
        });
      } else if (step === 2) {
        eventDetailsSchema.parse({
          eventDuration: formData.eventDuration,
          adminDuration: formData.adminDuration,
          newParticipants: formData.newParticipants,
          returningParticipants: formData.returningParticipants,
          eventIsYouthFocused: formData.eventIsYouthFocused,
          totalCost: formData.totalCost,
        });
      } else if (step === 3) {
        eventAssociationsSchema.parse({
          activityTypeId: formData.activityTypeId,
          siteId: formData.siteId,
          hasCoHost: formData.hasCoHost,
          communityPartnerId: formData.communityPartnerId,
        });
      }
      return true;
    } catch (error: any) {
      const fieldErrors: Record<string, string> = {};
      error.errors?.forEach((err: any) => {
        if (err.path.length > 0) {
          const fieldPath = err.path.join('.');
          fieldErrors[fieldPath] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
  };

  // Navigate between steps
  const goToStep = (step: number) => {
    if (step < currentStep || validateStep(currentStep)) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    // Check if eventDate exists
    if (!formData.eventDate) {
      setErrors({ eventDate: 'Event date is required' });
      setLoading(false);
      return;
    }

    // Validate all steps one final time
    const step1Valid = eventBasicInfoSchema.safeParse({
      title: formData.title,
      eventDate: formData.eventDate,
      description: formData.description,
    });

    const step2Valid = eventDetailsSchema.safeParse({
      eventDuration: formData.eventDuration,
      adminDuration: formData.adminDuration,
      newParticipants: formData.newParticipants,
      returningParticipants: formData.returningParticipants,
      eventIsYouthFocused: formData.eventIsYouthFocused,
      totalCost: formData.totalCost,
    });

    const step3Valid = eventAssociationsSchema.safeParse({
      activityTypeId: formData.activityTypeId,
      siteId: formData.siteId,
      hasCoHost: formData.hasCoHost,
      communityPartnerId: formData.communityPartnerId,
    });

    // Check for validation errors
    if (!step1Valid.success || !step2Valid.success || !step3Valid.success) {
      const fieldErrors: Record<string, string> = {};

      [step1Valid, step2Valid, step3Valid].forEach(validation => {
        if (!validation.success) {
          validation.error.errors.forEach(err => {
            if (err.path.length > 0) {
              const fieldPath = err.path.join('.');
              fieldErrors[fieldPath] = err.message;
            }
          });
        }
      });

      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    // Check co-host refinement manually
    if (formData.hasCoHost && !formData.communityPartnerId) {
      setErrors({
        communityPartnerId:
          "Community partner is required when 'Has Co-Host' is selected",
      });
      setLoading(false);
      return;
    }

    // Transform data for API (convert form format to API format)
    const apiData = {
      title: formData.title,
      eventDate: formData.eventDate.toISOString(), // Convert Date to string
      description: formData.description,
      eventDuration:
        formData.eventDuration.hours * 60 + formData.eventDuration.minutes, // Convert to minutes
      adminDuration:
        formData.adminDuration.hours * 60 + formData.adminDuration.minutes, // Convert to minutes
      newParticipants: formData.newParticipants, // Already a number
      returningParticipants: formData.returningParticipants, // Already a number
      eventIsYouthFocused: formData.eventIsYouthFocused,
      hasCoHost: formData.hasCoHost,
      totalCost: formData.totalCost,
      activityTypeId: formData.activityTypeId,
      siteId: formData.siteId,
      communityPartnerId: formData.hasCoHost
        ? formData.communityPartnerId
        : null,
    };

    console.log('API Data being sent:', apiData); // Debug log

    try {
      const url =
        mode === 'create' ? '/api/events' : `/api/admin/events/${eventId}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();

      if (data.success) {
        const targetEventId = mode === 'create' ? data.event.id : eventId;
        router.push(`/events/${targetEventId}`);
      } else {
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((err: any) => {
            if (err.path.length > 0) {
              const fieldPath = err.path.join('.');
              fieldErrors[fieldPath] = err.message;
            }
          });
          setErrors(fieldErrors);
        } else {
          setError(data.error || `Failed to ${mode} event`);
        }
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  if (optionsLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  const progressPercentage = (currentStep / STEPS.length) * 100;
  const isCreate = mode === 'create';

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isCreate ? 'Create New Event' : 'Edit Event'}
          </h1>
          <p className="text-muted-foreground">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
          </p>
        </div>
      </div>

      {/* Progress Bar - No Card Wrapper */}
      <div className="mb-6">
        <div className="mb-6">
          <Progress
            value={progressPercentage}
            className="w-full h-2 bg-blue-100 [&>div]:bg-blue-600"
          />
        </div>
        <div className="flex justify-between">
          {STEPS.map(step => (
            <button
              key={step.id}
              onClick={() => goToStep(step.id)}
              className="flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  step.id === currentStep
                    ? 'bg-blue-600 text-white shadow-md'
                    : step.id < currentStep
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-blue-100 text-blue-400 border border-blue-200'
                }`}
              >
                <span className="text-sm font-medium">{step.id}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>
            {STEPS[currentStep - 1].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <StepOne
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              loading={loading}
            />
          )}
          {currentStep === 2 && (
            <StepTwo
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              loading={loading}
            />
          )}
          {currentStep === 3 && (
            <StepThree
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              loading={loading}
              options={options}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1 || loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep < STEPS.length ? (
          <Button onClick={nextStep} disabled={loading}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={() => setShowConfirmDialog(true)} disabled={loading}>
            {isCreate ? 'Create Event' : 'Update Event'}
          </Button>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              {isCreate ? 'Confirm Event Creation' : 'Confirm Event Update'}
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                Please review your event details carefully.
                {isCreate &&
                  ' Once created, the event information can only be edited by administrators.'}
              </p>
              <p className="font-medium">
                Are you sure you want to {isCreate ? 'create' : 'update'} this
                event?
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading
                ? isCreate
                  ? 'Creating...'
                  : 'Updating...'
                : isCreate
                  ? 'Yes, Create Event'
                  : 'Yes, Update Event'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
