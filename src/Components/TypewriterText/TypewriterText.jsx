import { useEffect, useRef, useState } from "react";
import "./TypewriterText.css";
import { randomGlyph } from "../ShuffleText/glyphs";

/* Mỗi ký tự nhảy loạn bao lâu sau khi được gõ ra rồi mới chốt (ms). */

const SETTLE_TIME = 160;

/* Đổi ký tự ngẫu nhiên mỗi bao nhiêu ms. */

const GLYPH_INTERVAL = 50;

/*
  Tách chữ theo từng ký tự hiển thị (giữ nguyên chữ có dấu tiếng Việt).
*/

const segmenter =
  typeof Intl !== "undefined" && Intl.Segmenter
    ? new Intl.Segmenter("vi", { granularity: "grapheme" })
    : null;

function splitGraphemes(text) {
  if (!segmenter) return Array.from(text);

  return Array.from(segmenter.segment(text), (part) => part.segment);
}

/* Dừng lâu hơn một chút sau dấu câu, như người đang gõ thật. */

function pauseAfter(char, speed) {
  if (/[.!?…]/.test(char)) return speed * 12;
  if (/[,;:]/.test(char)) return speed * 6;

  return 0;
}

/*
  Gõ từng ký tự một. Vài ký tự ngay trước con trỏ còn nhảy loạn,
  qua SETTLE_TIME mới chốt thành chữ thật.

  status:
  - "hidden": chưa hiện chữ (vẫn giữ chỗ),
  - "typing": gõ từ đầu tới cuối rồi gọi onDone,
  - "done":   hiện đủ chữ.

  Đang gõ thì luôn có con trỏ đứng yên ở cuối phần đã gõ.
  showCursor: giữ con trỏ (nhấp nháy) cả khi đã gõ xong.

  Phần chưa gõ vẫn được render nhưng ẩn đi,
  nên chữ xuống dòng đúng chỗ ngay từ ký tự đầu tiên.
*/

function TypewriterText({
  text,
  as: Tag = "p",
  className = "",
  status = "hidden",
  showCursor = false,
  speed = 14,
  onDone,
  ...rest
}) {
  /*
    count: số ký tự đã gõ ra (kể cả đang nhảy loạn),
    settled: số ký tự đã chốt thành chữ thật,
    output: chữ đang hiển thị của phần đã gõ.
  */

  const [typed, setTyped] = useState({ count: 0, settled: 0, output: "" });

  /* Bắt đầu lượt gõ mới (hoặc đổi chữ) thì gõ lại từ đầu. */

  const [run, setRun] = useState({ status, text });

  if (run.status !== status || run.text !== text) {
    setRun({ status, text });
    setTyped({ count: 0, settled: 0, output: "" });
  }

  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  });

  const chars = splitGraphemes(text);

  useEffect(() => {
    if (status !== "typing") return;

    const parts = splitGraphemes(text);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    /* times[i]: thời điểm ký tự thứ i hiện ra. */

    const times = [];
    let time = 0;

    parts.forEach((char, index) => {
      time += speed;
      times[index] = time;
      time += pauseAfter(char, speed);
    });

    let frameId;
    let startTime = null;
    let lastGlyphTime = -Infinity;

    let count = 0;
    let settled = 0;

    /* Ký tự ngẫu nhiên đang hiện cho từng vị trí chưa chốt. */

    const glyphs = [];

    function frame(now) {
      if (startTime === null) startTime = now;

      const elapsed = reduceMotion ? Infinity : now - startTime;

      while (count < parts.length && times[count] <= elapsed) {
        count++;
      }

      while (settled < count && times[settled] + SETTLE_TIME <= elapsed) {
        settled++;
      }

      const shouldRefresh = now - lastGlyphTime >= GLYPH_INTERVAL;

      if (shouldRefresh) lastGlyphTime = now;

      let tail = "";

      for (let i = settled; i < count; i++) {
        // Giữ khoảng trắng để hình dáng các từ không nhảy lung tung.
        if (/\s/.test(parts[i])) {
          tail += parts[i];
          continue;
        }

        if (shouldRefresh || !glyphs[i]) glyphs[i] = randomGlyph(parts[i]);

        tail += glyphs[i];
      }

      setTyped({
        count,
        settled,
        output: parts.slice(0, settled).join("") + tail,
      });

      if (settled < parts.length) {
        frameId = requestAnimationFrame(frame);
        return;
      }

      onDoneRef.current?.();
    }

    frameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [status, text, speed]);

  const isRunning = status === "typing";

  const visibleCount =
    status === "done" ? chars.length : isRunning ? typed.count : 0;

  const visibleText = status === "done" ? text : isRunning ? typed.output : "";

  const isTyping = isRunning && typed.settled < chars.length;

  return (
    <Tag className={`typewriter-text ${className}`} {...rest}>
      <span className="typewriter-sr">{text}</span>

      <span aria-hidden="true">
        {visibleText}

        {(showCursor || isTyping) && (
          <span
            className={`typewriter-cursor ${isTyping ? "is-typing" : ""}`}
          />
        )}

        <span className="typewriter-rest">
          {chars.slice(visibleCount).join("")}
        </span>
      </span>
    </Tag>
  );
}

export default TypewriterText;
