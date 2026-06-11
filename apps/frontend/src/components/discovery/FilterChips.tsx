import { IonButton, IonChip, IonLabel } from '@ionic/react'
import { useMapStore } from '../map/model/stores/mapStore'

// ── Date preset helpers ─────────────────────────────────────────────

/**
 * Computes Unix timestamps for the start and end of today.
 * Start: today at 00:00:00.000, End: today at 23:59:59.000
 */
function todayRange(): { start: number; end: number } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 0)
  return {
    start: Math.floor(start.getTime() / 1000),
    end: Math.floor(end.getTime() / 1000),
  }
}

/**
 * Computes Unix timestamps for the start and end of tomorrow.
 */
function tomorrowRange(): { start: number; end: number } {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const start = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0, 0)
  const end = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59, 0)
  return {
    start: Math.floor(start.getTime() / 1000),
    end: Math.floor(end.getTime() / 1000),
  }
}

/**
 * Computes Unix timestamps for the start of next Saturday 00:00 and end of Sunday 23:59.
 * If today is Saturday, "this weekend" means today (Saturday 00:00 to Sunday 23:59).
 * If today is Sunday, "this weekend" means yesterday (Saturday 00:00 to today 23:59).
 */
function weekendRange(): { start: number; end: number } {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0=Sun, 6=Sat
  const daysUntilSaturday = dayOfWeek === 6 ? 0 : 6 - dayOfWeek

  const saturday = new Date(now)
  saturday.setDate(now.getDate() + daysUntilSaturday)
  const satStart = new Date(saturday.getFullYear(), saturday.getMonth(), saturday.getDate(), 0, 0, 0, 0)

  const sunday = new Date(satStart)
  sunday.setDate(satStart.getDate() + 1)
  const sunEnd = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59, 0)

  return {
    start: Math.floor(satStart.getTime() / 1000),
    end: Math.floor(sunEnd.getTime() / 1000),
  }
}

// ── Preset definitions ──────────────────────────────────────────────

const DATE_PRESETS: { label: string; range: () => { start: number; end: number } }[] = [
  { label: 'Today', range: todayRange },
  { label: 'Tomorrow', range: tomorrowRange },
  { label: 'This weekend', range: weekendRange },
]

const SKILL_LEVELS = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
]

const ATMOSPHERES = [
  { label: 'Casual', value: 'casual' },
  { label: 'Competitive', value: 'competitive' },
]

// ── Equality helpers ─────────────────────────────────────────────────

/** Checks if the current dateRange matches a preset range */
function dateRangeMatches(
  current: { start: number; end: number } | undefined,
  preset: { start: number; end: number },
): boolean {
  if (!current) return false
  return current.start === preset.start && current.end === preset.end
}

// ── Component ────────────────────────────────────────────────────────

export interface FilterChipsProps {
  /** Unique game names from available results, used to render game filter chips */
  availableGames: string[]
}

/**
 * Renders filter chips for event discovery.
 * Includes date presets, skill level, atmosphere, and game filters.
 * All filters use AND logic — selecting multiple chips narrows results.
 * Reads/writes to the global mapStore for filter state.
 */
export function FilterChips({ availableGames }: FilterChipsProps) {
  const filters = useMapStore(s => s.filters)
  const setFilters = useMapStore(s => s.setFilters)
  const resetFilters = useMapStore(s => s.resetFilters)

  const handleDatePreset = (preset: (typeof DATE_PRESETS)[number]) => {
    const range = preset.range()
    if (dateRangeMatches(filters.dateRange, range)) {
      // Toggle off: clear date range
      setFilters({ ...filters, dateRange: undefined })
    }
    else {
      // Toggle on: set this date range
      setFilters({ ...filters, dateRange: range })
    }
  }

  const handleSkillLevel = (value: string) => {
    if (filters.skillLevel === value) {
      setFilters({ ...filters, skillLevel: undefined })
    }
    else {
      setFilters({ ...filters, skillLevel: value })
    }
  }

  const handleAtmosphere = (value: string) => {
    if (filters.atmosphere === value) {
      setFilters({ ...filters, atmosphere: undefined })
    }
    else {
      setFilters({ ...filters, atmosphere: value })
    }
  }

  const handleGameToggle = (game: string) => {
    const games = filters.games.includes(game)
      ? filters.games.filter(g => g !== game)
      : [...filters.games, game]
    setFilters({ ...filters, games })
  }

  return (
    <div data-testid="filter-chips">
      {/* Date Presets */}
      <IonLabel>
        <strong>Date</strong>
      </IonLabel>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {DATE_PRESETS.map(preset => {
          const range = preset.range()
          const isSelected = dateRangeMatches(filters.dateRange, range)
          return (
            <IonChip
              key={preset.label}
              outline={!isSelected}
              color={isSelected ? 'primary' : undefined}
              onClick={() => handleDatePreset(preset)}
            >
              {preset.label}
            </IonChip>
          )
        })}
      </div>

      {/* Skill Level */}
      <IonLabel>
        <strong>Skill Level</strong>
      </IonLabel>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {SKILL_LEVELS.map(skill => {
          const isSelected = filters.skillLevel === skill.value
          return (
            <IonChip
              key={skill.value}
              outline={!isSelected}
              color={isSelected ? 'primary' : undefined}
              onClick={() => handleSkillLevel(skill.value)}
            >
              {skill.label}
            </IonChip>
          )
        })}
      </div>

      {/* Atmosphere */}
      <IonLabel>
        <strong>Atmosphere</strong>
      </IonLabel>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {ATMOSPHERES.map(atm => {
          const isSelected = filters.atmosphere === atm.value
          return (
            <IonChip
              key={atm.value}
              outline={!isSelected}
              color={isSelected ? 'primary' : undefined}
              onClick={() => handleAtmosphere(atm.value)}
            >
              {atm.label}
            </IonChip>
          )
        })}
      </div>

      {/* Game filters */}
      {availableGames.length > 0 && (
        <>
          <IonLabel>
            <strong>Games</strong>
          </IonLabel>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {availableGames.map(game => {
              const isSelected = filters.games.includes(game)
              return (
                <IonChip
                  key={game}
                  outline={!isSelected}
                  color={isSelected ? 'primary' : undefined}
                  onClick={() => handleGameToggle(game)}
                >
                  {game}
                </IonChip>
              )
            })}
          </div>
        </>
      )}

      {/* Clear filters */}
      <IonButton
        fill="clear"
        size="small"
        color="medium"
        onClick={resetFilters}
      >
        Clear filters
      </IonButton>
    </div>
  )
}
