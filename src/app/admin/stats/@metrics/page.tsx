import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import {
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  DollarSign,
  Users,
  Activity,
} from 'lucide-react';

type LucideIcon = React.FC<React.SVGProps<SVGSVGElement>>;

const metricsData = [
  {
    title: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1%',
    trend: 'up',
    icon: DollarSign,
    description: 'from last month',
  },
  {
    title: 'Active Users',
    value: '2,350',
    change: '+180.1%',
    trend: 'up',
    icon: Users,
    description: 'from last month',
  },
  {
    title: 'Units Sold',
    value: '12,234',
    change: '-19%',
    trend: 'down',
    icon: ShoppingCart,
    description: 'from last month',
  },
  {
    title: 'Conversion Rate',
    value: '3.2%',
    change: '+2.5%',
    trend: 'up',
    icon: Activity,
    description: 'from last week',
  },
];

// Metrics Widget Component
function MetricsWidget({
  title,
  value,
  change,
  trend,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  change: string;
  trend: string;
  icon: LucideIcon;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          {trend === 'up' ? (
            <ArrowUpRight className="h-3 w-3 text-green-500" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-500" />
          )}
          <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
            {change}
          </span>
          <span>{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Async components that simulate data fetching
export default async function AsyncMetrics() {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricsData.map((metric, index) => (
        <MetricsWidget
          key={index}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          trend={metric.trend}
          icon={metric.icon}
          description={metric.description}
        />
      ))}
    </div>
  );
}
