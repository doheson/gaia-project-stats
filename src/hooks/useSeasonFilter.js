import { useState } from 'react'
import { getCurrentSeason } from '../lib/seasons'

export function useSeasonFilter(initial = getCurrentSeason()) {
  return useState(initial)
}
