import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { AppContext } from '../context/appContext';

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { token, logout } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate('/login');
    const fetchBoards = async () => {
      try {
        const res = await api.get('/boards'); 
        setBoards(res.data);
      } catch (err) {
        console.error('Fetch boards error:', err);
      }
    };
    fetchBoards();
  }, [token, navigate]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setIsCreating(true);
    try {
      const res = await api.post('/boards', { title: newTitle });
      setBoards([...boards, res.data]);
      setNewTitle('');
    } catch (err) {
      console.error('Create board error:', err);
    } finally {
      setIsCreating(false);
    }
  }

  const boardStyles = [
    // Torn paper with coral accent
    'torn-edge bg-coral border-l-4 border-l-rust shadow-torn hover-lift',
    // Dog ear with sage background
    'dog-ear bg-sage border border-moss shadow-paper hover-tilt',
    // Handwritten style with lavender
    'bg-lavender border-2 border-dashed border-plum shadow-soft hover-wiggle',
    // Minimal with left accent
    'bg-cream border-l-8 border-l-terracotta shadow-ink-drop hover-lift',
    // Brutalist style
    'bg-peach border-2 border-charcoal shadow-brutal hover-tilt',
    // Floating style
    'bg-mint border border-sage shadow-soft-warm hover-lift animate-float',
  ];

  const getAvatarStyle = (index, title) => {
    const styles = [
      'bg-gradient-to-br from-rust to-terracotta text-cream font-display font-bold text-lg',
      'bg-charcoal text-sage font-mono text-sm border-2 border-sage',
      'bg-gradient-to-tr from-plum to-lavender text-cream font-handwriting text-xl transform rotate-3',
      'bg-coral text-charcoal font-sans font-black text-base border border-rust',
      'bg-ink text-peach font-display font-medium text-lg border-2 border-peach',
      'bg-sage text-cream font-mono text-sm transform -rotate-2',
    ];
    return styles[index % styles.length];
  };

  return (
    <div className="min-h-screen bg-cream cursor-ink">
      {/* Asymmetric Header */}
      <div className="bg-sand border-b-4 border-clay sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-end justify-between">
            <div className="flex items-end space-x-4">
              <div className="w-12 h-12 bg-charcoal transform rotate-12 flex items-center justify-center">
                <span className="text-terracotta font-display font-bold text-xl transform -rotate-12">T</span>
              </div>
              <div>
                <h1 className="font-display text-4xl font-bold text-charcoal leading-none mb-1">Your Boards</h1>
                <p className="font-mono text-sm text-rust tracking-wide">// creative workspace</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-6 py-2 bg-charcoal text-cream font-mono text-sm hover:bg-ink transition-colors duration-200 transform hover:-rotate-1"
            >
              exit()
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Asymmetric Create Section */}
        <div className="mb-16 max-w-2xl">
          <div className="bg-sand border-l-8 border-l-terracotta p-8 shadow-paper transform -rotate-1">
            <h2 className="font-display text-2xl font-semibold text-charcoal mb-6 handwriting">Start something new</h2>
            <div className="space-y-4">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What's brewing in your mind?"
                className="w-full px-6 py-4 bg-cream border-2 border-clay focus:border-rust focus:outline-none font-sans text-charcoal placeholder-fog transform focus:rotate-0 transition-transform duration-200"
                onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
              />
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim() || isCreating}
                className="px-8 py-4 bg-rust hover:bg-terracotta disabled:bg-fog disabled:cursor-not-allowed text-cream font-sans font-semibold shadow-brutal hover:shadow-ink-drop transition-all duration-200 transform hover:-translate-y-1 hover:rotate-1"
              >
                {isCreating ? 'Crafting...' : 'Create Board'}
              </button>
            </div>
          </div>
        </div>

        {/* Unique Board Grid */}
        {boards.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-clay transform rotate-45 flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-rust transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="font-display text-3xl font-bold text-charcoal mb-4">The canvas awaits</h3>
            <p className="font-mono text-rust text-lg">// create your first masterpiece</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {boards.map((board, index) => {
              const cardStyle = boardStyles[index % boardStyles.length];
              const avatarStyle = getAvatarStyle(index, board.title);
              
              return (
                <Link
                  key={board.id}
                  to={`/board/${board.id}`}
                  className={`group p-6 cursor-fancy transition-all duration-300 ${cardStyle}`}
                  style={{
                    transform: `rotate(${(index % 3 - 1) * 2}deg)`,
                  }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 flex items-center justify-center ${avatarStyle}`}>
                      <span>
                        {board.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-charcoal opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                  
                  <h3 className={`font-sans font-bold text-xl text-charcoal mb-3 group-hover:text-ink transition-colors duration-200 ${
                    index % 4 === 2 ? 'font-handwriting text-2xl handwriting' : ''
                  }`}>
                    {board.title}
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm text-rust">
                      {board.cards?.length || 0}
                    </span>
                    <span className="font-mono text-xs text-fog">
                      {board.cards?.length === 1 ? 'card' : 'cards'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Unique Share Section */}
        {boards.length > 0 && (
          <div className="mt-20 flex justify-end">
            <button
              onClick={async () => {
                const boardOptions = boards.map(b => `${b.id}: ${b.title}`).join('\n');
                const selection = prompt(`Select a board to share:\n\n${boardOptions}\n\nEnter the number:`);
                const boardId = parseInt(selection);
                if (!boardId || !boards.find(b => b.id === boardId)) return;
                try {
                  const res = await api.post(`/boards/${boardId}/share`);
                  const shareLink = `${window.location.origin}/join?token=${res.data.shareToken}`;
                  navigator.clipboard.writeText(shareLink);
                  alert(`Share link copied to clipboard:\n\n${shareLink}`);
                } catch (err) {
                  alert('Failed to generate share link. Make sure you own this board.');
                }
              }}
              className="group flex items-center space-x-3 px-6 py-3 bg-sage hover:bg-moss text-cream font-mono text-sm transform hover:-rotate-2 transition-all duration-200 shadow-paper hover:shadow-ink-drop"
            >
              <span>share.link()</span>
              <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;