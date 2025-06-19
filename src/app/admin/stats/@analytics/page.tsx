import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function AsyncAnalytics() {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Overview</CardTitle>
        <CardDescription>
          This could be another parallel route @analytics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Page Views</span>
            <span className="font-medium">12,345</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Bounce Rate</span>
            <span className="font-medium">23.5%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Session Duration</span>
            <span className="font-medium">2m 45s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
