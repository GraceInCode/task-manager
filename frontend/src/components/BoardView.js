import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrop } from 'react-dnd';
import api from '../api';
import { AppContext } from '../context/appContext';
import io from 'socket.io-client';
import Card from './Card';
import CardModal from './CardModal';
import { toast } from 'react-toastify';

const ItemType = 'CARD';

const socket = io(process.env.REACT_APP_SOCKET_URL || 'https://task-manager-yjcd.onrender.com', { 
  auth: { token: localStorage.getItem('token') },
  transports: ['websocket', 'polling'],
});

const List = ({ list, cards, handleDrop, handleAddCard, handleCardClick, index }) => {
  const [, drop] = useDrop(() => ({
    accept: ItemType,
    drop: (item) => {
      if (item.listName === list) return;
      const newPosition = cards.length;
      handleDrop(item.id, list, newPosition);
    }
  }))

  const listStyles = {
    'To Do': {
      bg: 'bg-coral border-l-4 border-l-rust shadow-torn',
      header: 'bg-rust text-cream font-display font-bold',
      rotation: 'transform rotate-1'
    },
    'In Progress': {
      bg: 'bg-sage border-l-4 border-l-moss shadow-paper',
      header: 'bg-charcoal text-sage font-mono',
      rotation: 'transform -rotate-1'
    },
    'Done': {
      bg: 'bg-lavender border-l-4 border-l-plum shadow-soft',
      header: 'bg-plum text-cream font-handwriting handwriting',
      rotation: 'transform rotate-2'
    }
  };

  const style = listStyles[list];

  return (
    <div 
      ref={drop}  
      className={`${style.bg} ${style.rotation} p-6 min-h-[500px] w-80 flex-shrink-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-ink-drop`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className={`px-4 py-2 ${style.header} text-sm tracking-wide`}>
          <span>{list.toLowerCase().replace(' ', '_')}()</span>
        </div>
        <div className="w-8 h-8 bg-charcoal text-cream font-mono text-xs flex items-center justify-center transform rotate-12">
          {cards.length}
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        {cards
          .sort((a, b) => a.position - b.position)
          .map((card, cardIndex) => (
            <div key={card.id} onClick={() => handleCardClick(card)} className="cursor-fancy">
              <Card card={card} index={cardIndex} listName={list} onDrop={handleDrop} />
            </div>
          ))}
      </div>
      
      <button 
        onClick={() => handleAddCard(list)}
        className="w-full py-4 px-4 text-charcoal hover:text-ink bg-cream hover:bg-sand border-2 border-dashed border-clay hover:border-rust transition-all duration-200 font-mono text-sm group transform hover:-rotate-1"
      >
        <span className="flex items-center justify-center space-x-2">
          <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>add.card()</span>
        </span>
      </button>
    </div>
  );
};

const BoardView = () => {
  const { id } = useParams();
  const { token } = useContext(AppContext);
  const [board, setBoard] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [selectedList, setSelectedList] = useState('');

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  useEffect(() => {
    if (!token) return;
    const fetchBoard = async () => {
      try {
        const res = await api.get(`/boards/${id}`);
        setBoard(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBoard();

    socket.emit('joinBoard', id);
    socket.on('cardUpdated', (data) => {
      const card = data.card || data;
      const user = data.user;
      setBoard(prev => ({ ...prev, cards: prev.cards.map(c => c.id === card.id ? card : c) }));
      toast.info(`Card updated by ${user?.email || 'another user'}`)
    });
    socket.on('commentAdded', (data) => {
      const user = data.user;
      toast.info(`New comment added by ${user?.email || 'another user'}`)
    })
    socket.on('attachmentAdded', (data) => {
      const user = data.user;
      toast.info(`New attachment added by ${user?.email || 'another user'}`)
    })

    return () => {
      socket.emit('leaveBoard', id);
      socket.off('cardUpdated');
      socket.off('commentAdded');
      socket.off('attachmentAdded');
    }
  }, [id, token]);

  if (!board) return (
    <div className="min-h-screen bg-cream cursor-ink flex items-center justify-center">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-charcoal transform rotate-45 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-terracotta border-t-transparent animate-spin transform -rotate-45"></div>
        </div>
        <span className="font-mono text-rust text-lg tracking-wide">// loading.board()</span>
      </div>
    </div>
  );

  const lists = ['To Do', 'In Progress', 'Done'];  

  const handleDrop = async (cardId, newList, newPosition) => {
    try {
      setBoard(prev => {
        let updatedCards = [...prev.cards];
        const cardIndex = updatedCards.findIndex(c => c.id === cardId);
        updatedCards[cardIndex] = { ...updatedCards[cardIndex], listName: newList, position: newPosition };
        updatedCards = updatedCards.map(c => {
          if (c.listName === newList) c.position = updatedCards.filter(nc => nc.listName === newList).indexOf(c);
          return c;
        })
        return { ...prev, cards: updatedCards };
      });

      await api.put(`/cards/${cardId}`, { listName: newList, position: newPosition });
    } catch (err) {
      console.error('Drop card error:', err);
      const res = await api.get(`/boards/${id}`);
      setBoard(res.data);
    }
  };

  const handleAddCard = async (list) => {
    setSelectedList(list);
    setNewCardTitle('');
    setShowAddCardModal(true);
  };

  const createCard = async () => {
    if (!newCardTitle.trim()) return;
    try {
      const position = board.cards.filter(c => c.listName === selectedList).length;
      const res = await api.post(`/boards/${id}/cards`, { title: newCardTitle, listName: selectedList, position });
      setBoard(prev => ({ ...prev, cards: [...prev.cards, res.data] }));
      setShowAddCardModal(false);
      setNewCardTitle('');
    } catch (err) {
      console.error('Add card error:', err);
      toast.error('Failed to add card. Please try again.');
    }
  }

  const handleShare = async () => {
    try {
      const res = await api.post(`/boards/${id}/share`);
      const shareLink = `${window.location.origin}/join?token=${res.data.shareToken}`;
      await navigator.clipboard.writeText(shareLink);
      toast.success('Share link copied to clipboard!');
      toast.info(shareLink, { autoClose: 8000 });
    } catch (err) {
      console.error('Share error:', err);
      toast.error('Failed to generate share link');
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-cream cursor-ink">
        {/* Asymmetric Header */}
        <div className="bg-sand border-b-4 border-clay sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-end justify-between">
              <div className="flex items-end space-x-4">
                <button 
                  onClick={() => window.history.back()}
                  className="w-12 h-12 bg-charcoal hover:bg-ink text-terracotta hover:text-rust transition-all duration-200 transform hover:-rotate-12 flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="font-display text-4xl font-bold text-charcoal leading-none mb-1">{board.title}</h1>
                  <p className="font-mono text-sm text-rust tracking-wide">// collaborative.workspace()</p>
                </div>
              </div>
              <button
                onClick={handleShare}
                className="group flex items-center space-x-3 px-6 py-3 bg-rust hover:bg-terracotta text-cream font-mono text-sm transform hover:-rotate-2 transition-all duration-200 shadow-brutal hover:shadow-ink-drop"
              >
                <span>share.link()</span>
                <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Board Content */}
        <div className="p-8">
          <div className="flex space-x-8 overflow-x-auto pb-8">
            {lists.map((list, index) => (
              <List 
                key={list}
                list={list}
                index={index}
                cards={board.cards.filter(c => c.listName === list)}
                handleDrop={handleDrop}
                handleAddCard={handleAddCard}
                handleCardClick={handleCardClick}
              />
            ))}
          </div>
        </div>

        {selectedCard && (
          <CardModal
            card={selectedCard}
            board={board}
            onClose={() => setSelectedCard(null)}
            onUpdate={(updated) => {
              setBoard(prev => ({
                ...prev,
                cards: prev.cards.map(c => c.id === updated.id ? updated : c)
              }))
            }}
          />
        )}

        {/* Add Card Modal */}
        {showAddCardModal && (
          <div className="fixed inset-0 bg-charcoal bg-opacity-80 flex items-center justify-center z-50 cursor-ink" onClick={() => setShowAddCardModal(false)}>
            <div className="bg-sand border-4 border-clay p-8 max-w-md w-full mx-4 shadow-brutal transform rotate-1" onClick={(e) => e.stopPropagation()}>
              <h2 className="font-display text-2xl font-bold text-charcoal mb-4">Add Card</h2>
              <p className="font-mono text-sm text-rust mb-6">// {selectedList.toLowerCase().replace(' ', '_')}()</p>
              <input
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                placeholder="Enter card title..."
                className="w-full px-6 py-4 bg-cream border-2 border-clay focus:border-rust focus:outline-none font-sans text-charcoal placeholder-fog mb-6"
                onKeyPress={(e) => e.key === 'Enter' && createCard()}
                autoFocus
              />
              <div className="flex space-x-3">
                <button
                  onClick={createCard}
                  disabled={!newCardTitle.trim()}
                  className="flex-1 px-6 py-3 bg-rust hover:bg-terracotta disabled:bg-fog disabled:cursor-not-allowed text-cream font-mono text-sm transition-colors duration-200"
                >
                  create()
                </button>
                <button
                  onClick={() => setShowAddCardModal(false)}
                  className="flex-1 px-6 py-3 bg-charcoal hover:bg-ink text-cream font-mono text-sm transition-colors duration-200"
                >
                  cancel()
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default BoardView;