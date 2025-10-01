// @/components/reports/monthly/types.ts

export interface ActivityTypeByRegion {
  activityTypeId: string;
  activityTypeName: string;
  programGoalName: string;
  region: string;
  eventCount: number;
  participantsServed: number;
  newParticipants: number;
  returningParticipants: number;
  totalAdminDuration: number;
  totalCost: number;
}

export interface ProgramGoalSummary {
  id: string;
  name: string;
  activityCount: number;
  color: string;
}

export interface ActivityTypeParticipation {
  id: string;
  name: string;
  participantCount: number;
  eventCount: number;
  color: string;
}

export interface MonthlyParticipantGrowth {
  region: string;
  currentMonthParticipants: number;
  previousMonthParticipants: number;
  growthRate: number;
  growthType: 'growth' | 'decline' | 'stable';
}

export interface MonthlyEventGrowth {
  region: string;
  currentMonthEvents: number;
  previousMonthEvents: number;
  growthRate: number;
  growthType: 'growth' | 'decline' | 'stable';
}

export interface MonthlyCostGrowth {
  currentMonthCost: number;
  previousMonthCost: number;
  growthRate: number;
  growthType: 'growth' | 'decline' | 'stable';
}

export interface RegionalCostGrowth {
  region: string;
  currentMonthCost: number;
  previousMonthCost: number;
  growthRate: number;
  growthType: 'growth' | 'decline' | 'stable';
}

export interface SupplyDistributionSummary {
  supplyId: string;
  supplyName: string;
  totalQuantityDistributed: number;
  totalCost: number;
  distributionCount: number;
}

export interface MonthlySupplyDistributionGrowth {
  currentMonthQuantity: number;
  previousMonthQuantity: number;
  growthRate: number;
  growthType: 'growth' | 'decline' | 'stable';
}

export interface SitePerformance {
  siteName: string;
  eventCount: number;
  participantCount: number;
  utilizationRate: number;
}

export interface MonthlyActivityReportData {
  reportMonth: string;
  totalEvents: number;
  totalParticipants: number;
  totalNewParticipants: number;
  totalReturningParticipants: number;
  totalCost: number;
  totalEventDuration: number;
  totalAdminDuration: number;
  activityTypesByRegion: ActivityTypeByRegion[];
  programGoals: ProgramGoalSummary[];
  activityTypesParticipation: ActivityTypeParticipation[];
  monthlyParticipantGrowth: MonthlyParticipantGrowth[];
  monthlyEventGrowth: MonthlyEventGrowth[];
  monthlyCostGrowth: MonthlyCostGrowth;
  regionalCostGrowth: RegionalCostGrowth[];
  supplyDistributions: SupplyDistributionSummary[];
  monthlySupplyDistributionGrowth: MonthlySupplyDistributionGrowth;
  sitePerformance: SitePerformance[];
  regions: string[];
  availableDateRange: { minDate: string; maxDate: string };
}

export interface MonthlyActivityReportProps {
  data: MonthlyActivityReportData;
  currentParams: {
    startYear: number;
    startMonth: number;
    endYear?: number;
    endMonth?: number;
  };
}
