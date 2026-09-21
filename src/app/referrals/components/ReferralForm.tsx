"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  Info,
  Loader2,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { ChipGroup } from "@/components/ui/chip-group";
import { cn } from "@/lib/utils";
import { CHANNELS, REFERRED_TO } from "@/lib/referral-options";

interface Site {
  id: string;
  name: string;
  address: string;
}

interface FormData {
  channel: string;
  referralDate: string;
  siteId: string;
  referredTo: string;
}

const pageClass = "bg-(--surface-page) px-6 pt-7 pb-10";
// 840px per the design-system template — narrower than the other forms
// because this one is a single column of four fields.
const containerClass = "mx-auto max-w-[840px]";
const cardClass =
  "gap-0 rounded-(--radius-card) border-(--border-default) bg-(--surface-card) px-6 pt-5 pb-6 shadow-(--shadow-card)";
const labelClass = "text-[15px] font-normal";
const inputClass =
  "h-9 rounded-(--radius-input) border-(--border-input) bg-(--surface-card) px-2.5 text-[15px] shadow-none md:text-[15px] focus-visible:border-(--action-primary) focus-visible:ring-[3px] focus-visible:ring-(--action-selected)";
const comboTriggerClass =
  "h-9 w-full justify-between rounded-(--radius-input) border-(--border-input) bg-(--surface-card) px-2.5 text-[15px] font-normal shadow-none hover:bg-(--surface-card) hover:text-(--text-body) focus-visible:border-(--action-primary) focus-visible:ring-[3px] focus-visible:ring-(--action-selected)";
const comboPanelClass =
  "w-[var(--radix-popover-trigger-width)] rounded-(--radius-control) border-(--border-default) p-0 shadow-(--shadow-modal)";
const errorClass = "mt-1.5 text-xs text-(--danger)";
const primaryButtonClass =
  "h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover) disabled:bg-(--action-primary-disabled) disabled:opacity-100";
const outlineButtonClass =
  "h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)";
const alertClass = "border-y-0 border-r-0 px-3.5 py-3";
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
}: {
  icon: LucideIcon;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-[30px] shrink-0 place-items-center rounded-(--radius-control) bg-(--action-selected) text-(--action-primary)">
        <Icon size={17} />
      </span>
      <div>
        <div className="text-[17px] font-bold">{title}</div>
        <div className="text-[13px] text-(--text-muted)">{sub}</div>
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className={errorClass}>{message}</p>;
}

export default function ReferralForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    channel: "",
    referralDate: new Date().toISOString().split("T")[0],
    siteId: "",
    referredTo: "",
  });

  const [sites, setSites] = useState<Site[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [siteOpen, setSiteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch("/api/referrals/options");
        if (!response.ok) {
          throw new Error("Failed to fetch options");
        }
        const data = await response.json();
        setSites(data.sites || []);
      } catch (err) {
        console.error("Failed to fetch referral options:", err);
        setError("Failed to load sites. Please refresh the page.");
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const selectedSite = sites.find((site) => site.id === formData.siteId);

  const setField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Display-only, same as the other forms: it drives the footer note. Save
  // stays enabled so server rejections still surface as field errors.
  const checklist = [
    { label: "Channel", ok: !!formData.channel },
    { label: "Date and site", ok: !!formData.referralDate && !!formData.siteId },
    { label: "Referred to", ok: !!formData.referredTo },
  ];
  const remaining = checklist.filter((item) => !item.ok).length;
  const readyNote =
    remaining > 0
      ? `${remaining} required field${remaining === 1 ? "" : "s"} left`
      : "All required fields complete";

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.channel) next.channel = "Please choose how it came up";
    if (!formData.referralDate) next.referralDate = "Please choose a date";
    if (!formData.siteId) next.siteId = "Please select a site";
    if (!formData.referredTo)
      next.referredTo = "Please choose where you pointed the tenant";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!validate()) {
      setError("Please complete the required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Referral logged successfully!");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
        return;
      }

      setError(data.error || "Failed to log referral.");
    } catch (err) {
      console.error("Referral submit error:", err);
      setError("Failed to log referral. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (optionsLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-(--text-muted)">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <div className={pageClass}>
      <div className={containerClass}>
        <h1 className="text-[30px] leading-tight font-bold tracking-[-.2px]">
          Log Referral
        </h1>
        <p className="mt-1.5 text-[15px] text-(--text-muted)">
          Record a referral you made when a tenant asked for something outside
          the tenant engagement program — whether it came up in person, by
          phone, or by email.
        </p>

        <div className="mt-5 flex flex-col gap-4">
          {success && (
            <Alert className={cn(alertClass, successAlertClass)}>
              <AlertDescription className="text-[14px] text-foreground">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className={alertClass}>
              <AlertDescription className="text-[14px]">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Card className={cardClass}>
            <SectionHeader
              icon={TriangleAlert}
              title="How it came up"
              sub="Referrals aren't tied to a specific event"
            />

            <div className="mt-5">
              <div className="mb-2 text-[15px]">
                Channel
                <Required />
              </div>
              <ChipGroup
                ariaLabel="Channel"
                options={CHANNELS}
                value={formData.channel}
                onChange={(value) => setField("channel", value)}
                disabled={submitting}
                invalid={!!errors.channel}
              />
              <FieldError message={errors.channel} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="referralDate" className={labelClass}>
                  Date
                  <Required />
                </Label>
                <Input
                  id="referralDate"
                  type="date"
                  value={formData.referralDate}
                  onChange={(e) => setField("referralDate", e.target.value)}
                  disabled={submitting}
                  aria-invalid={!!errors.referralDate}
                  className={cn(inputClass, "mt-1.5")}
                />
                <FieldError message={errors.referralDate} />
              </div>

              <div>
                <Label className={labelClass}>
                  Site
                  <Required />
                </Label>
                <Popover open={siteOpen} onOpenChange={setSiteOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={siteOpen}
                      aria-invalid={!!errors.siteId}
                      disabled={submitting}
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
                        {sites.map((site) => (
                          <CommandItem
                            key={site.id}
                            value={`${site.name} ${site.address}`}
                            onSelect={() => {
                              setField("siteId", site.id);
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
          </Card>

          <Card className={cardClass}>
            <SectionHeader
              icon={Info}
              title="Referred to"
              sub="Where you pointed the tenant — the details of the request stay between them and the referral"
            />

            <div className="mt-5">
              <ChipGroup
                ariaLabel="Referred to"
                options={REFERRED_TO}
                value={formData.referredTo}
                onChange={(value) => setField("referredTo", value)}
                disabled={submitting}
                invalid={!!errors.referredTo}
              />
              <FieldError message={errors.referredTo} />
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-(--border-default) bg-(--surface-page) pt-3.5 pb-1">
            <span className="text-[13px] text-(--text-muted)">{readyNote}</span>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
                className={outlineButtonClass}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className={primaryButtonClass}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving referral...
                  </>
                ) : (
                  "Save referral"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
