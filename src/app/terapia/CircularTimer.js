// components/CircularTimer.js
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faRedo } from '@fortawesome/free-solid-svg-icons';

const CircularTimer = ({ onTimeUpdate }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(seconds);
    }
  }, [seconds, onTimeUpdate]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;

  return (
    <div className="circular-timer-container">
      <div className="circular-timer">
        <svg className="circular-progress" viewBox="0 0 100 100">
          <circle className="bg" cx="50" cy="50" r="45" />
          <circle
            className="progress"
            cx="50"
            cy="50"
            r="45"
            style={{
              strokeDasharray: `${Math.PI * 90}`,
              strokeDashoffset: `${Math.PI * 90 - (seconds / 600) * (Math.PI * 90)}`, // Assuming max time is around 10 minutes for full circle
            }}
          />
        </svg>
        <div className="timer-value">{formattedTime}</div>
        <div className="timer-controls">
          <button onClick={toggleTimer} className="control-button">
            <FontAwesomeIcon icon={isRunning ? faPause : faPlay} />
          </button>
          <button onClick={resetTimer} className="control-button">
            <FontAwesomeIcon icon={faRedo} />
          </button>
        </div>
      </div>
      <style jsx>{`
        .circular-timer-container {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .circular-timer {
          position: relative;
          width: 150px;
          height: 150px;
        }

        .circular-progress {
          width: 100%;
          height: 100%;
        }

        .bg {
          fill: none;
          stroke: #e0e0e0;
          stroke-width: 8px;
        }

        .progress {
          fill: none;
          stroke: #28a745;
          stroke-width: 8px;
          stroke-linecap: round;
          transform: rotate(-90deg);
          transform-origin: center;
          transition: stroke-dashoffset 0.2s;
        }

        .timer-value {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1.5em;
          font-weight: bold;
        }

        .timer-controls {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
        }

        .control-button {
          background: none;
          border: none;
          outline: none;
          cursor: pointer;
          font-size: 1em;
          color: #555;
        }
      `}</style>
    </div>
  );
};

export default CircularTimer;