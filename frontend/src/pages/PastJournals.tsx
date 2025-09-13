import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { journalAPI } from '../utils/api';
import CustomButton from '../components/CustomButton';

interface JournalEntry {
  _id: string;
  title: string;
  entry: string;
  username: string;
  timestamp: string;
}

interface GroupedJournals {
  [date: string]: JournalEntry[];
}



const PastJournals: React.FC = () => {
  const { user, logout } = useAuth();
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [groupedJournals, setGroupedJournals] = useState<GroupedJournals>({});
  const [isLoading, setIsLoading] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.username) {
      loadUserJournals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadUserJournals = async () => {
    if (!user?.username) return;
    
    setIsLoading(true);
    try {
      const response = await journalAPI.getUserJournals(user.username);
      const journalList = response.journals || [];
      setJournals(journalList);
      
      // Group journals by date
      const grouped = groupJournalsByDate(journalList);
      setGroupedJournals(grouped);
    } catch (error) {
      console.error('Error loading user journals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupJournalsByDate = (journalList: JournalEntry[]): GroupedJournals => {
    const grouped: GroupedJournals = {};
    
    journalList.forEach(journal => {
      const date = new Date(journal.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(journal);
    });
    
    // Sort entries within each date by time (newest first)
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    });
    
    return grouped;
  };

  const toggleExpanded = (journalId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(journalId)) {
      newExpanded.delete(journalId);
    } else {
      newExpanded.add(journalId);
    }
    setExpandedEntries(newExpanded);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Sort dates (newest first)
  const sortedDates = Object.keys(groupedJournals).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-secondary-bg to-dark text-light flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-light mb-4">Please sign in to view your journals</h2>
          <p className="text-medium mb-6">You need to be logged in to access your past journal entries.</p>
          <CustomButton
            title="Sign In"
            onPress={() => window.location.href = '/signin'}
            variant="primary"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-secondary-bg to-dark text-light p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-light">Past Journals</h1>
            <p className="text-medium mt-2">Your journal entries organized by date</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-medium">Total entries</p>
            <p className="text-3xl font-bold text-accent-color">{journals.length}</p>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-dark/50 border border-medium/30 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-light">
                {user.username}'s Journal History
              </h2>
              <p className="text-medium text-sm mt-1">
                {user.email}
              </p>
            </div>
            <div className="flex gap-3">
              <CustomButton
                title="Refresh"
                onPress={loadUserJournals}
                disabled={isLoading}
                variant="secondary"
                size="sm"
              />
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

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-color"></div>
            <p className="mt-4 text-medium">Loading your journals...</p>
          </div>
        ) : journals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📔</div>
            <h3 className="text-2xl font-semibold text-light mb-2">No journals yet</h3>
            <p className="text-medium mb-6">Start writing your first journal entry to see it here.</p>
            <CustomButton
              title="Create First Journal"
              onPress={() => window.location.href = '/journal'}
              variant="primary"
            />
          </div>
        ) : (
          /* Journal Entries Grouped by Date */
          <div className="space-y-8">
            {sortedDates.map(date => (
              <div key={date} className="bg-dark/50 border border-medium/30 rounded-lg shadow-lg overflow-hidden">
                {/* Date Header */}
                <div className="bg-gradient-to-r from-accent-color to-teal-400 text-white p-6">
                  <h2 className="text-2xl font-semibold">{date}</h2>
                  <p className="text-teal-100 mt-1">
                    {groupedJournals[date].length} {groupedJournals[date].length === 1 ? 'entry' : 'entries'}
                  </p>
                </div>

                {/* Entries for this date */}
                <div className="divide-y divide-medium/20">
                  {groupedJournals[date].map(journal => (
                    <div key={journal._id} className="p-6 hover:bg-dark/30 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-light flex-1 mr-4">
                          {journal.title}
                        </h3>
                        <span className="text-sm text-medium whitespace-nowrap">
                          {formatTime(journal.timestamp)}
                        </span>
                      </div>
                      
                      <div className="text-light/90 mb-4">
                        {expandedEntries.has(journal._id) ? (
                          <div className="whitespace-pre-wrap">{journal.entry}</div>
                        ) : (
                          <div>{truncateText(journal.entry)}</div>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        {journal.entry.length > 150 && (
                          <button
                            onClick={() => toggleExpanded(journal._id)}
                            className="text-accent-color hover:text-teal-400 text-sm font-medium focus:outline-none"
                          >
                            {expandedEntries.has(journal._id) ? 'Show Less' : 'Read More'}
                          </button>
                        )}
                        <span className="text-xs text-medium/60 ml-auto">
                          ID: {journal._id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PastJournals;
