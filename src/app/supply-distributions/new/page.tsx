// app/supply-distributions/new/page.tsx
import SupplyDistributionForm from '../components/SupplyDistributionForm';

export default function NewSupplyDistributionPage() {
  return <SupplyDistributionForm />;
}

export async function generateMetadata() {
  return {
    title: 'Log New Supply Distribution',
    description:
      'Record a new supply distribution to tenants and community members',
  };
}
