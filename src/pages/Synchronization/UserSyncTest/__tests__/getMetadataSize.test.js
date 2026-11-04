/**
 * @jest-environment node
 */
import { getMetadataSize } from '../getMetadata'
import {
    apiFetchDataElements,
    apiFetchIndicators,
} from '../queries/metadataQueries'

jest.mock('../queries/metadataQueries')

const createDataElementIds = (total) =>
    Array.from({ length: total }, (_, index) => `dataElement${index}`)

const runMetadataSize = (dataElementList) =>
    getMetadataSize({
        dataEngine: {},
        orgUnitList: [],
        programList: [],
        trackedEntityTypeList: [],
        teaList: [],
        optionSetList: [],
        dataSetList: [],
        dataElementList,
        categoryComboList: [],
        categoryList: [],
        indicatorList: [],
    })

describe('getMetadataSize', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        apiFetchIndicators.mockResolvedValue([])
    })

    it.each([
        [0, []],
        [100, [100]],
        [250, [100, 100, 50]],
    ])(
        'requests %i data elements in chunks of up to 100 ids',
        async (total, expectedChunkSizes) => {
            const dataElementList = createDataElementIds(total)

            await runMetadataSize(dataElementList)

            const requestedChunks = apiFetchDataElements.mock.calls.map(
                ([, dataElements]) => dataElements
            )
            expect(requestedChunks.map((chunk) => chunk.length)).toEqual(
                expectedChunkSizes
            )
            expect(requestedChunks.flat()).toEqual(dataElementList)
        }
    )
})
