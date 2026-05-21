import { useState } from 'react';
import { NotesProvider } from './context/NotesContext';
import { AppToaster } from './components/AppToaster';
import { NoteListScreen } from './components/NoteListScreen';
import { NoteEditor } from './components/NoteEditor';

type AppView = 'list' | 'editor';

export function App() {
  const [view, setView] = useState<AppView>('list');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
    setIsCreating(false);
    setView('editor');
  };

  const handleNewNote = () => {
    setSelectedNoteId(null);
    setIsCreating(true);
    setView('editor');
  };

  const handleDone = () => {
    setIsCreating(false);
    setView('list');
  };

  return (
    <NotesProvider>
      {/* 모바일 셸: max-width 390px, 화면 중앙 */}
      <div
        style={{
          maxWidth: 390,
          margin: '0 auto',
          minHeight: '100dvh',
          background: 'var(--color-background-app)',
          position: 'relative',
          isolation: 'isolate',
        }}
      >
        {view === 'list' ? (
          <NoteListScreen
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
            onNewNote={handleNewNote}
          />
        ) : (
          <NoteEditor
            selectedNoteId={selectedNoteId}
            isCreating={isCreating}
            onDone={handleDone}
          />
        )}
      </div>
      <AppToaster />
    </NotesProvider>
  );
}
