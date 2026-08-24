import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const getGrowthIcon = (growthType: string) => {
  switch (growthType) {
    case 'growth':
      return <TrendingUp className="h-4 w-4 text-(--success)" />;
    case 'decline':
      return <TrendingDown className="h-4 w-4 text-(--danger)" />;
    default:
      return <Minus className="h-4 w-4 text-(--text-muted)" />;
  }
};

export const getGrowthColor = (growthType: string) => {
  switch (growthType) {
    case 'growth':
      return 'text-(--success)';
    case 'decline':
      return 'text-(--danger)';
    default:
      return 'text-(--text-muted)';
  }
};

export const getCostGrowthIcon = (growthType: string) => {
  switch (growthType) {
    case 'growth':
      return <TrendingUp className="h-4 w-4 text-(--danger)" />;
    case 'decline':
      return <TrendingDown className="h-4 w-4 text-(--success)" />;
    default:
      return <Minus className="h-4 w-4 text-(--text-muted)" />;
  }
};

export const getCostGrowthColor = (growthType: string) => {
  switch (growthType) {
    case 'growth':
      return 'text-(--danger)';
    case 'decline':
      return 'text-(--success)';
    default:
      return 'text-(--text-muted)';
  }
};
