import { ExternalLink } from 'lucide-react'

// Inline SVG icons for each supported platform
const ICONS = {
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34l-.01-8.83a8.2 8.2 0 004.79 1.53V4.55a4.85 4.85 0 01-1.01-.14z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
}

const PLATFORM_META = {
  youtube:   { label: 'YouTube',   color: '#FF0000', bg: 'rgba(255,0,0,0.08)' },
  facebook:  { label: 'Facebook',  color: '#1877F2', bg: 'rgba(24,119,242,0.08)' },
  instagram: { label: 'Instagram', color: '#C13584', bg: 'rgba(193,53,132,0.08)' },
  tiktok:    { label: 'TikTok',    color: '#161823', bg: 'rgba(22,24,35,0.07)' },
  twitter:   { label: 'X',         color: '#000000', bg: 'rgba(0,0,0,0.07)' },
}

function detectPlatform(source, sourceUrl) {
  const s = (source ?? '').toLowerCase().trim()
  const url = (sourceUrl ?? '').toLowerCase()

  if (s === 'youtube' || s === 'yt' || url.includes('youtube.com') || url.includes('youtu.be'))
    return 'youtube'
  if (s === 'facebook' || s === 'fb' || url.includes('facebook.com') || url.includes('fb.watch'))
    return 'facebook'
  if (s === 'instagram' || s === 'ig' || url.includes('instagram.com'))
    return 'instagram'
  if (s === 'tiktok' || s === 'tt' || url.includes('tiktok.com'))
    return 'tiktok'
  if (s === 'twitter' || s === 'x' || url.includes('twitter.com') || url.includes('x.com'))
    return 'twitter'

  return null
}

/**
 * SourceBadge — displays the platform origin of an imported recipe.
 *
 * variant="icon"  — small circular icon badge (for RecipeCard)
 * variant="pill"  — icon + label + external link arrow (for RecipeDetailPage)
 */
export default function SourceBadge({ source, sourceUrl, variant = 'icon' }) {
  const platform = detectPlatform(source, sourceUrl)

  // Nothing to show if source is entirely unknown and no URL provided
  if (!platform && !sourceUrl) return null

  const meta = platform ? PLATFORM_META[platform] : { label: 'Source', color: '#888', bg: 'rgba(0,0,0,0.06)' }
  const icon = platform ? ICONS[platform] : null

  if (variant === 'pill') {
    const pill = (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-opacity hover:opacity-80"
        style={{ backgroundColor: meta.bg, color: meta.color }}
      >
        {icon && (
          <span className="h-3.5 w-3.5 shrink-0 flex items-center">
            {icon}
          </span>
        )}
        <span>View on {meta.label}</span>
        <ExternalLink size={10} strokeWidth={2.5} className="shrink-0 opacity-70" />
      </span>
    )

    if (sourceUrl) {
      return (
        <a
          href={sourceUrl}
          onClick={(e) => e.stopPropagation()}
          rel="noopener noreferrer"
          target="_blank"
          title={`View original on ${meta.label}`}
        >
          {pill}
        </a>
      )
    }

    return pill
  }

  // variant="icon" — compact circular badge
  const badge = (
    <span
      className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full transition-transform hover:scale-110"
      style={{ backgroundColor: meta.bg, color: meta.color }}
      title={meta.label}
    >
      {icon ? (
        <span className="h-[13px] w-[13px] flex items-center">{icon}</span>
      ) : (
        <ExternalLink size={11} strokeWidth={2.5} />
      )}
    </span>
  )

  if (sourceUrl) {
    return (
      <a
        href={sourceUrl}
        onClick={(e) => e.stopPropagation()}
        rel="noopener noreferrer"
        target="_blank"
        title={`View on ${meta.label}`}
      >
        {badge}
      </a>
    )
  }

  return badge
}
