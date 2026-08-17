type Props = {
  href: string;
  title?: string;
  label?: string;
};

/** Hide raw URLs behind a quiet “More info” control. */
export function MoreInfoLink({
  href,
  title,
  label = "Link for more info",
}: Props) {
  return (
    <a
      className="more-info-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title || href}
    >
      {label}
      <span className="sr-only">
        {title ? `: ${title}` : ""} (opens in new tab)
      </span>
    </a>
  );
}

type SourceListProps = {
  sources: Array<{ source_id: string; title: string; url: string }>;
};

export function SourceMoreInfoList({ sources }: SourceListProps) {
  if (!sources.length) return null;
  return (
    <ul className="source-more-list">
      {sources.map((source) => (
        <li key={source.source_id}>
          <span className="source-more-title">{source.title}</span>
          <MoreInfoLink href={source.url} title={source.title} />
        </li>
      ))}
    </ul>
  );
}
