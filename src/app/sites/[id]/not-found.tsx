import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Site Not Found</CardTitle>
            <CardDescription>
              The site you're looking for doesn't exist or may have been
              removed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Link href="/sites">
                <Button className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sites
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
