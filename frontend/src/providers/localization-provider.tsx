import { createContext } from 'react'
import enTranslations from '../../i18n/en.json'
import type { ReactNode } from 'react'

// Create a type from the translation keys
type TranslationKeys = keyof typeof enTranslations
type Translations = typeof enTranslations

// Context to hold the translations and locale
type LocalizationContextType = {
  t: (key: TranslationKeys, variables?: Record<string, string>) => string
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

  // Function to get a translation by key with variable replacement
  const t = (
    key: TranslationKeys,
    variables?: Record<string, string>,
  ): string => {
    let text = translations[key] || key

    // Replace variables in the format {{variableName}}
    if (variables) {
      Object.entries(variables).forEach(([varName, value]) => {
        // eslint-disable-next-line no-useless-escape
        text = text.replace(new RegExp('\{\{' + varName + '\}\}', 'g'), value)
      })
    }

    return text
  }

  return (
    <LocalizationContext.Provider value={{ t, locale }}>
      {children}
    </LocalizationContext.Provider>
  )
}
