import test from 'node:test'
import assert from 'node:assert/strict'
import { createSwipeDeleteHarness } from './swipeDeleteHarness.mjs'

test('index 列表左滑并删除后同步存储', () => {
	const initial = [
		{ id: 'a', amount: 12 },
		{ id: 'b', amount: 22 },
		{ id: 'c', amount: 32 }
	]
	const calls = []
	const removeExpense = (id, storageList) => {
		calls.push(id)
		const nextStorage = storageList.filter((item) => item.id !== id)
		return { ok: true, nextStorage }
	}
	const vm = createSwipeDeleteHarness(initial, removeExpense)

	vm.onSwipeStart('b', 200)
	vm.onSwipeMove(120)
	vm.onSwipeEnd()

	assert.equal(vm.getSwipeTranslateX('b'), -80)

	const deleted = vm.deleteById('b')
	assert.equal(deleted, true)
	assert.equal(vm.getDataList().length, 2)
	assert.equal(vm.getStorageList().length, 2)
	assert.deepEqual(calls, ['b'])
	assert.equal(vm.getToastMessage(), '已删除')
})
