/** Compact star rating display. */
export default function Rating({ value = 0, count, size = 'sm' }) {
  const full = Math.round(value)
  const dim = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <span className="inline-flex items-center gap-1 text-amber-500" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={dim} viewBox="0 0 20 20" fill={i <= full ? 'currentColor' : 'none'} stroke="currentColor">
          <path
            strokeWidth="1.5"
            d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.36 4.18a1 1 0 00.95.69h4.4c.96 0 1.36 1.23.58 1.8l-3.56 2.59a1 1 0 00-.36 1.12l1.36 4.18c.3.92-.76 1.68-1.54 1.12l-3.56-2.59a1 1 0 00-1.18 0l-3.56 2.59c-.78.56-1.84-.2-1.54-1.12l1.36-4.18a1 1 0 00-.36-1.12L1.14 9.6c-.78-.57-.38-1.8.58-1.8h4.4a1 1 0 00.95-.69L9.05 2.93z"
          />
        </svg>
      ))}
      {count != null && <span className="text-xs text-slate-400">({count})</span>}
    </span>
  )
}
