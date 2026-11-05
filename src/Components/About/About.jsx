import { useEffect, useState } from "react";

import "./About.css";

import ShuffleText from "../ShuffleText/ShuffleText";
import TypewriterText from "../TypewriterText/TypewriterText";

/*
  Nội dung About theo ngôn ngữ.
  Tiêu đề và phần DEVELOPMENT vốn đã là tiếng Anh nên giữ nguyên.
  Tiêu đề xáo trộn chữ rồi hiện ra mỗi lần About mở.
*/

const ABOUT_TEXT = {
  vi: {
    project: [
      "Dự án này được xây dựng với mục đích học hỏi, lưu trữ kỉ niệm.",
      "Những nội dung bên trong dự án không nhằm mục đích cổ súy, công kích hay báng bổ bất cứ tổ chức hay cá nhân nào.",
      "Cũng như là sự tri ân lớn với những người rời đi hay ở lại, kể cả xa lạ, góp phần hoàn thành dự án này.",
    ],
    archive: [
      "Just An Archiv3 là một kho lưu trữ mang giá trị nghệ thuật dưới góc nhìn cá nhân mình.",
      "Ý niệm về tình yêu, về sự trưởng thành và về những nỗi đau.",
      "Những câu chuyện được ẩn ý tường thuật lại dựa trên những mảnh ghép trong quá trình trưởng thành của mình.",
      "Mọi cái tên, mọi diễn biến là một câu chuyện thật sự tồn tại dưới lăng kính của nhân vật hư cấu.",
    ],
  },
  en: {
    project: [
      "This project was built to learn and to keep memories.",
      "Nothing in this project is meant to promote, attack or blaspheme any organization or individual.",
      "It is also a deep gratitude to those who left and those who stayed, strangers included, who helped bring this project to life.",
    ],
    archive: [
      "Just An Archiv3 is an archive of artistic value, seen through my own eyes.",
      "Notions of love, of growing up, and of pain.",
      "The stories are told in veiled form, built from the pieces of my own coming of age.",
      "Every name, every event is a story that truly exists, seen through the lens of fictional characters.",
    ],
  },
};

const DEVELOPMENT_TEXT = [
  "Directed & Designed by ___Kninn9.",
  "ARTWORKS & MUSIC. ALL RIGHTS RESERVED: MCK, FujiByNight, Phuong Vu, Trung Bao, Fustic, Maiki, N0L4BL3, AAA Music Studio.",
  "Thank To: HieuImBa, BeyBipuii, Thanh Nhi, Tuan Kien (AAA).",
  "Special Thank To: T. Kristen, who contributed the most.",
];

/*
  Thời điểm từng khối trượt xong (ms), khớp About.css:
  khối 1: delay 0.1s + 0.6s, khối 2: 0.7s + 0.6s, khối 3: 1.3s + 0.6s.
  Chữ của mỗi khối nhảy loạn cho tới đúng lúc đó mới chốt lại.
*/

const ITEM_SETTLE_TIMES = [700, 1300, 1900];

/*
  Khi đóng: chữ giữ nguyên (không nhảy loạn) và mờ đi trước
  (aboutDisappear 0.35s trong About.css), rồi lớp blur của menu mới tắt hẳn (0.6s).
  Trong khoảng này chữ vẫn được giữ hiện để không bị mất giữa chừng.
*/

const CLOSE_TIME = 600;

/*
  Nội dung một khối: tiêu đề nhảy loạn cho tới khi khối trượt xong,
  rồi các đoạn bên dưới được gõ ra lần lượt.
*/

function AboutItemText({
  title,
  paragraphs,
  isOpen,
  isScrambling,
  isClosing,
  typedCount,
  onParagraphDone,
}) {
  // Đang đóng thì đoạn đang gõ dở cứ gõ tiếp trong lúc mờ đi.
  const canType = (isOpen || isClosing) && !isScrambling;

  function getStatus(index) {
    if (index < typedCount) return "done";

    if (canType && index === typedCount) return "typing";

    return "hidden";
  }

  return (
    <div className="about-item-content">
      <ShuffleText
        as="h2"
        text={title}
        isRevealed={isOpen || isClosing}
        isScrambling={isScrambling}
      />

      {paragraphs.map((paragraph, index) => (
        <TypewriterText
          key={index}
          text={paragraph}
          status={getStatus(index)}
          onDone={() => onParagraphDone(index)}
        />
      ))}
    </div>
  );
}

function About({ isAboutOpen, hasAboutStarted, uiTheme, lang = "vi" }) {
  const aboutColor = uiTheme === "white" ? "#f5f5f2" : "#040606";

  const text = ABOUT_TEXT[lang] ?? ABOUT_TEXT.vi;

  /* Số khối đã trượt xong kể từ lần mở này. */

  const [settledCount, setSettledCount] = useState(0);

  /*
    Số đoạn đã gõ xong của từng khối.
    Đóng About thì giữ nguyên chữ khi trượt ra, mở lại mới gõ lại từ đầu.
  */

  const [typedCounts, setTypedCounts] = useState([0, 0, 0]);

  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isAboutOpen) {
      if (!hasAboutStarted) return;

      const closeTimers = [
        setTimeout(() => {
          setSettledCount(0);
          setIsClosing(true);
        }, 0),

        setTimeout(() => setIsClosing(false), CLOSE_TIME),
      ];

      return () => closeTimers.forEach(clearTimeout);
    }

    const timers = [
      setTimeout(() => {
        setTypedCounts([0, 0, 0]);
        setIsClosing(false);
      }, 0),

      ...ITEM_SETTLE_TIMES.map((time, index) =>
        setTimeout(() => setSettledCount(index + 1), time),
      ),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isAboutOpen, hasAboutStarted]);

  const isItemScrambling = (index) => isAboutOpen && settledCount <= index;

  function handleParagraphDone(itemIndex, paragraphIndex) {
    setTypedCounts((prev) =>
      prev.map((count, index) =>
        index === itemIndex ? Math.max(count, paragraphIndex + 1) : count,
      ),
    );
  }

  const itemProps = (index) => ({
    isOpen: isAboutOpen,
    isScrambling: isItemScrambling(index),
    isClosing,
    typedCount: typedCounts[index],
    onParagraphDone: (paragraphIndex) =>
      handleParagraphDone(index, paragraphIndex),
  });

  return (
    <div
      className={`
        about-container
        ${!hasAboutStarted ? "not-started" : ""}
        ${isAboutOpen ? "is-opened" : "is-closed"}
      `}
      style={{
        "--about-color": aboutColor,
      }}
    >
      <div className="about-item about-item-left">
        <AboutItemText
          title="ABOUT PROJECT"
          paragraphs={text.project}
          {...itemProps(0)}
        />
      </div>

      <div className="about-item about-item-right">
        <AboutItemText
          title="JUST AN ARCHIV3"
          paragraphs={text.archive}
          {...itemProps(1)}
        />
      </div>

      <div className="about-item about-item-left">
        <AboutItemText
          title="DEVELOPMENT"
          paragraphs={DEVELOPMENT_TEXT}
          {...itemProps(2)}
        />
      </div>
    </div>
  );
}

export default About;
