import { useRef, useState } from "react";
import "./Nav.css";

import About from "../About/About";
import ShuffleText from "../ShuffleText/ShuffleText";

import menuOpenWhite from "../../assets/Icon/menu-open-white.svg";
import menuUnopenWhite from "../../assets/Icon/menu-unopen-white.svg";
import menuOpenBlack from "../../assets/Icon/menu-open-black.svg";
import menuUnopenBlack from "../../assets/Icon/menu-unopen-black.svg";

/* Thời gian chữ của ô Secret xáo trộn khi hiện/ẩn (ms). */

const SECRET_RESET_TIME = 450;

function Nav({
  layout,
  setLayout,
  uiTheme,
  isUiVisible,
  onSecretUnlock,
  isSecretUnlocked,
  lang,
  onToggleLang,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [hasAboutStarted, setHasAboutStarted] = useState(false);

  /* ========================================================= */
  /* UI COLOR */
  /* ========================================================= */

  const isWhiteUI = uiTheme === "white";

  const menuOpenIcon = isWhiteUI ? menuOpenWhite : menuOpenBlack;

  const menuClosedIcon = isWhiteUI ? menuUnopenWhite : menuUnopenBlack;

  const navColor = isWhiteUI ? "#ffffff" : "#000000";

  /* ========================================================= */
  /* SECRET STATE */
  /* ========================================================= */

  const [isSecretOpen, setIsSecretOpen] = useState(false);

  const [secretDay, setSecretDay] = useState("");
  const [secretMonth, setSecretMonth] = useState("");
  const [secretYear, setSecretYear] = useState("");

  const [secretStatus, setSecretStatus] = useState("idle");
  // idle | failed | resetting
  // Nhập đúng thì không cần trạng thái riêng: isSecretUnlocked từ App giữ luôn.

  const secretDayRef = useRef(null);
  const secretMonthRef = useRef(null);
  const secretYearRef = useRef(null);

  const secretTimersRef = useRef([]);

  function clearSecretTimers() {
    secretTimersRef.current.forEach(clearTimeout);
    secretTimersRef.current = [];
  }

  /* ========================================================= */
  /* RESET SECRET */
  /* ========================================================= */

  function resetSecret() {
    clearSecretTimers();

    setIsSecretOpen(false);

    setSecretStatus("idle");

    setSecretDay("");
    setSecretMonth("");
    setSecretYear("");
  }

  /* ========================================================= */
  /* MENU TOGGLE */
  /* ========================================================= */

  function handleToggle() {
    if (isOpen) {
      resetSecret();
    }

    setIsOpen((prev) => !prev);

    setHasStarted(true);

    setIsAboutOpen(false);
  }

  /* ========================================================= */
  /* ABOUT */
  /* ========================================================= */

  function handleAboutOpen() {
    setIsAboutOpen(true);

    setHasAboutStarted(true);

    setIsOpen(false);

    resetSecret();
  }

  /* ========================================================= */
  /* OVERLAY */
  /* ========================================================= */

  function handleOverlayClick() {
    setIsOpen(false);
    setIsAboutOpen(false);

    resetSecret();
  }

  /* ========================================================= */
  /* SECRET DAY */
  /* ========================================================= */

  function handleSecretDayChange(event) {
    let value = event.target.value.replace(/\D/g, "");

    if (value.length > 2) {
      value = value.slice(0, 2);
    }

    /*
      Nếu nhập 4,5,6,7,8,9
      thì tự hiểu thành 04,05,06...
    */

    if (value.length === 1 && Number(value) > 3) {
      value = `0${value}`;
    }

    setSecretDay(value);
    setSecretStatus("idle");

    if (value.length === 2) {
      requestAnimationFrame(() => {
        secretMonthRef.current?.focus({
          preventScroll: true,
        });
      });
    }
  }

  /* ========================================================= */
  /* SECRET MONTH */
  /* ========================================================= */

  function handleSecretMonthChange(event) {
    let value = event.target.value.replace(/\D/g, "");

    if (value.length > 2) {
      value = value.slice(0, 2);
    }

    /*
      Nếu nhập 2,3,4...
      thì tự hiểu thành 02,03,04...
    */

    if (value.length === 1 && Number(value) > 1) {
      value = `0${value}`;
    }

    setSecretMonth(value);
    setSecretStatus("idle");

    if (value.length === 2) {
      requestAnimationFrame(() => {
        secretYearRef.current?.focus({
          preventScroll: true,
        });
      });
    }
  }

  /* ========================================================= */
  /* SECRET YEAR */
  /* ========================================================= */

  function handleSecretYearChange(event) {
    let value = event.target.value.replace(/\D/g, "");

    if (value.length > 4) {
      value = value.slice(0, 4);
    }

    setSecretYear(value);
    setSecretStatus("idle");
  }

  /* ========================================================= */
  /* BACKSPACE NAVIGATION */
  /* ========================================================= */

  /* Nhấn Enter trên bàn phím ở ô nào cũng gửi luôn, như bấm ENTER. */

  function handleEnterKey(event) {
    if (event.key !== "Enter") return false;

    event.preventDefault();

    handleSecretSubmit();

    return true;
  }

  function handleDayKeyDown(event) {
    handleEnterKey(event);
  }

  function handleMonthKeyDown(event) {
    if (handleEnterKey(event)) return;

    if (event.key === "Backspace" && secretMonth === "") {
      secretDayRef.current?.focus({
        preventScroll: true,
      });
    }
  }

  function handleYearKeyDown(event) {
    if (handleEnterKey(event)) return;

    if (event.key === "Backspace" && secretYear === "") {
      secretMonthRef.current?.focus({
        preventScroll: true,
      });
    }
  }

  /* ========================================================= */
  /* OPEN SECRET */
  /* ========================================================= */

  function handleSecretOpen() {
    setIsSecretOpen(true);

    setSecretDay("");
    setSecretMonth("");
    setSecretYear("");

    setSecretStatus("idle");

    if (isSecretUnlocked) return;

    requestAnimationFrame(() => {
      secretDayRef.current?.focus({
        preventScroll: true,
      });
    });
  }

  /* ========================================================= */
  /* SECRET SUBMIT */
  /* ========================================================= */

  function handleSecretSubmit() {
    // Đã mở khóa, hoặc đang hiện FAILED ONE: bấm ENTER không làm gì.
    if (isSecretUnlocked || secretStatus !== "idle") return;

    const enteredDate = `${secretDay}/${secretMonth}/${secretYear}`;

    /*
      ĐỔI NGÀY SECRET Ở ĐÂY
    */

    const SECRET_DATE = "06/11/2003";

    /*
      Đúng: CHOSEN ONE xáo trộn hiện ra rồi nằm luôn ở đó,
      YOUR BIRTHDAY đổi thành CHAPTER UNLOCK.
    */

    if (enteredDate === SECRET_DATE) {
      onSecretUnlock?.();
      return;
    }

    /*
      Sai: FAILED ONE xáo trộn hiện ra, giữ 3 giây,
      xáo trộn biến mất (SECRET_RESET_TIME) rồi mới hiện lại ô nhập.
    */

    setSecretStatus("failed");

    clearSecretTimers();

    secretTimersRef.current = [
      setTimeout(() => setSecretStatus("resetting"), 3000),

      setTimeout(() => {
        setSecretStatus("idle");

        setSecretDay("");
        setSecretMonth("");
        setSecretYear("");

        requestAnimationFrame(() => {
          secretDayRef.current?.focus({
            preventScroll: true,
          });
        });
      }, 3000 + SECRET_RESET_TIME),
    ];
  }

  /* ========================================================= */
  /* RETURN */
  /* ========================================================= */

  return (
    <>
      {/* ===================================================== */}
      {/* NAV BUTTON */}
      {/* ===================================================== */}

      <div
        className={`nav-btn-wrapper ${
          isUiVisible || isOpen ? "ui-visible" : "ui-hidden"
        }`}
      >
        <button
          className="nav-btn"
          onClick={handleToggle}
          aria-label="Toggle menu"
        >
          <img src={isOpen ? menuOpenIcon : menuClosedIcon} alt="" />
        </button>
      </div>

      {/* ===================================================== */}
      {/* LANGUAGE (góc trái, ẩn khi menu hoặc About đang mở) */}
      {/* ===================================================== */}

      {/*
        Nút ghi ngôn ngữ sẽ chuyển sang:
        đang tiếng Việt thì ghi EN, đang tiếng Anh thì ghi VI.
      */}

      <div
        className={`nav-lang-wrapper ${
          isUiVisible && !isOpen && !isAboutOpen ? "ui-visible" : "ui-hidden"
        }`}
        style={{
          "--nav-color": navColor,
        }}
      >
        <button
          className="nav-lang-btn"
          onClick={onToggleLang}
          aria-label={
            lang === "vi" ? "Switch story to English" : "Chuyển sang tiếng Việt"
          }
        >
          <ShuffleText
            as="span"
            className="nav-shuffle-label"
            text={lang === "vi" ? "EN" : "VI"}
            duration={450}
          />
        </button>
      </div>

      {/* ===================================================== */}
      {/* OVERLAY */}
      {/* ===================================================== */}

      <div
        onClick={handleOverlayClick}
        className={`
          nav-overlay
          ${isOpen || isAboutOpen ? "is-active" : ""}
        `}
      />

      {/* ===================================================== */}
      {/* MENU */}
      {/* ===================================================== */}

      <div
        className={`
          nav-menu
          ${!hasStarted ? "not-started" : isOpen ? "is-opened" : "is-closed"}
        `}
        style={{
          "--nav-color": navColor,
        }}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {/* =================================================== */}
        {/* VIEW MODE */}
        {/* =================================================== */}

        <div className="nav-item">
          <button
            onClick={(event) => {
              event.stopPropagation();

              setLayout((prev) => (prev === "center" ? "grid" : "center"));
            }}
          >
            <ShuffleText
              as="span"
              className="nav-shuffle-label"
              text={layout === "center" ? "GRID" : "CENTER"}
              duration={450}
            />
          </button>
        </div>

        {/* =================================================== */}
        {/* ABOUT */}
        {/* =================================================== */}

        <div className="nav-item">
          <button
            onClick={(event) => {
              event.stopPropagation();

              handleAboutOpen();
            }}
          >
            ABOUT THIS PROJECT
          </button>
        </div>

        {/* =================================================== */}
        {/* SECRET */}
        {/* =================================================== */}

        <div className="nav-item secret-nav-item">
          <div className="secret-spacer" />

          <div
            className={`secret-control ${isSecretOpen ? "is-expanded" : ""}`}
          >
            <div className="secret-control-inner">
              <button
                type="button"
                className="secret-button"
                onClick={(event) => {
                  event.stopPropagation();

                  if (!isSecretOpen) {
                    handleSecretOpen();
                    return;
                  }

                  handleSecretSubmit();
                }}
              >
                {isSecretOpen ? "ENTER" : "SECRET"}
              </button>

              <div
                className={`secret-content ${isSecretOpen ? "is-visible" : ""}`}
              >
                {!isSecretUnlocked && secretStatus === "idle" && (
                  <div className="secret-date">
                    <input
                      ref={secretDayRef}
                      value={secretDay}
                      onChange={handleSecretDayChange}
                      onKeyDown={handleDayKeyDown}
                      placeholder="--"
                      inputMode="numeric"
                      maxLength={2}
                      className="secret-date-part secret-day"
                    />

                    <span>|</span>

                    <input
                      ref={secretMonthRef}
                      value={secretMonth}
                      onChange={handleSecretMonthChange}
                      onKeyDown={handleMonthKeyDown}
                      placeholder="--"
                      inputMode="numeric"
                      maxLength={2}
                      className="secret-date-part secret-month"
                    />

                    <span>|</span>

                    <input
                      ref={secretYearRef}
                      value={secretYear}
                      onChange={handleSecretYearChange}
                      onKeyDown={handleYearKeyDown}
                      placeholder="----"
                      inputMode="numeric"
                      maxLength={4}
                      className="secret-date-part secret-year"
                    />
                  </div>
                )}

                {isSecretUnlocked && (
                  <ShuffleText
                    key="chosen"
                    as="span"
                    className="secret-result"
                    text="CHOSEN ONE"
                    duration={SECRET_RESET_TIME}
                    revealOnMount
                  />
                )}

                {!isSecretUnlocked && secretStatus !== "idle" && (
                  <ShuffleText
                    key="failed"
                    as="span"
                    className="secret-result"
                    text="FAILED ONE"
                    isRevealed={secretStatus === "failed"}
                    duration={SECRET_RESET_TIME}
                    revealOnMount
                  />
                )}
              </div>
              <div
                className={`secret-caption ${isSecretOpen ? "is-visible" : ""}`}
              >
                <div
                  className={`secret-caption-text ${
                    isSecretUnlocked ? "is-unlocked" : ""
                  }`}
                >
                  <ShuffleText
                    as="span"
                    text={isSecretUnlocked ? "CHAPTER" : "YOUR"}
                    duration={SECRET_RESET_TIME}
                  />
                  <ShuffleText
                    as="span"
                    text={isSecretUnlocked ? "UNLOCK" : "BIRTHDAY"}
                    duration={SECRET_RESET_TIME}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* ABOUT */}
      {/* ===================================================== */}

      <About
        isAboutOpen={isAboutOpen}
        hasAboutStarted={hasAboutStarted}
        uiTheme={uiTheme}
        lang={lang}
      />
    </>
  );
}

export default Nav;
