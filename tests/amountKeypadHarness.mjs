export function applyAmountKey(prevDraft, key) {
	const prev = String(prevDraft || '')
	if (key === 'del') return prev.length ? prev.slice(0, prev.length - 1) : ''
	if (key === 'clear') return ''
	if (key === '.') {
		if (!prev) return '0.'
		if (prev.includes('.')) return prev
		return prev + '.'
	}
	if (typeof key !== 'string' || key.length !== 1 || key < '0' || key > '9') return prev

	if (prev === '0' && key === '0' && !prev.includes('.')) return prev
	if (prev === '0' && key !== '0' && !prev.includes('.')) return key

	const dotIdx = prev.indexOf('.')
	if (dotIdx >= 0) {
		const decimals = prev.length - dotIdx - 1
		if (decimals >= 2) return prev
	}
	return prev + key
}

