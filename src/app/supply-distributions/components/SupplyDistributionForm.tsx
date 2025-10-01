// app/supply-distributions/components/SupplyDistributionForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Calculator,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Site {
  id: string;
  name: string;
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
  distributionType: string;
  distributionDate: string;
  recipientNotes: string;
  notes: string;
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
    distributionType: 'door_to_door',
    distributionDate: new Date().toISOString().split('T')[0],
    recipientNotes: '',
    notes: '',
  });

  const [options, setOptions] = useState({
    sites: [] as Site[],
    supplies: [] as Supply[],
  });

  const [optionsLoading, setOptionsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const distributionTypes = [
    { value: 'door_to_door', label: 'Door to Door' },
    { value: 'community_room_pickup', label: 'Community Room Pickup' },
    { value: 'event_distribution', label: 'Event Distribution' },
    { value: 'emergency_distribution', label: 'Emergency Distribution' },
  ];

  // Fetch initial options on component mount
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

  // Fetch supplies for selected site
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
        }));

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

          // If supply is selected, update name and unit cost
          if (field === 'supplyId') {
            const selectedSupply = options.supplies.find(s => s.id === value);
            if (selectedSupply) {
              updatedItem.supplyName = selectedSupply.name;
              updatedItem.unitCost = parseFloat(selectedSupply.costPerUnit);
              updatedItem.lineTotal =
                updatedItem.quantity * parseFloat(selectedSupply.costPerUnit);
            }
          }

          // If quantity changes, recalculate line total
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

    // Validate required fields
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

    // Validate distribution items
    const validItems = distributionItems.filter(
      item => item.supplyId && item.quantity > 0
    );

    if (validItems.length === 0) {
      setError('Please add at least one supply item with a positive quantity.');
      setSubmitting(false);
      return;
    }

    // Check inventory constraints
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

        // Reset form
        setFormData({
          siteId: '',
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

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Optionally redirect after success
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-pulse">
              <Loader2 className="h-8 w-8 mx-auto text-muted-foreground mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading form options...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        {/* <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button> */}
        <div>
          <h1 className="text-3xl font-bold">Log Supply Distribution</h1>
          <p className="text-muted-foreground">
            Record supplies distributed to tenants and community members
          </p>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 mb-6">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Basic Distribution Info */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution Details</CardTitle>
            <CardDescription>
              Basic information about this distribution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site">Site *</Label>
                <Select
                  value={formData.siteId}
                  onValueChange={value =>
                    setFormData({ ...formData, siteId: value })
                  }
                  disabled={submitting}
                >
                  <SelectTrigger>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="distributionType">Distribution Type *</Label>
                <Select
                  value={formData.distributionType}
                  onValueChange={value =>
                    setFormData({ ...formData, distributionType: value })
                  }
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {distributionTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="distributionDate">Distribution Date *</Label>
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
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientNotes">Recipient Information *</Label>
              <Textarea
                id="recipientNotes"
                placeholder="e.g., Mrs. Johnson apt 3B, family of 4, or Event attendees (12 people)"
                value={formData.recipientNotes}
                onChange={e =>
                  setFormData({ ...formData, recipientNotes: e.target.value })
                }
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional context about this distribution..."
                value={formData.notes}
                onChange={e =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                disabled={submitting}
              />
            </div>
          </CardContent>
        </Card>

        {/* Supply Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Supply Items
                </CardTitle>
                <CardDescription>
                  Add the supplies being distributed
                </CardDescription>
              </div>
              <Button
                type="button"
                onClick={addSupplyItem}
                size="sm"
                disabled={submitting || !formData.siteId}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!formData.siteId && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please select a site first to view available supplies.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {distributionItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-end gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-1 space-y-2">
                    <Label>Supply *</Label>
                    <Select
                      value={item.supplyId}
                      onValueChange={value =>
                        updateSupplyItem(item.id, 'supplyId', value)
                      }
                      disabled={submitting || !formData.siteId}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            formData.siteId
                              ? 'Select supply'
                              : 'Select site first'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {options.supplies.map(supply => (
                          <SelectItem key={supply.id} value={supply.id}>
                            <div className="flex justify-between items-center w-full">
                              <span>{supply.name}</span>
                              <Badge variant="outline" className="ml-2">
                                ${parseFloat(supply.costPerUnit).toFixed(2)} ea
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-24 space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      max={
                        item.supplyId
                          ? getAvailableQuantity(item.supplyId)
                          : undefined
                      }
                      value={item.quantity}
                      onChange={e =>
                        updateSupplyItem(
                          item.id,
                          'quantity',
                          parseInt(e.target.value) || 0
                        )
                      }
                      disabled={submitting}
                    />
                    {item.supplyId && (
                      <div className="text-xs text-muted-foreground">
                        Available: {getAvailableQuantity(item.supplyId)}
                      </div>
                    )}
                  </div>

                  <div className="w-28 space-y-2">
                    <Label>Unit Cost</Label>
                    <Input
                      value={`${item.unitCost.toFixed(2)}`}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="w-32 space-y-2">
                    <Label>Line Total</Label>
                    <Input
                      value={`${item.lineTotal.toFixed(2)}`}
                      disabled
                      className="bg-muted font-medium"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeSupplyItem(item.id)}
                    disabled={distributionItems.length === 1 || submitting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Separator />

              <div className="flex justify-end">
                <div className="text-right space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Total Distribution Cost
                  </div>
                  <div className="text-2xl font-bold">
                    ${calculateTotalCost().toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !formData.siteId}
            className="bg-blue-600 hover:bg-blue-700"
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
  );
}
