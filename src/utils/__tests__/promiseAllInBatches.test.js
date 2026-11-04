import { promiseAllInBatches } from '../promiseAllInBatches'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

test('The results keep the order of the items', async () => {
    const result = await promiseAllInBatches(
        [30, 10, 20, 0],
        async (ms) => {
            await delay(ms)
            return ms * 2
        },
        2
    )

    expect(result).toEqual([60, 20, 40, 0])
})

test('No more requests than the batch size are pending at once', async () => {
    let pending = 0
    let maxPending = 0

    await promiseAllInBatches(
        Array.from({ length: 25 }, (_, index) => index),
        async () => {
            pending++
            maxPending = Math.max(maxPending, pending)
            await delay(1)
            pending--
        },
        10
    )

    expect(maxPending).toBe(10)
})
