import type { FilterState, SearchResult } from '../components/discovery/types'

/**
 * Applies AND-logic filters to search results.
 *
 * Filtering rules:
 * - `games`: event must include ALL selected games (array intersection)
 * - `dateRange`: event date must be within [start, end] (both Unix timestamps, inclusive)
 * - `skillLevel`: exact match on event.skillLevel
 * - `atmosphere`: exact match on event.atmosphere
 *
 * Results preserve the input sort order (expected to be distance-sorted).
 *
 * @param results - Search results to filter
 * @param filters - Active filter criteria
 * @returns Filtered results in the same order as input
 */
export function useEventFilters(
  results: SearchResult[],
  filters: FilterState,
): SearchResult[] {
  let filtered = results

  // Game filter: event must include ALL selected games (AND logic)
  if (filters.games.length > 0) {
    filtered = filtered.filter(r =>
      filters.games.every(g => r.event.games.includes(g)),
    )
  }

  // Date range filter: event date must be within [start, end] inclusive
  if (filters.dateRange) {
    const { start, end } = filters.dateRange
    filtered = filtered.filter(r => r.event.date >= start && r.event.date <= end)
  }

  // Skill level filter: exact match
  if (filters.skillLevel !== undefined) {
    filtered = filtered.filter(r => r.event.skillLevel === filters.skillLevel)
  }

  // Atmosphere filter: exact match
  if (filters.atmosphere !== undefined) {
    filtered = filtered.filter(r => r.event.atmosphere === filters.atmosphere)
  }

  return filtered
}

/**
 * Extracts unique game names from all search results.
 * Useful for populating filter chips.
 *
 * @param results - Search results to extract games from
 * @returns Unique game names sorted alphabetically
 */
export function getAvailableGames(results: SearchResult[]): string[] {
  const gameSet = new Set<string>()
  for (const r of results) {
    for (const g of r.event.games) {
      gameSet.add(g)
    }
  }
  return Array.from(gameSet).sort()
}
