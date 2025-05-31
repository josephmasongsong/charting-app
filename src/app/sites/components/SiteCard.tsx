import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Eye } from 'lucide-react';
import Link from 'next/link';

interface Site {
  id: string;
  name: string;
  address: string;
  numberOfTenants: number;
  hasCommunityPartner: boolean;
  communityPartnerName: string | null;
  userName: string;
}

interface SiteCardProps {
  site: Site;
}

export default function SiteCard({ site }: SiteCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {site.name}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {site.address}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline">
            {site.numberOfTenants}{' '}
            {site.numberOfTenants === 1 ? 'Tenant' : 'Tenants'}
          </Badge>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Manager:</p>
          <p className="text-sm font-medium">{site.userName}</p>
        </div>

        {site.hasCommunityPartner && site.communityPartnerName && (
          <div>
            <p className="text-sm text-muted-foreground">Community Partner:</p>
            <Badge variant="secondary" className="text-xs">
              {site.communityPartnerName}
            </Badge>
          </div>
        )}

        <Link href={`/sites/${site.id}`}>
          <Button className="w-full" variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
