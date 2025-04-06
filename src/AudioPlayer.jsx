import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

export default function AudioPlayer({ audioFile, notes, currentTime, onTimeUpdate }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef(null);
  const synthRef = useRef(null);
  const transportRef = useRef(null);
  const animationFrameRef = useRef(null);
  const notesRef = useRef(notes);
  const scheduledNotesRef = useRef([]);

  // Update notes reference when notes prop changes
  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  // Initialize Tone.js components
  useEffect(() => {
    // Create audio player
    playerRef.current = new Tone.Player({
      url: audioFile,
      loop: false,
      autostart: false,
    }).toDestination();

    // Create synth for MIDI playback
    synthRef.current = new Tone.PolySynth().toDestination();

    // Set up transport
    transportRef.current = Tone.Transport;

    // Cleanup function
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
      if (synthRef.current) {
        synthRef.current.dispose();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Load audio file and set duration
  useEffect(() => {
    if (audioFile && playerRef.current) {
      playerRef.current.load(audioFile).then(() => {
        setDuration(playerRef.current.buffer.duration);
      });
    }
  }, [audioFile]);

  // Schedule MIDI notes for playback
  const scheduleNotes = (startTime) => {
    // Clear any previously scheduled notes
    scheduledNotesRef.current.forEach(note => {
      if (note.id) {
        Tone.Transport.clear(note.id);
      }
    });
    scheduledNotesRef.current = [];

    // Schedule new notes
    if (notesRef.current && notesRef.current.length > 0) {
      notesRef.current.forEach(note => {
        // Only schedule notes that start after the current time
        if (note.time >= startTime) {
          const noteId = Tone.Transport.schedule(() => {
            synthRef.current.triggerAttackRelease(
              Tone.Frequency(note.midi, "midi").toFrequency(),
              note.duration,
              note.time,
              note.velocity / 127
            );
          }, note.time);
          
          scheduledNotesRef.current.push({ id: noteId, note });
        }
      });
    }
  };

  // Update current time during playback
  useEffect(() => {
    const updateTime = () => {
      if (isPlaying) {
        const currentSeconds = transportRef.current.seconds;
        onTimeUpdate(currentSeconds);
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, onTimeUpdate]);

  // Handle play/pause
  const togglePlayback = async () => {
    await Tone.start();
    
    if (!isPlaying) {
      // Start playback
      transportRef.current.start();
      playerRef.current.start();
      scheduleNotes(transportRef.current.seconds);
      setIsPlaying(true);
    } else {
      // Pause playback
      transportRef.current.pause();
      playerRef.current.stop();
      setIsPlaying(false);
    }
  };

  // Handle seeking
  const handleSeek = (time) => {
    const newTime = Math.max(0, Math.min(time, duration));
    onTimeUpdate(newTime);
    
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current.start(newTime);
    }
    
    transportRef.current.seconds = newTime;
    
    // Reschedule notes from the new position
    if (isPlaying) {
      scheduleNotes(newTime);
    }
  };

  // Format time for display
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-player">
      <div className="transport-controls">
        <button onClick={togglePlayback}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <div className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
      <div className="seek-bar">
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={(e) => handleSeek(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
} 