import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, Activity, MapPin, Users } from 'lucide-react';

interface StepThreeProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: Record<string, string>;
  loading: boolean;
  options: {
    activityTypes: Array<{ id: string; name: string; programGoalName: string }>;
    sites: Array<{ id: string; name: string; address: string }>;
    communityPartners: Array<{ id: string; name: string }>;
  };
}

export default function StepThree({
  formData,
  setFormData,
  errors,
  loading,
  options,
}: StepThreeProps) {
  const [activityTypeOpen, setActivityTypeOpen] = useState(false);
  const [siteOpen, setSiteOpen] = useState(false);
  const [communityPartnerOpen, setCommunityPartnerOpen] = useState(false);

  const selectedActivityType = options.activityTypes.find(
    type => type.id === formData.activityTypeId
  );

  const selectedSite = options.sites.find(site => site.id === formData.siteId);

  const selectedCommunityPartner = options.communityPartners.find(
    partner => partner.id === formData.communityPartnerId
  );

  return (
    <div className="space-y-6">
      {/* Activity Type */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Activity Type *
        </Label>
        <Popover open={activityTypeOpen} onOpenChange={setActivityTypeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={activityTypeOpen}
              className={`w-full justify-between ${errors.activityTypeId ? 'border-red-500' : ''}`}
              disabled={loading}
            >
              {selectedActivityType ? (
                <div className="flex items-center gap-2">
                  <span>{selectedActivityType.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {selectedActivityType.programGoalName}
                  </Badge>
                </div>
              ) : (
                'Select activity type...'
              )}
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
                      setFormData({ ...formData, activityTypeId: type.id });
                      setActivityTypeOpen(false);
                    }}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        formData.activityTypeId === type.id
                          ? 'opacity-100'
                          : 'opacity-0'
                      }`}
                    />
                    <div className="flex flex-col">
                      <span>{type.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {type.programGoalName}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.activityTypeId && (
          <p className="text-sm text-red-500">{errors.activityTypeId}</p>
        )}
      </div>

      {/* Site */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Site *
        </Label>
        <Popover open={siteOpen} onOpenChange={setSiteOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={siteOpen}
              className={`w-full justify-between ${errors.siteId ? 'border-red-500' : ''}`}
              disabled={loading}
            >
              {selectedSite ? (
                <div className="flex flex-col items-start">
                  <span>{selectedSite.name}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {selectedSite.address}
                  </span>
                </div>
              ) : (
                'Select site...'
              )}
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
                      setFormData({ ...formData, siteId: site.id });
                      setSiteOpen(false);
                    }}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        formData.siteId === site.id
                          ? 'opacity-100'
                          : 'opacity-0'
                      }`}
                    />
                    <div className="flex flex-col">
                      <span>{site.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {site.address}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.siteId && (
          <p className="text-sm text-red-500">{errors.siteId}</p>
        )}
      </div>

      {/* Co-Host */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasCoHost"
            checked={formData.hasCoHost}
            onCheckedChange={checked => {
              const hasCoHost = checked as boolean;
              setFormData({
                ...formData,
                hasCoHost,
                communityPartnerId: hasCoHost
                  ? formData.communityPartnerId
                  : '',
              });
            }}
            disabled={loading}
          />
          <Label
            htmlFor="hasCoHost"
            className="text-sm font-medium cursor-pointer"
          >
            This event has a co-host
          </Label>
        </div>

        {/* Conditional Community Partner Dropdown */}
        {formData.hasCoHost && (
          <div className="space-y-2 ml-6">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Community Partner *
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
                  className={`w-full justify-between ${errors.communityPartnerId ? 'border-red-500' : ''}`}
                  disabled={loading}
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
                          setFormData({
                            ...formData,
                            communityPartnerId: partner.id,
                          });
                          setCommunityPartnerOpen(false);
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            formData.communityPartnerId === partner.id
                              ? 'opacity-100'
                              : 'opacity-0'
                          }`}
                        />
                        {partner.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.communityPartnerId && (
              <p className="text-sm text-red-500">
                {errors.communityPartnerId}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
