'use client';

import { useState, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

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
  supplyId: string;
  quantity: number;
}

interface CreateDistributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onRefresh: () => void;
}

export default function CreateDistributionDialog({
  open,
  onOpenChange,
  onSuccess,
  onError,
  onRefresh,
}: CreateDistributionDialogProps) {
  const [form, setForm] = useState({
    siteId: '',
    distributionDate: '',
    distributionType: 'door_to_door',
    recipientNotes: '',
    notes: '',
  });
  const [distributionItems, setDistributionItems] = useState<
    DistributionItem[]
  >([{ supplyId: '', quantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setForm(prev => ({ ...prev, distributionDate: today }));
  }, []);

  // Fetch sites and supplies when dialog opens
  useEffect(() => {
    if (open) {
      fetchOptions();
    }
  }, [open]);

  // Fetch supplies when site changes
  useEffect(() => {
    if (form.siteId) {
      fetchSuppliesForSite(form.siteId);
    }
  }, [form.siteId]);

  const fetchOptions = async () => {
    setLoadingOptions(true);
    try {
      const response = await fetch('/api/admin/supply-distributions/options');
      const data = await response.json();

      if (response.ok) {
        setSites(data.sites || []);
        setSupplies(data.supplies || []);
      } else {
        onError(data.error || 'Failed to fetch options');
      }
    } catch (error) {
      onError('Network error occurred');
    } finally {
      setLoadingOptions(false);
    }
  };

  const fetchSuppliesForSite = async (siteId: string) => {
    try {
      const response = await fetch(
        `/api/admin/supply-distributions/options?siteId=${siteId}`
      );
      const data = await response.json();

      if (response.ok) {
        setSupplies(data.supplies || []);
        // Reset distribution items when site changes
        setDistributionItems([{ supplyId: '', quantity: 1 }]);
      } else {
        onError(data.error || 'Failed to fetch supplies for site');
      }
    } catch (error) {
      onError('Network error occurred');
    }
  };

  const addDistributionItem = () => {
    setDistributionItems([...distributionItems, { supplyId: '', quantity: 1 }]);
  };

  const removeDistributionItem = (index: number) => {
    if (distributionItems.length > 1) {
      setDistributionItems(distributionItems.filter((_, i) => i !== index));
    }
  };

  const updateDistributionItem = (
    index: number,
    field: keyof DistributionItem,
    value: string | number
  ) => {
    const updated = [...distributionItems];
    updated[index] = { ...updated[index], [field]: value };
    setDistributionItems(updated);
  };

  const getAvailableSupplies = (currentSupplyId?: string) => {
    const usedSupplyIds = distributionItems
      .map(item => item.supplyId)
      .filter(id => id && id !== currentSupplyId);

    return supplies.filter(
      supply =>
        !usedSupplyIds.includes(supply.id) || supply.id === currentSupplyId
    );
  };

  const getSupplyDetails = (supplyId: string) => {
    return supplies.find(supply => supply.id === supplyId);
  };

  const calculateTotal = () => {
    return distributionItems.reduce((total, item) => {
      const supply = getSupplyDetails(item.supplyId);
      if (supply) {
        return total + parseFloat(supply.costPerUnit) * item.quantity;
      }
      return total;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate form
    if (!form.siteId || !form.distributionDate || !form.recipientNotes) {
      onError('Site, distribution date, and recipient notes are required');
      setLoading(false);
      return;
    }

    // Validate distribution items
    const validItems = distributionItems.filter(
      item => item.supplyId && item.quantity > 0
    );
    if (validItems.length === 0) {
      onError('At least one distribution item is required');
      setLoading(false);
      return;
    }

    // Check inventory limits
    for (const item of validItems) {
      const supply = getSupplyDetails(item.supplyId);
      if (supply && item.quantity > supply.availableQuantity) {
        onError(
          `Quantity for ${supply.name} exceeds available inventory (${supply.availableQuantity})`
        );
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/admin/supply-distributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          distributionItems: validItems,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess('Distribution logged successfully!');
        setForm({
          siteId: '',
          distributionDate: new Date().toISOString().split('T')[0],
          distributionType: 'door_to_door',
          recipientNotes: '',
          notes: '',
        });
        setDistributionItems([{ supplyId: '', quantity: 1 }]);
        onOpenChange(false);
        onRefresh();
      } else {
        onError(data.error || 'Failed to log distribution');
      }
    } catch (error) {
      onError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Supply Distribution</DialogTitle>
          <DialogDescription>
            Record a new supply distribution to track inventory and costs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteId">Site *</Label>
              <Select
                value={form.siteId}
                onValueChange={value =>
                  setForm(prev => ({ ...prev, siteId: value }))
                }
                disabled={loading || loadingOptions}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map(site => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="distributionDate">Distribution Date *</Label>
              <Input
                id="distributionDate"
                type="date"
                value={form.distributionDate}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    distributionDate: e.target.value,
                  }))
                }
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distributionType">Distribution Type</Label>
              <Select
                value={form.distributionType}
                onValueChange={value =>
                  setForm(prev => ({ ...prev, distributionType: value }))
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="door_to_door">Door to Door</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientNotes">Recipients/Notes *</Label>
              <Input
                id="recipientNotes"
                value={form.recipientNotes}
                onChange={e =>
                  setForm(prev => ({ ...prev, recipientNotes: e.target.value }))
                }
                placeholder="Who received the supplies?"
                required
                disabled={loading}
                maxLength={500}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={e =>
                setForm(prev => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Any additional details about this distribution..."
              disabled={loading}
              rows={3}
            />
          </div>

          {/* Distribution Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Distribution Items *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDistributionItem}
                disabled={loading || !form.siteId}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {!form.siteId && (
              <p className="text-sm text-muted-foreground">
                Please select a site first to choose supplies.
              </p>
            )}

            <div className="space-y-3">
              {distributionItems.map((item, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-6">
                        <Label htmlFor={`supply-${index}`}>Supply</Label>
                        <Select
                          value={item.supplyId}
                          onValueChange={value =>
                            updateDistributionItem(index, 'supplyId', value)
                          }
                          disabled={loading || !form.siteId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select supply" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableSupplies(item.supplyId).map(supply => (
                              <SelectItem key={supply.id} value={supply.id}>
                                {supply.name} (Available:{' '}
                                {supply.availableQuantity})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-3">
                        <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          max={
                            getSupplyDetails(item.supplyId)
                              ?.availableQuantity || 999
                          }
                          value={item.quantity}
                          onChange={e =>
                            updateDistributionItem(
                              index,
                              'quantity',
                              parseInt(e.target.value) || 1
                            )
                          }
                          disabled={loading || !item.supplyId}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label>Line Total</Label>
                        <div className="h-10 flex items-center text-sm font-mono">
                          $
                          {(() => {
                            const supply = getSupplyDetails(item.supplyId);
                            return supply
                              ? (
                                  parseFloat(supply.costPerUnit) * item.quantity
                                ).toFixed(2)
                              : '0.00';
                          })()}
                        </div>
                      </div>

                      <div className="md:col-span-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeDistributionItem(index)}
                          disabled={loading || distributionItems.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="text-right">
                <Label>Total Distribution Value</Label>
                <div className="text-lg font-bold font-mono">
                  ${calculateTotal().toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Logging Distribution...' : 'Log Distribution'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
