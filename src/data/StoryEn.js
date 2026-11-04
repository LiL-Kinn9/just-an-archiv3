/*
  Bản tiếng Anh của story.

  Mỗi chương là một file `story-en/NN.txt` (NN = id chương, 01, 02...).
  Mỗi dòng ứng đúng một phần tử trong mảng `story` tiếng Việt của chương đó,
  cùng thứ tự, nên số dòng phải bằng nhau.
  Dòng ngăn cảnh ghi là "---" (trình soạn thảo hay tự xóa dấu cách cuối dòng),
  khi nạp sẽ đổi thành "   " như bản tiếng Việt.
*/

const files = import.meta.glob("./story-en/*.txt", {
  query: "?raw",
  import: "default",
  eager: true,
});

const storyEnById = {};

for (const [path, raw] of Object.entries(files)) {
  const id = Number(path.match(/(\d+)\.txt$/)?.[1]);

  if (!id) continue;

  const lines = raw.replace(/\r/g, "").split("\n");

  // Bỏ dòng trống cuối file (do xuống dòng sau dòng cuối).
  while (lines.length && lines[lines.length - 1] === "") lines.pop();

  storyEnById[id] = lines.map((line) => (line.trim() === "---" ? "   " : line));
}

/*
  Lấy story theo ngôn ngữ.
  Chương chưa có bản dịch (hoặc lệch số dòng) thì dùng tiếng Việt.
*/

export function getStory(artwork, lang) {
  const vi = artwork?.story ?? [];

  if (lang !== "en") return vi;

  const en = storyEnById[artwork?.id];

  if (!en || en.length !== vi.length) return vi;

  return en;
}
