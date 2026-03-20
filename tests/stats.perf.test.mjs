import test from 'node:test'
import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'

function pad2(n) {
	return String(n).padStart(2, '0')
}

function isoDate(y, m, d) {
	return `${y}-${pad2(m)}-${pad2(d)}`
}

function dateFromISO(iso) {
	const parts = String(iso || '').split('-')
	if (parts.length !== 3) return null
	const y = Number(parts[0])
	const m = Number(parts[1])
	const d = Number(parts[2])
	if (!y || !m || !d) return null
	return new Date(y, m - 1, d)
}

function startOfWeekMonday(date) {
	const day = date.getDay()
	const diff = day === 0 ? 6 : day - 1
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() - diff)
}

function computeWeekSnapshot(transactions, weekStartDate) {
	const dayMs = 24 * 60 * 60 * 1000
	const start = startOfWeekMonday(weekStartDate)
	const startMs = start.getTime()
	const endMs = startMs + 7 * dayMs
	const prevStartMs = startMs - 7 * dayMs
	const prevEndMs = startMs
	const barSums = new Array(7).fill(0)
	const categoryTotals = Object.create(null)
	let total = 0
	let prevTotal = 0

	for (const t of transactions) {
		if (t.type !== 'expense') continue
		const d = dateFromISO(t.date)
		if (!d) continue
		const ms = d.getTime()
		const amount = Number(t.amount || 0)
		if (ms >= startMs && ms < endMs) {
			total += amount
			const cat = t.category || '未分类'
			categoryTotals[cat] = (categoryTotals[cat] || 0) + amount
			const idx = Math.floor((ms - startMs) / dayMs)
			if (idx >= 0 && idx < 7) barSums[idx] += amount
		}
		if (ms >= prevStartMs && ms < prevEndMs) prevTotal += amount
	}

	const top5 = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 5)
	return { total, prevTotal, barSums, top5 }
}

test('stats 周维度计算在 500ms 内完成（50k 条）', () => {
	const year = 2026
	const categories = ['购物', '交通', '娱乐', '餐饮', '住房', '医疗', '学习']
	const tx = []
	for (let i = 0; i < 50_000; i++) {
		const m = 1 + (i % 12)
		const d = 1 + (i % 28)
		tx.push({
			type: 'expense',
			date: isoDate(year, m, d),
			category: categories[i % categories.length],
			amount: (i % 200) + 0.5
		})
	}
	const weekStart = new Date(year, 6, 7)
	const t0 = performance.now()
	const out = computeWeekSnapshot(tx, weekStart)
	const t1 = performance.now()
	assert.equal(typeof out.total, 'number')
	assert.ok(out.barSums.length === 7)
	assert.ok(out.top5.length <= 5)
	assert.ok(t1 - t0 < 500, `compute took ${Math.round(t1 - t0)}ms`)
})

