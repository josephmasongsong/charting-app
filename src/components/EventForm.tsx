"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Calendar as CalIcon,
  Clock,
  Users,
  Contact,
  Copy,
  Save,
  X,
  Check,
  CheckIcon,
  ChevronDown,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Options {
  activityTypes: Array<{ id: string; name: string; programGoalName: string }>;
  sites: Array<{ id: string; name: string; address: string }>;
  communityPartners: Array<{ id: string; name: string }>;
}

interface EventFormProps {
  mode: "create" | "edit";
  eventId?: string;
  initialData?: any;
  isDuplicated?: boolean;
  isAdmin?: boolean;
  // Set when a parent layout already supplies the page background and padding.
  embedded?: boolean;
}

const pageClass = "bg-(--surface-page) px-6 pt-7 pb-10";
const containerClass = "mx-auto max-w-[1160px]";
const cardClass =
  "gap-0 rounded-(--radius-card) border-(--border-default) bg-(--surface-card) px-6 pt-5 pb-6 shadow-(--shadow-card)";
const labelClass = "text-[15px] font-normal";
const inputClass =
  "h-9 rounded-(--radius-input) border-(--border-input) bg-(--surface-card) px-2.5 text-[15px] shadow-none md:text-[15px] focus-visible:border-(--action-primary) focus-visible:ring-[3px] focus-visible:ring-(--action-selected)";
const comboTriggerClass =
  "h-9 w-full justify-between rounded-(--radius-input) border-(--border-input) bg-(--surface-card) px-2.5 text-[15px] font-normal shadow-none hover:bg-(--surface-card) hover:text-(--text-body) focus-visible:border-(--action-primary) focus-visible:ring-[3px] focus-visible:ring-(--action-selected)";
const comboPanelClass =
  "w-[var(--radix-popover-trigger-width)] rounded-(--radius-control) border-(--border-default) p-0 shadow-(--shadow-modal)";
const helperClass = "mt-2 text-[12.5px] text-(--text-muted)";
const errorClass = "mt-1.5 text-xs text-(--danger)";
const totalTileClass =
  "rounded-(--radius-control) border border-(--border-default) bg-(--surface-muted) px-4 py-2 text-center";
const primaryButtonClass =
  "h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover) disabled:bg-(--action-primary-disabled) disabled:opacity-100";
const outlineButtonClass =
  "h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)";
const alertClass = "border-y-0 border-r-0 px-3.5 py-3";
const infoAlertClass =
  "rounded-[2px] border-l-[5px] border-l-(--action-primary) bg-(--action-selected) text-foreground";
const successAlertClass =
  "rounded-[2px] border-l-[5px] border-l-(--success) bg-[var(--bch-green-50,#EDF6EF)] text-foreground";

function Required() {
  return (
    <span aria-hidden="true" className="ml-0.5 text-(--danger)">
      *
    </span>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  sub,
  required = false,
}: {
  icon: LucideIcon;
  title: string;
  sub: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-[30px] shrink-0 place-items-center rounded-(--radius-control) bg-(--action-selected) text-(--action-primary)">
        <Icon size={17} />
      </span>
      <div>
        <div className="text-[17px] font-bold">
          {title}
          {required && <Required />}
        </div>
        <div className="text-[13px] text-(--text-muted)">{sub}</div>
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className={errorClass}>{message}</p> : null;
}

export default function EventForm({
  mode,
  eventId,
  initialData,
  isDuplicated,
  isAdmin,
  embedded,
}: EventFormProps) {
  const router = useRouter();
  const [options, setOptions] = useState<Options>({
    activityTypes: [],
    sites: [],
    communityPartners: [],
  });
  const [optionsLoading, setOptionsLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    eventDate: "",
    successes: "",
    challenges: "",
    eventDuration: "",
    adminDuration: "",
    newParticipants: "",
    returningParticipants: "",
    eventIsYouthFocused: false,
    usedTenantActivityGrant: false,
    hasCoHost: false,
    totalCost: "",
    activityTypeId: "",
    siteId: "",
    communityPartnerId: "",
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
        const response = await fetch("/api/events/options");
        const data = await response.json();

        if (response.ok) {
          setOptions(data);
        }
      } catch (error) {
        console.error("Failed to fetch options:", error);
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        title: initialData.title || "",
        eventDate: initialData.eventDate || "",
        successes: initialData.successes || "",
        challenges: initialData.challenges || "",
        eventDuration: initialData.eventDuration?.toString() || "",
        adminDuration: initialData.adminDuration?.toString() || "",
        newParticipants: initialData.newParticipants?.toString() || "",
        returningParticipants:
          initialData.returningParticipants?.toString() || "",
        eventIsYouthFocused: initialData.eventIsYouthFocused || false,
        usedTenantActivityGrant: initialData.usedTenantActivityGrant || false,
        hasCoHost: initialData.hasCoHost || false,
        totalCost: initialData.totalCost || "",
        activityTypeId: initialData.activityTypeId || "",
        siteId: initialData.siteId || "",
        communityPartnerId: initialData.communityPartnerId || "",
      });
    }
  }, [mode, initialData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCheckboxChange = (field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.eventDate) newErrors.eventDate = "Event date is required";

    if (!formData.activityTypeId)
      newErrors.activityTypeId = "Activity type is required";
    if (!formData.siteId) newErrors.siteId = "Site is required";

    if (!formData.eventDuration.trim()) {
      newErrors.eventDuration = "Event duration is required";
    } else if (parseInt(formData.eventDuration) < 1) {
      newErrors.eventDuration = "Duration must be at least 1 minute";
    }
    if (formData.adminDuration && parseInt(formData.adminDuration) < 0) {
      newErrors.adminDuration = "Duration cannot be negative";
    }
    if (formData.newParticipants && parseInt(formData.newParticipants) < 0) {
      newErrors.newParticipants = "Cannot be negative";
    }
    if (
      formData.returningParticipants &&
      parseInt(formData.returningParticipants) < 0
    ) {
      newErrors.returningParticipants = "Cannot be negative";
    }
    if (!formData.totalCost.trim()) {
      newErrors.totalCost = "Total cost is required";
    } else if (parseFloat(formData.totalCost) < 0) {
      newErrors.totalCost = "Cost cannot be negative";
    }

    if (formData.hasCoHost && !formData.communityPartnerId) {
      newErrors.communityPartnerId = "Please select a community partner";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitStatus("error");
      return;
    }

    setSubmitStatus("loading");

    const apiData = {
      title: formData.title,
      eventDate: formData.eventDate,
      successes: formData.successes,
      challenges: formData.challenges,
      eventDuration: parseInt(formData.eventDuration) || 0,
      adminDuration: parseInt(formData.adminDuration) || 0,
      newParticipants: parseInt(formData.newParticipants) || 0,
      returningParticipants: parseInt(formData.returningParticipants) || 0,
      eventIsYouthFocused: formData.eventIsYouthFocused,
      usedTenantActivityGrant: formData.usedTenantActivityGrant,
      hasCoHost: formData.hasCoHost,
      totalCost: formData.totalCost,
      activityTypeId: formData.activityTypeId,
      siteId: formData.siteId,
      communityPartnerId: formData.hasCoHost
        ? formData.communityPartnerId
        : null,
      isFirstSaveAfterDuplication: isDuplicated,
    };

    try {
      let url: string;
      let method: string;

      if (mode === "create") {
        url = "/api/events";
        method = "POST";
      } else if (isAdmin) {
        url = `/api/admin/events/${eventId}`;
        method = "PATCH";
      } else {
        url = `/api/events/${eventId}`;
        method = "PATCH";
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus("success");
        const targetEventId = mode === "create" ? data.event.id : eventId;
        setTimeout(() => {
          router.push(`/events/${targetEventId}`);
        }, 1500);
      } else {
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((err: any) => {
            if (err.path.length > 0) {
              fieldErrors[err.path.join(".")] = err.message;
            }
          });
          setErrors(fieldErrors);
        }
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
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
    (type) => type.id === formData.activityTypeId,
  );
  const selectedSite = options.sites.find(
    (site) => site.id === formData.siteId,
  );
  const selectedCommunityPartner = options.communityPartners.find(
    (partner) => partner.id === formData.communityPartnerId,
  );

  // Checklist mirrors validateForm()'s required rules; it is display only.
  const checklist = [
    { label: "Event title", ok: !!formData.title.trim() },
    { label: "Date and site", ok: !!formData.eventDate && !!formData.siteId },
    { label: "Activity type", ok: !!formData.activityTypeId },

    ...(formData.hasCoHost
      ? [{ label: "Community partner", ok: !!formData.communityPartnerId }]
      : []),
  ];
  const remaining = checklist.filter((item) => !item.ok).length;
  const readyNote =
    remaining > 0
      ? `${remaining} required field${remaining === 1 ? "" : "s"} left`
      : "All required fields complete";

  if (optionsLoading) {
    return (
      <div className={embedded ? undefined : pageClass}>
        <div
          className={cn(
            containerClass,
            "flex items-center justify-center py-8 text-(--text-muted)",
          )}
        >
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={embedded ? undefined : pageClass}>
      <div className={containerClass}>
        <h1 className="text-[30px] leading-tight font-bold tracking-[-.2px]">
          {mode === "create" ? "Log New Event" : "Edit Event"}
        </h1>
        <p className="mt-1.5 text-[15px] text-(--text-muted)">
          Record details of a community event or activity
        </p>

        <div className="mt-5">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {isDuplicated && (
              <Alert className={cn(alertClass, infoAlertClass)}>
                <Copy className="text-(--action-primary)" />
                <AlertTitle className="font-semibold">
                  Editing Duplicated Event
                </AlertTitle>
                <AlertDescription className="text-foreground">
                  This event was duplicated. When you save, it will be logged to
                  the activity feed.
                </AlertDescription>
              </Alert>
            )}

            {submitStatus === "success" && (
              <Alert className={cn(alertClass, successAlertClass)}>
                <CheckIcon className="text-(--success)" />
                <AlertTitle className="font-semibold">
                  Event {mode === "create" ? "logged" : "updated"} successfully!
                </AlertTitle>
                <AlertDescription className="text-foreground">
                  Your event has been{" "}
                  {mode === "create" ? "recorded" : "updated"} in the system.
                </AlertDescription>
              </Alert>
            )}

            {submitStatus === "error" && (
              <Alert variant="destructive" className={alertClass}>
                <AlertTitle className="font-semibold">
                  Please fix the errors below
                </AlertTitle>
                <AlertDescription>
                  Some required fields are missing or invalid.
                </AlertDescription>
              </Alert>
            )}

            <Card className={cardClass}>
              <SectionHeader
                icon={CalIcon}
                title="Event details"
                sub="What happened, where, and when"
              />

              <div className="mt-5">
                <Label htmlFor="title" className={labelClass}>
                  Event Title
                  <Required />
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Community Health Fair"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  aria-invalid={!!errors.title}
                  className={cn(inputClass, "mt-1.5")}
                />
                <FieldError message={errors.title} />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="eventDate" className={labelClass}>
                    Event Date
                    <Required />
                  </Label>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        id="eventDate"
                        variant="outline"
                        aria-invalid={!!errors.eventDate}
                        className={cn(
                          comboTriggerClass,
                          "mt-1.5 justify-start",
                          !selectedDate && "text-(--text-muted)",
                        )}
                      >
                        <CalIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (date) {
                            handleInputChange(
                              "eventDate",
                              date.toISOString().split("T")[0],
                            );
                          }
                          setCalendarOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldError message={errors.eventDate} />
                </div>

                <div>
                  <Label className={labelClass}>
                    Site Location
                    <Required />
                  </Label>
                  <Popover open={siteOpen} onOpenChange={setSiteOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={siteOpen}
                        aria-invalid={!!errors.siteId}
                        className={cn(comboTriggerClass, "mt-1.5")}
                      >
                        {selectedSite ? selectedSite.name : "Select site..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-(--text-muted)" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className={comboPanelClass}>
                      <Command>
                        <CommandInput placeholder="Search sites..." />
                        <CommandEmpty>No site found.</CommandEmpty>
                        <CommandGroup>
                          {options.sites.map((site) => (
                            <CommandItem
                              key={site.id}
                              value={`${site.name} ${site.address}`}
                              onSelect={() => {
                                handleInputChange("siteId", site.id);
                                setSiteOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.siteId === site.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {site.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FieldError message={errors.siteId} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className={labelClass}>
                    Activity Type
                    <Required />
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
                        aria-invalid={!!errors.activityTypeId}
                        className={cn(comboTriggerClass, "mt-1.5")}
                      >
                        {selectedActivityType
                          ? selectedActivityType.name
                          : "Select activity type..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-(--text-muted)" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className={comboPanelClass}>
                      <Command>
                        <CommandInput placeholder="Search activity types..." />
                        <CommandEmpty>No activity type found.</CommandEmpty>
                        <CommandGroup>
                          {options.activityTypes.map((type) => (
                            <CommandItem
                              key={type.id}
                              value={`${type.name} ${type.programGoalName}`}
                              onSelect={() => {
                                handleInputChange("activityTypeId", type.id);
                                setActivityTypeOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.activityTypeId === type.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {type.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FieldError message={errors.activityTypeId} />
                </div>

                <div className="flex h-9 items-center gap-2 md:mt-[27px]">
                  <Checkbox
                    id="eventIsYouthFocused"
                    checked={formData.eventIsYouthFocused}
                    onCheckedChange={() =>
                      handleCheckboxChange("eventIsYouthFocused")
                    }
                    className="rounded-[2px] border-(--border-input) data-[state=checked]:border-(--action-primary) data-[state=checked]:bg-(--action-primary)"
                  />
                  <Label
                    htmlFor="eventIsYouthFocused"
                    className={cn(labelClass, "cursor-pointer")}
                  >
                    This is a youth-focused event
                  </Label>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  {
                    field: "successes" as const,
                    label: "Successes",
                    placeholder:
                      "What went well? Turnout, engagement, partnerships, outcomes...",
                  },
                  {
                    field: "challenges" as const,
                    label: "Challenges",
                    placeholder:
                      "What was difficult? Barriers, no-shows, supply or space issues...",
                  },
                ].map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <Label htmlFor={field} className={labelClass}>
                      {label}
                    </Label>
                    <Textarea
                      id={field}
                      placeholder={placeholder}
                      rows={4}
                      value={formData[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      aria-invalid={!!errors[field]}
                      maxLength={600}
                      className="mt-1.5 min-h-[110px] rounded-(--radius-input) border-(--border-input) bg-(--surface-card) px-2.5 text-[15px] shadow-none md:text-[15px] focus-visible:border-(--action-primary) focus-visible:ring-[3px] focus-visible:ring-(--action-selected)"
                    />
                    <div className="mt-1 text-right text-[12.5px] text-(--text-muted)">
                      {formData[field].length} / 600
                    </div>
                    <FieldError message={errors[field]} />
                  </div>
                ))}
              </div>
            </Card>

            <Card className={cardClass}>
              <SectionHeader
                icon={Users}
                title="Participation"
                sub="Attendance counts for this event"
              />

              <div className="mt-5 grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_1fr_auto]">
                <div>
                  <Label htmlFor="newParticipants" className={labelClass}>
                    New Participants
                  </Label>
                  <Input
                    id="newParticipants"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.newParticipants}
                    onChange={(e) =>
                      handleInputChange("newParticipants", e.target.value)
                    }
                    aria-invalid={!!errors.newParticipants}
                    className={cn(inputClass, "mt-1.5")}
                  />
                  <FieldError message={errors.newParticipants} />
                </div>

                <div>
                  <Label htmlFor="returningParticipants" className={labelClass}>
                    Returning Participants
                  </Label>
                  <Input
                    id="returningParticipants"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.returningParticipants}
                    onChange={(e) =>
                      handleInputChange("returningParticipants", e.target.value)
                    }
                    aria-invalid={!!errors.returningParticipants}
                    className={cn(inputClass, "mt-1.5")}
                  />
                  <FieldError message={errors.returningParticipants} />
                </div>

                <div className={cn(totalTileClass, "min-w-28")}>
                  <div className="text-xs tracking-[.4px] text-(--text-muted) uppercase">
                    Total
                  </div>
                  <div className="text-[22px] leading-[1.2] font-bold">
                    {totalParticipants}
                  </div>
                </div>
              </div>

              {totalParticipants > 0 &&
                formData.newParticipants &&
                formData.returningParticipants && (
                  <p className={helperClass}>
                    {(
                      (parseInt(formData.newParticipants) / totalParticipants) *
                      100
                    ).toFixed(1)}
                    % new,{" "}
                    {(
                      (parseInt(formData.returningParticipants) /
                        totalParticipants) *
                      100
                    ).toFixed(1)}
                    % returning
                  </p>
                )}
            </Card>

            <Card className={cardClass}>
              <SectionHeader
                icon={Clock}
                title="Time and cost"
                sub="Staff time and expenses to attribute to this event"
              />

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="eventDuration" className={labelClass}>
                    Event Duration
                    <Required />
                  </Label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Input
                      id="eventDuration"
                      type="number"
                      min="0"
                      placeholder="60"
                      value={formData.eventDuration}
                      onChange={(e) =>
                        handleInputChange("eventDuration", e.target.value)
                      }
                      aria-invalid={!!errors.eventDuration}
                      className={inputClass}
                    />
                    <span className="text-sm text-(--text-muted)">min</span>
                  </div>
                  <FieldError message={errors.eventDuration} />
                  <div className="mt-2 flex gap-1.5">
                    {[30, 60, 90, 120].map((minutes) => (
                      <button
                        key={minutes}
                        type="button"
                        aria-pressed={
                          formData.eventDuration === String(minutes)
                        }
                        onClick={() =>
                          handleInputChange("eventDuration", String(minutes))
                        }
                        className={cn(
                          "cursor-pointer rounded-full border px-2.5 py-[3px] text-[12.5px]",
                          formData.eventDuration === String(minutes)
                            ? "border-(--action-primary) bg-(--action-selected) text-(--action-primary)"
                            : "border-(--border-default) bg-(--surface-card) text-(--text-muted) hover:border-(--action-primary) hover:text-(--action-primary)",
                        )}
                      >
                        {minutes} min
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="adminDuration" className={labelClass}>
                    Admin Duration
                  </Label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Input
                      id="adminDuration"
                      type="number"
                      min="0"
                      placeholder="30"
                      value={formData.adminDuration}
                      onChange={(e) =>
                        handleInputChange("adminDuration", e.target.value)
                      }
                      aria-invalid={!!errors.adminDuration}
                      className={inputClass}
                    />
                    <span className="text-sm text-(--text-muted)">min</span>
                  </div>
                  <FieldError message={errors.adminDuration} />
                  <p className={helperClass}>
                    Setup, cleanup, and planning time
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="totalCost" className={labelClass}>
                    Total Cost ($)
                    <Required />
                  </Label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[15px] text-(--text-muted)">$</span>
                    <Input
                      id="totalCost"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.totalCost}
                      onChange={(e) =>
                        handleInputChange("totalCost", e.target.value)
                      }
                      aria-invalid={!!errors.totalCost}
                      className={inputClass}
                    />
                  </div>
                  <FieldError message={errors.totalCost} />
                  <p className={helperClass}>
                    Include supplies, food, materials, and other expenses
                  </p>
                </div>

                {/* Same column geometry as the youth-focused checkbox above. */}
                <div className="flex h-9 items-center gap-2 md:mt-[27px]">
                  <Checkbox
                    id="usedTenantActivityGrant"
                    checked={formData.usedTenantActivityGrant}
                    onCheckedChange={() =>
                      handleCheckboxChange("usedTenantActivityGrant")
                    }
                    className="rounded-[2px] border-(--border-input) data-[state=checked]:border-(--action-primary) data-[state=checked]:bg-(--action-primary)"
                  />
                  <Label
                    htmlFor="usedTenantActivityGrant"
                    className={cn(labelClass, "cursor-pointer")}
                  >
                    Funded by a Tenant Activity Grant (TAG)
                  </Label>
                </div>
              </div>

              {/* Summary tiles move below now that TAG owns the second column. */}
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {totalTime > 0 && (
                  <div
                    className={cn(
                      totalTileClass,
                      "flex items-center justify-between text-left",
                    )}
                  >
                    <span className="text-sm font-medium">Total Time</span>
                    <Badge variant="secondary">
                      {totalTime} minutes ({(totalTime / 60).toFixed(1)} hours)
                    </Badge>
                  </div>
                )}
                {formData.totalCost && totalParticipants > 0 && (
                  <div
                    className={cn(
                      totalTileClass,
                      "flex items-center justify-between text-left",
                    )}
                  >
                    <span className="text-sm font-medium">
                      Cost per Participant
                    </span>
                    <Badge variant="secondary">
                      $
                      {(
                        parseFloat(formData.totalCost) / totalParticipants
                      ).toFixed(2)}
                    </Badge>
                  </div>
                )}
              </div>
            </Card>

            <Card className={cardClass}>
              <SectionHeader
                icon={Contact}
                title="Community partnership"
                sub="Optional — add a co-host organization"
              />

              <div className="mt-[18px] flex items-center gap-2">
                <Checkbox
                  id="hasCoHost"
                  checked={formData.hasCoHost}
                  onCheckedChange={() => handleCheckboxChange("hasCoHost")}
                  className="rounded-[2px] border-(--border-input) data-[state=checked]:border-(--action-primary) data-[state=checked]:bg-(--action-primary)"
                />
                <Label
                  htmlFor="hasCoHost"
                  className={cn(labelClass, "cursor-pointer")}
                >
                  This event has a community partner co-host
                </Label>
              </div>

              {formData.hasCoHost && (
                <div className="mt-4 max-w-[520px] border-t border-(--bch-gray-200) pt-4">
                  <Label className={labelClass}>
                    Community Partner
                    <Required />
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
                        aria-invalid={!!errors.communityPartnerId}
                        className={cn(comboTriggerClass, "mt-1.5")}
                      >
                        {selectedCommunityPartner
                          ? selectedCommunityPartner.name
                          : "Select community partner..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-(--text-muted)" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className={comboPanelClass}>
                      <Command>
                        <CommandInput placeholder="Search community partners..." />
                        <CommandEmpty>No community partner found.</CommandEmpty>
                        <CommandGroup>
                          {options.communityPartners.map((partner) => (
                            <CommandItem
                              key={partner.id}
                              value={partner.name}
                              onSelect={() => {
                                handleInputChange(
                                  "communityPartnerId",
                                  partner.id,
                                );
                                setCommunityPartnerOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.communityPartnerId === partner.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {partner.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        {/* TODO: /events/new — not wired: inline partner
                            creation needs a non-admin create route. */}
                        <div className="border-t border-(--bch-gray-200) px-3.5 py-2">
                          <button
                            type="button"
                            disabled
                            className="text-[13.5px] text-(--action-primary) opacity-60"
                          >
                            Add a new community partner
                          </button>
                        </div>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FieldError message={errors.communityPartnerId} />
                </div>
              )}
            </Card>

            {/* TODO: /events/new — not wired: the template disables Save until
                the checklist is complete; Save stays enabled so validateForm()
                and server-side rejections still surface as field errors. */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-(--border-default) bg-(--surface-page) pt-3.5 pb-1">
              <span className="text-[13px] text-(--text-muted)">
                {readyNote}
              </span>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={submitStatus === "loading"}
                  className={outlineButtonClass}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitStatus === "loading"}
                  className={cn(primaryButtonClass, "min-w-32")}
                >
                  {submitStatus === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Event
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
