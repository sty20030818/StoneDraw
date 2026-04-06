const MULTIPLE_SPACE_PATTERN = /\s+/g
const INVALID_FILE_NAME_CHARS = new Set(['<', '>', ':', '"', '/', '\\', '|', '?', '*'])

function normalizeUnsafeCharacter(character: string): string {
	const characterCode = character.charCodeAt(0)

	if (INVALID_FILE_NAME_CHARS.has(character) || characterCode <= 31) {
		return '-'
	}

	return character
}

export function sanitizeFileName(input: string): string {
	const trimmedInput = input.trim()

	if (!trimmedInput) {
		return 'untitled'
	}

	return Array.from(trimmedInput)
		.map((character) => normalizeUnsafeCharacter(character))
		.join('')
		.replace(MULTIPLE_SPACE_PATTERN, ' ')
		.replaceAll(' ', '-')
		.toLowerCase()
}
