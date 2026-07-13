import type { TFunction } from 'i18next'

/**
 * Los apodos "mágicos" se guardan siempre en el formato canónico
 * `adjetivo_icono` (en inglés, con guion bajo), independientemente del
 * idioma de la interfaz — p.ej. "brave_lion". Esta función los traduce
 * para mostrarlos en el idioma activo.
 *
 * Un apodo personalizado (escrito a mano por la familia) nunca contiene
 * guion bajo, así que se devuelve tal cual.
 *
 * IMPORTANTE: esta es la ÚNICA función que debe usarse para mostrar
 * nicknames en toda la app. Antes había implementaciones duplicadas en
 * FamilyCard/ExplorePage (que esperaban espacio en vez de guion bajo) y
 * dejaban de traducir cualquier apodo mágico, mostrándolo en inglés.
 */
export function translateNickname(
  nickname: string | undefined | null,
  t: TFunction,
): string {
  if (!nickname) return ''
  if (!nickname.includes('_')) return nickname

  const [adj, icon] = nickname.split('_')
  const translatedAdj = t(`nicknames.adjectives.${adj.toLowerCase()}`, {
    defaultValue: adj,
  })
  const translatedIcon = t(`nicknames.nouns.${icon.toLowerCase()}`, {
    defaultValue: icon,
  })

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  return `${capitalize(translatedAdj)} ${capitalize(translatedIcon)}`
}

/**
 * Igual que translateNickname, pero con un texto por defecto según el
 * género cuando el niño todavía no tiene apodo (usado en tarjetas de
 * familia/exploración).
 */
export function translateNicknameOrDefault(
  nickname: string | undefined | null,
  gender: string | undefined,
  t: TFunction,
): string {
  if (!nickname) {
    return gender === 'BOY' ? t('children.card.titleBoy') : t('children.card.titleGirl')
  }
  return translateNickname(nickname, t)
}

export const MAGIC_ADJECTIVES = [
  'magic',
  'brave',
  'creative',
  'explorer',
  'artist',
  'captain',
  'happy',
  'shiny',
  'curious',
  'little',
]

export const MAGIC_ICONS = [
  'lion',
  'star',
  'dolphin',
  'fox',
  'bear',
  'wizard',
  'koala',
  'astronaut',
  'rocket',
  'eagle',
]

export function generateMagicNickname(): string {
  const adj = MAGIC_ADJECTIVES[Math.floor(Math.random() * MAGIC_ADJECTIVES.length)]
  const icon = MAGIC_ICONS[Math.floor(Math.random() * MAGIC_ICONS.length)]
  return `${adj}_${icon}`
}
