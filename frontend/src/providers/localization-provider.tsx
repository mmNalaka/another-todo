import { createContext } from 'react'
import enTranslations from '../../i18n/en.json'
import type { ReactNode } from 'react'

// Create a type from the translation keys
type TranslationKeys = keyof typeof enTranslations
type Translations = typeof enTranslations

// Context to hold the translations and locale
type LocalizationContextType = {
  t: (key: TranslationKeys) => string
  locale: string
}

export const LocalizationContext = createContext<
  LocalizationContextType | undefined
>(undefined)

type LocalizationProviderProps = {
  children: ReactNode
  locale?: string
}

export function LocalizationProvider({
  children,
  locale = 'en',
}: LocalizationProviderProps) {
  // For now, we only support English
  const translations: Translations = enTranslations

  // Function to get a translation by key
  const t = (key: TranslationKeys): string => {
    return translations[key] || key
  }

  return (
    <LocalizationContext.Provider value={{ t, locale }}>
      {children}
    </LocalizationContext.Provider>
  )
}
