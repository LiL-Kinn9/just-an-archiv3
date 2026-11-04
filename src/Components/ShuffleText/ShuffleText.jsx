import { useEffect, useRef, useState } from "react";
import "./ShuffleText.css";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const OTHER = "0123456789#%&*+=?!/<>";

function pick(set) {
  return set[Math.floor(Math.random() * set.length)];
}

/*
  Giữ kiểu chữ của ký tự đích:
  chữ hoa nhảy chữ hoa, chữ thường nhảy chữ thường.
*/

function randomGlyph(shapeChar) {
  const upper = shapeChar.toUpperCase();
  const lower = shapeChar.toLowerCase();

  if (upper === lower) return pick(OTHER + UPPER);

  return shapeChar === upper ? pick(UPPER) : pick(LOWER);
}

/*
  Khi `text` đổi, từng ký tự lần lượt:
  1. giữ chữ cũ,
  2. nhảy loạn ký tự ngẫu nhiên,
  3. chốt lại thành chữ mới.
  Thứ tự chạy như một làn sóng từ đầu tới cuối đoạn, có chút ngẫu nhiên.

  isRevealed = false: chưa hiện chữ (nhưng vẫn giữ chỗ),
  khi chuyển sang true, chữ xáo trộn rồi hiện ra.

  isScrambling = true: chữ nhảy loạn liên tục (giữ hình dạng từ),
  khi chuyển sang false mới chốt về chữ thật.
*/

function ShuffleText({
  text,
  as: Tag = "p",
  className = "",
  duration = 700,
  isRevealed = true,
  isScrambling = false,
  ...rest
}) {
  const target = isRevealed ? text : "";

  const [displayText, setDisplayText] = useState(target);
  const displayRef = useRef(target);

  /* Nhảy loạn liên tục cho tới khi isScrambling tắt. */

  useEffect(() => {
    if (!isScrambling || !target) return;

    const chars = Array.from(target);

    let frameId;
    let lastTime = 0;

    function loop(now) {
      if (now - lastTime > 55) {
        lastTime = now;

        const output = chars
          .map((char) => (/\s/.test(char) ? char : randomGlyph(char)))
          .join("");

        displayRef.current = output;
        setDisplayText(output);
      }

      frameId = requestAnimationFrame(loop);
    }

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isScrambling, target]);

  useEffect(() => {
    if (isScrambling) return;

    const fromChars = Array.from(displayRef.current);
    const toChars = Array.from(target);

    if (fromChars.join("") === target) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const length = Math.max(fromChars.length, toChars.length);

    const starts = [];
    const ends = [];

    for (let i = 0; i < length; i++) {
      const wave = length > 1 ? i / (length - 1) : 0;

      starts[i] = wave * duration * 0.35 + Math.random() * duration * 0.1;
      ends[i] =
        starts[i] + duration * 0.35 + Math.random() * duration * 0.2;
    }

    let frameId;
    let startTime = null;

    function frame(now) {
      if (startTime === null) startTime = now;

      const elapsed = reduceMotion ? Infinity : now - startTime;

      let output = "";
      let isDone = true;

      for (let i = 0; i < length; i++) {
        const fromChar = fromChars[i];
        const toChar = toChars[i];

        if (elapsed >= ends[i]) {
          output += toChar ?? "";
          continue;
        }

        isDone = false;

        if (elapsed < starts[i]) {
          output += fromChar ?? "";
          continue;
        }

        // Giữ khoảng trắng để hình dáng các từ không nhảy lung tung.
        const shapeChar = toChar ?? fromChar ?? "";

        output += /\s/.test(shapeChar) ? shapeChar : randomGlyph(shapeChar);
      }

      displayRef.current = output;
      setDisplayText(output);

      if (!isDone) {
        frameId = requestAnimationFrame(frame);
      }
    }

    frameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [target, duration, isScrambling]);

  return (
    <Tag className={`shuffle-text ${className}`} {...rest}>
      <span className="shuffle-text-sr">{text}</span>

      {/* Giữ chỗ bằng chữ thật để bố cục không nhảy khi chữ đang xáo trộn. */}
      <span className="shuffle-text-reserve" aria-hidden="true">
        {text}
      </span>

      <span className="shuffle-text-live" aria-hidden="true">
        {displayText}
      </span>
    </Tag>
  );
}

export default ShuffleText;
