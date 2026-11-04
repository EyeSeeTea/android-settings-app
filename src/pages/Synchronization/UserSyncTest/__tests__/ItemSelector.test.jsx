import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import '@testing-library/jest-dom'
import ItemSelector from '../searchField/ItemSelector.jsx'

const mockQuery = jest.fn()

jest.mock('@dhis2/app-runtime', () => ({
    useDataEngine: () => ({ query: mockQuery }),
}))

const openMenu = () =>
    userEvent.click(screen.getByPlaceholderText('Search by user'))

const searchFor = (text) =>
    userEvent.type(screen.getByPlaceholderText('Search by user'), text)

const rejectWhenAborted = (_query, { signal }) =>
    new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () =>
            reject(new Error('Network error'))
        )
    })

describe('ItemSelector', () => {
    beforeEach(() => {
        mockQuery.mockReset()
    })

    it('shows a loading item while the users are being fetched', async () => {
        mockQuery.mockReturnValue(new Promise(() => {}))
        render(<ItemSelector selection={jest.fn()} />)

        await openMenu()

        expect(await screen.findByText('Loading users...')).toBeInTheDocument()
        expect(screen.queryByText('No user found')).not.toBeInTheDocument()
    })

    it('shows "No user found" when no user matches', async () => {
        mockQuery.mockResolvedValue({ items: { users: [] } })
        render(<ItemSelector selection={jest.fn()} />)

        await openMenu()

        expect(await screen.findByText('No user found')).toBeInTheDocument()
        expect(screen.queryByText('Loading users...')).not.toBeInTheDocument()
    })

    it('lists the fetched users', async () => {
        mockQuery.mockResolvedValue({
            items: { users: [{ id: 'user1', name: 'John Traore' }] },
        })
        render(<ItemSelector selection={jest.fn()} />)

        await openMenu()

        expect(await screen.findByText('John Traore')).toBeInTheDocument()
        expect(screen.queryByText('No user found')).not.toBeInTheDocument()
    })

    it('shows an error item when the users request fails', async () => {
        mockQuery.mockRejectedValue(new Error('Network error'))
        render(<ItemSelector selection={jest.fn()} />)

        await openMenu()

        expect(
            await screen.findByText('Error loading users')
        ).toBeInTheDocument()
        expect(screen.queryByText('Loading users...')).not.toBeInTheDocument()
    })

    it('cancels the previous request without showing an error', async () => {
        mockQuery.mockImplementationOnce(rejectWhenAborted).mockResolvedValue({
            items: { users: [{ id: 'user1', name: 'John Traore' }] },
        })
        render(<ItemSelector selection={jest.fn()} />)

        await searchFor('John')

        expect(await screen.findByText('John Traore')).toBeInTheDocument()
        const [, firstRequestOptions] = mockQuery.mock.calls[0]
        expect(firstRequestOptions.signal.aborted).toBe(true)
        expect(
            screen.queryByText('Error loading users')
        ).not.toBeInTheDocument()
    })

    it('ignores a late response from a previous search', async () => {
        let resolveFirstRequest
        mockQuery
            .mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        resolveFirstRequest = resolve
                    })
            )
            .mockResolvedValue({
                items: { users: [{ id: 'user1', name: 'John Traore' }] },
            })
        render(<ItemSelector selection={jest.fn()} />)

        await searchFor('John')
        expect(await screen.findByText('John Traore')).toBeInTheDocument()

        await act(async () =>
            resolveFirstRequest({
                items: { users: [{ id: 'user2', name: 'Aminata Kamara' }] },
            })
        )

        expect(screen.getByText('John Traore')).toBeInTheDocument()
        expect(screen.queryByText('Aminata Kamara')).not.toBeInTheDocument()
    })
})
