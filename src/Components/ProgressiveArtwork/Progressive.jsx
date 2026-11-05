import { useEffect, useMemo, useRef, useState } from "react";

import "./Progressive.css";

/*
  minimumDisplayTime: mỗi lớp (preview2, preview1, ảnh gốc) hiện ít nhất bấy nhiêu ms.
  Mặc định rất ngắn; tăng lên khi muốn người xem thấy rõ ảnh nét dần (vd. secret).
*/

function ProgressiveArtwork({
  artwork,
  alt,
  imageRef,
  onImageLoad,
  minimumDisplayTime = 30,
}) {
  const progressiveSources = useMemo(() => {
    return [
      {
        src: artwork.preview2,
        type: "preview2",
      },
      {
        src: artwork.preview1,
        type: "preview1",
      },
      {
        src: artwork.image,
        type: "original",
      },
    ].filter((item) => item.src);
  }, [artwork.preview2, artwork.preview1, artwork.image]);

  const baseSrc = artwork.preview3 ?? artwork.preview2 ?? artwork.preview1;

  const [loadedLayers, setLoadedLayers] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const onImageLoadRef = useRef(onImageLoad);

  useEffect(() => {
    onImageLoadRef.current = onImageLoad;
  }, [onImageLoad]);

  /* Đọc qua ref để đổi giá trị giữa chừng không làm chạy lại từ đầu. */

  const minimumDisplayTimeRef = useRef(minimumDisplayTime);

  useEffect(() => {
    minimumDisplayTimeRef.current = minimumDisplayTime;
  }, [minimumDisplayTime]);

  useEffect(() => {
    let cancelled = false;

    function wait(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }

    async function loadSequentially(index) {
      if (cancelled) return;
      if (index >= progressiveSources.length) return;

      const img = new Image();

      const startTime = performance.now();

      try {
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;

          img.src = progressiveSources[index].src;
        });

        try {
          await img.decode();
        } catch {
          // vẫn tiếp tục
        }
      } catch {
        if (!cancelled) {
          loadSequentially(index + 1);
        }

        return;
      }

      if (cancelled) return;

      const elapsed = performance.now() - startTime;

      const remaining = Math.max(0, minimumDisplayTimeRef.current - elapsed);

      if (remaining > 0) {
        await wait(remaining);
      }

      if (cancelled) return;

      setLoadedLayers((prev) => [
        ...prev,
        {
          src: progressiveSources[index].src,
          type: progressiveSources[index].type,
          sourceIndex: index,
        },
      ]);

      setActiveIndex(index);

      loadSequentially(index + 1);
    }

    loadSequentially(0);

    return () => {
      cancelled = true;
    };
  }, [progressiveSources]);

  return (
    <div className="progressive-artwork">
      {/*
        BASE: bản nhẹ nhất đang có (thường là preview3), hiện ngay khi vừa render
        nên ô ảnh không bao giờ trống trong lúc chờ các lớp sau.
      */}
      {baseSrc && (
        <img
          className={`progressive-base ${activeIndex === -1 ? "is-active" : ""}`}
          src={baseSrc}
          alt=""
        />
      )}

      {/* PREVIEW 2 -> PREVIEW 1 -> ORIGINAL */}
      {loadedLayers.map((layer) => {
        const isOriginal = layer.type === "original";

        return (
          <img
            key={layer.src}
            ref={isOriginal ? imageRef : null}
            src={layer.src}
            alt={isOriginal ? alt : ""}
            className={`
  progressive-layer
  progressive-${layer.type}
  ${layer.sourceIndex === activeIndex ? "is-active" : ""}
`}
            onLoad={() => {
              if (isOriginal) {
                onImageLoadRef.current?.();
              }
            }}
          />
        );
      })}
    </div>
  );
}

export default ProgressiveArtwork;
