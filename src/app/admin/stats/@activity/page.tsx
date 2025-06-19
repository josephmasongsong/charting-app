import { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from '@/components/ui/card';
import { DollarSign, User, Calendar, Bell, Activity } from 'lucide-react';

const activityData = [
  {
    id: 1,
    type: 'sale',
    message: 'New order #12345 completed',
    user: 'John Doe',
    time: '2 minutes ago',
    amount: '$125.00',
  },
  {
    id: 2,
    type: 'user',
    message: 'New user registration',
    user: 'Sarah Wilson',
    time: '5 minutes ago',
  },
  {
    id: 3,
    type: 'update',
    message: 'Product inventory updated',
    user: 'System',
    time: '10 minutes ago',
  },
  {
    id: 4,
    type: 'sale',
    message: 'Order #12344 shipped',
    user: 'Mike Johnson',
    time: '15 minutes ago',
    amount: '$89.99',
  },
  {
    id: 5,
    type: 'alert',
    message: 'Low stock alert: Wireless Headphones',
    user: 'System',
    time: '1 hour ago',
  },
];

function ActivityFeed() {
  const getActivityIcon = (type: ReactNode) => {
    switch (type) {
      case 'sale':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'user':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'update':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'alert':
        return <Bell className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest updates and activities from your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityData.map(activity => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {activity.message}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-muted-foreground">
                    by {activity.user}
                  </p>
                  <span className="text-xs text-muted-foreground">•</span>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
                {activity.amount && (
                  <p className="text-sm font-semibold text-green-600 mt-1">
                    {activity.amount}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AsyncActivityFeed() {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return <ActivityFeed />;
}
