import React from 'react';

const NOTE_HEIGHT = 20;
const PIXELS_PER_SECOND = 120;
const LABEL_WIDTH = 50;
const GRID_COLOR = '#ddd';
const LABEL_COLOR = '#333';

function midiToNoteName(midi) {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const name = noteNames[midi % 12];
  return `${name}${octave}`;
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
                background: '#222',
                color: '#eee',
                // Remove border here — let the main grid lines do the work
                // borderBottom: `1px solid ${GRID_COLOR}`,
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
        {/* Horizontal grid lines, one per row */}
        {Array.from({ length: midiRange + 1 }, (_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: i * NOTE_HEIGHT,
              left: 0,
              width: '100%',
              height: 1,
              backgroundColor: GRID_COLOR,
            }}
          />
        ))}

        {/* MIDI notes: fill entire row to align perfectly */}
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
                height: NOTE_HEIGHT,  // fill the row
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
