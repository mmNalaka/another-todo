import { useState } from 'react'
import { Check, Plus } from 'lucide-react'

import type { SchemaField } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useLocalization } from '@/hooks/use-localization'
import { useCreateList } from '@/hooks/lists/use-create-list'

type CreateListDialogProps = React.ComponentProps<typeof Dialog>

const predefinedColors = [
  // Blues
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Light Blue', value: '#7dd3fc' },
  // Reds
  { name: 'Red', value: '#ef4444' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Light Red', value: '#fca5a5' },
  // Greens
  { name: 'Green', value: '#22c55e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Light Green', value: '#86efac' },
  // Yellows/Oranges
  { name: 'Yellow', value: '#eab308' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Light Yellow', value: '#fef08a' },
  // Purples
  { name: 'Purple', value: '#a855f7' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Light Purple', value: '#d8b4fe' },
  // Neutrals
  { name: 'Slate', value: '#64748b' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Stone', value: '#78716c' },
  { name: 'Black', value: '#171717' },
  // Pastels
  { name: 'Pastel Blue', value: '#bfdbfe' },
  { name: 'Pastel Green', value: '#bbf7d0' },
  { name: 'Pastel Pink', value: '#fbcfe8' },
  { name: 'Pastel Purple', value: '#e9d5ff' },
]

// const fieldTypes: Array<{ label: string; value: FieldType }> = [
//   { label: 'Text', value: 'text' },
//   { label: 'Number', value: 'number' },
//   { label: 'Date', value: 'date' },
//   { label: 'Checkbox', value: 'checkbox' },
// ]

export function CreateListDialog(props: CreateListDialogProps) {
  const { t } = useLocalization()
  const [isListDialogOpen, setIsListDialogOpen] = useState(false)
  const [listName, setListName] = useState('')
  const [selectedColor, setSelectedColor] = useState('#4f46e5')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [fields, setFields] = useState<Array<SchemaField>>([
    { id: '1', name: 'Task', type: 'text', required: true },
  ])

  const { createList, isCreating } = useCreateList()

  // const addField = () => {
  //   const newField: SchemaField = {
  //     id: Date.now().toString(),
  //     name: '',
  //     type: 'text',
  //     required: false,
  //   }
  //   setFields([...fields, newField])
  // }

  // const updateField = (id: string, updates: Partial<SchemaField>) => {
  //   setFields(
  //     fields.map((field) =>
  //       field.id === id ? { ...field, ...updates } : field,
  //     ),
  //   )
  // }

  // const removeField = (id: string) => {
  //   setFields(fields.filter((field) => field.id !== id))
  // }

  const handleAddList = async () => {
    if (!listName.trim()) return

    try {
      await createList({
        title: listName,
        color: selectedColor,
        schema: fields,
      })

      // Reset form state
      setListName('')
      setSelectedColor('#4f46e5')
      setShowAdvanced(false)
      setFields([{ id: '1', name: 'Task', type: 'text', required: true }])
      setIsListDialogOpen(false)
    } catch (error) {
      console.error('Failed to create list:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showAdvanced) {
      handleAddList()
    }
  }

  return (
    <Dialog
      open={isListDialogOpen}
      onOpenChange={setIsListDialogOpen}
      {...props}
    >
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>{t('lists.create.list.label')}</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('lists.create.list.label')}</DialogTitle>
          <DialogDescription>{t('lists.create.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="list-name" className="text-base font-medium">
                {t('lists.create.list.label')}
              </Label>
              <Input
                id="list-name"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder={t('list.create.form.title.placeholder')}
                className="mt-1"
                onKeyDown={handleKeyDown}
                autoFocus
                required
              />
            </div>

            <div>
              <Label className="text-base font-medium mb-2 block">
                {t('list.create.form.color')}
              </Label>
              <div className="flex flex-wrap gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={cn(
                      'w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center',
                      selectedColor === color.value
                        ? 'border-gray-900'
                        : 'border-transparent hover:border-gray-300',
                    )}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSelectedColor(color.value)}
                    aria-label={`Select ${color.name} color`}
                    title={color.name}
                  >
                    {selectedColor === color.value && (
                      <Check className="h-4 w-4 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleAddList}
            className="w-full"
            disabled={!listName.trim() || isCreating}
          >
            {t('list.create.form.submit')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
