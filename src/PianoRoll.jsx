import React from 'react';

const NOTE_HEIGHT = 20;
const PIXELS_PER_SECOND = 120;
const LABEL_WIDTH = 50;
const GRID_COLOR = '#ddd';
const LABEL_COLOR = '#333';

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

export default function PianoRoll({ notes }) {
  if (!notes || notes.length === 0) return null;

  const minMidi = Math.min(...notes.map(n => n.midi));
  const maxMidi = Math.max(...notes.map(n => n.midi));
  const midiRange = maxMidi - minMidi + 1;

  // figure out total width (seconds → pixels)
  const maxEndTime = Math.max(...notes.map(n => n.time + n.duration));
  const viewWidth = maxEndTime * PIXELS_PER_SECOND;
  const viewHeight = midiRange * NOTE_HEIGHT;

  return (
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
        }}
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
      </div>
    </div>
  );
}
