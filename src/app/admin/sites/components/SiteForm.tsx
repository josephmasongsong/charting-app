'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  MapPin,
  Package,
  Plus,
  Trash2,
} from 'lucide-react';
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

  if (optionsLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

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
            {mode === 'create' ? 'Create New Site' : 'Edit Site'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'create'
              ? 'Add a new site to your system'
              : 'Update site information and properties'}
          </p>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <Alert className="border-green-200 bg-green-50 mb-6">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {message}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the basic details for the site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Site Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter site name"
                  disabled={loading}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfTenants">Number of Tenants *</Label>
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
                  className={errors.numberOfTenants ? 'border-red-500' : ''}
                />
                {errors.numberOfTenants && (
                  <p className="text-sm text-red-500">
                    {errors.numberOfTenants}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={e =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter full address"
                disabled={loading}
                className={errors.address ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">Site Manager *</Label>
              <Select
                value={formData.userId}
                onValueChange={value =>
                  setFormData({ ...formData, userId: value })
                }
                disabled={loading}
              >
                <SelectTrigger
                  className={errors.userId ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder="Select a site manager" />
                </SelectTrigger>
                <SelectContent>
                  {options.users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.userId && (
                <p className="text-sm text-red-500">{errors.userId}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Information
            </CardTitle>
            <CardDescription>
              Enter the GPS coordinates for the site location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
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
                  className={errors.latitude ? 'border-red-500' : ''}
                />
                {errors.latitude && (
                  <p className="text-sm text-red-500">{errors.latitude}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
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
                  className={errors.longitude ? 'border-red-500' : ''}
                />
                {errors.longitude && (
                  <p className="text-sm text-red-500">{errors.longitude}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Site Properties */}
        <Card>
          <CardHeader>
            <CardTitle>Site Properties</CardTitle>
            <CardDescription>
              Configure the features and characteristics of this site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasCommunityRoom"
                  checked={formData.hasCommunityRoom}
                  onCheckedChange={checked =>
                    setFormData({
                      ...formData,
                      hasCommunityRoom: checked as boolean,
                    })
                  }
                  disabled={loading}
                />
                <Label
                  htmlFor="hasCommunityRoom"
                  className="text-sm font-medium"
                >
                  Has Community Room
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isSingleSeniorOnly"
                  checked={formData.isSingleSeniorOnly}
                  onCheckedChange={checked =>
                    setFormData({
                      ...formData,
                      isSingleSeniorOnly: checked as boolean,
                    })
                  }
                  disabled={loading}
                />
                <Label
                  htmlFor="isSingleSeniorOnly"
                  className="text-sm font-medium"
                >
                  Single Senior Only
                </Label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasCommunityPartner"
                  checked={formData.hasCommunityPartner}
                  onCheckedChange={checked => {
                    const hasPartner = checked as boolean;
                    setFormData({
                      ...formData,
                      hasCommunityPartner: hasPartner,
                      communityPartnerId: hasPartner
                        ? formData.communityPartnerId
                        : '',
                    });
                  }}
                  disabled={loading}
                />
                <Label
                  htmlFor="hasCommunityPartner"
                  className="text-sm font-medium"
                >
                  Has Community Partner
                </Label>
              </div>

              {/* Conditional Community Partner Dropdown */}
              {formData.hasCommunityPartner && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="communityPartnerId">
                    Community Partner *
                  </Label>
                  <Select
                    value={formData.communityPartnerId}
                    onValueChange={value =>
                      setFormData({ ...formData, communityPartnerId: value })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger
                      className={
                        errors.communityPartnerId ? 'border-red-500' : ''
                      }
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
                  {errors.communityPartnerId && (
                    <p className="text-sm text-red-500">
                      {errors.communityPartnerId}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Supply Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Supply Management
            </CardTitle>
            <CardDescription>
              {mode === 'edit'
                ? 'Manage supplies at this site. Update quantities, remove supplies, or add new ones.'
                : 'Add supplies to this site. Quantities will be added to both site inventory and main supply counts.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Existing Supplies (Edit Mode) */}
            {mode === 'edit' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">
                    Current Inventory
                  </Label>
                  {existingSupplies.length > 0 && (
                    <Badge variant="secondary">
                      {existingSupplies.length}{' '}
                      {existingSupplies.length === 1 ? 'item' : 'items'}
                    </Badge>
                  )}
                </div>

                {existingSupplies.length > 0 ? (
                  <div className="space-y-3">
                    {existingSupplies.map(supply => (
                      <div
                        key={supply.siteSupplyId}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 border rounded-lg bg-muted/20"
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-sm">
                            {supply.supplyName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ${supply.costPerUnit} per unit
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Quantity</Label>
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
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Total Value
                          </p>
                          <p className="font-medium text-sm">
                            $
                            {(
                              parseFloat(supply.costPerUnit) * supply.quantity
                            ).toFixed(2)}
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            removeExistingSupply(supply.siteSupplyId)
                          }
                          disabled={loading}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed rounded-lg">
                    <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No supplies at this site
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Add New Supplies */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  {mode === 'edit'
                    ? 'Add New Supplies'
                    : 'Add Supplies to Site'}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSupplyRow}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Supply
                </Button>
              </div>

              {siteSupplies.map((supply, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 border rounded-lg"
                >
                  <div className="space-y-2">
                    <Label>Supply</Label>
                    <Select
                      value={supply.supplyId}
                      onValueChange={value =>
                        updateSupplyRow(index, 'supplyId', value)
                      }
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a supply" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableSupplies(index).map(availableSupply => (
                          <SelectItem
                            key={availableSupply.id}
                            value={availableSupply.id}
                          >
                            {availableSupply.name} (Available:{' '}
                            {availableSupply.quantity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity to Add</Label>
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
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSupplyRow(index)}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ))}

              {siteSupplies.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">
                    {mode === 'edit'
                      ? 'No new supplies to add. Click "Add Supply" to add more supplies to this site.'
                      : 'No supplies added. Click "Add Supply" to start adding supplies to this site.'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? `${mode === 'create' ? 'Creating' : 'Updating'}...`
              : `${mode === 'create' ? 'Create' : 'Update'} Site`}
          </Button>
        </div>
      </form>
    </div>
  );
}
