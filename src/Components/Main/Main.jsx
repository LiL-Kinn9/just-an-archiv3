import { useEffect, useRef, useState } from "react";
import "./Main.css";

import AudioPlayer from "../AudioPlayer/AudioPlayer";

function Main({
  layout,
  setLayout,

  artworks,

  currentIndex,
  setCurrentIndex,

  uiTheme,
  isUiVisible,

  setForceHideUi,
  setUiTransitionLocked,
}) {
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  const [direction, setDirection] = useState(null);
  const [phase, setPhase] = useState("idle");

  /* ========================================================= */
  /* GRID */
  /* ========================================================= */

  const [gridOffset, setGridOffset] = useState(0);
  const [gridMaxOffset, setGridMaxOffset] = useState(0);

  const gridViewRef = useRef(null);
  const gridLeftRef = useRef(null);
  const gridRightRef = useRef(null);

  /* ========================================================= */
  /* DETAIL CENTER */
  /* ========================================================= */

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailPhase, setDetailPhase] = useState("closed");
  const [isCloseVisible, setIsCloseVisible] = useState(true);

  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const storyWheelLockedRef = useRef(false);

  /* ========================================================= */
  /* CURRENT / PREV / NEXT */
  /* ========================================================= */

  const currentItem = artworks[currentIndex];

  const prevItem = currentIndex > 0 ? artworks[currentIndex - 1] : null;

  const nextItem =
    currentIndex < artworks.length - 1 ? artworks[currentIndex + 1] : null;

  useEffect(() => {
    if (layout !== "grid") return;

    function calculateGridHeight() {
      if (
        !gridViewRef.current ||
        !gridLeftRef.current ||
        !gridRightRef.current
      ) {
        return;
      }

      const viewportHeight = gridViewRef.current.clientHeight;

      const leftHeight = gridLeftRef.current.scrollHeight;
      const rightHeight = gridRightRef.current.scrollHeight;

      const columnHeight = Math.max(leftHeight, rightHeight);

      const maxOffset = Math.max(0, columnHeight - viewportHeight);

      setGridMaxOffset(maxOffset);

      setGridOffset((prev) => Math.min(prev, maxOffset));
    }

    calculateGridHeight();

    window.addEventListener("resize", calculateGridHeight);

    return () => {
      window.removeEventListener("resize", calculateGridHeight);
    };
  }, [layout, artworks]);

  /* ========================================================= */
  /* GRID ITEMS */
  /* ========================================================= */

  const leftGridItems = artworks.slice(0, 6).map((artwork, index) => ({
    artwork,
    originalIndex: index,
  }));

  const rightGridItems = artworks.slice(6).map((artwork, index) => ({
    artwork,
    originalIndex: index + 6,
  }));

  /* ========================================================= */
  /* CONTROL ICONS */
  /* ========================================================= */

  const prevIcon =
    uiTheme === "white" ? "/Icon/prev-white-2.svg" : "/Icon/prev-black-2.svg";

  const nextIcon =
    uiTheme === "white" ? "/Icon/next-white-2.svg" : "/Icon/next-black-2.svg";

  /* ========================================================= */
  /* BACKGROUND */
  /* ========================================================= */

  function getBackground(item) {
    return item.background;
  }

  /* ========================================================= */
  /* OPEN DETAIL */
  /* ========================================================= */

  function handleOpenDetail() {
    if (phase !== "idle") return;
    if (detailPhase !== "closed") return;

    setUiTransitionLocked(true);
    setForceHideUi(true);

    setActiveStoryIndex(0);
    setIsCloseVisible(true);

    setIsDetailOpen(true);
    setDetailPhase("hiding-ui");
  }

  /* ========================================================= */
  /* HIDE UI -> OPENING */
  /* ========================================================= */

  useEffect(() => {
    if (detailPhase !== "hiding-ui") return;

    const timer = setTimeout(() => {
      setDetailPhase("opening");
    }, 450);

    return () => {
      clearTimeout(timer);
    };
  }, [detailPhase]);

  /* ========================================================= */
  /* OPENING -> OPEN */
  /* ========================================================= */

  useEffect(() => {
    if (detailPhase !== "opening") return;

    const timer = setTimeout(() => {
      setDetailPhase("open");
    }, 1400);

    return () => {
      clearTimeout(timer);
    };
  }, [detailPhase]);

  /* ========================================================= */
  /* CLOSE DETAIL */
  /* ========================================================= */

  function handleCloseDetail() {
    if (detailPhase !== "open") return;

    setUiTransitionLocked(true);

    /*
      Keep normal nav hidden throughout close animation.
    */

    setForceHideUi(true);

    setDetailPhase("closing");
  }

  /* ========================================================= */
  /* CLOSING -> RETURNING */
  /* ========================================================= */

  useEffect(() => {
    if (detailPhase !== "closing") return;

    const timer = setTimeout(() => {
      setDetailPhase("returning");
    }, 800);

    return () => {
      clearTimeout(timer);
    };
  }, [detailPhase]);

  /* ========================================================= */
  /* RETURNING -> CLOSED */
  /* ========================================================= */

  useEffect(() => {
    if (detailPhase !== "returning") return;

    const timer = setTimeout(() => {
      setIsDetailOpen(false);
      setDetailPhase("closed");

      setUiTransitionLocked(false);
    }, 850);

    return () => {
      clearTimeout(timer);
    };
  }, [detailPhase, setUiTransitionLocked]);

  /* ========================================================= */
  /* NEXT */
  /* ========================================================= */

  function handleNext() {
    if (!nextItem) return;
    if (phase !== "idle") return;
    if (detailPhase !== "closed") return;

    setUiTransitionLocked(true);
    setForceHideUi(true);

    setDirection("next");
    setPhase("sliding");
  }

  /* ========================================================= */
  /* PREV */
  /* ========================================================= */

  function handlePrev() {
    if (!prevItem) return;
    if (phase !== "idle") return;
    if (detailPhase !== "closed") return;

    setUiTransitionLocked(true);
    setForceHideUi(true);

    setDirection("prev");
    setPhase("sliding");
  }

  /* ========================================================= */
  /* SLIDE FINISHED */
  /* ========================================================= */

  function handleSlideEnd(event) {
    if (event.target !== event.currentTarget) return;

    if (
      event.animationName !== "currentSlideOutLeft" &&
      event.animationName !== "currentSlideOutRight"
    ) {
      return;
    }

    if (direction === "next") {
      setCurrentIndex((prev) => prev + 1);
    }

    if (direction === "prev") {
      setCurrentIndex((prev) => prev - 1);
    }

    setDirection(null);
    setPhase("idle");

    setForceHideUi(false);
    setUiTransitionLocked(false);
  }

  /* ========================================================= */
  /* DETAIL AUDIO VISIBILITY */
  /* ========================================================= */

  const shouldShowAudio = isDetailOpen ? detailPhase === "open" : isUiVisible;

  function handleStoryWheel(event) {
    if (detailPhase !== "open") return;
    if (!currentItem.story?.length) return;

    event.preventDefault();
    event.stopPropagation();

    if (storyWheelLockedRef.current) return;

    const direction = event.deltaY > 0 ? 1 : -1;

    setActiveStoryIndex((prev) => {
      const next = prev + direction;

      return Math.max(0, Math.min(next, currentItem.story.length - 1));
    });

    storyWheelLockedRef.current = true;

    setTimeout(() => {
      storyWheelLockedRef.current = false;
    }, 450);
  }

  function handleGridWheel(event) {
    if (layout !== "grid") return;

    event.preventDefault();

    setGridOffset((prev) => {
      const next = prev + event.deltaY;

      return Math.max(0, Math.min(next, gridMaxOffset));
    });
  }

  function handleGridItemClick(index) {
    setCurrentIndex(index);

    setLayout("center");
  }

  function handleDetailScroll(event) {
    const scrollTop = event.currentTarget.scrollTop;

    if (scrollTop <= 10) {
      setIsCloseVisible(true);
    } else {
      setIsCloseVisible(false);
    }
  }

  function handleTouchStart(event) {
    if (detailPhase !== "closed") return;
    if (phase !== "idle") return;

    const touch = event.touches[0];

    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  }

  function handleTouchEnd(event) {
    if (detailPhase !== "closed") return;
    if (phase !== "idle") return;

    const touch = event.changedTouches[0];

    const deltaX = touch.clientX - touchStartXRef.current;

    const deltaY = touch.clientY - touchStartYRef.current;

    /*
    Nếu user đang vuốt dọc,
    đừng coi đó là swipe carousel.
  */
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    /*
    Swipe quá ngắn thì bỏ qua.
  */
    if (Math.abs(deltaX) < 50) {
      return;
    }

    /*
    vuốt sang trái -> NEXT
  */
    if (deltaX < 0) {
      handleNext();
      return;
    }

    /*
    vuốt sang phải -> PREV
  */
    if (deltaX > 0) {
      handlePrev();
    }
  }

  return (
    <main className={`main ${layout}`}>
      {/* ===================================================== */}
      {/* CENTER */}
      {/* ===================================================== */}

      {layout === "center" && (
        <div
          className="center-view"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`
              center-stage
              ${direction ? `is-${direction}` : ""}
              phase-${phase}
              ${detailPhase !== "closed" ? `detail-${detailPhase}` : ""}
            `}
          >
            {/* ================================================= */}
            {/* LEFT 20% INTERACTION ZONE */}
            {/* ================================================= */}

            {prevItem && detailPhase === "closed" && (
              <div className="gallery-zone gallery-zone-left">
                <button
                  className="gallery-control gallery-control-prev"
                  onClick={handlePrev}
                  aria-label="Previous artwork"
                >
                  <img src={prevIcon} alt="" />
                </button>
              </div>
            )}

            {/* ================================================= */}
            {/* CURRENT SLIDE */}
            {/* ================================================= */}

            <div
              className={`
  gallery-slide
  current-slide
  ${detailPhase === "closed" ? "detail-closed" : `detail-${detailPhase}`}
`}
              style={{
                backgroundColor: getBackground(currentItem),

                "--detail-color":
                  uiTheme === "white" ? "#f5f5f5d6" : "#000000d6",
                "--detail-story-color":
                  uiTheme === "white" ? "#f5f5f5b8" : "#000000b8",
                "--detail-story-title-color":
                  uiTheme === "white" ? "#f5f5f5" : "#000000",
                "--detail-story-line-color":
                  uiTheme === "white" ? "#f5f5f56e" : "#000000",
              }}
              onScroll={handleDetailScroll}
              onAnimationEnd={handleSlideEnd}
            >
              {/* =============================================== */}
              {/* ARTWORK */}
              {/* =============================================== */}
              {/* =============================================== */}
              {/* CENTER / DESKTOP ARTWORK */}
              {/* =============================================== */}

              <div className="slide-artwork" onClick={handleOpenDetail}>
                <img src={currentItem.image} alt={currentItem.title} />
              </div>

              {/* =============================================== */}
              {/* DESKTOP DETAIL */}
              {/* =============================================== */}

              {isDetailOpen && (
                <div className="desktop-detail">
                  <div className="detail-layout">
                    <div className="detail-left">
                      {/* INFO */}

                      <div className="detail-info">
                        <p className="detail-index">
                          {String(currentIndex + 1).padStart(2, "0")} /{" "}
                          {String(13).padStart(2, "0")}
                        </p>

                        <p className="detail-artwork-title">
                          {currentItem.title}
                        </p>

                        <h1 className="detail-story-title">
                          {currentItem.storyTitle}
                        </h1>

                        <div className="detail-info-images">
                          <img src="/Detail/detail-mark.png" alt="" />
                          <img src="/Detail/detail-mark.png" alt="" />
                          <img src="/Detail/detail-mark.png" alt="" />
                        </div>
                      </div>

                      {/* STORY */}

                      <div className="detail-story" onWheel={handleStoryWheel}>
                        <div className="detail-story-track">
                          {currentItem.story?.map((paragraph, index) => {
                            const offset = index - activeStoryIndex;
                            const distance = Math.abs(offset);

                            return (
                              <p
                                key={index}
                                className={`detail-story-paragraph ${
                                  offset === 0 ? "is-active" : ""
                                }`}
                                style={{
                                  "--story-offset": offset,
                                  "--story-opacity":
                                    distance === 0
                                      ? 1
                                      : distance === 1
                                        ? 0.3
                                        : 0,

                                  "--story-scale": distance === 0 ? 1 : 0.94,
                                }}
                              >
                                {paragraph}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="detail-right" />
                  </div>
                </div>
              )}

              {/* =============================================== */}
              {/* MOBILE DETAIL */}
              {/* =============================================== */}

              {isDetailOpen && (
                <div className="mobile-detail">
                  {/* MOBILE ARTWORK */}

                  <div className="mobile-detail-artwork">
                    <img src={currentItem.image} alt={currentItem.title} />
                  </div>

                  {/* chừa vị trí cho AudioPlayer */}

                  <div className="mobile-detail-audio-space" />

                  {/* MOBILE INFO */}

                  <div className="mobile-detail-info">
                    <p className="mobile-detail-index">
                      {String(currentIndex + 1).padStart(2, "0")} /{" "}
                      {String(13).padStart(2, "0")}
                    </p>

                    <p className="mobile-detail-artwork-title">
                      {currentItem.title}
                    </p>

                    <h1 className="mobile-detail-story-title">
                      {currentItem.storyTitle}
                    </h1>

                    <div className="mobile-detail-images">
                      <img src="/Detail/detail-mark.png" alt="" />
                      <img src="/Detail/detail-mark.png" alt="" />
                      <img src="/Detail/detail-mark.png" alt="" />
                    </div>
                  </div>

                  {/* MOBILE STORY */}

                  <div className="mobile-detail-story">
                    {currentItem.story?.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* =============================================== */}
              {/* AUDIO */}
              {/* =============================================== */}

              {currentItem.audio && (
                <AudioPlayer
                  audioSrc={currentItem.audio}
                  uiTheme={uiTheme}
                  isUiVisible={shouldShowAudio}
                />
              )}
              {/* =============================================== */}
              {/* CLOSE BUTTON */}
              {/* =============================================== */}

              {isDetailOpen && (
                <button
                  className={`detail-close-btn ${
                    isCloseVisible ? "is-scroll-visible" : "is-scroll-hidden"
                  }`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    handleCloseDetail();
                  }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                  }}
                  aria-label="Close artwork detail"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 4L20 20" />
                    <path d="M20 4L4 20" />
                  </svg>
                </button>
              )}
            </div>

            {/* ================================================= */}
            {/* RIGHT 20% INTERACTION ZONE */}
            {/* ================================================= */}

            {nextItem && detailPhase === "closed" && (
              <div className="gallery-zone gallery-zone-right">
                <button
                  className="gallery-control gallery-control-next"
                  onClick={handleNext}
                  aria-label="Next artwork"
                >
                  <img src={nextIcon} alt="" />
                </button>
              </div>
            )}

            {/* ================================================= */}
            {/* INCOMING NEXT */}
            {/* ================================================= */}

            {phase === "sliding" && direction === "next" && nextItem && (
              <div
                className="gallery-slide incoming-slide incoming-next"
                style={{
                  backgroundColor: getBackground(nextItem),
                }}
              >
                <div className="slide-artwork">
                  <img src={nextItem.image} alt={nextItem.title} />
                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* INCOMING PREV */}
            {/* ================================================= */}

            {phase === "sliding" && direction === "prev" && prevItem && (
              <div
                className="gallery-slide incoming-slide incoming-prev"
                style={{
                  backgroundColor: getBackground(prevItem),
                }}
              >
                <div className="slide-artwork">
                  <img src={prevItem.image} alt={prevItem.title} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* GRID */}
      {/* ===================================================== */}

      {layout === "grid" && (
        <div className="grid-view">
          <div className="grid-container">
            {artworks.map((artwork, index) => (
              <button
                className="grid-item"
                key={artwork.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setLayout("center");
                }}
                style={{
                  backgroundColor: artwork.background,
                }}
                aria-label={`Open ${artwork.title}`}
              >
                <img src={artwork.image} alt={artwork.title} />
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

export default Main;
