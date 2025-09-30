// @/components/reports/monthly/GrowthIndicators.tsx

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const getGrowthIcon = (growthType: string) => {
  switch (growthType) {
    case 'growth':
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case 'decline':
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    default:
      return <Minus className="h-4 w-4 text-gray-500" />;
  }
};

export const getGrowthColor = (growthType: string) => {
  switch (growthType) {
    case 'growth':
      return 'text-green-600';
    case 'decline':
      return 'text-red-600';
    default:
      return 'text-gray-500';
  }
};

export const getCostGrowthIcon = (growthType: string) => {
  switch (growthType) {
    case 'growth':
      return <TrendingUp className="h-4 w-4 text-red-600" />;
    case 'decline':
      return <TrendingDown className="h-4 w-4 text-green-600" />;
    default:
      return <Minus className="h-4 w-4 text-gray-500" />;
  }
};

export const getCostGrowthColor = (growthType: string) => {
  switch (growthType) {
    case 'growth':
      return 'text-red-600';
    case 'decline':
      return 'text-green-600';
    default:
      return 'text-gray-500';
  }
};
