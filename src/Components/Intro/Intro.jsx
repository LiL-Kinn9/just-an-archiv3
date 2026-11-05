import { useEffect, useRef, useState } from "react";

import "./Intro.css";

import {
  getPreviewSources,
  preloadImage,
  preloadInOrder,
} from "../../utils/preload";

import LOCKED_SECRET_ARTWORK from "../../data/LockedSecret";

function Intro({ onStart, artworks = [] }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isArtworkLoaded, setIsArtworkLoaded] = useState(false);

  const videoRef = useRef(null);
  const hasFinishedRef = useRef(false);

  /* ========================================== */
  /* PRELOAD ARTWORKS */
  /* ========================================== */

  /*
    Trước khi hiện "Touch To Start": mọi bản nhẹ (preview3/2/1) của tất cả
    artwork, kể cả ảnh ô secret còn khoá trong Grid (ảnh này rất nhẹ nên tải
    luôn bản gốc), và ảnh gốc của chương 1.
    Sau đó ảnh gốc các chương còn lại tải ngầm lần lượt theo thứ tự chương,
    chạy tiếp cả khi đã vào trang.
  */

  useEffect(() => {
    let cancelled = false;

    const [first, ...rest] = artworks.map((artwork) => artwork.image);

    Promise.all([
      ...getPreviewSources([...artworks, LOCKED_SECRET_ARTWORK]).map(
        preloadImage,
      ),
      preloadImage(LOCKED_SECRET_ARTWORK.image),
      preloadImage(first),
    ]).then(() => {
      if (cancelled) return;

      setIsArtworkLoaded(true);

      preloadInOrder(rest);
    });

    return () => {
      cancelled = true;
    };
  }, [artworks]);

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
            <section className="intro-disclaimer-block" lang="en">
              <h1>DISCLAIMER</h1>

              <p>This website contains explicit content.</p>
              <p>Viewer discretion is advised.</p>
            </section>

            <section className="intro-disclaimer-block" lang="vi">
              <h2>LƯU Ý</h2>

              <p>Trang web này chứa nội dung nhạy cảm.</p>
              <p>Người xem nên tự cân nhắc.</p>
            </section>

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
