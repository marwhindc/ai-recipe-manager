import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from './AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, '')

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const hasOAuthError = searchParams.get('error') === 'oauth'
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && user) {
      window.location.href = '/'
    }
  }, [user, isLoading])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-cream">
      {/* Soft background radial glow — matches app-backdrop in index.css */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 60% 5%, hsl(38 70% 88% / 0.55), transparent 60%), radial-gradient(45% 40% at 10% 90%, hsl(14 60% 88% / 0.4), transparent 55%)',
        }}
      />

      <div className="relative w-full max-w-xs flex flex-col items-center gap-8">
        {/* App icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-saffron to-paprika flex items-center justify-center shadow-lg shadow-paprika/20">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            {/* Bowl with steam — table / gathering motif */}
            <path d="M4 11 C4 16.5 20 16.5 20 11" />
            <line x1="12" y1="11" x2="12" y2="17" />
            <line x1="4" y1="19" x2="20" y2="19" />
            <path d="M9 7 C9 5 10 4 10 3" />
            <path d="M13 7 C13 5 14 4 14 3" />
          </svg>
        </div>

        {/* Wordmark + tagline */}
        <div className="text-center space-y-1.5">
          <h1 className="font-display text-4xl font-bold tracking-tight text-espresso">
            Hapag
          </h1>
          <p className="font-sans text-sm text-taupe">
            Gather. Cook. Remember.
          </p>
        </div>

        {/* Error banner */}
        {hasOAuthError && (
          <div className="w-full rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 text-center">
            Sign-in failed. Please try again.
          </div>
        )}

        {/* Sign-in button */}
        <div className="w-full space-y-3">
          <a
            href={`${BACKEND_ORIGIN}/oauth2/authorization/google`}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white border border-linen shadow-sm px-5 py-3.5 font-sans text-sm font-semibold text-espresso hover:bg-parchment active:scale-[0.98] transition-all"
          >
            <GoogleIcon />
            Continue with Google
          </a>
          <p className="text-center font-sans text-xs text-taupe/70">
            By continuing, you agree to our terms of service
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}
