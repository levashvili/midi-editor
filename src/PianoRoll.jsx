import React from 'react';

const NOTE_HEIGHT = 20;
const PIXELS_PER_SECOND = 120;
const LABEL_WIDTH = 50;
const GRID_COLOR = '#ddd';
const LABEL_COLOR = '#333';
const PLAYHEAD_COLOR = '#ff0000';
const PLAYHEAD_WIDTH = 2;

// Color mapping for notes
const NOTE_COLORS = {
  'C': '#ff9999',  // brighter red
  'C#': '#ffb366', // brighter orange-red
  'D': '#ffcc66',  // brighter orange
  'D#': '#ffe666', // brighter yellow-orange
  'E': '#ffff66',  // brighter yellow
  'F': '#d9ff99',  // brighter yellow-green
  'F#': '#99ff99', // brighter green
  'G': '#99ffd9',  // brighter teal-green
  'G#': '#ccf2ff', // light blue-teal (adjusted to be closer to A)
  'A': '#d9ccff',  // light purple (adjusted to be closer to G#)
  'A#': '#f2ccff', // light pink-purple
  'B': '#ffb3ff',  // brighter pink
};

function midiToNoteName(midi) {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const name = noteNames[midi % 12];
  return `${name}${octave}`;
}

function getNoteColor(midi) {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteName = noteNames[midi % 12];
  return NOTE_COLORS[noteName];
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default function PianoRoll({ notes, currentTime = 0, onSeek }) {
  if (!notes || notes.length === 0) return null;

  const minMidi = Math.min(...notes.map(n => n.midi));
  const maxMidi = Math.max(...notes.map(n => n.midi));
  const midiRange = maxMidi - minMidi + 1;

  // figure out total width (seconds → pixels)
  const maxEndTime = Math.max(...notes.map(n => n.time + n.duration));
  const viewWidth = maxEndTime * PIXELS_PER_SECOND;
  const viewHeight = midiRange * NOTE_HEIGHT;

  // Calculate playhead position
  const playheadPosition = currentTime * PIXELS_PER_SECOND;

  // Handle click on the piano roll for seeking
  const handlePianoRollClick = (e) => {
    if (!onSeek) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - LABEL_WIDTH;
    const time = x / PIXELS_PER_SECOND;
    onSeek(time);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Time indicator */}
      <div style={{ 
        display: 'flex', 
        marginLeft: LABEL_WIDTH, 
        marginBottom: '5px',
        fontSize: '12px',
        color: '#666'
      }}>
        <div style={{ width: '100%', textAlign: 'center' }}>
          {formatTime(currentTime)} / {formatTime(maxEndTime)}
        </div>
      </div>
      
      <div style={{ display: 'flex', width: '100%', overflow: 'auto' }}>
        {/* --- Left-hand piano labels --- */}
        <div style={{ display: 'flex', flexDirection: 'column', width: LABEL_WIDTH }}>
          {Array.from({ length: midiRange }, (_, i) => {
            const midi = maxMidi - i;
            return (
              <div
                key={midi}
                style={{
                  height: NOTE_HEIGHT,
                  lineHeight: `${NOTE_HEIGHT}px`,
                  textAlign: 'right',
                  paddingRight: 6,
                  fontSize: 12,
                  background: getNoteColor(midi),
                  color: '#333',
                }}
              >
                {midiToNoteName(midi)}
              </div>
            );
          })}
        </div>

        {/* --- Main grid + notes --- */}
        <div
          style={{
            position: 'relative',
            width: viewWidth,
            height: viewHeight,
            background: '#fafafa',
            border: '1px solid #ccc',
            cursor: 'pointer',
          }}
          onClick={handlePianoRollClick}
        >
          {/* Horizontal grid lines and colored backgrounds */}
          {Array.from({ length: midiRange }, (_, i) => {
            const midi = maxMidi - i;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: i * NOTE_HEIGHT,
                  left: 0,
                  width: '100%',
                  height: NOTE_HEIGHT,
                  backgroundColor: getNoteColor(midi),
                  opacity: 0.3,
                }}
              />
            );
          })}

          {/* Vertical grid lines (every second) */}
          {Array.from({ length: Math.ceil(maxEndTime) + 1 }, (_, i) => (
            <div
              key={`grid-${i}`}
              style={{
                position: 'absolute',
                top: 0,
                left: i * PIXELS_PER_SECOND,
                width: 1,
                height: '100%',
                backgroundColor: GRID_COLOR,
              }}
            />
          ))}

          {/* Time markers (every second) */}
          {Array.from({ length: Math.ceil(maxEndTime) + 1 }, (_, i) => (
            <div
              key={`time-${i}`}
              style={{
                position: 'absolute',
                top: -20,
                left: i * PIXELS_PER_SECOND,
                fontSize: '10px',
                color: '#666',
                transform: 'translateX(-10px)',
              }}
            >
              {formatTime(i)}
            </div>
          ))}

          {/* MIDI notes */}
          {notes.map((note, i) => {
            const top = (maxMidi - note.midi) * NOTE_HEIGHT;
            const left = note.time * PIXELS_PER_SECOND;
            const width = note.duration * PIXELS_PER_SECOND;
            return (
              <div
                key={i}
                title={`Note: ${midiToNoteName(note.midi)} 
                        | Start: ${note.time.toFixed(2)}s 
                        | Duration: ${note.duration.toFixed(2)}s`}
                style={{
                  position: 'absolute',
                  top,
                  left,
                  width,
                  height: NOTE_HEIGHT,
                  backgroundColor: '#007bff',
                  borderRadius: 3,
                  color: 'white',
                  fontSize: 10,
                  textAlign: 'center',
                  lineHeight: `${NOTE_HEIGHT}px`,
                  overflow: 'hidden',
                }}
              >
                {midiToNoteName(note.midi)}
              </div>
            );
          })}

          {/* Playhead */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: playheadPosition,
              width: PLAYHEAD_WIDTH,
              height: '100%',
              backgroundColor: PLAYHEAD_COLOR,
              boxShadow: '0 0 5px rgba(255, 0, 0, 0.7)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
}
