import SiteForm from '../../components/SiteForm';

interface EditSitePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSitePage({ params }: EditSitePageProps) {
  const { id } = await params;
  return <SiteForm mode="edit" siteId={id} />;
}
