import { useRef, useState } from "react";
import "./Nav.css";

import About from "../About/About";

import menuOpenWhite from "../../assets/Icon/menu-open-white.svg";
import menuUnopenWhite from "../../assets/Icon/menu-unopen-white.svg";
import menuOpenBlack from "../../assets/Icon/menu-open-black.svg";
import menuUnopenBlack from "../../assets/Icon/menu-unopen-black.svg";

function Nav({ layout, setLayout, uiTheme, isUiVisible, onSecretUnlock }) {
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
  // idle | failed | success

  const secretDayRef = useRef(null);
  const secretMonthRef = useRef(null);
  const secretYearRef = useRef(null);

  /* ========================================================= */
  /* RESET SECRET */
  /* ========================================================= */

  function resetSecret() {
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

  function handleMonthKeyDown(event) {
    if (event.key === "Backspace" && secretMonth === "") {
      secretDayRef.current?.focus({
        preventScroll: true,
      });
    }
  }

  function handleYearKeyDown(event) {
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
    const enteredDate = `${secretDay}/${secretMonth}/${secretYear}`;

    /*
      ĐỔI NGÀY SECRET Ở ĐÂY
    */

    const SECRET_DATE = "06/11/2003";

    if (enteredDate === SECRET_DATE) {
      setSecretStatus("success");

      onSecretUnlock?.();
    } else {
      setSecretStatus("failed");
    }

    /*
      Sau 3 giây:
      SUCCESS / FAILED
      quay lại DD/MM/YYYY
    */

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
    }, 3000);
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
            {layout === "center" ? "GRID" : "CENTER"}
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
                {secretStatus === "idle" && (
                  <div className="secret-date">
                    <input
                      ref={secretDayRef}
                      value={secretDay}
                      onChange={handleSecretDayChange}
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

                {secretStatus === "success" && (
                  <span className="secret-result">CHOSEN ONE</span>
                )}

                {secretStatus === "failed" && (
                  <span className="secret-result">FAILED ONE</span>
                )}
              </div>
              <div
                className={`secret-caption ${isSecretOpen ? "is-visible" : ""}`}
              >
                <div className="secret-caption-text">
                  <span>YOUR</span>
                  <span>BIRTHDAY</span>
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
      />
    </>
  );
}

export default Nav;
