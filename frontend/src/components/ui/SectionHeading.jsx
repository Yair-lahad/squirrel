// Shared section headline — same look wherever a panel/table/grid needs a
// plain title (Categories, Add a rule, Rules, ...).
export default function SectionHeading({ children, className, ...props }) {
  const classes = ['section-heading', className].filter(Boolean).join(' ');
  return (
    <h2 className={classes} {...props}>
      {children}
    </h2>
  );
}
