import DOMPurify from 'dompurify'

export function sanitizeNarrative(input: string) {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['strong', 'em', 'br'],
    ALLOWED_ATTR: [],
  })
}
