'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Check,
  CheckIcon,
  Home,
  Loader2,
  MapPin,
  Package,
  Plus,
  Trash2,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  createSiteSchema,
  type CreateSiteInput,
} from '@/lib/validations/sites';

interface User {
  id: string;
  name: string;
  email: string;
}

interface CommunityPartner {
  id: string;
  name: string;
}

interface Supply {
  id: string;
  name: string;
  costPerUnit: string;
  quantity: number;
}

interface SiteSupplyInput {
  supplyId: string;
  quantity: number;
}

interface ExistingSupplyEdit {
  siteSupplyId: string;
  supplyId: string;
  supplyName: string;
  quantity: number;
  costPerUnit: string;
}

interface Options {
  users: User[];
  communityPartners: CommunityPartner[];
  supplies: Supply[];
}

interface SiteFormProps {
  mode: 'create' | 'edit';
  siteId?: string;
  initialData?: Partial<CreateSiteInput>;
}

const cardClass =
  'gap-0 rounded-(--radius-card) border-(--border-default) bg-(--surface-card) px-6 pt-5 pb-6 shadow-(--shadow-card)';
const labelClass = 'text-[15px] font-normal';
const inputClass =
  'h-9 rounded-(--radius-input) border-(--border-input) bg-(--surface-card) px-2.5 text-[15px] shadow-none md:text-[15px] focus-visible:border-(--action-primary) focus-visible:ring-[3px] focus-visible:ring-(--action-selected)';
const textareaClass =
  'rounded-(--radius-input) border-(--border-input) bg-(--surface-card) px-2.5 text-[15px] shadow-none md:text-[15px] focus-visible:border-(--action-primary) focus-visible:ring-[3px] focus-visible:ring-(--action-selected)';
const selectTriggerClass =
  'h-9 w-full rounded-(--radius-input) border-(--border-input) bg-(--surface-card) px-2.5 text-[15px] shadow-none';
const helperClass = 'mt-2 text-[12.5px] text-(--text-muted)';
const errorClass = 'mt-1.5 text-xs text-(--danger)';
const primaryButtonClass =
  'h-auto rounded-(--radius-control) bg-(--action-primary) px-[18px] py-[9px] text-[15px] font-normal text-(--text-on-chrome) shadow-none hover:bg-(--action-primary-hover) disabled:bg-(--action-primary-disabled) disabled:opacity-100';
const outlineButtonClass =
  'h-auto rounded-(--radius-control) border-(--action-primary) bg-(--surface-card) px-[18px] py-[9px] text-[15px] font-normal text-(--action-primary) shadow-none hover:bg-(--action-selected) hover:text-(--action-primary)';
const destructiveGhostClass =
  'rounded-(--radius-control) text-(--danger) hover:bg-(--danger-surface) hover:text-(--danger)';
const alertClass = 'border-y-0 border-r-0 px-3.5 py-3';
const successAlertClass =
  'rounded-[2px] border-l-[5px] border-l-(--success) bg-[var(--bch-green-50,#EDF6EF)] text-foreground';
const supplyHeaderClass =
  'gap-3 border-b border-(--border-default) bg-(--surface-muted) px-3.5 py-2 text-xs tracking-[.4px] text-(--text-muted) uppercase';

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
  return message ? <p className={errorClass}>{message}</p> : null;
}

const propertyTiles: Array<{
  key: 'hasCommunityRoom' | 'isSingleSeniorOnly' | 'hasCommunityPartner';
  label: string;
  desc: string;
}> = [
  {
    key: 'hasCommunityRoom',
    label: 'Community room',
    desc: 'Has an indoor space bookable for events.',
  },
  {
    key: 'isSingleSeniorOnly',
    label: 'Single seniors only',
    desc: 'Tenancy restricted to single senior residents.',
  },
  {
    key: 'hasCommunityPartner',
    label: 'Community partner',
    desc: 'An outside organization delivers programs here.',
  },
];

export default function SiteForm({ mode, siteId, initialData }: SiteFormProps) {
  const router = useRouter();
  const [options, setOptions] = useState<Options>({
    users: [],
    communityPartners: [],
    supplies: [],
  });
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState<CreateSiteInput>({
    name: initialData?.name || '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    address: initialData?.address || '',
    numberOfTenants: initialData?.numberOfTenants || '',
    hasCommunityRoom: initialData?.hasCommunityRoom ?? true,
    hasCommunityPartner: initialData?.hasCommunityPartner ?? false,
    communityPartnerId: initialData?.communityPartnerId || '',
    isSingleSeniorOnly: initialData?.isSingleSeniorOnly ?? true,
    region: initialData?.region || 'LMDM',
    userId: initialData?.userId || '',
  });

  // Supply management state
  const [siteSupplies, setSiteSupplies] = useState<SiteSupplyInput[]>([]);
  const [existingSupplies, setExistingSupplies] = useState<
    ExistingSupplyEdit[]
  >([]);
  const [removedSupplies, setRemovedSupplies] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch options for dropdowns
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch('/api/admin/sites/options');
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

  // Fetch existing site data for edit mode
  useEffect(() => {
    if (mode === 'edit' && siteId) {
      const fetchSite = async () => {
        try {
          const response = await fetch(`/api/admin/sites/${siteId}`);
          const data = await response.json();

          if (response.ok) {
            const site = data.site;
            setFormData({
              name: site.name,
              latitude: site.latitude,
              longitude: site.longitude,
              address: site.address,
              numberOfTenants: site.numberOfTenants.toString(),
              hasCommunityRoom: site.hasCommunityRoom,
              hasCommunityPartner: site.hasCommunityPartner,
              communityPartnerId: site.communityPartnerId || '',
              isSingleSeniorOnly: site.isSingleSeniorOnly,
              region: site.region || 'LMDM',
              userId: site.userId,
            });

            // Fetch existing site supplies
            if (data.siteSupplies) {
              const formattedSupplies = data.siteSupplies.map(
                (supply: any) => ({
                  siteSupplyId: supply.id,
                  supplyId: supply.supplyId,
                  supplyName: supply.supplyName,
                  quantity: supply.quantity,
                  costPerUnit: supply.costPerUnit,
                })
              );
              setExistingSupplies(formattedSupplies);
            }
          }
        } catch (error) {
          console.error('Failed to fetch site:', error);
        }
      };

      fetchSite();
    }
  }, [mode, siteId]);

  // Supply management functions
  const addSupplyRow = () => {
    setSiteSupplies([...siteSupplies, { supplyId: '', quantity: 0 }]);
  };

  const removeSupplyRow = (index: number) => {
    setSiteSupplies(siteSupplies.filter((_, i) => i !== index));
  };

  const updateSupplyRow = (
    index: number,
    field: keyof SiteSupplyInput,
    value: string | number
  ) => {
    const updated = [...siteSupplies];
    updated[index] = { ...updated[index], [field]: value };
    setSiteSupplies(updated);
  };

  // Existing supply management functions
  const updateExistingSupply = (siteSupplyId: string, newQuantity: number) => {
    setExistingSupplies(prev =>
      prev.map(supply =>
        supply.siteSupplyId === siteSupplyId
          ? { ...supply, quantity: newQuantity }
          : supply
      )
    );
  };

  const removeExistingSupply = (siteSupplyId: string) => {
    setRemovedSupplies(prev => [...prev, siteSupplyId]);
    setExistingSupplies(prev =>
      prev.filter(supply => supply.siteSupplyId !== siteSupplyId)
    );
  };

  const getAvailableSupplies = (currentIndex: number) => {
    const selectedSupplyIds = siteSupplies
      .map((s, i) => (i !== currentIndex ? s.supplyId : null))
      .filter(Boolean);

    const existingSupplyIds = existingSupplies.map(s => s.supplyId);

    // Safety check to ensure options.supplies exists
    if (!options.supplies || !Array.isArray(options.supplies)) {
      return [];
    }

    return options.supplies.filter(
      supply =>
        !selectedSupplyIds.includes(supply.id) &&
        !existingSupplyIds.includes(supply.id)
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setError('');
    setMessage('');

    // Validate with Zod
    const validation = createSiteSchema.safeParse(formData);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path.length > 0) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    // Validate supplies
    const validSupplies = siteSupplies.filter(
      s => s.supplyId && s.quantity > 0
    );
    if (siteSupplies.some(s => s.supplyId && s.quantity <= 0)) {
      setError('All supply quantities must be greater than 0');
      setLoading(false);
      return;
    }

    // Validate existing supplies (edit mode)
    if (mode === 'edit' && existingSupplies.some(s => s.quantity <= 0)) {
      setError('All existing supply quantities must be greater than 0');
      setLoading(false);
      return;
    }

    try {
      const url =
        mode === 'create' ? '/api/admin/sites' : `/api/admin/sites/${siteId}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const requestBody = {
        ...validation.data,
        newSupplies: validSupplies, // new supplies to add
        existingSupplies:
          mode === 'edit'
            ? existingSupplies.map(s => ({
                siteSupplyId: s.siteSupplyId,
                quantity: s.quantity,
              }))
            : undefined,
        removedSupplies: mode === 'edit' ? removedSupplies : undefined,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          `Site ${mode === 'create' ? 'created' : 'updated'} successfully!`
        );
        setTimeout(() => {
          router.push('/admin/sites');
        }, 2000);
      } else {
        if (data.details) {
          // Handle Zod validation errors from server
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((err: any) => {
            if (err.path.length > 0) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
        } else {
          setError(data.error || `Failed to ${mode} site`);
        }
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const located =
    formData.latitude !== '' &&
    formData.longitude !== '' &&
    !isNaN(Number(formData.latitude)) &&
    !isNaN(Number(formData.longitude));

  // Display-only checklist mirroring createSiteSchema's required rules.
  const checklist = [
    { label: 'Site name', ok: !!formData.name.trim() },
    { label: 'Number of tenants', ok: Number(formData.numberOfTenants) > 0 },
    { label: 'Address', ok: !!formData.address.trim() },
    { label: 'Location coordinates', ok: located },
    { label: 'Tenant engagement worker', ok: !!formData.userId },
    ...(formData.hasCommunityPartner
      ? [{ label: 'Community partner named', ok: !!formData.communityPartnerId }]
      : []),
  ];
  const remaining = checklist.filter(item => !item.ok).length;
  const readyNote =
    remaining > 0
      ? `${remaining} required field${remaining === 1 ? '' : 's'} left`
      : 'All required fields complete';

  if (optionsLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-(--text-muted)">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-2.5 flex items-center gap-1.5 text-[13px] text-(--text-muted)">
        <Link href="/dashboard" className="text-(--action-primary) hover:underline">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/admin/sites" className="text-(--action-primary) hover:underline">
          Sites
        </Link>
        <span>/</span>
        <span>{mode === 'create' ? 'Create site' : 'Edit site'}</span>
      </div>

      <h1 className="text-[30px] leading-tight font-bold tracking-[-.2px]">
        {mode === 'create' ? 'Create New Site' : 'Edit Site'}
      </h1>
      <p className="mt-1.5 max-w-[620px] text-[15px] text-(--text-muted)">
        {mode === 'create'
          ? 'Add a new site to your system'
          : 'Update site information and properties'}
      </p>

      <div className="mt-5 flex flex-col items-start gap-6 lg:flex-row">
        <form
          onSubmit={handleSubmit}
          className="flex min-w-0 flex-1 flex-col gap-4"
        >
          {message && (
            <Alert className={cn(alertClass, successAlertClass)}>
              <AlertDescription className="text-[14px] text-foreground">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className={alertClass}>
              <AlertDescription className="text-[14px]">{error}</AlertDescription>
            </Alert>
          )}

          <Card className={cardClass}>
            <SectionHeader
              icon={Home}
              title="Site identity"
              sub="Name, size, and who looks after it"
            />

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[1.6fr_1fr]">
              <div>
                <Label htmlFor="name" className={labelClass}>
                  Site Name
                  <Required />
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter site name"
                  disabled={loading}
                  aria-invalid={!!errors.name}
                  className={cn(inputClass, 'mt-1.5')}
                />
                <FieldError message={errors.name} />
              </div>

              <div>
                <Label htmlFor="numberOfTenants" className={labelClass}>
                  Number of Tenants
                  <Required />
                </Label>
                <Input
                  id="numberOfTenants"
                  type="number"
                  min="1"
                  value={formData.numberOfTenants}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      numberOfTenants: e.target.value,
                    })
                  }
                  placeholder="Enter number of tenants"
                  disabled={loading}
                  aria-invalid={!!errors.numberOfTenants}
                  className={cn(inputClass, 'mt-1.5')}
                />
                <FieldError message={errors.numberOfTenants} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[1.6fr_1fr]">
              <div>
                <Label htmlFor="userId" className={labelClass}>
                  Tenant Engagement Worker
                  <Required />
                </Label>
                <Select
                  value={formData.userId}
                  onValueChange={value =>
                    setFormData({ ...formData, userId: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger
                    id="userId"
                    aria-invalid={!!errors.userId}
                    className={cn(selectTriggerClass, 'mt-1.5')}
                  >
                    <SelectValue placeholder="Select a worker..." />
                  </SelectTrigger>
                  <SelectContent>
                    {options.users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={errors.userId} />
              </div>

              <div>
                <Label htmlFor="region" className={labelClass}>
                  Region
                </Label>
                <Select
                  value={formData.region}
                  onValueChange={value =>
                    setFormData({
                      ...formData,
                      region: value as CreateSiteInput['region'],
                    })
                  }
                >
                  <SelectTrigger
                    id="region"
                    aria-invalid={!!errors.region}
                    className={cn(selectTriggerClass, 'mt-1.5')}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LMDM">Lower Mainland</SelectItem>
                    <SelectItem value="VIR">Vancouver Island</SelectItem>
                    <SelectItem value="Interior">Interior</SelectItem>
                    <SelectItem value="Northern">Northern</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError message={errors.region} />
              </div>
            </div>
          </Card>

          <Card className={cardClass}>
            <SectionHeader
              icon={MapPin}
              title="Address and location"
              sub="Where the site is and its map coordinates"
            />

            <div className="mt-5">
              <Label htmlFor="address" className={labelClass}>
                Address
                <Required />
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={e =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter full address"
                disabled={loading}
                aria-invalid={!!errors.address}
                rows={3}
                className={cn(textareaClass, 'mt-1.5')}
              />
              <FieldError message={errors.address} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="latitude" className={labelClass}>
                  Latitude
                  <Required />
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={e =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                  placeholder="e.g., 49.2827"
                  disabled={loading}
                  aria-invalid={!!errors.latitude}
                  className={cn(inputClass, 'mt-1.5')}
                />
                <FieldError message={errors.latitude} />
              </div>

              <div>
                <Label htmlFor="longitude" className={labelClass}>
                  Longitude
                  <Required />
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={e =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                  placeholder="e.g., -123.1207"
                  disabled={loading}
                  aria-invalid={!!errors.longitude}
                  className={cn(inputClass, 'mt-1.5')}
                />
                <FieldError message={errors.longitude} />
              </div>
            </div>

            {/* TODO: /admin/sites/new — not wired: no geocoder exists; the
                template's Find on map needs a server route + external API. */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" disabled className={outlineButtonClass}>
                Find on map
              </Button>
            </div>

            <div className="mt-4 overflow-hidden rounded-(--radius-control) border border-(--border-default)">
              <div className="grid h-[170px] place-items-center bg-[repeating-linear-gradient(135deg,#eef1f3_0_12px,#e6eaee_12px_24px)]">
                {located ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="size-[18px] rounded-full border-[3px] border-white bg-(--action-primary) shadow-(--shadow-card)" />
                    <span className="rounded-[2px] border border-(--border-default) bg-(--surface-card) px-2 py-0.5 font-mono text-xs text-(--text-muted)">
                      {formData.latitude}, {formData.longitude}
                    </span>
                  </div>
                ) : (
                  <span className="font-mono text-xs text-(--text-muted)">
                    No coordinates yet
                  </span>
                )}
              </div>
            </div>
          </Card>

          <Card className={cardClass}>
            <SectionHeader
              icon={Users}
              title="Site properties"
              sub="These drive which programs and reports the site appears in"
            />

            <div className="mt-[18px] grid grid-cols-1 gap-3 md:grid-cols-3">
              {propertyTiles.map(tile => {
                const on = formData[tile.key];
                return (
                  <button
                    key={tile.key}
                    type="button"
                    aria-pressed={on}
                    disabled={loading}
                    onClick={() => {
                      if (tile.key === 'hasCommunityPartner') {
                        const next = !formData.hasCommunityPartner;
                        setFormData({
                          ...formData,
                          hasCommunityPartner: next,
                          communityPartnerId: next
                            ? formData.communityPartnerId
                            : '',
                        });
                      } else {
                        setFormData({
                          ...formData,
                          [tile.key]: !formData[tile.key],
                        });
                      }
                    }}
                    className={cn(
                      'flex cursor-pointer flex-col gap-1 rounded-(--radius-control) px-3.5 py-3 text-left',
                      on
                        ? 'border border-(--action-primary) bg-(--action-selected)'
                        : 'border border-(--border-default) bg-(--surface-card) hover:border-(--action-primary)'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          'grid size-[17px] shrink-0 place-items-center rounded-[2px]',
                          on
                            ? 'bg-(--action-primary) text-(--text-on-chrome)'
                            : 'border border-(--border-input) bg-(--surface-card)'
                        )}
                      >
                        {on && <Check size={12} />}
                      </span>
                      <span className="text-[15px] font-semibold">
                        {tile.label}
                      </span>
                    </span>
                    <span className="text-[13px] leading-[1.35] text-(--text-muted)">
                      {tile.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {formData.hasCommunityPartner && (
              <div className="mt-4 max-w-[460px] border-t border-(--bch-gray-200) pt-4">
                <Label htmlFor="communityPartnerId" className={labelClass}>
                  Community Partner
                  <Required />
                </Label>
                <Select
                  value={formData.communityPartnerId}
                  onValueChange={value =>
                    setFormData({ ...formData, communityPartnerId: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger
                    id="communityPartnerId"
                    aria-invalid={!!errors.communityPartnerId}
                    className={cn(selectTriggerClass, 'mt-1.5')}
                  >
                    <SelectValue placeholder="Select a community partner" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.communityPartners.map(partner => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={errors.communityPartnerId} />
              </div>
            )}
          </Card>

          <Card className={cardClass}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionHeader
                icon={Package}
                title="Supply Management"
                sub={
                  mode === 'edit'
                    ? 'Manage supplies at this site. Update quantities, remove supplies, or add new ones.'
                    : 'Add supplies to this site. Quantities will be added to both site inventory and main supply counts.'
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={addSupplyRow}
                disabled={loading}
                className={outlineButtonClass}
              >
                <Plus className="h-4 w-4" />
                Add Supply
              </Button>
            </div>

            {/* Existing Supplies (Edit Mode) */}
            {mode === 'edit' && (
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <div className="text-[15px] font-semibold">Current Inventory</div>
                  {existingSupplies.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="rounded-(--radius-control) bg-(--bch-gray-100) text-(--text-muted)"
                    >
                      {existingSupplies.length}{' '}
                      {existingSupplies.length === 1 ? 'item' : 'items'}
                    </Badge>
                  )}
                </div>

                {existingSupplies.length > 0 ? (
                  <div className="mt-3 overflow-hidden rounded-(--radius-control) border border-(--border-default)">
                    <div className={cn(supplyHeaderClass, 'grid grid-cols-[1fr_150px_150px_44px]')}>
                      <span>Supply</span>
                      <span>Quantity</span>
                      <span>Total Value</span>
                      <span></span>
                    </div>
                    {existingSupplies.map(supply => (
                      <div
                        key={supply.siteSupplyId}
                        className="grid grid-cols-[1fr_150px_150px_44px] items-center gap-3 border-b border-(--bch-gray-200) px-3.5 py-2.5 last:border-b-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {supply.supplyName}
                          </p>
                          <p className="text-xs text-(--text-muted)">
                            ${supply.costPerUnit} per unit
                          </p>
                        </div>
                        <Input
                          type="number"
                          min="1"
                          value={supply.quantity || ''}
                          onChange={e =>
                            updateExistingSupply(
                              supply.siteSupplyId,
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="Enter quantity"
                          disabled={loading}
                          aria-label={`Quantity of ${supply.supplyName}`}
                          className={inputClass}
                        />
                        <span className="text-sm font-medium">
                          $
                          {(
                            parseFloat(supply.costPerUnit) * supply.quantity
                          ).toFixed(2)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            removeExistingSupply(supply.siteSupplyId)
                          }
                          disabled={loading}
                          title="Remove supply"
                          aria-label={`Remove ${supply.supplyName}`}
                          className={cn(destructiveGhostClass, 'size-8')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 rounded-(--radius-control) border border-dashed border-(--border-default) px-6 py-6 text-center">
                    <Package className="mx-auto mb-2 h-8 w-8 text-(--text-muted)" />
                    <p className="text-sm text-(--text-muted)">
                      No supplies at this site
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Add New Supplies */}
            <div className="mt-5">
              <div className="text-[15px] font-semibold">
                {mode === 'edit' ? 'Add New Supplies' : 'Add Supplies to Site'}
              </div>

              {siteSupplies.length > 0 ? (
                <div className="mt-3 overflow-hidden rounded-(--radius-control) border border-(--border-default)">
                  <div className={cn(supplyHeaderClass, 'grid grid-cols-[1fr_150px_44px]')}>
                    <span>Supply</span>
                    <span>Quantity</span>
                    <span></span>
                  </div>
                  {siteSupplies.map((supply, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[1fr_150px_44px] items-center gap-3 border-b border-(--bch-gray-200) px-3.5 py-2.5 last:border-b-0"
                    >
                      <Select
                        value={supply.supplyId}
                        onValueChange={value =>
                          updateSupplyRow(index, 'supplyId', value)
                        }
                        disabled={loading}
                      >
                        <SelectTrigger
                          aria-label="Supply"
                          className={selectTriggerClass}
                        >
                          <SelectValue placeholder="Select a supply" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableSupplies(index).map(availableSupply => (
                            <SelectItem
                              key={availableSupply.id}
                              value={availableSupply.id}
                            >
                              {availableSupply.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        value={supply.quantity || ''}
                        onChange={e =>
                          updateSupplyRow(
                            index,
                            'quantity',
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="Enter quantity"
                        disabled={loading}
                        aria-label="Quantity to add"
                        className={inputClass}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSupplyRow(index)}
                        disabled={loading}
                        title="Remove supply row"
                        aria-label="Remove supply row"
                        className={cn(destructiveGhostClass, 'size-8')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 rounded-(--radius-control) border border-dashed border-(--border-default) px-6 py-6 text-center text-sm text-(--text-muted)">
                  {mode === 'edit'
                    ? 'No new supplies to add. Click "Add Supply" to add more supplies to this site.'
                    : 'No supplies added. Click "Add Supply" to start adding supplies to this site.'}
                </div>
              )}
            </div>
          </Card>

          {/* TODO: /admin/sites/new — not wired: the template disables Save
              until the checklist is complete; Save stays enabled so Zod and
              server rejections still surface as field errors. */}
          <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-4 border-t border-(--border-default) bg-(--surface-page) pt-3.5 pb-1">
            <span className="text-[13px] text-(--text-muted)">{readyNote}</span>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className={outlineButtonClass}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className={primaryButtonClass}>
                {loading
                  ? `${mode === 'create' ? 'Creating' : 'Updating'}...`
                  : `${mode === 'create' ? 'Create' : 'Update'} Site`}
              </Button>
            </div>
          </div>
        </form>

        <aside className="w-full shrink-0 overflow-hidden rounded-(--radius-card) border border-(--border-default) bg-(--surface-card) shadow-(--shadow-card) lg:sticky lg:top-5 lg:w-80">
          <div className="border-b border-(--bch-gray-200) px-5 py-3.5">
            <div className="text-[15px] font-bold">Required fields</div>
            <div className="text-[12.5px] text-(--text-muted)">Complete these to save</div>
          </div>
          <ul className="flex flex-col gap-3 px-5 pt-4 pb-5">
            {checklist.map(item => (
              <li
                key={item.label}
                className={cn(
                  'flex items-center gap-2 text-[13.5px]',
                  item.ok ? 'text-(--success)' : 'text-(--text-muted)'
                )}
              >
                <span className="grid size-4 shrink-0 place-items-center rounded-full border-[1.5px] border-current">
                  {item.ok && <CheckIcon className="size-2.5" strokeWidth={3} />}
                </span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
