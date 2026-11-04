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
      }, 1500);
    }

    window.addEventListener("mousemove", handleMouseMove);

    hideTimerRef.current = setTimeout(() => {
      setIsUiVisible(false);
    }, 1500);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);

      clearTimeout(hideTimerRef.current);
    };
  }, [uiTransitionLocked, hasStarted]);

  /* ========================================================= */
  /* LANGUAGE (vi | en) */
  /* ========================================================= */

  /*
    Chỉ story và trang About đổi ngôn ngữ.
    Tên bài nhạc và tên chương tiếng Pháp giữ nguyên.
  */

  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("lang") === "en" ? "en" : "vi";
    } catch {
      return "vi";
    }
  });

  function handleToggleLang() {
    setLang((prev) => {
      const next = prev === "vi" ? "en" : "vi";

      try {
        localStorage.setItem("lang", next);
      } catch {
        // Không lưu được thì thôi, vẫn đổi ngôn ngữ.
      }

      return next;
    });
  }

  const [isSecretUnlocked, setIsSecretUnlocked] = useState(false);

  function handleSecretUnlock() {
    setIsSecretUnlocked(true);
  }

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
            onSecretUnlock={handleSecretUnlock}
            isSecretUnlocked={isSecretUnlocked}
            isUiVisible={hasStarted && shouldShowUi}
            lang={lang}
            onToggleLang={handleToggleLang}
          />

          <Main
            layout={layout}
            setLayout={setLayout}
            artworks={artworks}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            uiTheme={uiTheme}
            setForceHideUi={setForceHideUi}
            setUiTransitionLocked={setUiTransitionLocked}
            isSecretUnlocked={isSecretUnlocked}
            lang={lang}
          />
        </>
      )}

      {/* ===================================================== */}
      {/* INTRO */}
      {/* ===================================================== */}

      {!hasStarted && (
        <Intro onStart={handleStart} firstArtworkSrc={artworks[0]?.image} />
      )}
    </>
  );
}

export default App;
