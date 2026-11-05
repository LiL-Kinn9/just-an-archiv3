/*
  Tải trước ảnh vào bộ nhớ đệm của trình duyệt.
  Mỗi đường dẫn chỉ tải một lần, gọi lại thì dùng chung kết quả.
  Lỗi tải không làm hỏng gì: ảnh đó sẽ được tải lại lúc hiển thị như bình thường.
*/

const loading = new Map();

export function preloadImage(src) {
  if (!src) return Promise.resolve(false);

  if (!loading.has(src)) {
    loading.set(
      src,
      new Promise((resolve) => {
        const img = new Image();

        img.decoding = "async";
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);

        img.src = src;
      }),
    );
  }

  return loading.get(src);
}

/* Tải lần lượt từng ảnh (không tranh băng thông với ảnh đang xem). */

export async function preloadInOrder(srcs) {
  for (const src of srcs) {
    await preloadImage(src);
  }
}

/* Ảnh xem trước (rất nhẹ) của mọi artwork. */

export function getPreviewSources(artworks) {
  return artworks.flatMap((artwork) =>
    [artwork.preview3, artwork.preview2, artwork.preview1].filter(Boolean),
  );
}
