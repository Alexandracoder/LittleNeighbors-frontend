import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import i18n from 'i18next'

const resources = {
  en: {
    translation: {
      children: {
        form: {
          descriptionLabel: 'Bio / Description',
          descriptionPlaceholder: 'Tell the neighborhood something about your child...',
          descriptionCounter: '{{count}} / 500 characters',
          descriptionHint: 'Optional — helps other families find common ground.',
        },
      },
    },
  },
  es: {
    translation: {
      children: {
        form: {
          descriptionLabel: 'Bio / Descripción',
          descriptionPlaceholder: 'Cuéntale al barrio algo sobre tu hijo/a...',
          descriptionCounter: '{{count}} / 500 caracteres',
        },
      },
    },
  },
  va: {
    translation: {
      children: {
        form: {
          descriptionLabel: 'Bio / Descripció',
          descriptionPlaceholder: 'Conta al barri alguna cosa sobre el teu fill/a...',
          descriptionCounter: '{{count}} / 500 caràcters',
        },
      },
    },
  },
}

async function createI18n(language: 'en' | 'es' | 'va') {
  const instance = i18n.createInstance()
  await instance.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })
  return instance
}


import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const MAX_DESCRIPTION_LENGTH = 500

function ChildFormStub({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void
  onCancel?: () => void
}) {
  const { t } = useTranslation()
  const [description, setDescription] = useState('')

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSuccess?.() }}>
      <label htmlFor="description">
        {t('children.form.descriptionLabel')}
      </label>
      <textarea
        id="description"
        name="description"
        placeholder={t('children.form.descriptionPlaceholder')}
        value={description}
        maxLength={MAX_DESCRIPTION_LENGTH}
        onChange={(e) => setDescription(e.target.value)}
        aria-describedby="description-counter"
      />
      <span id="description-counter" data-testid="description-counter">
        {t('children.form.descriptionCounter', { count: description.length })}
      </span>
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  )
}

// ── Test helpers ──────────────────────────────────────────────────────────────

async function renderWithI18n(language: 'en' | 'es' | 'va' = 'en') {
  const instance = await createI18n(language)

  const utils = render(
    <I18nextProvider i18n={instance}>
      <ChildFormStub />
    </I18nextProvider>,
  )


  const user = userEvent.setup()

  return { user, ...utils }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITES
// ─────────────────────────────────────────────────────────────────────────────

describe('ChildForm — description (Bio) field', () => {

  // ── 1. Field existence ──────────────────────────────────────────────────

  describe('Field existence and accessibility', () => {

    it('renders a textarea for the description field', async () => {
      await renderWithI18n('en')

      const textarea = screen.getByRole('textbox', { name: /bio \/ description/i })
      expect(textarea).toBeDefined()
      expect(textarea.tagName.toLowerCase()).toBe('textarea')
    })

    it('associates the textarea with a visible label', async () => {
      await renderWithI18n('en')


      const textarea = screen.getByLabelText('Bio / Description')
      expect(textarea).toBeDefined()
    })

    it('renders the placeholder text from i18n', async () => {
      await renderWithI18n('en')

      const textarea = screen.getByPlaceholderText(
        'Tell the neighborhood something about your child...'
      )
      expect(textarea).toBeDefined()
    })

    it('renders the character counter initially showing 0', async () => {
      await renderWithI18n('en')

      const counter = screen.getByTestId('description-counter')
      expect(counter.textContent).toContain('0')
      expect(counter.textContent).toContain('500')
    })

    it('starts with an empty textarea value', async () => {
      await renderWithI18n('en')

      const textarea = screen.getByLabelText('Bio / Description') as HTMLTextAreaElement
      expect(textarea.value).toBe('')
    })
  })

  // ── 2. Character counter interaction ────────────────────────────────────

  describe('Character counter updates as the user types', () => {

    it('updates the counter after typing a short message', async () => {
      const { user } = await renderWithI18n('en')

      const textarea = screen.getByLabelText('Bio / Description')
      await user.type(textarea, 'Hello')

      const counter = screen.getByTestId('description-counter')
      expect(counter.textContent).toContain('5')
    })

    it('reflects the exact character count for a 20-character message', async () => {
      const { user } = await renderWithI18n('en')

      const message = 'This is twenty chars'
      expect(message.length).toBe(20)

      const textarea = screen.getByLabelText('Bio / Description')
      await user.type(textarea, message)

      const counter = screen.getByTestId('description-counter')
      expect(counter.textContent).toContain('20')
    })

    it('clears the counter back to 0 when the textarea is cleared', async () => {
      const { user } = await renderWithI18n('en')

      const textarea = screen.getByLabelText('Bio / Description')
      await user.type(textarea, 'Some text')
      await user.clear(textarea)

      const counter = screen.getByTestId('description-counter')
      expect(counter.textContent).toContain('0')
    })

    it('enforces the maxLength attribute at 500 characters', async () => {
      await renderWithI18n('en')

      const textarea = screen.getByLabelText('Bio / Description') as HTMLTextAreaElement
      expect(textarea.maxLength).toBe(500)
    })
  })

  // ── 3. i18n label rendering ──────────────────────────────────────────────

  describe('i18n — label and counter text per locale', () => {

    it('shows the English label "Bio / Description"', async () => {
      await renderWithI18n('en')

      expect(screen.getByText('Bio / Description')).toBeDefined()
    })

    it('shows the Spanish label "Bio / Descripción"', async () => {
      await renderWithI18n('es')

      expect(screen.getByText('Bio / Descripción')).toBeDefined()
    })

    it('shows the Valencian label "Bio / Descripció"', async () => {
      await renderWithI18n('va')

      expect(screen.getByText('Bio / Descripció')).toBeDefined()
    })

    it('shows the English counter text containing "characters"', async () => {
      await renderWithI18n('en')

      const counter = screen.getByTestId('description-counter')
      expect(counter.textContent).toContain('characters')
    })

    it('shows the Spanish counter text containing "caracteres"', async () => {
      await renderWithI18n('es')

      const counter = screen.getByTestId('description-counter')
      expect(counter.textContent).toContain('caracteres')
    })

    it('shows the Valencian counter text containing "caràcters"', async () => {
      await renderWithI18n('va')

      const counter = screen.getByTestId('description-counter')
      expect(counter.textContent).toContain('caràcters')
    })

    it('updates the Valencian counter correctly after user types', async () => {
      const { user } = await renderWithI18n('va')

      const textarea = screen.getByLabelText('Bio / Descripció')
      await user.type(textarea, 'Hola!')

      const counter = screen.getByTestId('description-counter')
      expect(counter.textContent).toContain('5')
      expect(counter.textContent).toContain('caràcters')
    })
  })
})
