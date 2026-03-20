function normalizeAmountRaw(v) {
	const s = String(v || '').trim()
	if (!s) return ''
	if (s.startsWith('￥')) return s.slice(1).trim()
	return s
}

export function computeAmountDisplayText(amount, amountDraft, isOpen) {
	const raw = isOpen ? amountDraft : amount
	const normalized = normalizeAmountRaw(raw)
	if (!normalized) return '￥0.00'
	return `￥${normalized}`
}

export function computeAmountDisplayPlaceholder(amount, amountDraft, isOpen) {
	const raw = isOpen ? amountDraft : amount
	return normalizeAmountRaw(raw).length === 0
}

