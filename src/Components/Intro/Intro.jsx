import { useRef, useState } from "react";
import "./Intro.css";

function Intro({ onStart }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef(null);

  function handleStart() {
    if (isTransitioning) return;

    setIsTransitioning(true);

    requestAnimationFrame(() => {
      videoRef.current?.play();
    });
  }

  function handleVideoEnd() {
    onStart();
  }

  return (
    <div
      className={`intro ${isTransitioning ? "is-transitioning" : ""}`}
      onClick={handleStart}
    >
      {/* DISCLAIMER SCREEN */}
      {!isTransitioning && (
        <>
          <div className="intro-disclaimer">
            <h1>DISCLAIMER</h1>

            <p>This website contains explicit content.</p>

            <p>Viewer discretion is advised.</p>

            <img
              className="intro-advisory"
              src="/Detail/parental-advisory.png"
              alt="Parental advisory"
            />
          </div>

          <p className="intro-touch">Touch To Start</p>
        </>
      )}

      {/* TRANSITION VIDEO */}
      <video
        ref={videoRef}
        className="intro-transition-video"
        src="/Videos/HVL-Intro.mp4"
        muted
        playsInline
        preload="auto"
        onEnded={handleVideoEnd}
      />
    </div>
  );
}

export default Intro;
