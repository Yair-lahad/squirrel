// Shared select styling — pairs with Input/Button for a consistent form
// look wherever it's dropped in.
export default function Select({ className, children, ...props }) {
  return (
    <select className={['select', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </select>
  );
}
