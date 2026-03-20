import test from 'node:test'
import assert from 'node:assert/strict'
import { createSwipeDeleteHarness } from './swipeDeleteHarness.mjs'

test('history 同时仅一条滑出且删除失败会回滚', () => {
	const initial = [
		{ id: 'x', amount: 12 },
		{ id: 'y', amount: 22 },
		{ id: 'z', amount: 32 }
	]
	const calls = []
	const removeExpense = (id, storageList) => {
		calls.push(id)
		return { ok: false, nextStorage: storageList }
	}
	const vm = createSwipeDeleteHarness(initial, removeExpense)

	vm.onSwipeStart('x', 220)
	vm.onSwipeMove(140)
	vm.onSwipeEnd()
	assert.equal(vm.getSwipeTranslateX('x'), -80)

	vm.onSwipeStart('y', 220)
	vm.onSwipeMove(140)
	vm.onSwipeEnd()
	assert.equal(vm.getSwipeTranslateX('x'), 0)
	assert.equal(vm.getSwipeTranslateX('y'), -80)

	const deleted = vm.deleteById('y')
	assert.equal(deleted, false)
	assert.equal(vm.getDataList().length, 3)
	assert.equal(vm.getStorageList().length, 3)
	assert.deepEqual(calls, ['y'])
	assert.equal(vm.getToastMessage(), '删除失败')
})
