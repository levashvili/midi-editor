
import React from 'react';

const NOTE_HEIGHT = 20;
const PIXELS_PER_SECOND = 120;

// MIDI to note name
function midiToNoteName(midi) {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const name = noteNames[midi % 12];
  return `${name}${octave}`;
}

// Generate range of MIDI note numbers
function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function PianoRoll({ notes }) {
  if (!notes || notes.length === 0) return null;

  const minMidi = Math.min(...notes.map(n => n.midi));
  const maxMidi = Math.max(...notes.map(n => n.midi));
  const midiRange = range(minMidi, maxMidi);

  const viewHeight = midiRange.length * NOTE_HEIGHT;
  const viewWidth = Math.max(...notes.map(n => n.time + n.duration)) * PIXELS_PER_SECOND;

  return (
    <div
      style={{
        display: 'flex',
        border: '1px solid #ccc',
        background: '#fafafa',
        overflow: 'auto',
        width: '100%',
        height: viewHeight,
      }}
    >
      {/* Piano Labels */}
      <div style={{ width: 60, position: 'relative' }}>
        {midiRange.map((midi, i) => (
          <div
            key={midi}
            style={{
              height: NOTE_HEIGHT,
              lineHeight: `${NOTE_HEIGHT}px`,
              borderBottom: '1px solid #ddd',
              paddingLeft: 4,
              fontSize: 12,
              color: '#fff',
              background: '#333',
            }}
          >
            {midiToNoteName(midi)}
          </div>
        ))}
      </div>

      {/* Notes Canvas */}
      <div
        style={{
          position: 'relative',
          width: viewWidth,
          height: viewHeight,
          background: '#f8f8f8',
        }}
      >
        {/* Horizontal lines for each pitch */}
        {midiRange.map((midi, i) => (
          <div
            key={`line-${midi}`}
            style={{
              position: 'absolute',
              top: i * NOTE_HEIGHT,
              left: 0,
              width: '100%',
              height: 1,
              backgroundColor: '#e0e0e0',
            }}
          />
        ))}

        {/* MIDI notes */}
        {notes.map((note, i) => {
          const y = (maxMidi - note.midi) * NOTE_HEIGHT;
          const x = note.time * PIXELS_PER_SECOND;
          const width = note.duration * PIXELS_PER_SECOND;

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: y,
                left: x,
                width,
                height: NOTE_HEIGHT - 2,
                backgroundColor: '#007bff',
                color: 'white',
                fontSize: 10,
                paddingLeft: 3,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 2,
              }}
              title={`Note: ${midiToNoteName(note.midi)}\nStart: ${note.time.toFixed(2)}s\nDuration: ${note.duration.toFixed(2)}s`}
            >
              {midiToNoteName(note.midi)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

