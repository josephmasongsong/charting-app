'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  X,
  Calendar,
  Package,
  Users,
  Info,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface Site {
  id: string;
  name: string;
}

interface SiteEvent {
  id: string;
  title: string;
  eventDate: string;
}

interface Supply {
  id: string;
  name: string;
  costPerUnit: string;
  availableQuantity: number;
}

interface DistributionItem {
  id: number;
  supplyId: string;
  supplyName: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

interface FormData {
  siteId: string;
  eventId: string;
  distributionType: string;
  distributionDate: string;
  recipientNotes: string;
  notes: string;
}

const surfaceCardClass =
  'gap-0 rounded-(--radius-card) border-(--border-default) bg-(--surface-card) px-6 pt-5 pb-6 shadow-(--shadow-card)';
const primaryButtonClass =
  'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover) disabled:bg-(--action-primary-disabled) disabled:opacity-100';
const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary) disabled:border-(--bch-gray-300) disabled:text-(--bch-gray-500) disabled:opacity-100';
const inputClass =
  'rounded-(--radius-control) border-(--border-input) bg-(--surface-card) shadow-none md:text-sm';
const selectTriggerClass =
  'w-full rounded-(--radius-control) border-(--border-input) bg-(--surface-card) shadow-none';
const alertClass = 'border-y-0 border-r-0 px-3.5 py-3';
const successAlertClass =
  'rounded-[2px] border-l-[5px] border-l-(--success) bg-[var(--bch-green-50,#EDF6EF)] text-foreground';
const itemsGridClass =
  'grid grid-cols-[minmax(190px,1fr)_76px_96px_92px_96px_34px] items-center gap-2.5';

function Required() {
  return <span className="text-(--danger)">*</span>;
}

function SectionHeader({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ComponentType<{ size?: number | string }>;
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

export default function SupplyDistributionForm() {
  const router = useRouter();

  const [distributionItems, setDistributionItems] = useState<
    DistributionItem[]
  >([
    {
      id: 1,
      supplyId: '',
      supplyName: '',
      quantity: 1,
      unitCost: 0,
      lineTotal: 0,
    },
  ]);

  const [formData, setFormData] = useState<FormData>({
    siteId: '',
    eventId: '',
    distributionType: 'door_to_door',
    distributionDate: new Date().toISOString().split('T')[0],
    recipientNotes: '',
    notes: '',
  });

  const [options, setOptions] = useState({
    sites: [] as Site[],
    supplies: [] as Supply[],
    events: [] as SiteEvent[],
  });

  const [optionsLoading, setOptionsLoading] = useState(true);
  const [lastLog, setLastLog] = useState<
    Array<{ supplyId: string; quantity: number }> | null
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const distributionTypes = [
    { value: 'door_to_door', label: 'Door to Door' },
    { value: 'community_room_pickup', label: 'Community Room Pickup' },
    { value: 'event_distribution', label: 'Event Distribution' },
    { value: 'emergency_distribution', label: 'Emergency Distribution' },
  ];

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch('/api/supply-distributions/options');
        if (!response.ok) {
          throw new Error('Failed to fetch options');
        }
        const data = await response.json();
        setOptions(data);
      } catch (error) {
        console.error('Failed to fetch options:', error);
        setError('Failed to load form options. Please refresh the page.');
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchSiteSupplies = async () => {
      if (!formData.siteId) {
        return;
      }

      try {
        const response = await fetch(
          `/api/supply-distributions/options?siteId=${formData.siteId}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch site supplies');
        }
        const data = await response.json();
        setOptions(prev => ({
          ...prev,
          supplies: data.supplies,
          events: data.events ?? [],
        }));
        setLastLog(data.lastLog ?? null);

        // Clear any selected supplies that are no longer available
        setDistributionItems(prev =>
          prev.map(item => {
            const supplyStillAvailable = data.supplies.find(
              (s: Supply) => s.id === item.supplyId
            );
            if (!supplyStillAvailable) {
              return {
                ...item,
                supplyId: '',
                supplyName: '',
                unitCost: 0,
                lineTotal: 0,
              };
            }
            return item;
          })
        );
      } catch (error) {
        console.error('Failed to fetch site supplies:', error);
        setError('Failed to load supplies for selected site.');
      }
    };

    fetchSiteSupplies();
  }, [formData.siteId]);

  const repeatLastLog = () => {
    if (!lastLog?.length) return;
    const rows = lastLog
      .map((item, index) => {
        const supply = options.supplies.find(s => s.id === item.supplyId);
        if (!supply) return null;
        return {
          id: index + 1,
          supplyId: supply.id,
          supplyName: supply.name,
          quantity: item.quantity,
          unitCost: parseFloat(supply.costPerUnit),
          lineTotal: item.quantity * parseFloat(supply.costPerUnit),
        };
      })
      .filter((row): row is DistributionItem => row !== null);
    if (rows.length) {
      setDistributionItems(rows);
    }
  };

  const addSupplyItem = () => {
    const newId = Math.max(...distributionItems.map(item => item.id)) + 1;
    setDistributionItems([
      ...distributionItems,
      {
        id: newId,
        supplyId: '',
        supplyName: '',
        quantity: 1,
        unitCost: 0,
        lineTotal: 0,
      },
    ]);
  };

  const removeSupplyItem = (id: number) => {
    if (distributionItems.length > 1) {
      setDistributionItems(distributionItems.filter(item => item.id !== id));
    }
  };

  const updateSupplyItem = (
    id: number,
    field: keyof DistributionItem,
    value: string | number
  ) => {
    setDistributionItems(items =>
      items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          if (field === 'supplyId') {
            const selectedSupply = options.supplies.find(s => s.id === value);
            if (selectedSupply) {
              updatedItem.supplyName = selectedSupply.name;
              updatedItem.unitCost = parseFloat(selectedSupply.costPerUnit);
              updatedItem.lineTotal =
                updatedItem.quantity * parseFloat(selectedSupply.costPerUnit);
            }
          }

          if (field === 'quantity') {
            updatedItem.lineTotal = (value as number) * updatedItem.unitCost;
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const calculateTotalCost = () => {
    return distributionItems.reduce(
      (total, item) => total + (item.lineTotal || 0),
      0
    );
  };

  const getAvailableQuantity = (supplyId: string) => {
    const supply = options.supplies.find(s => s.id === supplyId);
    return supply ? supply.availableQuantity : 0;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    if (
      !formData.siteId ||
      !formData.recipientNotes ||
      distributionItems.every(item => !item.supplyId)
    ) {
      setError(
        'Please fill in all required fields and add at least one supply item.'
      );
      setSubmitting(false);
      return;
    }

    const validItems = distributionItems.filter(
      item => item.supplyId && item.quantity > 0
    );

    if (validItems.length === 0) {
      setError('Please add at least one supply item with a positive quantity.');
      setSubmitting(false);
      return;
    }

    for (const item of validItems) {
      const availableQuantity = getAvailableQuantity(item.supplyId);
      if (item.quantity > availableQuantity) {
        const supply = options.supplies.find(s => s.id === item.supplyId);
        setError(
          `Insufficient inventory for ${supply?.name}. Available: ${availableQuantity}, Requested: ${item.quantity}`
        );
        setSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/supply-distributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          distributionItems: validItems.map(item => ({
            supplyId: item.supplyId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Distribution logged successfully!');

        setFormData({
          siteId: '',
          eventId: '',
          distributionType: 'door_to_door',
          distributionDate: new Date().toISOString().split('T')[0],
          recipientNotes: '',
          notes: '',
        });

        setDistributionItems([
          {
            id: 1,
            supplyId: '',
            supplyName: '',
            quantity: 1,
            unitCost: 0,
            lineTotal: 0,
          },
        ]);

        window.scrollTo({ top: 0, behavior: 'smooth' });

        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(data.error || 'Failed to log distribution');
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (optionsLoading) {
    return (
      <div className="min-h-screen bg-(--surface-page) px-6 pt-7 pb-10">
        <div className="mx-auto flex min-h-96 max-w-[1220px] items-center justify-center">
          <div className="text-center text-(--text-muted)">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
            <p>Loading form options...</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedSiteName = options.sites.find(
    s => s.id === formData.siteId
  )?.name;
  const validItems = distributionItems.filter(
    item => item.supplyId && item.quantity > 0
  );
  const totalUnits = validItems.reduce((sum, item) => sum + item.quantity, 0);
  const overages = validItems.filter(
    item => item.quantity > getAvailableQuantity(item.supplyId)
  ).length;
  const checklist = [
    {
      label: 'Site and date',
      ok: !!formData.siteId && !!formData.distributionDate,
    },
    { label: 'Distribution type', ok: !!formData.distributionType },
    { label: 'At least one supply item', ok: validItems.length > 0 },
    { label: 'Quantities within stock', ok: overages === 0 },
    { label: 'Recipient information', ok: !!formData.recipientNotes.trim() },
  ];
  const remaining = checklist.filter(c => !c.ok).length;
  const readyNote =
    overages > 0
      ? 'Quantities exceed stock on hand'
      : remaining > 0
        ? `${remaining} required field${remaining === 1 ? '' : 's'} left`
        : 'All required fields complete';

  return (
    <div className="min-h-screen bg-(--surface-page) px-6 pt-7 pb-10">
      <div className="mx-auto max-w-[1220px]">
        <h1 className="text-[30px] leading-tight font-bold tracking-[-.2px]">
          Log Supply Distribution
        </h1>
        <p className="mt-1.5 text-[15px] text-(--text-muted)">
          Record supplies distributed to tenants and community members
        </p>

        <div className="mt-5 flex flex-col items-start gap-6 lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {error && (
              <Alert variant="destructive" className={alertClass}>
                <AlertDescription className="text-[14px]">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className={cn(alertClass, successAlertClass)}>
                <AlertDescription className="text-[14px] text-foreground">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <Card className={surfaceCardClass}>
              <SectionHeader
                icon={Calendar}
                title="Distribution details"
                sub="Where and when the supplies were handed out"
              />
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="site" className="text-[15px] font-normal">
                    Site <Required />
                  </Label>
                  <Select
                    value={formData.siteId}
                    onValueChange={value =>
                      setFormData({ ...formData, siteId: value, eventId: '' })
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger
                      id="site"
                      aria-invalid={!!error && !formData.siteId}
                      className={selectTriggerClass}
                    >
                      <SelectValue placeholder="Select a site" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.sites.map(site => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[12.5px] text-(--text-muted)">
                    {selectedSiteName
                      ? `Drawing from ${selectedSiteName} inventory`
                      : 'Pick a site to load its inventory'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="distributionDate"
                    className="text-[15px] font-normal"
                  >
                    Distribution date <Required />
                  </Label>
                  <Input
                    id="distributionDate"
                    type="date"
                    value={formData.distributionDate}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        distributionDate: e.target.value,
                      })
                    }
                    disabled={submitting}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 text-[15px]">
                  Distribution type <Required />
                </div>
                <div className="flex flex-wrap gap-2">
                  {distributionTypes.map(type => {
                    const selected = formData.distributionType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        aria-pressed={selected}
                        disabled={submitting}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            distributionType: type.value,
                            ...(type.value !== 'event_distribution'
                              ? { eventId: '' }
                              : {}),
                          })
                        }
                        className={cn(
                          'cursor-pointer rounded-(--radius-control) border px-3.5 py-[7px] text-[14.5px]',
                          selected
                            ? 'border-(--action-primary) bg-(--action-selected) text-(--action-primary)'
                            : 'border-(--border-default) bg-(--surface-card) text-(--text-body) hover:border-(--action-primary) hover:text-(--action-primary)'
                        )}
                      >
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.distributionType === 'event_distribution' && (
                <div className="mt-4 space-y-1.5 md:max-w-[calc(50%-8px)]">
                  <Label
                    htmlFor="linkedEvent"
                    className="text-[15px] font-normal"
                  >
                    Linked event
                  </Label>
                  <Select
                    value={formData.eventId || 'none'}
                    onValueChange={value =>
                      setFormData({
                        ...formData,
                        eventId: value === 'none' ? '' : value,
                      })
                    }
                    disabled={submitting || !formData.siteId}
                  >
                    <SelectTrigger
                      id="linkedEvent"
                      className={selectTriggerClass}
                    >
                      <SelectValue
                        placeholder={
                          formData.siteId
                            ? 'Select an event (optional)'
                            : 'Select site first'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No linked event</SelectItem>
                      {options.events.map(event => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title} — {event.eventDate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[12.5px] text-(--text-muted)">
                    {formData.siteId
                      ? 'Ties this distribution to the event it was handed out at.'
                      : 'Pick a site to load its events.'}
                  </p>
                </div>
              )}
            </Card>

            <Card className={surfaceCardClass}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <SectionHeader
                  icon={Package}
                  title="Supply items"
                  sub="Unit costs come from the site inventory record"
                />
                <div className="flex gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={repeatLastLog}
                    disabled={submitting || !lastLog?.length}
                    title={
                      lastLog?.length
                        ? 'Prefill items from your last log at this site'
                        : 'No previous log for this site'
                    }
                    className={outlineButtonClass}
                  >
                    Repeat last log
                  </Button>
                  <Button
                    type="button"
                    onClick={addSupplyItem}
                    disabled={submitting || !formData.siteId}
                    className={primaryButtonClass}
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </div>

              <div className="mt-[18px] overflow-x-auto rounded-(--radius-control) border border-(--border-default)">
                <div className="min-w-[620px]">
                  <div
                    className={cn(
                      itemsGridClass,
                      'bg-(--surface-chrome) px-3.5 py-[9px] text-[12.5px] font-bold tracking-[.4px] text-(--text-on-chrome) uppercase'
                    )}
                  >
                    <span>Supply</span>
                    <span className="text-right">On hand</span>
                    <span className="text-center">Quantity</span>
                    <span className="text-right">Unit cost</span>
                    <span className="text-right">Line total</span>
                    <span />
                  </div>
                  {distributionItems.map(item => {
                    const available = item.supplyId
                      ? getAvailableQuantity(item.supplyId)
                      : null;
                    const over =
                      available !== null && item.quantity > available;
                    return (
                      <div
                        key={item.id}
                        className="border-t border-(--bch-gray-200) bg-(--surface-card) px-3.5 py-3"
                      >
                        <div className={itemsGridClass}>
                          <Select
                            value={item.supplyId}
                            onValueChange={value =>
                              updateSupplyItem(item.id, 'supplyId', value)
                            }
                            disabled={submitting || !formData.siteId}
                          >
                            <SelectTrigger
                              aria-label="Supply"
                              className={cn(selectTriggerClass, 'h-9')}
                            >
                              <SelectValue
                                placeholder={
                                  formData.siteId
                                    ? 'Select a supply...'
                                    : 'Select site first'
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {options.supplies.map(supply => (
                                <SelectItem key={supply.id} value={supply.id}>
                                  <span className="flex w-full items-center justify-between gap-2">
                                    <span>{supply.name}</span>
                                    <span className="rounded-full bg-(--surface-muted) px-2 py-[2px] text-[11.5px] font-semibold text-(--text-muted)">
                                      $
                                      {parseFloat(supply.costPerUnit).toFixed(
                                        2
                                      )}{' '}
                                      ea
                                    </span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <span
                            className={cn(
                              'text-right text-[14.5px] tabular-nums',
                              over
                                ? 'font-semibold text-(--danger)'
                                : 'text-(--text-muted)'
                            )}
                          >
                            {available !== null ? available : '—'}
                          </span>

                          <Input
                            type="number"
                            min="1"
                            max={
                              item.supplyId
                                ? getAvailableQuantity(item.supplyId)
                                : undefined
                            }
                            aria-label="Quantity"
                            value={item.quantity}
                            onChange={e =>
                              updateSupplyItem(
                                item.id,
                                'quantity',
                                parseInt(e.target.value) || 0
                              )
                            }
                            disabled={submitting}
                            className={cn(
                              inputClass,
                              'h-9 text-center tabular-nums'
                            )}
                          />

                          <span className="text-right text-[14.5px] text-(--text-muted) tabular-nums">
                            ${item.unitCost.toFixed(2)}
                          </span>

                          <span className="text-right text-[15px] font-semibold tabular-nums">
                            ${item.lineTotal.toFixed(2)}
                          </span>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Remove item"
                            onClick={() => removeSupplyItem(item.id)}
                            disabled={
                              distributionItems.length === 1 || submitting
                            }
                            className="size-8 rounded-(--radius-control) text-(--text-muted) hover:bg-(--danger-surface) hover:text-(--danger)"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                        {over && (
                          <div className="mt-2 flex items-center gap-2 text-[13.5px] text-(--danger)">
                            <span>
                              Only {available} on hand at this site — reduce
                              the quantity.
                            </span>
                          </div>
                        )}
                        {available !== null &&
                          !over &&
                          item.quantity > 0 &&
                          available - item.quantity <= 3 && (
                            <div className="mt-2 text-[13.5px] text-(--warning-text)">
                              This leaves {available - item.quantity} on hand.
                              Reorder soon.
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between gap-4 border-t border-(--bch-gray-200) pt-3.5">
                <span className="text-[13.5px] text-(--text-muted)">
                  {validItems.length
                    ? `${validItems.length} item${validItems.length === 1 ? '' : 's'} · ${totalUnits} unit${totalUnits === 1 ? '' : 's'}`
                    : 'No items counted yet'}
                </span>
                <div className="text-right">
                  <div className="text-[13px] text-(--text-muted)">
                    Total distribution cost
                  </div>
                  <div className="text-[28px] leading-[1.15] font-bold tabular-nums">
                    ${calculateTotalCost().toFixed(2)}
                  </div>
                </div>
              </div>
            </Card>

            <Card className={surfaceCardClass}>
              <SectionHeader
                icon={Users}
                title="Who received the supplies"
                sub="The written detail drives reach reporting"
              />
              <div className="mt-5 space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="recipientNotes"
                    className="text-[15px] font-normal"
                  >
                    Recipient Information <Required />
                  </Label>
                  <Textarea
                    id="recipientNotes"
                    placeholder="e.g., Mrs. Johnson apt 3B, family of 4, or Event attendees (12 people)"
                    value={formData.recipientNotes}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        recipientNotes: e.target.value,
                      })
                    }
                    disabled={submitting}
                    aria-invalid={!!error && !formData.recipientNotes}
                    className={inputClass}
                  />
                  <p className="flex items-start gap-2 text-[12.5px] text-(--text-muted)">
                    <Info className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                      Do not record health information, immigration status, or
                      anything a tenant shared in confidence. Use unit numbers
                      rather than names where you can.
                    </span>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-[15px] font-normal">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional context about this distribution..."
                    value={formData.notes}
                    onChange={e =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    disabled={submitting}
                    className={inputClass}
                  />
                </div>
              </div>
            </Card>

            <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-4 border-t border-(--border-default) bg-(--surface-page) pt-3.5 pb-1">
              <span
                className={cn(
                  'text-[13px]',
                  overages > 0 ? 'text-(--danger)' : 'text-(--text-muted)'
                )}
              >
                {readyNote}
              </span>
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
                  disabled={submitting || !formData.siteId}
                  className={primaryButtonClass}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging Distribution...
                    </>
                  ) : (
                    'Log Distribution'
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="w-full shrink-0 overflow-hidden rounded-(--radius-card) border border-(--border-default) bg-(--surface-card) shadow-(--shadow-card) lg:sticky lg:top-5 lg:w-[320px]">
            <div className="border-b border-(--bch-gray-200) px-5 py-3.5">
              <div className="text-[15px] font-bold">Required fields</div>
              <div className="text-[12.5px] text-(--text-muted)">
                Complete these to save
              </div>
            </div>
            <div className="flex flex-col gap-3 px-5 pt-4 pb-5">
              {checklist.map(item => (
                <div
                  key={item.label}
                  className={cn(
                    'flex items-center gap-2 text-[13.5px]',
                    item.ok ? 'text-(--success)' : 'text-(--text-muted)'
                  )}
                >
                  <span className="grid size-4 shrink-0 place-items-center rounded-full border-[1.5px] border-current text-[10px] leading-none">
                    {item.ok ? '✓' : ''}
                  </span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
