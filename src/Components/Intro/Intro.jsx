import { useRef, useState } from "react";
import "./Intro.css";

function Intro({ onStart }) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const videoRef = useRef(null);
  const hasFinishedRef = useRef(false);

  function finishIntro() {
    if (hasFinishedRef.current) return;

    hasFinishedRef.current = true;

    onStart();
  }

  function handleStart() {
    if (isTransitioning) return;

    setIsTransitioning(true);

    const video = videoRef.current;

    setTimeout(() => {
      finishIntro();
    }, 1500);

    if (!video) {
      finishIntro();
      return;
    }

    video.currentTime = 0;

    video.play().catch(() => {
      finishIntro();
    });
  }

  return (
    <div
      className={`intro ${isTransitioning ? "is-transitioning" : ""}`}
      onClick={handleStart}
    >
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

      <video
        ref={videoRef}
        className="intro-transition-video"
        src="/Videos/HVL-Intro.mp4"
        muted
        playsInline
        preload="auto"
        onEnded={finishIntro}
        onError={finishIntro}
      />
    </div>
  );
}

export default Intro;
