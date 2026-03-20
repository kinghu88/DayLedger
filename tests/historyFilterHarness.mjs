function pad2(n) {
	return String(n).padStart(2, '0')
}

export function isoFromDate(d) {
	const y = d.getFullYear()
	const m = d.getMonth() + 1
	const day = d.getDate()
	return `${y}-${pad2(m)}-${pad2(day)}`
}

export function parseISOToDate(iso) {
	const parts = String(iso || '').split('-')
	if (parts.length !== 3) return null
	const y = Number(parts[0])
	const m = Number(parts[1])
	const d = Number(parts[2])
	if (!y || !m || !d) return null
	return new Date(y, m - 1, d)
}

export function formatGroupLabel(dateStr, now = new Date()) {
	const todayISO = isoFromDate(now)
	const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
	const yesterdayISO = isoFromDate(yesterday)
	if (dateStr === todayISO) return '今天'
	if (dateStr === yesterdayISO) return '昨天'

	const d = parseISOToDate(dateStr)
	if (!d) return String(dateStr || '')
	const y = d.getFullYear()
	const m = d.getMonth() + 1
	const day = d.getDate()
	const currentYear = now.getFullYear()
	if (y === currentYear) return `${m}月${day}号`
	return `${y}年${m}月${day}号`
}

export function applyHistoryFilters(transactions, filters) {
	const list = Array.isArray(transactions) ? transactions : []
	const keyword = String(filters?.keyword || '').trim().toLowerCase()
	const type = filters?.type === 'income' ? 'income' : (filters?.type === 'expense' ? 'expense' : 'all')
	let start = String(filters?.startDate || '')
	let end = String(filters?.endDate || '')
	if (start && end && start > end) {
		const tmp = start
		start = end
		end = tmp
	}

	const out = []
	for (let i = 0; i < list.length; i++) {
		const t = list[i]
		const tType = String(t?.type || 'expense')
		if (type !== 'all' && tType !== type) continue

		const dateStr = String(t?.date || '')
		if (start && dateStr && dateStr < start) continue
		if (end && dateStr && dateStr > end) continue

		if (keyword) {
			const desc = String(t?.description || '').toLowerCase()
			const cat = String(t?.category || '').toLowerCase()
			const note = String(t?.note || '').toLowerCase()
			if (!desc.includes(keyword) && !cat.includes(keyword) && !note.includes(keyword)) continue
		}

		out.push(t)
	}
	return out
}

export function groupByDate(transactions, now = new Date()) {
	const groups = Object.create(null)
	for (const t of transactions || []) {
		const k = String(t?.date || '')
		if (!k) continue
		if (!groups[k]) groups[k] = []
		groups[k].push(t)
	}
	return Object.keys(groups)
		.sort((a, b) => b.localeCompare(a))
		.map(date => ({ date, label: formatGroupLabel(date, now), items: groups[date] }))
}

export function emptyStateText(totalCount, shownCount) {
	if (Number(totalCount || 0) === 0) return '暂无交易记录'
	if (Number(shownCount || 0) === 0) return '没有匹配的交易'
	return ''
}

