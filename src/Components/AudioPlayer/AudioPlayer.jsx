import { useEffect, useRef, useState } from "react";

import "./AudioPlayer.css";

function AudioPlayer({ audioSrc, uiTheme, isUiVisible, isReady }) {
  const audioRef = useRef(null);

  const returnTimerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  /* ========================================================= */
  /* PLAY / PAUSE */
  /* ========================================================= */

  async function handlePlayPause() {
    const audio = audioRef.current;

    if (!audio) return;

    /*
      Không cho click trong lúc progress
      đang chạy animation trở về đầu.
    */
    if (isReturning) return;

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
    if (isReturning) return;

    const newTime = Number(event.target.value);

    audio.currentTime = newTime;

    setCurrentTime(newTime);
  }

  /* ========================================================= */
  /* RETURN TO START WHEN AUDIO ENDS */
  /* ========================================================= */

  function handleEnded() {
    const audio = audioRef.current;

    if (!audio) return;

    /*
      Audio đã hết.
      Giữ currentTime ở cuối bài để knob vẫn nằm 100%.
    */
    setIsPlaying(false);

    /*
      Bật animation:
      progress 100% -> 0%
    */
    setIsReturning(true);

    clearTimeout(returnTimerRef.current);

    returnTimerRef.current = setTimeout(() => {
      audio.currentTime = 0;

      setCurrentTime(0);
      setIsReturning(false);

      audio.play().catch((error) => {
        console.error("LOOP PLAY ERROR:", error);
      });
    }, 1000);
  }

  /* ========================================================= */
  /* RESET WHEN AUDIO CHANGES */
  /* ========================================================= */

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    clearTimeout(returnTimerRef.current);

    audio.pause();
    audio.currentTime = 0;

    setCurrentTime(0);
    setDuration(0);

    setIsPlaying(false);
    setIsReturning(false);

    audio.load();

    return () => {
      clearTimeout(returnTimerRef.current);
    };
  }, [audioSrc]);

  return (
    <div
      className={`audio-player ${isReady ? "audio-ready" : "audio-locked"}
        ${isUiVisible ? "ui-visible" : "ui-hidden"}
        ${isReturning ? "is-returning" : ""}
      `}
      style={{
        "--audio-color": uiTheme === "white" ? "#ffffff3d" : "#040606",

        "--thumb-color": uiTheme === "white" ? "#f5f5f2" : "#040606",

        "--thumb-past-color": uiTheme === "white" ? "#8c1616" : "#040606",

        /* Bóng đổ chung cho ô kéo và nút play/pause. */
        "--audio-shadow":
          uiTheme === "white"
            ? "0 2px 6px rgba(245, 245, 242, 0.35)"
            : "0 2px 6px rgba(4, 6, 6, 0.35)",
      }}
    >
      {/* ===================================================== */}
      {/* AUDIO */}
      {/* ===================================================== */}

      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        onLoadedMetadata={(event) => {
          const audio = event.currentTarget;

          setDuration(audio.duration);
        }}
        onTimeUpdate={(event) => {
          /*
            Trong lúc returning,
            không cập nhật currentTime nữa.
          */
          if (isReturning) return;

          setCurrentTime(event.currentTarget.currentTime);
        }}
        onPlay={() => {
          setIsPlaying(true);
        }}
        onPause={() => {
          setIsPlaying(false);
        }}
        onEnded={handleEnded}
        onError={(event) => {
          console.error("AUDIO ERROR:", event.currentTarget.error);
        }}
      />

      {/* ===================================================== */}
      {/* PROGRESS */}
      {/* ===================================================== */}

      <div className="audio-seek">
        <input
          className={`audio-seek-slider ${isReturning ? "is-returning" : ""}`}
          type="range"
          min="0"
          max={duration || 0}
          step="0.01"
          value={isReturning ? 0 : currentTime}
          onChange={handleSeek}
          aria-label="Music position"
          style={{
            "--progress": isReturning ? "0%" : `${progress}%`,
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
        {/* Icon vẽ bằng CSS: khung vuông giống ô kéo, trong là ▶ hoặc ❚❚ */}
        <span
          className={`audio-icon ${isPlaying ? "is-pause" : "is-play"}`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

export default AudioPlayer;
