import { useEffect, useRef, useState } from "react";
import "./Main.css";

import ProgressiveArtwork from "../ProgressiveArtwork/Progressive";
import AudioPlayer from "../AudioPlayer/AudioPlayer";
import ShuffleText from "../ShuffleText/ShuffleText";

/*
  Ảnh hiện ở ô secret khi chưa unlock.
*/

const LOCKED_SECRET_ARTWORK = {
  title: "Secret",
  image: "/Artworks/HVL-artwork116.jpg",
  preview1: "/Artworks/preview1/HVL-artwork116.jpg",
};

function GridArtwork({ artwork }) {
  const [isOriginalLoaded, setIsOriginalLoaded] = useState(false);

  return (
    <div className="grid-artwork">
      <img
        src={artwork.preview1}
        alt=""
        className={`grid-artwork-preview ${
          isOriginalLoaded ? "is-hidden" : ""
        }`}
      />

      <img
        src={artwork.image}
        alt={artwork.title}
        className={`grid-artwork-original ${
          isOriginalLoaded ? "is-loaded" : ""
        }`}
        onLoad={() => {
          setIsOriginalLoaded(true);
        }}
      />
    </div>
  );
}

/* ========================================================= */
/* SCRAMBLE STORY */
/* ========================================================= */

/*
  Cuộn tới đâu, đoạn truyện xáo trộn rồi hiện ra tới đó,
  luôn đi trước đoạn đang thấy REVEAL_AHEAD đoạn.
  Đoạn đã hiện thì giữ nguyên, không chạy lại.
*/

const REVEAL_AHEAD = 2;

function ScrambleStory({ paragraphs, isActive, scrollRootRef, children }) {
  const containerRef = useRef(null);

  const [revealUntil, setRevealUntil] = useState(-1);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;

    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let lastVisible = -1;

        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          lastVisible = Math.max(
            lastVisible,
            Number(entry.target.dataset.storyIndex),
          );
        });

        if (lastVisible < 0) return;

        setRevealUntil((prev) => Math.max(prev, lastVisible + REVEAL_AHEAD));
      },
      { root: scrollRootRef.current },
    );

    container
      .querySelectorAll("[data-story-index]")
      .forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [isActive, paragraphs, scrollRootRef]);

  return (
    <div className="mobile-detail-story" ref={containerRef}>
      {paragraphs.map((paragraph, index) => (
        <ShuffleText
          key={index}
          data-story-index={index}
          text={paragraph}
          isRevealed={isActive && index <= revealUntil}
        />
      ))}

      {children}
    </div>
  );
}

function Main({
  layout,
  setLayout,

  artworks,

  currentIndex,
  setCurrentIndex,

  uiTheme,

  setForceHideUi,
  setUiTransitionLocked,

  isSecretUnlocked,
}) {
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  const detailSlideRef = useRef(null);
  const artworkImgRef = useRef(null);

  const [isAudioReady, setIsAudioReady] = useState(false);

  const [detailSwipePhase, setDetailSwipePhase] = useState("idle");
  const [detailSwipeDirection, setDetailSwipeDirection] = useState(null);

  const [detailSwipeTargetIndex, setDetailSwipeTargetIndex] = useState(null);

  const [direction, setDirection] = useState(null);
  const [phase, setPhase] = useState("idle");

  const isPinchingRef = useRef(false);
  const touchDistanceRef = useRef(null);

  /* ========================================================= */
  /* DETAIL CENTER */
  /* ========================================================= */

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailPhase, setDetailPhase] = useState("closed");
  const [isCloseVisible, setIsCloseVisible] = useState(true);

  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const storyWheelLockedRef = useRef(false);

  const storyTouchStartYRef = useRef(0);
  const storyTouchStartXRef = useRef(0);

  /* ========================================================= */
  /* CURRENT / PREV / NEXT */
  /* ========================================================= */

  const allowedIndexes = artworks
    .map((artwork, index) => ({
      artwork,
      index,
    }))
    .filter(({ artwork }) => {
      return !artwork.isSecret || isSecretUnlocked;
    })
    .map(({ index }) => index);

  const currentAllowedPosition = allowedIndexes.indexOf(currentIndex);

  const prevIndex =
    currentAllowedPosition > 0
      ? allowedIndexes[currentAllowedPosition - 1]
      : null;

  const nextIndex =
    currentAllowedPosition >= 0 &&
    currentAllowedPosition < allowedIndexes.length - 1
      ? allowedIndexes[currentAllowedPosition + 1]
      : null;

  const currentItem = artworks[currentIndex];

  /*
    Số thứ tự theo id chương, mẫu số là id lớn nhất (17),
    để vẫn đúng khi các chương chưa viết đang bị ẩn.
  */

  const totalChapters = Math.max(...artworks.map((artwork) => artwork.id));

  const prevItem = prevIndex !== null ? artworks[prevIndex] : null;

  const nextItem = nextIndex !== null ? artworks[nextIndex] : null;

  useEffect(() => {
    const prevPreview = prevItem?.preview3 || null;
    const nextPreview = nextItem?.preview3 || null;

    [prevPreview, nextPreview].filter(Boolean).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [prevItem, nextItem]);

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
  /* RETURNING HEADER */
  /* ========================================================= */

  function handleReturnDesktopStory() {
    setActiveStoryIndex(0);
  }

  function handleReturnMobileDetail() {
    if (!detailSlideRef.current) return;

    detailSlideRef.current.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

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

    if (direction === "next" && nextIndex !== null) {
      setCurrentIndex(nextIndex);
    }

    if (direction === "prev" && prevIndex !== null) {
      setCurrentIndex(prevIndex);
    }

    setDirection(null);
    setPhase("idle");

    setForceHideUi(false);
    setUiTransitionLocked(false);
  }

  /* ========================================================= */
  /* DETAIL AUDIO VISIBILITY */
  /* ========================================================= */

  /*
    Audio chỉ hiện trong detail, không còn ở center.
  */

  const shouldShowAudio = isDetailOpen && detailPhase === "open";

  /*
    Tiêu đề chỉ xáo trộn rồi hiện ra sau khi artwork trượt xong.
  */

  const isDetailTitleRevealed =
    detailPhase === "open" || detailPhase === "closing";

  function handleStoryWheel(event) {
    if (detailPhase !== "open") return;
    if (!currentItem.story?.length) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      return;
    }

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

  function handleStoryTouchStart(event) {
    if (detailPhase !== "open") return;

    if (event.touches.length >= 2) {
      isPinchingRef.current = true;

      return;
    }

    const touch = event.touches[0];

    storyTouchStartXRef.current = touch.clientX;
    storyTouchStartYRef.current = touch.clientY;
  }

  function handleStoryTouchEnd(event) {
    if (detailPhase !== "open") return;
    if (!currentItem.story?.length) return;

    if (isPinchingRef.current) {
      if (event.touches.length === 0) {
        isPinchingRef.current = false;
      }

      return;
    }

    const touch = event.changedTouches[0];

    if (!touch) return;

    const deltaX = touch.clientX - storyTouchStartXRef.current;

    const deltaY = touch.clientY - storyTouchStartYRef.current;

    // Swipe ngang -> story không xử lý
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return;
    }

    // Swipe dọc quá ngắn
    if (Math.abs(deltaY) < 120) {
      return;
    }

    // Swipe lên
    if (deltaY < 0) {
      setActiveStoryIndex((prev) =>
        Math.min(prev + 1, currentItem.story.length - 1),
      );

      return;
    }

    // Swipe xuống
    if (deltaY > 0) {
      setActiveStoryIndex((prev) => Math.max(prev - 1, 0));
    }
  }

  function handleDetailScroll(event) {
    const scrollTop = event.currentTarget.scrollTop;

    if (scrollTop <= 10) {
      setIsCloseVisible(true);
    } else {
      setIsCloseVisible(false);
    }
  }

  /* ========================================================= */
  /* DETAIL SWIPE */
  /* ========================================================= */

  function handleDetailSwipe(direction) {
    if (detailPhase !== "open") return;
    if (detailSwipePhase !== "idle") return;

    const isNext = direction === "next";

    if (isNext && !nextItem) return;
    if (!isNext && !prevItem) return;

    const targetIndex = isNext ? nextIndex : prevIndex;

    if (targetIndex === null) return;

    setDetailSwipeTargetIndex(targetIndex);

    setDetailSwipeDirection(direction);
    setDetailSwipePhase("out");

    setIsCloseVisible(false);

    setTimeout(() => {
      setCurrentIndex(targetIndex);

      setActiveStoryIndex(0);

      requestAnimationFrame(() => {
        if (detailSlideRef.current) {
          detailSlideRef.current.scrollTop = 0;
        }

        setDetailSwipePhase("in");

        setTimeout(() => {
          setDetailSwipePhase("idle");
          setDetailSwipeDirection(null);

          setDetailSwipeTargetIndex(null);

          setIsCloseVisible(true);
        }, 450);
      });
    }, 450);
  }

  function handleDetailNavigationWheel(event) {
    if (detailPhase !== "open") return;

    const isHorizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);

    if (!isHorizontal) return;

    if (Math.abs(event.deltaX) < 30) return;

    event.preventDefault();

    if (event.deltaX > 0) {
      handleDetailSwipe("next");
    } else {
      handleDetailSwipe("prev");
    }
  }

  function getTouchDistance(touches) {
    if (touches.length < 2) return null;

    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;

    return Math.sqrt(dx * dx + dy * dy);
  }
  function handleTouchStart(event) {
    if (phase !== "idle") return;

    if (detailPhase !== "closed" && detailPhase !== "open") {
      return;
    }

    if (event.touches.length >= 2) {
      isPinchingRef.current = true;

      touchDistanceRef.current = getTouchDistance(event.touches);

      return;
    }

    isPinchingRef.current = false;
    touchDistanceRef.current = null;

    const touch = event.touches[0];

    if (!touch) return;

    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  }
  function handleTouchEnd(event) {
    if (phase !== "idle") return;

    if (detailPhase !== "closed" && detailPhase !== "open") {
      return;
    }

    // Nếu user vừa pinch zoom thì tuyệt đối không đổi artwork
    if (isPinchingRef.current) {
      // Nếu vẫn còn ngón tay trên màn hình thì vẫn đang pinch
      if (event.touches.length > 0) {
        return;
      }

      isPinchingRef.current = false;
      touchDistanceRef.current = null;

      return;
    }

    const touch = event.changedTouches[0];

    if (!touch) return;

    const deltaX = touch.clientX - touchStartXRef.current;

    const deltaY = touch.clientY - touchStartYRef.current;

    /*
    Swipe phải thiên về chiều ngang.
  */
    if (Math.abs(deltaY) >= Math.abs(deltaX)) {
      return;
    }

    /*
    Phải swipe đủ xa mới đổi artwork.
  */
    const swipeThreshold = 120;

    if (Math.abs(deltaX) < swipeThreshold) {
      return;
    }

    /*
    ==============================
    DETAIL MODE
    ==============================
  */

    if (detailPhase === "open") {
      if (deltaX < 0) {
        handleDetailSwipe("next");
        return;
      }

      if (deltaX > 0) {
        handleDetailSwipe("prev");
        return;
      }
    }

    /*
    ==============================
    CENTER MODE
    ==============================
  */

    if (detailPhase === "closed") {
      if (deltaX < 0) {
        handleNext();
        return;
      }

      if (deltaX > 0) {
        handlePrev();
      }
    }
  }

  function handleTouchMove(event) {
    if (event.touches.length >= 2) {
      isPinchingRef.current = true;

      touchDistanceRef.current = getTouchDistance(event.touches);

      return;
    }
  }

  const detailSwipeTargetItem =
    detailSwipeTargetIndex !== null ? artworks[detailSwipeTargetIndex] : null;

  useEffect(() => {
    if (layout !== "center") {
      setIsAudioReady(false);
      return;
    }

    setIsAudioReady(false);

    const timer = setTimeout(() => {
      setIsAudioReady(true);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [layout, currentIndex]);

  /* ========================================================= */
  /* GRID: CHAPTERS + SECRET */
  /* ========================================================= */

  const gridChapters = artworks.filter((artwork) => !artwork.isSecret);

  const secretArtwork = artworks.find((artwork) => artwork.isSecret);

  /*
    Desktop xếp so le: mỗi 3 ảnh chiếm 2 hàng (cột 1 + cột 3, rồi cột 2),
    mỗi hàng được kéo lên nửa ô. Ô secret phải kéo lên bằng đúng hàng
    của ảnh cuối, để nằm ngay dưới ảnh đó.
  */

  function getGridRow(position) {
    const group = Math.floor((position - 1) / 3);
    const slot = (position - 1) % 3;

    return group * 2 + (slot < 2 ? 1 : 2);
  }

  const secretLift =
    gridChapters.length > 0
      ? (getGridRow(gridChapters.length) - 1) * 0.5
      : 0;

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
          onTouchMove={handleTouchMove}
        >
          <div
            className={`
    center-stage
    ${direction ? `is-${direction}` : ""}
    phase-${phase}
    ${detailPhase !== "closed" ? `detail-${detailPhase}` : ""}
  `}
          >
            {detailSwipePhase !== "idle" && detailSwipeTargetItem && (
              <div
                className="detail-swipe-background"
                style={{
                  backgroundColor:
                    detailSwipeTargetItem.uiTheme === "white" ? "#000" : "#000",
                }}
              ></div>
            )}

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
              ref={detailSlideRef}
              className={`
    gallery-slide
    current-slide

    ui-${uiTheme}

    ${detailPhase === "closed" ? "detail-closed" : `detail-${detailPhase}`}

    ${
      detailSwipePhase !== "idle"
        ? `detail-swipe-${detailSwipePhase}-${detailSwipeDirection}`
        : ""
    }
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
              onWheel={handleDetailNavigationWheel}
            >
              {/* =============================================== */}
              {/* CENTER / DESKTOP ARTWORK */}
              {/* =============================================== */}
              <div className="slide-artwork" onClick={handleOpenDetail}>
                <ProgressiveArtwork
                  key={currentItem.image}
                  artwork={currentItem}
                  imageRef={artworkImgRef}
                  alt={currentItem.title}
                />
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
                          {String(currentItem.id).padStart(2, "0")} /{" "}
                          {String(totalChapters).padStart(2, "0")}
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

                      <div
                        className="detail-story"
                        onWheel={handleStoryWheel}
                        onTouchStart={handleStoryTouchStart}
                        onTouchEnd={handleStoryTouchEnd}
                      >
                        <div className="detail-story-track">
                          {currentItem.story?.length > 0 && (
                            <ShuffleText
                              key={currentIndex}
                              className="detail-story-paragraph"
                              text={currentItem.story[activeStoryIndex] ?? ""}
                            />
                          )}
                        </div>

                        <button
                          className="desktop-return-btn"
                          onClick={handleReturnDesktopStory}
                          aria-label="Return to first paragraph"
                        >
                          <img src="/Detail/return-mark.png" alt="" />
                        </button>
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
                    <ProgressiveArtwork
                      key={`mobile-${currentItem.image}`}
                      artwork={currentItem}
                      alt={currentItem.title}
                    />
                  </div>

                  {/* MOBILE STICKY AUDIO */}

                  {currentItem.audio && (
                    <div className="mobile-audio-sticky">
                      <AudioPlayer
                        audioSrc={currentItem.audio}
                        uiTheme={uiTheme}
                        isUiVisible={shouldShowAudio}
                        isReady={isAudioReady}
                      />
                    </div>
                  )}

                  {/* MOBILE INFO */}

                  <div className="mobile-detail-info">
                    <p className="mobile-detail-index">
                      {String(currentItem.id).padStart(2, "0")} /{" "}
                      {String(totalChapters).padStart(2, "0")}
                    </p>

                    <ShuffleText
                      className="mobile-detail-artwork-title"
                      text={currentItem.title}
                      isRevealed={isDetailTitleRevealed}
                    />

                    <ShuffleText
                      as="h1"
                      className="mobile-detail-story-title"
                      text={currentItem.storyTitle}
                      isRevealed={isDetailTitleRevealed}
                      duration={900}
                    />
                  </div>

                  {/* MOBILE MARK LINE (desktop: kéo ngang hết khối) */}

                  <div className="mobile-detail-images">
                    <img src="/Detail/detail-mark.png" alt="" />
                    <img src="/Detail/detail-mark.png" alt="" />
                    <img src="/Detail/detail-mark.png" alt="" />
                  </div>

                  {/* MOBILE STORY */}

                  <ScrambleStory
                    key={currentIndex}
                    paragraphs={currentItem.story ?? []}
                    isActive={isDetailTitleRevealed}
                    scrollRootRef={detailSlideRef}
                  >
                    <button
                      className="mobile-return-btn"
                      onClick={handleReturnMobileDetail}
                      aria-label="Return to top"
                    >
                      <img src="/Detail/return-mark.png" alt="" />
                    </button>
                  </ScrambleStory>
                </div>
              )}
              {/* =============================================== */}
              {/* AUDIO */}
              {/* =============================================== */}
              {isDetailOpen && currentItem.audio && (
                <div className="desktop-main-audio">
                  <AudioPlayer
                    audioSrc={currentItem.audio}
                    uiTheme={uiTheme}
                    isUiVisible={shouldShowAudio}
                    isReady={isAudioReady}
                  />
                </div>
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
                  <img
                    className="incoming-preview"
                    src={nextItem.preview3}
                    alt={nextItem.title}
                  />
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
                  <img
                    className="incoming-preview"
                    src={prevItem.preview3}
                    alt={prevItem.title}
                  />
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
            {gridChapters.map((artwork) => (
              <button
                className="grid-item"
                key={artwork.id}
                onClick={() => {
                  const realIndex = artworks.findIndex(
                    (item) => item.id === artwork.id,
                  );

                  setCurrentIndex(realIndex);
                  setLayout("center");
                }}
                style={{
                  backgroundColor: artwork.background,
                }}
                aria-label={`Open ${artwork.title}`}
              >
                <GridArtwork artwork={artwork} />
              </button>
            ))}

            {/* SECRET: luôn ở cuối, chiếm hết một hàng */}

            {secretArtwork && isSecretUnlocked && (
              <button
                className="grid-item grid-item-secret"
                onClick={() => {
                  const realIndex = artworks.findIndex(
                    (item) => item.id === secretArtwork.id,
                  );

                  setCurrentIndex(realIndex);
                  setLayout("center");
                }}
                style={{
                  backgroundColor: secretArtwork.background,
                  "--secret-lift": secretLift,
                }}
                aria-label={`Open ${secretArtwork.title}`}
              >
                <GridArtwork artwork={secretArtwork} />
              </button>
            )}

            {secretArtwork && !isSecretUnlocked && (
              <div
                className="grid-item grid-item-secret is-locked"
                style={{
                  backgroundColor: secretArtwork.background,
                  "--secret-lift": secretLift,
                }}
                aria-label="Secret artwork"
              >
                <GridArtwork artwork={LOCKED_SECRET_ARTWORK} />
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default Main;
