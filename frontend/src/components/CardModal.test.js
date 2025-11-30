import { render, screen, fireEvent, waitFor } from '@testing-library/react';

jest.mock('../api', () => ({
    get: jest.fn(() => Promise.resolve({ data: [] })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
}));

import CardModal from './CardModal';
import api from '../api';

test('renders modal and saves changes', async () => {
    const mockCard = { id: 1, title: 'Test Card', description: 'This is a test card.', updatedAt: new Date().toISOString() };
    const mockBoard = { id: 1, cards: [mockCard] };
    
    window.alert = jest.fn();
    api.put.mockResolvedValue({ data: { ...mockCard, title: 'New Title' } });

    render(<CardModal card={mockCard} board={mockBoard} onClose={jest.fn()} onUpdate={jest.fn()} />);

    await waitFor(() => screen.getByDisplayValue('Test Card'));

    fireEvent.change(screen.getByDisplayValue('Test Card'), { target: { value: 'New Title' } });
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/cards/1', expect.objectContaining({ title: 'New Title' })));
});
