import createClient from 'bgg'

const bgg = createClient({ timeout: 5000, retries: 0 })

export interface BggSearchResult {
  bggId: number
  name: string
  year?: number
}

export interface BggGameDetail {
  bggId: number
  name: string
  minPlayers: number | null
  maxPlayers: number | null
  playingTime: number | null
  image: string | null
  thumbnail: string | null
  description: string | null
  yearPublished: number | null
}

/**
 * Search BoardGameGeek for board games by name.
 * Returns an array of matching games with BGG ID, name, and optional year.
 */
export async function searchBoardGame(query: string): Promise<BggSearchResult[]> {
  const response = await bgg('search', { query, type: 'boardgame' })

  const items = response?.items?.item
  if (!items)
    return []

  const itemList = Array.isArray(items) ? items : [items]

  return itemList.map((item: Record<string, unknown>) => ({
    bggId: Number(item.id),
    name: parseTextValue(item.name),
    year: parseOptionalYear(item.yearpublished),
  }))
}

/**
 * Get detailed metadata for a board game by its BGG numeric ID.
 * Returns name, player counts, playing time, images, description, and year.
 */
export async function getBoardGameDetail(bggId: number): Promise<BggGameDetail> {
  const response = await bgg('thing', { id: String(bggId), stats: 1 })

  const item = response?.items?.item as Record<string, unknown> | undefined
  if (!item) {
    throw new Error(`BGG game not found for ID: ${bggId}`)
  }

  const primaryName = extractPrimaryName(item.name)

  return {
    bggId: Number(item.id),
    name: primaryName,
    minPlayers: parseOptionalInt(item.minplayers),
    maxPlayers: parseOptionalInt(item.maxplayers),
    playingTime: parseOptionalInt(item.playingtime),
    image: parseOptionalText(item.image),
    thumbnail: parseOptionalText(item.thumbnail),
    description: parseOptionalText(item.description),
    yearPublished: parseOptionalYear(item.yearpublished),
  }
}

// ── Helpers ───────────────────────────────────────────────────────

function parseTextValue(field: unknown): string {
  if (!field)
    return ''
  if (typeof field === 'string')
    return field
  if (typeof field === 'object' && field !== null) {
    const obj = field as Record<string, unknown>
    return String(obj._text ?? '')
  }
  return String(field)
}

function parseOptionalText(field: unknown): string | null {
  if (!field)
    return null
  if (typeof field === 'object' && field !== null) {
    const obj = field as Record<string, unknown>
    const text = obj._text
    return text != null ? String(text) : null
  }
  return null
}

function parseOptionalInt(field: unknown): number | null {
  if (!field)
    return null
  if (typeof field === 'object' && field !== null) {
    const obj = field as Record<string, unknown>
    const text = obj._text
    if (text != null) {
      const num = Number(text)
      return Number.isNaN(num) ? null : num
    }
    return null
  }
  return null
}

function parseOptionalYear(field: unknown): number | undefined {
  const val = parseOptionalInt(field)
  return val ?? undefined
}

function extractPrimaryName(nameField: unknown): string {
  if (!nameField)
    return ''

  // Multiple names — find primary
  if (Array.isArray(nameField)) {
    const primary = nameField.find(
      (n: Record<string, unknown>) => n.type === 'primary',
    )
    if (primary)
      return String(primary._text ?? '')
    // Fallback: first name
    return String(nameField[0]?._text ?? '')
  }

  // Single name object
  const obj = nameField as Record<string, unknown>
  return String(obj._text ?? '')
}
