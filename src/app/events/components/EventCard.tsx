import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Eye, MapPin } from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  eventDate: string;
  activityTypeName: string | null;
  siteName: string | null;
  userName: string | null;
}

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.eventDate);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {event.title}
        </CardTitle>
        <CardDescription>{formattedDate}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{event.siteName || 'Unknown Site'}</span>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Activity Type:</p>
          <Badge variant="outline" className="text-xs">
            {event.activityTypeName || 'Unknown Activity'}
          </Badge>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Organizer:</p>
          <p className="text-sm font-medium">
            {event.userName || 'Unknown Organizer'}
          </p>
        </div>

        <Link href={`/events/${event.id}`}>
          <Button className="w-full" variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
