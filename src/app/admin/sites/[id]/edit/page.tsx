import SiteForm from '../../components/SiteForm';

interface EditSitePageProps {
  params: {
    id: string;
  };
}

export default function EditSitePage({ params }: EditSitePageProps) {
  return <SiteForm mode="edit" siteId={params.id} />;
}
