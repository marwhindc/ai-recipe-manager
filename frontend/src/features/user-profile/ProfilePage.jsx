import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useAuth } from '../user-auth/AuthContext'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [avatarError, setAvatarError] = useState(false)

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <div className="space-y-6 pb-28">
      <header className="px-6 pt-6 pb-6 bg-gradient-to-b from-saffron/20 to-transparent">
        <div className="flex justify-between items-start mb-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-espresso">
            Profile
          </h1>
        </div>

        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md bg-parchment flex items-center justify-center flex-shrink-0">
            {user?.avatarUrl && !avatarError ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="font-display text-2xl font-semibold text-taupe">{initials}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-semibold text-espresso truncate">
              {user?.displayName}
            </h2>
          </div>
        </div>
      </header>

      <div className="px-6">
        <div className="bg-white rounded-[1.5rem] border border-linen shadow-sm overflow-hidden">
          <button
            onClick={logout}
            className="w-full p-4 flex items-center gap-3 text-red-500 hover:bg-neutral-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
              <LogOut size={16} />
            </div>
            <span className="font-sans font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}
