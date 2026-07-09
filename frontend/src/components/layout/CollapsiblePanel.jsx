export default function CollapsiblePanel({ title, defaultOpen = true, children }) {
  return (
    <details className="panel" open={defaultOpen}>
      <summary>{title}</summary>
      <div className="panel-body">{children}</div>
    </details>
  );
}
