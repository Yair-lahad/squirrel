// Two overlapping gold coins — used for smaller amounts, where a stack of
// bills would overstate it. Fixed gold tones, matching CashStackIcon's fixed
// green rather than inheriting currentColor.
export default function CoinsIcon({ size = 16, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="9" cy="15.5" r="6" fill="#ffca28" stroke="#f9a825" strokeWidth="1" />
      <circle cx="9" cy="15.5" r="3.6" fill="none" stroke="#f9a825" strokeWidth="1" />
      <circle cx="15.5" cy="8.5" r="6" fill="#ffd54f" stroke="#f9a825" strokeWidth="1" />
      <circle cx="15.5" cy="8.5" r="3.6" fill="none" stroke="#f9a825" strokeWidth="1" />
    </svg>
  );
}
