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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-600 font-medium">Joining board...</span>
      </div>
    </div>
  );
};

export default Join;