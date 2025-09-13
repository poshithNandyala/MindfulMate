import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { journalAPI } from '../utils/api';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';

interface JournalEntry {
  _id: string;
  title: string;
  entry: string;
  username: string;
  timestamp: string;
}

const UserJournals: React.FC = () => {
  const { user, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [journalCount, setJournalCount] = useState(0);
  const [expandedJournals, setExpandedJournals] = useState<Set<string>>(new Set());

  // Load current user's journals on component mount
  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
      loadUserJournals(user.username);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadUserJournals = async (userToLoad?: string) => {
    const targetUsername = userToLoad || username;
    if (!targetUsername.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await journalAPI.getUserJournals(targetUsername);
      setJournals(response.journals || []);
      setJournalCount(response.count || 0);
    } catch (error) {
      console.error('Error loading user journals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = (journalId: string) => {
    const newExpanded = new Set(expandedJournals);
    if (newExpanded.has(journalId)) {
      newExpanded.delete(journalId);
    } else {
      newExpanded.add(journalId);
    }
    setExpandedJournals(newExpanded);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-secondary-bg to-dark text-light p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-light mb-8">
          My Journals
        </h1>

        {/* Current User Section */}
        {user && (
          <div className="bg-dark/50 border border-medium/30 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-light">
                  Welcome back, {user.username}!
                </h2>
                <p className="text-medium text-sm mt-1">
                  {user.email}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-medium">Your journals</p>
                  <p className="text-2xl font-bold text-accent-color">{journalCount}</p>
                </div>
                <CustomButton
                  title="Logout"
                  onPress={() => {
                    logout();
                    window.location.href = '/welcome';
                  }}
                  variant="accent"
                  size="sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Search Other Users Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Search Other User's Journals
          </h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <InputField
                placeholder="Enter username"
                value={username}
                onChangeText={setUsername}
                className="w-full"
              />
            </div>
            <CustomButton
              title={isLoading ? 'Loading...' : 'Load Journals'}
              onPress={loadUserJournals}
              disabled={!username.trim() || isLoading}
              className="px-6 py-2"
            />
          </div>
        </div>

        {/* Results Section */}
        {username.trim() && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-700">
                {username === user?.username ? 'Your Journals' : `Journals by "${username}"`}
              </h2>
              <div className="text-sm text-gray-500">
                {journalCount} {journalCount === 1 ? 'entry' : 'entries'} found
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-2 text-gray-600">Loading journals...</p>
              </div>
            ) : journals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">No journal entries found for this user.</p>
                <p className="text-sm mt-2">
                  Make sure the username is correct and the user has created journal entries.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {journals.map((journal) => (
                  <div
                    key={journal._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 flex-1 mr-4">
                        {journal.title}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(journal.timestamp)}
                      </span>
                    </div>
                    
                    <div className="text-gray-600 mb-3">
                      {expandedJournals.has(journal._id) ? (
                        <div className="whitespace-pre-wrap">{journal.entry}</div>
                      ) : (
                        <div>{truncateText(journal.entry)}</div>
                      )}
                    </div>

                    {journal.entry.length > 150 && (
                      <button
                        onClick={() => toggleExpanded(journal._id)}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium focus:outline-none"
                      >
                        {expandedJournals.has(journal._id) ? 'Show Less' : 'Read More'}
                      </button>
                    )}

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-400">
                        By: {journal.username}
                      </span>
                      <span className="text-xs text-gray-400">
                        ID: {journal._id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserJournals;
