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

          <p>Dự án này được xây dựng với mục đích học hỏi, lưu trữ kỉ niệm.</p>
          <br />
          <p>
            Những nội dung bên trong dự án không nhằm mục đích cổ súy, công kích
            hay báng bổ bất cứ tổ chức hay cá nhân nào.
          </p>
          <br />
          <p>
            Cũng như là sự tri ân lớn với những người rời đi hay ở lại, kể cả xa
            lạ, góp phần hoàn thành dự án này.
          </p>
        </div>
      </div>

      <div className="about-item about-item-right">
        <div className="about-item-content">
          <h2>JUST AN ARCHIV3</h2>

          <p>
            Just An Archiv3 là một kho lưu trữ mang giá trị nghệ thuật dưới góc
            nhìn cá nhân mình.
          </p>
          <br />
          <p>Ý niệm về tình yêu, về sự trưởng thành và về những nỗi đau.</p>
          <br />
          <p>
            Những câu chuyện được ẩn ý tường thuật lại dựa trên những mảnh ghép
            trong quá trình trưởng thành của mình.
          </p>
          <br />
          <p>
            Mọi cái tên, mọi diễn biến là một câu chuyện thật sự tồn tại dưới
            lăng kính của nhân vật hư cấu.
          </p>
        </div>
      </div>

      <div className="about-item about-item-left">
        <div className="about-item-content">
          <h2>DEVELOPMENT</h2>

          <p>Directed & Designed by ___Kninn9.</p>
          <br />
          <p>
            ARTWORKS & MUSIC. ALL RIGHTS RESERVED: MCK, FujiByNight, Phuong Vu,
            Trung Bao, Fustic, Maiki, N0L4BL3, AAA Music Studio.
          </p>
          <br />
          <p>Thank To: HieuImBa, BeyBipuii, Thanh Nhi, Tuan Kien (AAA).</p>
          <br />
          <p>Special Thank To: T. Kristen. For the most contribution.</p>
        </div>
      </div>
    </div>
  );
}

export default About;
