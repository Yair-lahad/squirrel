// Shared button — variant picks the visual treatment, everything else
// (type, onClick, disabled, ...) passes straight through to <button>.
export default function Button({ variant = 'primary', className, ...props }) {
  const classes = ['btn', `btn-${variant}`, className].filter(Boolean).join(' ');
  return <button className={classes} {...props} />;
}
