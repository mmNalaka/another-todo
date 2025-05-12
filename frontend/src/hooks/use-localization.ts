import { useContext } from 'react'
import { LocalizationContext } from '@/providers/localization-provider'

// Custom hook to use the localization context
export function useLocalization() {
  const context = useContext(LocalizationContext)

  if (context === undefined) {
    throw new Error(
      'useLocalization must be used within a LocalizationProvider',
    )
  }

  return context
}
