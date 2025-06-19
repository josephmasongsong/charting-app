import {
  Card,
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Users, TrendingUp } from 'lucide-react';

export default async function AsyncActions() {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          This could be another parallel route @actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Button className="w-full justify-start" variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Manage Users
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <ShoppingCart className="mr-2 h-4 w-4" />
            View Orders
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <TrendingUp className="mr-2 h-4 w-4" />
            Analytics Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
