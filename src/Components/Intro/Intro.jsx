import { useEffect, useRef, useState } from "react";
import "./Intro.css";

function Intro({ onStart }) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const hideHintTimerRef = useRef(null);

  useEffect(() => {
    function handleMouseMove() {
      if (isLeaving) return;

      setShowHint(true);

      clearTimeout(hideHintTimerRef.current);

      hideHintTimerRef.current = setTimeout(() => {
        setShowHint(false);
      }, 700);
    }

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(hideHintTimerRef.current);
    };
  }, [isLeaving]);

  function handleStart() {
    if (isLeaving) return;

    setIsLeaving(true);
    setShowHint(false);

    setTimeout(() => {
      onStart();
    }, 800);
  }

  return (
    <div
      className={`intro ${isLeaving ? "is-leaving" : ""}`}
      onClick={handleStart}
    >
      <video className="intro-video" autoPlay muted loop playsInline>
        <source src="/Videos/IDK.mp4" type="video/mp4" />
      </video>

      <div className="intro-overlay" />

      <p
        className={`
          intro-start-hint
          ${showHint ? "is-visible" : ""}
        `}
      >
        Touch To Start
      </p>
    </div>
  );
}

export default Intro;
