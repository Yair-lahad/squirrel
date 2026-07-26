// Shared text input styling — pairs with Select/Button for a consistent
// form look wherever it's dropped in.
export default function Input({ className, ...props }) {
  return <input className={['input', className].filter(Boolean).join(' ')} {...props} />;
}
