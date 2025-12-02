import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        if (isMounted) {
          setUser(res.data);
          setUsername(res.data.username || '');
        }
      } catch (err) {
        if (isMounted) {
          console.error('Fetch profile error:', err);
          if (err.response?.status === 404) {
            toast.error('Profile endpoint not available. Please deploy the latest backend code.');
          } else {
            toast.error('Failed to load profile');
          }
        }
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, []);

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.put('/auth/username', { username });
      setUser(res.data);
      toast.success('Username updated successfully!');
    } catch (err) {
      console.error('Update username error:', err);
      const errorMsg = err.response?.data?.msg || 'Failed to update username';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-cream cursor-ink flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-charcoal transform rotate-45 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-terracotta border-t-transparent animate-spin transform -rotate-45"></div>
          </div>
          <span className="font-mono text-rust text-lg tracking-wide">// loading.profile()</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream cursor-ink">
      <div className="bg-sand border-b-4 border-clay sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-end justify-between">
            <div className="flex items-end space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-12 h-12 bg-charcoal hover:bg-ink text-terracotta hover:text-rust transition-all duration-200 transform hover:-rotate-12 flex items-center justify-center"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="font-display text-4xl font-bold text-charcoal leading-none mb-1">Profile</h1>
                <p className="font-mono text-sm text-rust tracking-wide">// user.settings()</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-12">
        <div className="bg-sand border-l-8 border-l-rust p-8 shadow-paper transform rotate-1 mb-8">
          <h2 className="font-display text-2xl font-bold text-charcoal mb-6">Account Information</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block font-mono text-sm font-medium text-charcoal mb-3 tracking-wide">
                email_address
              </label>
              <div className="w-full px-6 py-4 bg-clay border-2 border-fog font-sans text-fog cursor-not-allowed">
                {user.email}
              </div>
              <p className="font-mono text-xs text-fog mt-2">// email cannot be changed</p>
            </div>

            <form onSubmit={handleUpdateUsername}>
              <label className="block font-mono text-sm font-medium text-charcoal mb-3 tracking-wide">
                username
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_username"
                  required
                  className="flex-1 px-6 py-4 bg-cream border-2 border-clay focus:border-terracotta focus:outline-none font-sans text-charcoal placeholder-fog transition-all duration-200"
                />
                <button
                  type="submit"
                  disabled={isLoading || username === user.username}
                  className="px-6 py-4 bg-rust hover:bg-terracotta disabled:bg-fog disabled:cursor-not-allowed text-cream font-mono text-sm shadow-brutal hover:shadow-ink-drop transition-all duration-200 transform hover:-translate-y-1 disabled:transform-none"
                >
                  {isLoading ? 'saving...' : 'update()'}
                </button>
              </div>
              <p className="font-mono text-xs text-rust mt-2">// this is how others will see you</p>
            </form>
          </div>
        </div>

        <div className="bg-lavender border-l-8 border-l-plum p-8 shadow-soft transform -rotate-1">
          <h2 className="font-display text-2xl font-bold text-charcoal mb-4">User ID</h2>
          <div className="font-mono text-charcoal bg-cream p-4 border-2 border-plum">
            {user.id}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
