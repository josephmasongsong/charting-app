import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';

const tableData = [
  {
    id: '1',
    product: 'Wireless Headphones',
    status: 'Active',
    sales: 1234,
    revenue: '$12,340',
    category: 'Electronics',
  },
  {
    id: '2',
    product: 'Smart Watch',
    status: 'Active',
    sales: 856,
    revenue: '$25,680',
    category: 'Electronics',
  },
  {
    id: '3',
    product: 'Coffee Maker',
    status: 'Inactive',
    sales: 432,
    revenue: '$8,640',
    category: 'Home',
  },
  {
    id: '4',
    product: 'Running Shoes',
    status: 'Active',
    sales: 678,
    revenue: '$13,560',
    category: 'Sports',
  },
  {
    id: '5',
    product: 'Backpack',
    status: 'Active',
    sales: 234,
    revenue: '$4,680',
    category: 'Accessories',
  },
];

function ProductsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Products Overview</CardTitle>
        <CardDescription>
          Manage your products and view their sales performance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Product</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Sales</th>
                <th className="text-left p-4 font-medium">Revenue</th>
                <th className="text-left p-4 font-medium">Category</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map(item => (
                <tr key={item.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 font-medium">{item.product}</td>
                  <td className="p-4">
                    <Badge
                      variant={
                        item.status === 'Active' ? 'default' : 'secondary'
                      }
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td className="p-4">{item.sales.toLocaleString()}</td>
                  <td className="p-4 font-medium">{item.revenue}</td>
                  <td className="p-4">{item.category}</td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AsyncProductsTable() {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  return <ProductsTable />;
}
