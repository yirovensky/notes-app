// Вырезает из изображения центральный квадрат и сжимает до size×size JPEG.
// Так на сервер уходит лёгкий файл (десятки КБ), а не фото в несколько мегабайт.
export async function squareAvatarBlob(file: File, size = 256): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Не удалось прочитать изображение.");
  }

  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Не удалось обработать изображение.");

  ctx.fillStyle = "#ffffff"; // фон под прозрачные PNG
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Не удалось обработать изображение."))),
      "image/jpeg",
      0.9
    )
  );
}