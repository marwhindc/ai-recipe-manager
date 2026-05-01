import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import AddRecipeSheet from './AddRecipeSheet'
import BottomNav from './BottomNav'

const HIDE_CHROME_PATTERNS = [
  /^\/recipe\/[^/]+$/,
  /^\/recipe\/new$/,
  /^\/recipe\/import$/,
  /^\/recipe\/[^/]+\/edit$/
]

const FAB_PATTERNS = [/^\/$/]

export default function AppShell({ children }) {
  const { pathname } = useLocation()
  const [sheetOpen, setSheetOpen] = useState(false)

  const hideTabs = HIDE_CHROME_PATTERNS.some((pattern) => pattern.test(pathname))
  const showFab = FAB_PATTERNS.some((pattern) => pattern.test(pathname))

  return (
    <div className="app-backdrop">
      <div className="app-column flex min-h-screen flex-col">
        <main
          className={`no-scrollbar flex-1 overflow-x-hidden overflow-y-auto ${hideTabs ? 'pb-6' : 'pb-28'}`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {children}
        </main>

        {showFab && (
          <button
            aria-label="Add recipe"
            className="absolute right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-paprika text-white shadow-lg shadow-paprika/30 transition hover:scale-105 active:scale-95"
            onClick={() => setSheetOpen(true)}
            style={{ bottom: hideTabs ? 24 : 84 }}
            type="button"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        )}

        {!hideTabs && <BottomNav />}

        <AddRecipeSheet onOpenChange={setSheetOpen} open={sheetOpen} />
      </div>
    </div>
  )
}