import { ArrowLeft, Link2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { importRecipeFromLink } from '../services/recipeService'

const STAGE_MESSAGES = {
  video_download_failed: "Couldn't retrieve this link. Check the URL and try again.",
  transcription_failed: 'Transcription failed. The source may not contain spoken content.',
  recipe_extraction_failed: "Couldn't extract a recipe. The content may not describe a recipe.",
}

function isValidUrl(value) {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export default function RecipeImportPage() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')

  function handleUrlChange(e) {
    setUrl(e.target.value)
    if (urlError) setUrlError('')
    if (importError) setImportError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!url.trim()) {
      setUrlError('Paste a link to get started.')
      return
    }
    if (!isValidUrl(url)) {
      setUrlError('Please enter a valid https:// link.')
      return
    }

    setImporting(true)
    setImportError('')

    try {
      const draft = await importRecipeFromLink(url.trim())
      navigate('/recipe/new', { state: { draft } })
    } catch (err) {
      const raw = err?.message ?? ''
      const knownMessage = Object.entries(STAGE_MESSAGES).find(([code]) =>
        raw.toLowerCase().includes(code.replace(/_/g, ' ')) ||
        raw.includes(code),
      )
      setImportError(knownMessage ? knownMessage[1] : (raw || 'Import failed. Please try a different link.'))
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg min-h-screen bg-cream pb-28">
      <div className="flex items-center justify-between px-4 pb-4 pt-5">
        <button
          aria-label="Back"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-linen bg-white text-espresso shadow-sm"
          onClick={() => navigate('/')}
          type="button"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-display text-lg text-espresso">Import from Link</h1>
        <div aria-hidden="true" className="h-10 w-10" />
      </div>

      <div className="px-4 pt-4 space-y-6">
        <div className="rounded-3xl border border-linen bg-white p-5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-olive/15 text-olive">
            <Link2 size={22} />
          </div>
          <h2 className="font-display text-xl text-espresso">Paste a video or recipe link</h2>
          <p className="mt-1 text-sm text-taupe">
            Works with YouTube and Facebook cooking videos. The AI will extract
            the recipe for you to review before saving.
          </p>
        </div>

        <form className="space-y-4" noValidate onSubmit={handleSubmit}>
          <div>
            <label className="sr-only" htmlFor="source-url">Recipe URL</label>
            <input
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className={`w-full rounded-2xl border px-4 py-3.5 text-sm text-espresso outline-none transition focus:ring-2 ${
                urlError
                  ? 'border-red-300 bg-red-50 focus:ring-red-300/40'
                  : 'border-linen bg-white focus:ring-paprika/40'
              }`}
              disabled={importing}
              id="source-url"
              onChange={handleUrlChange}
              placeholder="https://youtube.com/watch?v=... or facebook.com/..."
              spellCheck={false}
              type="url"
              value={url}
            />
            {urlError && (
              <p className="mt-1.5 px-1 text-xs text-red-600">{urlError}</p>
            )}
          </div>

          {importError && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <span className="flex-1">{importError}</span>
              <button
                className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-red-700 shadow-sm"
                onClick={() => setImportError('')}
                type="button"
              >
                Retry
              </button>
            </div>
          )}

          <button
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-paprika py-4 text-sm font-semibold text-white shadow-md shadow-paprika/30 transition active:scale-[0.98] disabled:opacity-60"
            disabled={importing}
            type="submit"
          >
            {importing ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Importing…
              </>
            ) : (
              'Import Recipe'
            )}
          </button>
        </form>

        {importing && (
          <p className="text-center text-xs text-taupe">
            This can take up to a minute for longer videos.
          </p>
        )}
      </div>
    </div>
  )
}
