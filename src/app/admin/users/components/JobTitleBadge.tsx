interface JobTitleBadgeProps {
  jobTitle?: string;
}

const shortTitles = {
  'Tenant Engagement Worker': 'TEW',
  'People Plants & Homes': 'PPH',
  'Tenant Support Worker': 'TSW',
  'Health Services Manager': 'HSM',
} as const;

export default function JobTitleBadge({ jobTitle }: JobTitleBadgeProps) {
  if (!jobTitle) {
    return (
      <span data-slot="job-title-badge" className="text-[14.5px] text-(--text-muted)">
        N/A
      </span>
    );
  }

  return (
    <span
      data-slot="job-title-badge"
      title={jobTitle}
      className="text-[14.5px] whitespace-nowrap text-(--text-muted)"
    >
      {shortTitles[jobTitle as keyof typeof shortTitles] || jobTitle}
    </span>
  );
}
