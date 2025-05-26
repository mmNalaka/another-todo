import { useNavigate } from '@tanstack/react-router'
import { Calendar, CheckSquare, Filter, ListChecks } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLocalization } from '@/hooks/use-localization'

interface TaskFilterDropdownProps {
  currentFilter: string
  listId?: string
  className?: string
}

export function TaskFilterDropdown({
  currentFilter,
  listId,
  className,
}: TaskFilterDropdownProps) {
  const { t } = useLocalization()
  const navigate = useNavigate()

  // Determine the base route based on whether we're in a list view or main tasks view
  const baseRoute = listId ? `/lists/${listId}` : '/tasks'

  // Get the display text for the current filter
  const getFilterDisplayText = () => {
    switch (currentFilter) {
      case 'completed':
        return t('tasks.filter.completed')
      case 'today':
        return t('tasks.filter.today')
      case 'uncompleted':
        return t('tasks.filter.uncompleted')
      case 'all':
      default:
        return t('tasks.filter.all')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className={cn("flex items-center gap-1", className)}
        >
          <Filter className="h-4 w-4" />
          {getFilterDisplayText()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => navigate({ to: baseRoute, search: { filter: 'all' } })}
          className={cn(
            currentFilter === 'all' && "bg-primary/10 font-medium"
          )}
        >
          <div className="flex items-center gap-2">
            <ListChecks className={cn(
              "h-4 w-4 mr-1", 
              currentFilter === 'all' ? "text-primary" : "text-muted-foreground"
            )} />
            {currentFilter === 'all' && <span className="text-primary font-bold">✓</span>}
            {t('tasks.filter.all')}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            navigate({ to: baseRoute, search: { filter: 'uncompleted' } })
          }
          className={cn(
            currentFilter === 'uncompleted' && "bg-primary/10 font-medium"
          )}
        >
          <div className="flex items-center gap-2">
            <ListChecks className={cn(
              "h-4 w-4 mr-1", 
              currentFilter === 'uncompleted' ? "text-primary" : "text-muted-foreground"
            )} />
            {currentFilter === 'uncompleted' && (
              <span className="text-primary font-bold">✓</span>
            )}
            {t('tasks.filter.uncompleted')}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            navigate({ to: baseRoute, search: { filter: 'completed' } })
          }
          className={cn(
            currentFilter === 'completed' && "bg-primary/10 font-medium"
          )}
        >
          <div className="flex items-center gap-2">
            <CheckSquare className={cn(
              "h-4 w-4 mr-1", 
              currentFilter === 'completed' ? "text-primary" : "text-muted-foreground"
            )} />
            {currentFilter === 'completed' && (
              <span className="text-primary font-bold">✓</span>
            )}
            {t('tasks.filter.completed')}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate({ to: baseRoute, search: { filter: 'today' } })}
          className={cn(
            currentFilter === 'today' && "bg-primary/10 font-medium"
          )}
        >
          <div className="flex items-center gap-2">
            <Calendar className={cn(
              "h-4 w-4 mr-1", 
              currentFilter === 'today' ? "text-primary" : "text-muted-foreground"
            )} />
            {currentFilter === 'today' && <span className="text-primary font-bold">✓</span>}
            {t('tasks.filter.today')}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
