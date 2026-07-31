export function formatDate(date: string, includeTime = false): string {
  if (!date) return '-'
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }
  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }
  return new Date(date).toLocaleDateString('en-US', options)
}

export function getScoreClass(score: number): 'score-high' | 'score-medium' | 'score-low' {
  if (score >= 80) return 'score-high'
  if (score >= 60) return 'score-medium'
  return 'score-low'
}
