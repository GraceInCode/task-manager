import React from "react";
import { useDrag, useDrop } from "react-dnd";

const ItemType = 'CARD';

const Card = ({ card, index, listName, onDrop }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemType,
        item: { id: card.id, listName, index },
        collect: monitor => ({ isDragging: !!monitor.isDragging() }),
    }));

    const [, drop] = useDrop(() => ({
        accept: ItemType,
        hover: (item, monitor) => {
            if (item.listName === listName && item.index === index) return;
            onDrop(item.id, listName, index);
            item.index = index;
            item.listName = listName;
        }, 
    }));

    const cardStyles = [
        'bg-cream border-l-4 border-l-rust shadow-paper transform rotate-1',
        'bg-sand border-l-4 border-l-terracotta shadow-torn transform -rotate-1', 
        'bg-peach border-l-4 border-l-coral shadow-soft transform rotate-2',
        'bg-mint border-l-4 border-l-sage shadow-ink-drop transform -rotate-2'
    ];
    
    const cardStyle = cardStyles[index % cardStyles.length];

    return (
        <div 
            ref={(node) => drag(drop(node))} 
            className={`
                ${cardStyle} p-4 
                hover:shadow-brutal hover:scale-[1.02] hover:bg-sand
                transition-all duration-200 cursor-fancy group
                ${isDragging ? 'opacity-50 scale-105 shadow-ink-drop rotate-6' : ''}
            `}
        >
            <h3 className="font-sans font-semibold text-charcoal group-hover:text-ink transition-colors duration-200 leading-snug mb-2">
                {card.title}
            </h3>
            
            {card.description && (
                <p className="text-sm text-rust font-mono mt-2 line-clamp-2">
                  <span className="text-fog">// </span>{card.description}
                </p>
            )}
            
            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                    {card.assigneeId && (
                        <div className="w-7 h-7 bg-charcoal text-terracotta font-display font-bold text-sm flex items-center justify-center transform rotate-12">
                            <span>
                                {card.assignee?.email?.charAt(0).toUpperCase() || 'A'}
                            </span>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center space-x-3 text-xs text-fog font-mono">
                    {card.comments?.length > 0 && (
                        <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{card.comments.length}</span>
                        </div>
                    )}
                    
                    {card.attachments?.length > 0 && (
                        <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <span>{card.attachments.length}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Card;