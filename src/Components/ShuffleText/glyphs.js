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

export function randomGlyph(shapeChar) {
  const upper = shapeChar.toUpperCase();
  const lower = shapeChar.toLowerCase();

  if (upper === lower) return pick(OTHER + UPPER);

  return shapeChar === upper ? pick(UPPER) : pick(LOWER);
}
