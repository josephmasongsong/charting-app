// app/admin/page.tsx
'use client';
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Target,
  MapPin,
  Activity,
  Package,
  BarChart3,
  Settings,
  Truck,
  Calendar,
  Building,
} from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        {/* <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Administrative Dashboard</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive system management and configuration tools
          </p>
        </div> */}

        {/* Resource Management Section */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Navigation</CardTitle>
            <CardDescription>
              Common tasks and resource management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/events/new">
                <Button className="h-20 w-full flex flex-col gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm">New Event</span>
                </Button>
              </a>

              <a href="/admin/supply-distributions/new">
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col gap-2"
                >
                  <Truck className="h-5 w-5" />
                  <span className="text-sm">Log Distribution</span>
                </Button>
              </a>

              <a href="/admin/sites">
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col gap-2"
                >
                  <Building className="h-5 w-5" />
                  <span className="text-sm">Manage Sites</span>
                </Button>
              </a>

              <a href="/reports/monthly">
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col gap-2"
                >
                  <Target className="h-5 w-5" />
                  <span className="text-sm">View Reports</span>
                </Button>
              </a>

              <a href="/admin/users">
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col gap-2"
                >
                  <Users className="h-5 w-5" />
                  <span className="text-sm">Users</span>
                </Button>
              </a>

              <a href="/admin/program-goals">
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col gap-2"
                >
                  <Target className="h-5 w-5" />
                  <span className="text-sm">Program Goals</span>
                </Button>
              </a>

              <a href="/admin/activity-types">
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col gap-2"
                >
                  <Activity className="h-5 w-5" />
                  <span className="text-sm">Activity Types</span>
                </Button>
              </a>

              <a href="/admin/community-partners">
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col gap-2"
                >
                  <Users className="h-5 w-5" />
                  <span className="text-sm">Community Partners</span>
                </Button>
              </a>

              <a href="/admin/supplies">
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col gap-2"
                >
                  <Package className="h-5 w-5" />
                  <span className="text-sm">Supplies</span>
                </Button>
              </a>

              <a href="/admin/supply-distributions">
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col gap-2"
                >
                  <Truck className="h-5 w-5" />
                  <span className="text-sm">Distributions</span>
                </Button>
              </a>

              <a href="/admin/events">
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col gap-2"
                >
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm">Events</span>
                </Button>
              </a>

              <a href="/admin/settings">
                <Button
                  variant="outline"
                  className="h-20 w-full flex flex-col gap-2"
                >
                  <Settings className="h-5 w-5" />
                  <span className="text-sm">Settings</span>
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
