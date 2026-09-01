import "./About.css";

function About({ isAboutOpen, hasAboutStarted, uiTheme }) {
  const aboutColor = uiTheme === "white" ? "#f5f5f2" : "#000000";

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
        <div className="about-item-content">
          <h2>ABOUT PROJECT</h2>

          <p>Your introduction goes here.</p>
        </div>
      </div>

      <div className="about-item about-item-right">
        <div className="about-item-content">
          <h2>JUST AN ARCHIV3</h2>

          <p>Your design philosophy goes here.</p>
        </div>
      </div>

      <div className="about-item about-item-left">
        <div className="about-item-content">
          <h2>DEVELOPMENT</h2>

          <p>Your development philosophy goes here.</p>
        </div>
      </div>
    </div>
  );
}

export default About;
