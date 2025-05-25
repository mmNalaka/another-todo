import { useCallback, useState } from 'react'

/**
 * A hook that provides a debounced save function
 * @param saveFunction The function to call after the debounce period
 * @param debounceTime The debounce time in milliseconds
 * @returns An object containing the debounced save function and a boolean indicating if a save is in progress
 */
export function useDebouncedSave<T extends { id: string }>(  
  saveFunction: (data: T) => void | Promise<void>,
  debounceTime = 800
) {
  const [isSaving, setIsSaving] = useState(false)

  const debouncedSave = useCallback(
    (() => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null

      return (data: T) => {
        setIsSaving(true)

        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        timeoutId = setTimeout(() => {
          saveFunction(data)
          setIsSaving(false)
          timeoutId = null
        }, debounceTime)
      }
    })(),
    [saveFunction, debounceTime]
  )

  return { debouncedSave, isSaving }
}
