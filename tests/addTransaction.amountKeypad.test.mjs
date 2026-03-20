import test from 'node:test'
import assert from 'node:assert/strict'
import { applyAmountKey } from './amountKeypadHarness.mjs'
import { computeAmountDisplayText, computeAmountDisplayPlaceholder } from './amountDisplayHarness.mjs'

test('记一笔 金额键盘：小数最多两位', () => {
	let v = ''
	v = applyAmountKey(v, '1')
	v = applyAmountKey(v, '2')
	v = applyAmountKey(v, '.')
	v = applyAmountKey(v, '3')
	v = applyAmountKey(v, '4')
	v = applyAmountKey(v, '5')
	assert.equal(v, '12.34')
})

test('记一笔 金额键盘：前导 0 处理', () => {
	let v = ''
	v = applyAmountKey(v, '0')
	v = applyAmountKey(v, '0')
	assert.equal(v, '0')
	v = applyAmountKey(v, '8')
	assert.equal(v, '8')
})

test('记一笔 金额键盘：空值点小数得到 0.', () => {
	let v = ''
	v = applyAmountKey(v, '.')
	assert.equal(v, '0.')
})

test('记一笔 金额键盘：删除与清空', () => {
	let v = '123.4'
	v = applyAmountKey(v, 'del')
	assert.equal(v, '123.')
	v = applyAmountKey(v, 'del')
	assert.equal(v, '123')
	v = applyAmountKey(v, 'clear')
	assert.equal(v, '')
})

test('记一笔 金额显示：弹窗打开时随 draft 实时变化', () => {
	assert.equal(computeAmountDisplayText('', '', true), '￥0.00')
	assert.equal(computeAmountDisplayPlaceholder('', '', true), true)
	assert.equal(computeAmountDisplayText('12', '215', true), '￥215')
	assert.equal(computeAmountDisplayText('12', '215', false), '￥12')
	assert.equal(computeAmountDisplayText('', '￥8', true), '￥8')
})
