import { useEffect, useRef, useState } from "react";

import "./Intro.css";

function Intro({ onStart, firstArtworkSrc }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isArtworkLoaded, setIsArtworkLoaded] = useState(false);

  const videoRef = useRef(null);
  const hasFinishedRef = useRef(false);

  /* ========================================== */
  /* PRELOAD FIRST ARTWORK */
  /* ========================================== */

  useEffect(() => {
    if (!firstArtworkSrc) return;

    const img = new Image();

    function handleLoad() {
      setIsArtworkLoaded(true);
    }

    function handleError() {
      setIsArtworkLoaded(true);
    }

    img.addEventListener("load", handleLoad);
    img.addEventListener("error", handleError);

    img.src = firstArtworkSrc;

    return () => {
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);
    };
  }, [firstArtworkSrc]);

  function finishIntro() {
    if (hasFinishedRef.current) return;

    hasFinishedRef.current = true;
    onStart();
  }

  function handleStart() {
    if (isTransitioning) return;

    setIsTransitioning(true);

    const video = videoRef.current;

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

          <p className={`intro-touch ${isArtworkLoaded ? "is-ready" : ""}`}>
            Touch To Start
          </p>
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
