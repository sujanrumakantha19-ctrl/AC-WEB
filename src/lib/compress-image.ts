export const MAX_IMAGE_SIZE = 500 * 1024;

const MAX_DIMENSION = 1600;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to read image"));
    };
    img.src = url;
  });
}

function drawScaled(img: HTMLImageElement, maxDim: number): HTMLCanvasElement {
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

async function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode image"))),
      "image/jpeg",
      quality
    );
  });
}

export async function compressImage(file: File, maxSize = MAX_IMAGE_SIZE): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= maxSize) return file;

  const img = await loadImage(file);
  let quality = 0.82;
  let blob = await canvasToBlob(drawScaled(img, MAX_DIMENSION), quality);

  while (blob.size > maxSize && quality > 0.4) {
    quality -= 0.1;
    blob = await canvasToBlob(drawScaled(img, MAX_DIMENSION), quality);
  }

  if (blob.size > maxSize) {
    let maxDim = 1200;
    while (blob.size > maxSize && maxDim >= 480) {
      maxDim -= 160;
      blob = await canvasToBlob(drawScaled(img, maxDim), quality);
    }
  }

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}