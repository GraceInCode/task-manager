import React, { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/appContext';
import api from '../api';
import { toast } from 'react-toastify';

const Join = () => {
  const [searchParams] = useSearchParams();
  const { token } = useContext(AppContext);
  const navigate = useNavigate();
  const shareToken = searchParams.get('token');

  useEffect(() => {
    const joinBoard = async () => {
      if (!shareToken) {
        toast.error('Invalid share link');
        navigate('/dashboard');
        return;
      }

      if (!token) {
        toast.info('Please log in to join the board');
        navigate(`/login?redirect=/join?token=${shareToken}`);
        return;
      }

      try {
        const res = await api.post('/boards/join', { shareToken });
        toast.success(`Joined board: ${res.data.title}`);
        navigate(`/boards/${res.data.id}`);
      } catch (err) {
        console.error('Join error:', err);
        toast.error('Failed to join board. Link may be expired.');
        navigate('/dashboard');
      }
    };

    joinBoard();
  }, [shareToken, token, navigate]);

  return (
    <div className="min-h-screen bg-cream cursor-ink flex items-center justify-center">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-charcoal transform rotate-45 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-terracotta border-t-transparent animate-spin transform -rotate-45"></div>
        </div>
        <span className="font-mono text-rust text-lg tracking-wide">// joining.board()</span>
      </div>
    </div>
  );
};

export default Join;