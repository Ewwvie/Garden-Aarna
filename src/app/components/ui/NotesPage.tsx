import React from 'react';
import notesData from '../data/notes.json';
import './NotesPage.css';

export const NotesPage: React.FC = () => {
  const sortedNotes = [...notesData].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="notes-page-wrapper">
      {/* Navigation back to main site */}
      <nav className="notes-nav">
        <a href="#" className="back-btn">← Back to Garden</a>
      </nav>

      <main className="notes-container">
        <header className="notes-page-header">
          <h1>Notes for You ✨</h1>
          <p>A little space for special moments.</p>
        </header>

        <div className="notes-grid">
          {sortedNotes.map((note) => (
            <article key={note.id} className="note-card">
              <div className="note-header">
                <span className="note-occasion">{note.occasion}</span>
                <time className="note-date">
                  {new Date(note.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              <h3 className="note-title">{note.title}</h3>
              <p className="note-content">{note.content}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};