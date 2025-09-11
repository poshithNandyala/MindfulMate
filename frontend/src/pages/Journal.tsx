import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { journalAPI } from '../utils/api';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import MoodModal from '../components/MoodModal';
import 'react-calendar/dist/Calendar.css';

interface JournalEntry {
  _id: string;
  title: string;
  entry: string;
  timestamp: string;
}

const Journal: React.FC = () => {
  const [title, setTitle] = useState('');
  const [entry, setEntry] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const loadEntries = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await journalAPI.getEntries(dateStr);
      setEntries(response.journals || []);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  };

  const saveEntry = async () => {
    if (!title.trim() || !entry.trim()) return;

    setIsLoading(true);
    try {
      await journalAPI.saveEntry(title, entry);
      setTitle('');
      setEntry('');
      await loadEntries();
      setShowMoodModal(true);
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
    setIsLoading(false);
  };

  const handleDateChange = (date: any) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const handleMoodSelect = (mood: string) => {
    console.log('Mood selected:', mood);
    // Here you could save the mood to backend if needed
  };

  return (
    <div className="flex-1 p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-light">📔 Journal</h1>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="text-light hover:text-medium transition-colors text-2xl"
          >
            📅
          </button>
        </div>

        {/* Calendar */}
        {showCalendar && (
          <div className="mb-6">
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              className="bg-dark text-light border-medium rounded-lg w-full"
            />
          </div>
        )}

        {/* Current Date */}
        <div className="mb-6">
          <h2 className="text-xl text-light">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
        </div>

        {/* New Entry Form */}
        <div className="bg-dark/50 border border-medium/30 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-light mb-4">New Entry</h3>
          
          <InputField
            label="Title"
            placeholder="What's on your mind today?"
            value={title}
            onChangeText={setTitle}
          />
          
          <InputField
            label="Your thoughts..."
            placeholder="Write about your day, feelings, or anything you'd like to remember..."
            value={entry}
            onChangeText={setEntry}
            multiline
            rows={5}
          />
          
          <CustomButton
            title={isLoading ? "Saving..." : "Save Entry"}
            onPress={saveEntry}
            disabled={!title.trim() || !entry.trim() || isLoading}
            className="w-full"
          />
        </div>

        {/* Previous Entries */}
        <div>
          <h3 className="text-lg font-semibold text-light mb-4">
            Entries for {selectedDate.toLocaleDateString()}
          </h3>
          
          {entries.length === 0 ? (
            <div className="bg-dark/30 border border-medium/20 rounded-lg p-6 text-center">
              <p className="text-medium">No entries for this date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entryItem) => (
                <div
                  key={entryItem._id}
                  className="bg-dark/50 border border-medium/30 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-semibold text-light">
                      {entryItem.title}
                    </h4>
                    <span className="text-sm text-medium">
                      {new Date(entryItem.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-light/90 whitespace-pre-wrap">
                    {entryItem.entry}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mood Modal */}
        <MoodModal
          isVisible={showMoodModal}
          onClose={() => setShowMoodModal(false)}
          onMoodSelect={handleMoodSelect}
        />
      </div>
    </div>
  );
};

export default Journal;
