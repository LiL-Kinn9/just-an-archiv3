import { useState } from "react";
import "./Nav.css";
import About from "../About/About";

import menuOpenWhite from "../../assets/Icon/menu-open-white.svg";
import menuUnopenWhite from "../../assets/Icon/menu-unopen-white.svg";
import menuOpenBlack from "../../assets/Icon/menu-open-black.svg";
import menuUnopenBlack from "../../assets/Icon/menu-unopen-black.svg";

/* ========================================================= */
/* NAV */
/* ========================================================= */

function Nav({ layout, setLayout, uiTheme, isUiVisible }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [hasAboutStarted, setHasAboutStarted] = useState(false);

  /* ========================================================= */
  /* CURRENT UI COLOR */
  /* ========================================================= */

  const isWhiteUI = uiTheme === "white";

  const menuOpenIcon = isWhiteUI ? menuOpenWhite : menuOpenBlack;

  const menuClosedIcon = isWhiteUI ? menuUnopenWhite : menuUnopenBlack;

  const navColor = isWhiteUI ? "#ffffff" : "#000000";

  /* ========================================================= */
  /* MENU TOGGLE */
  /* ========================================================= */

  function handleToggle() {
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
  }

  /* ========================================================= */
  /* CLOSE EVERYTHING */
  /* ========================================================= */

  function handleOverlayClick() {
    setIsOpen(false);
    setIsAboutOpen(false);
  }

  return (
    <>
      {/* ===================================================== */}
      {/* ICON BUTTON */}
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
      >
        {/* =================================================== */}
        {/* VIEW MODE */}
        {/* =================================================== */}

        <div className="nav-item">
          <button
            onClick={() =>
              setLayout((prev) => (prev === "center" ? "grid" : "center"))
            }
          >
            {layout === "center" ? "GRID" : "CENTER"}
          </button>
        </div>

        {/* =================================================== */}
        {/* ABOUT */}
        {/* =================================================== */}

        <div className="nav-item">
          <button onClick={handleAboutOpen}>ABOUT THIS PROJECT</button>
        </div>

        {/* =================================================== */}
        {/* SECRET */}
        {/* =================================================== */}

        <div className="nav-item">
          <button>SECRET</button>
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
