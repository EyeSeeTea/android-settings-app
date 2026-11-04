import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import '@testing-library/jest-dom'
import ItemSelector from '../ItemSelector.jsx'

const mockQuery = jest.fn()

jest.mock('@dhis2/app-runtime', () => ({
    useDataEngine: () => ({ query: mockQuery }),
}))

const openMenu = () =>
    userEvent.click(screen.getByPlaceholderText('Search by user'))

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
})
