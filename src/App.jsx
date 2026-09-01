import { useEffect, useRef, useState } from "react";

import "./App.css";

import Nav from "./Components/Nav/Nav";
import Main from "./Components/Main/Main";
import Intro from "./Components/Intro/Intro";

import artworks from "./data/Artworks";

function App() {
  const [layout, setLayout] = useState("center");

  const [currentIndex, setCurrentIndex] = useState(0);

  /* ========================================================= */
  /* INTRO */
  /* ========================================================= */

  const [hasStarted, setHasStarted] = useState(false);

  /* ========================================================= */
  /* UI */
  /* ========================================================= */

  const [isUiVisible, setIsUiVisible] = useState(true);

  const [forceHideUi, setForceHideUi] = useState(false);

  const [uiTransitionLocked, setUiTransitionLocked] = useState(false);

  const hideTimerRef = useRef(null);

  const shouldShowUi = isUiVisible && !forceHideUi;

  /* ========================================================= */
  /* CURRENT ARTWORK */
  /* ========================================================= */

  const currentArtwork = artworks[currentIndex];

  const uiTheme = layout === "grid" ? "white" : currentArtwork.uiTheme;

  /* ========================================================= */
  /* AUTO HIDE UI */
  /* ========================================================= */

  useEffect(() => {
    /*
      Không chạy auto-hide khi Intro còn đang mở.
    */

    if (!hasStarted) return;

    function handleMouseMove() {
      if (uiTransitionLocked) return;

      setForceHideUi(false);

      setIsUiVisible(true);

      clearTimeout(hideTimerRef.current);

      hideTimerRef.current = setTimeout(() => {
        setIsUiVisible(false);
      }, 700);
    }

    window.addEventListener("mousemove", handleMouseMove);

    hideTimerRef.current = setTimeout(() => {
      setIsUiVisible(false);
    }, 700);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);

      clearTimeout(hideTimerRef.current);
    };
  }, [uiTransitionLocked, hasStarted]);

  /* ========================================================= */
  /* START WEBSITE */
  /* ========================================================= */

  function handleStart() {
    setLayout("center");

    setCurrentIndex(0);

    setIsUiVisible(true);

    setForceHideUi(false);

    setHasStarted(true);
  }

  return (
    <>
      {/* ===================================================== */}
      {/* WEBSITE */}
      {/* ===================================================== */}

      {hasStarted && (
        <>
          <Nav
            layout={layout}
            setLayout={setLayout}
            uiTheme={uiTheme}
            isUiVisible={hasStarted && shouldShowUi}
          />

          <Main
            layout={layout}
            setLayout={setLayout}
            artworks={artworks}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            uiTheme={uiTheme}
            isUiVisible={shouldShowUi}
            setForceHideUi={setForceHideUi}
            setUiTransitionLocked={setUiTransitionLocked}
          />
        </>
      )}

      {/* ===================================================== */}
      {/* INTRO */}
      {/* ===================================================== */}

      {!hasStarted && <Intro onStart={handleStart} />}
    </>
  );
}

export default App;
