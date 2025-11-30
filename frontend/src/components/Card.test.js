import { render, screen } from '@testing-library/react';
import Card from './Card';

jest.mock('react-dnd', () => ({
    useDrag: () => [{ isDragging: false }, jest.fn()],
    useDrop: () => [{}, jest.fn()],
}));

test('renders card', () => {
    const mockCard = { id: 1, title: 'Test Card', description: 'Test description' };
    const mockOnDrop = jest.fn();

    render(<Card card={mockCard} index={0} listName="To Do" onDrop={mockOnDrop} />);

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
});
