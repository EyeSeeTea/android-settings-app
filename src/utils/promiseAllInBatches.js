import chunk from 'lodash/chunk'

export const promiseAllInBatches = async (items, request, batchSize = 10) => {
    const results = []
    for (const batch of chunk(items, batchSize)) {
        results.push(...(await Promise.all(batch.map(request))))
    }
    return results
}
