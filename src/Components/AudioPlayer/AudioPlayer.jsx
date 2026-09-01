import { useEffect, useRef, useState } from "react";
import "./AudioPlayer.css";

function AudioPlayer({ audioSrc, uiTheme, isUiVisible }) {
  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  /* ========================================================= */
  /* ICONS */
  /* ========================================================= */

  const playIcon =
    uiTheme === "white" ? "/Icon/play-white.svg" : "/Icon/play-black.svg";

  const pauseIcon =
    uiTheme === "white" ? "/Icon/pause-white.svg" : "/Icon/pause-black.svg";

  /* ========================================================= */
  /* PLAY / PAUSE */
  /* ========================================================= */

  async function handlePlayPause() {
    const audio = audioRef.current;

    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch (error) {
        console.error("PLAY ERROR:", error);
      }
    } else {
      audio.pause();
    }
  }

  /* ========================================================= */
  /* SEEK */
  /* ========================================================= */

  function handleSeek(event) {
    const audio = audioRef.current;

    if (!audio) return;

    const newTime = Number(event.target.value);

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }

  /* ========================================================= */
  /* RESET WHEN AUDIO CHANGES */
  /* ========================================================= */

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;

    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    audio.load();
  }, [audioSrc]);

  return (
    <div
      className={`
    audio-player
    ${isUiVisible ? "ui-visible" : "ui-hidden"}
  `}
      style={{
        "--audio-color": uiTheme === "white" ? "#ffffff3d" : "#000000",
        "--thumb-color": uiTheme === "white" ? "#f5f5f2" : "#000000",
        "--thumb-past-color": uiTheme === "white" ? "#8c1616" : "#000000",
      }}
    >
      {/* ===================================================== */}
      {/* AUDIO */}
      {/* ===================================================== */}

      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={(event) => {
          const audio = event.currentTarget;

          setDuration(audio.duration);
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
        }}
        onPlay={() => {
          setIsPlaying(true);
        }}
        onPause={() => {
          setIsPlaying(false);
        }}
        onEnded={(event) => {
          const audio = event.currentTarget;

          audio.currentTime = 0;

          setCurrentTime(0);
          setIsPlaying(false);
        }}
        onError={(event) => {
          console.error("AUDIO ERROR:", event.currentTarget.error);
        }}
      >
        <source src={audioSrc} type="video/mp4" />
      </audio>

      {/* ===================================================== */}
      {/* PROGRESS */}
      {/* ===================================================== */}

      <div className="audio-seek">
        <input
          className="audio-seek-slider"
          type="range"
          min="0"
          max={duration || 0}
          step="0.01"
          value={currentTime}
          onChange={handleSeek}
          aria-label="Music position"
          style={{
            "--progress": `${progress}%`,
          }}
        />
      </div>

      {/* ===================================================== */}
      {/* PLAY / PAUSE */}
      {/* ===================================================== */}

      <button
        className="audio-play-btn"
        onClick={handlePlayPause}
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        <img src={isPlaying ? pauseIcon : playIcon} alt="" />
      </button>
    </div>
  );
}

export default AudioPlayer;
