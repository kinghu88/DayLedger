export function createSwipeDeleteHarness(initialList, removeExpense) {
	const DELETE_WIDTH = 80
	const DELETE_THRESHOLD = 60
	let dataList = [...initialList]
	let swipeOpenId = ''
	let swipeTrackingId = ''
	let swipeStartX = 0
	let swipeBaseOffset = 0
	let swipeOffset = 0
	let toastMessage = ''
	let storageList = [...initialList]

	function clampOffset(v) {
		if (v < 0) return 0
		if (v > DELETE_WIDTH) return DELETE_WIDTH
		return v
	}

	function onSwipeStart(id, x) {
		if (swipeOpenId && swipeOpenId !== id) swipeOpenId = ''
		swipeTrackingId = id
		swipeStartX = x
		swipeBaseOffset = swipeOpenId === id ? DELETE_WIDTH : 0
		swipeOffset = swipeBaseOffset
	}

	function onSwipeMove(x) {
		if (!swipeTrackingId) return
		const delta = x - swipeStartX
		swipeOffset = clampOffset(swipeBaseOffset - delta)
	}

	function onSwipeEnd() {
		if (!swipeTrackingId) return
		const id = swipeTrackingId
		swipeOpenId = swipeOffset >= DELETE_THRESHOLD ? id : ''
		swipeTrackingId = ''
		swipeOffset = 0
		swipeBaseOffset = 0
	}

	function getSwipeTranslateX(id) {
		if (swipeTrackingId === id) return -swipeOffset
		if (swipeOpenId === id) return -DELETE_WIDTH
		return 0
	}

	function deleteById(id) {
		const prev = [...dataList]
		dataList = prev.filter((t) => String(t.id) !== String(id))
		swipeOpenId = ''
		const result = removeExpense(id, storageList)
		if (result.ok) {
			storageList = [...result.nextStorage]
			toastMessage = '已删除'
			return true
		}
		dataList = prev
		toastMessage = '删除失败'
		return false
	}

	return {
		onSwipeStart,
		onSwipeMove,
		onSwipeEnd,
		getSwipeTranslateX,
		deleteById,
		getDataList: () => dataList,
		getStorageList: () => storageList,
		getToastMessage: () => toastMessage
	}
}
