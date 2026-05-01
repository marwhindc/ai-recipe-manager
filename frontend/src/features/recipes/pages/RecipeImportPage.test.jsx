import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import RecipeImportPage from './RecipeImportPage'
import * as recipeService from '../services/recipeService'

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useNavigate: () => mockNavigate }
})

// Mock recipeService
vi.mock('../services/recipeService', () => ({
  importRecipeFromLink: vi.fn(),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <RecipeImportPage />
    </MemoryRouter>,
  )
}

const DRAFT = {
  title: 'Pasta Carbonara',
  description: 'A classic Roman pasta dish.',
  ingredients: [{ name: 'Pasta', quantity: '200', unit: 'g' }],
  steps: [{ order: 1, instruction: 'Boil pasta.' }],
  cuisine: 'Italian',
  servings: 2,
  prepTimeMinutes: 10,
  cookTimeMinutes: 15,
  imageUrl: 'https://img.youtube.com/vi/abc/maxresdefault.jpg',
  sourceUrl: 'https://www.youtube.com/watch?v=abc',
  source: 'youtube',
}

describe('RecipeImportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the import form', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /import recipe/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/recipe url/i)).toBeInTheDocument()
  })

  describe('client-side URL validation', () => {
    it('blocks empty submission', async () => {
      renderPage()
      fireEvent.click(screen.getByRole('button', { name: /import recipe/i }))
      expect(await screen.findByText(/paste a link to get started/i)).toBeInTheDocument()
      expect(recipeService.importRecipeFromLink).not.toHaveBeenCalled()
    })

    it('blocks an invalid URL', async () => {
      renderPage()
      fireEvent.change(screen.getByLabelText(/recipe url/i), {
        target: { value: 'not-a-url' },
      })
      fireEvent.click(screen.getByRole('button', { name: /import recipe/i }))
      expect(await screen.findByText(/valid https:\/\/ link/i)).toBeInTheDocument()
      expect(recipeService.importRecipeFromLink).not.toHaveBeenCalled()
    })

    it('clears URL error when user starts typing', async () => {
      renderPage()
      fireEvent.click(screen.getByRole('button', { name: /import recipe/i }))
      expect(await screen.findByText(/paste a link/i)).toBeInTheDocument()
      await userEvent.type(screen.getByLabelText(/recipe url/i), 'h')
      expect(screen.queryByText(/paste a link/i)).not.toBeInTheDocument()
    })
  })

  describe('successful import', () => {
    it('calls importRecipeFromLink and navigates with draft state', async () => {
      recipeService.importRecipeFromLink.mockResolvedValue(DRAFT)
      renderPage()
      await userEvent.type(
        screen.getByLabelText(/recipe url/i),
        'https://www.youtube.com/watch?v=abc',
      )
      fireEvent.click(screen.getByRole('button', { name: /import recipe/i }))
      await waitFor(() => {
        expect(recipeService.importRecipeFromLink).toHaveBeenCalledWith(
          'https://www.youtube.com/watch?v=abc',
        )
        expect(mockNavigate).toHaveBeenCalledWith('/recipe/new', { state: { draft: DRAFT } })
      })
    })
  })

  describe('import error handling', () => {
    it('shows video_download_failed message', async () => {
      recipeService.importRecipeFromLink.mockRejectedValue(
        new Error('video_download_failed'),
      )
      renderPage()
      await userEvent.type(
        screen.getByLabelText(/recipe url/i),
        'https://www.youtube.com/watch?v=abc',
      )
      fireEvent.click(screen.getByRole('button', { name: /import recipe/i }))
      expect(
        await screen.findByText(/couldn't retrieve this link/i),
      ).toBeInTheDocument()
    })

    it('shows transcription_failed message', async () => {
      recipeService.importRecipeFromLink.mockRejectedValue(
        new Error('transcription_failed'),
      )
      renderPage()
      await userEvent.type(
        screen.getByLabelText(/recipe url/i),
        'https://www.youtube.com/watch?v=abc',
      )
      fireEvent.click(screen.getByRole('button', { name: /import recipe/i }))
      expect(
        await screen.findByText(/transcription failed/i),
      ).toBeInTheDocument()
    })

    it('shows recipe_extraction_failed message', async () => {
      recipeService.importRecipeFromLink.mockRejectedValue(
        new Error('recipe_extraction_failed'),
      )
      renderPage()
      await userEvent.type(
        screen.getByLabelText(/recipe url/i),
        'https://www.youtube.com/watch?v=abc',
      )
      fireEvent.click(screen.getByRole('button', { name: /import recipe/i }))
      expect(
        await screen.findByText(/couldn't extract a recipe/i),
      ).toBeInTheDocument()
    })

    it('retry button clears the error', async () => {
      recipeService.importRecipeFromLink.mockRejectedValue(new Error('video_download_failed'))
      renderPage()
      await userEvent.type(
        screen.getByLabelText(/recipe url/i),
        'https://www.youtube.com/watch?v=abc',
      )
      fireEvent.click(screen.getByRole('button', { name: /import recipe/i }))
      await screen.findByText(/couldn't retrieve this link/i)
      fireEvent.click(screen.getByRole('button', { name: /retry/i }))
      expect(screen.queryByText(/couldn't retrieve this link/i)).not.toBeInTheDocument()
    })
  })
})
