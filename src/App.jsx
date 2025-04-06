import { useState } from 'react';
import './App.css';
import { Midi } from '@tonejs/midi';
import PianoRoll from './PianoRoll';
import AudioPlayer from './AudioPlayer';

function App() {
  const [midiFile, setMidiFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [notes, setNotes] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);

  const handleMidiUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.mid')) {
      const arrayBuffer = await file.arrayBuffer();
      const midi = new Midi(arrayBuffer);

      // Flatten all notes from all tracks into one array
      const allNotes = midi.tracks.flatMap(track => track.notes);
      setNotes(allNotes);
      setMidiFile(file);
    }
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith('.wav') || file.name.endsWith('.mp3'))) {
      setAudioFile(URL.createObjectURL(file));
    }
  };

  const handleSeek = (time) => {
    setCurrentTime(time);
  };

  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>MIDI Editor</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Load MIDI file:
          <input type="file" accept=".mid" onChange={handleMidiUpload} />
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Load audio file:
          <input type="file" accept=".wav,.mp3" onChange={handleAudioUpload} />
        </label>
      </div>

      {midiFile && <p>✅ MIDI Loaded: {midiFile.name}</p>}
      {audioFile && (
        <div>
          <p>✅ Audio Loaded</p>
          <AudioPlayer 
            audioFile={audioFile} 
            notes={notes}
            currentTime={currentTime}
            onTimeUpdate={handleTimeUpdate}
          />
        </div>
      )}

      {notes.length > 0 && (
        <>
          <h2>Piano Roll</h2>
          <PianoRoll 
            notes={notes} 
            currentTime={currentTime}
            onSeek={handleSeek}
          />
        </>
      )}
    </div>
  );
}

export default App;

