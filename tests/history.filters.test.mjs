import test from 'node:test'
import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import { formatGroupLabel, applyHistoryFilters, groupByDate, emptyStateText } from './historyFilterHarness.mjs'

test('history 日期标签：同年仅显示月日号，跨年显示年月日号', () => {
	const now = new Date(2026, 11, 20)
	assert.equal(formatGroupLabel('2026-12-20', now), '今天')
	assert.equal(formatGroupLabel('2026-12-19', now), '昨天')
	assert.equal(formatGroupLabel('2026-01-01', now), '1月1号')
	assert.equal(formatGroupLabel('2025-12-20', now), '2025年12月20号')
})

test('history 过滤：关键字/状态/时间范围（含边界与反向范围）', () => {
	const list = [
		{ id: 1, type: 'expense', date: '2026-03-01', category: '餐饮', description: '午饭', note: '小票' },
		{ id: 2, type: 'income', date: '2026-03-02', category: '工资', description: 'Salary', note: '' },
		{ id: 3, type: 'expense', date: '2026-03-03', category: '交通', description: '地铁', note: null }
	]

	const byKeyword = applyHistoryFilters(list, { keyword: 'sal', type: 'all', startDate: '', endDate: '' })
	assert.deepEqual(byKeyword.map(t => t.id), [2])

	const byType = applyHistoryFilters(list, { keyword: '', type: 'income', startDate: '', endDate: '' })
	assert.deepEqual(byType.map(t => t.id), [2])

	const byRangeInclusive = applyHistoryFilters(list, { keyword: '', type: 'all', startDate: '2026-03-02', endDate: '2026-03-03' })
	assert.deepEqual(byRangeInclusive.map(t => t.id), [2, 3])

	const byRangeSwap = applyHistoryFilters(list, { keyword: '', type: 'all', startDate: '2026-03-03', endDate: '2026-03-02' })
	assert.deepEqual(byRangeSwap.map(t => t.id), [2, 3])
})

test('history 空结果提示：无数据与无匹配两种场景', () => {
	assert.equal(emptyStateText(0, 0), '暂无交易记录')
	assert.equal(emptyStateText(12, 0), '没有匹配的交易')
	assert.equal(emptyStateText(12, 3), '')
})

test('history 性能：50k 条过滤与分组在 300ms 内完成', () => {
	const tx = []
	for (let i = 0; i < 50_000; i++) {
		const d = 1 + (i % 28)
		tx.push({
			id: i,
			type: i % 3 === 0 ? 'income' : 'expense',
			date: `2026-03-${String(d).padStart(2, '0')}`,
			category: i % 2 === 0 ? '交通' : '餐饮',
			description: `item-${i}`,
			note: i % 10 === 0 ? '含关键字' : ''
		})
	}

	const t0 = performance.now()
	const filtered = applyHistoryFilters(tx, { keyword: '关键字', type: 'all', startDate: '2026-03-01', endDate: '2026-03-31' })
	const grouped = groupByDate(filtered, new Date(2026, 2, 15))
	const t1 = performance.now()

	assert.ok(filtered.length > 0)
	assert.ok(grouped.length > 0)
	assert.ok(t1 - t0 < 300, `took ${Math.round(t1 - t0)}ms`)
})

