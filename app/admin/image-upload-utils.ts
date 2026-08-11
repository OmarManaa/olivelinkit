"use client";

type CompressImageOptions = {
  maxWidth: number;
  maxHeight: number;
  quality?: number;
  maxBytes?: number;
};

export type MediaUploadPayload = {
  key?: string;
  name?: string;
  url?: string;
  error?: string;
};

const defaultMaxUploadBytes = 3.75 * 1024 * 1024;

function fileBaseName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "") || "image";
}

function imageFromObjectUrl(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be loaded."));
    image.src = url;
  });
}

function toWebpBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
}

export async function compressImageForUpload(file: File, options: CompressImageOptions) {
  if (!file.type.startsWith("image/")) throw new Error("Choose a JPEG, PNG, or WebP image.");

  const maxBytes = options.maxBytes ?? defaultMaxUploadBytes;
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await imageFromObjectUrl(objectUrl);
    const startingScale = Math.min(1, options.maxWidth / image.width, options.maxHeight / image.height);
    let width = Math.max(1, Math.round(image.width * startingScale));
    let height = Math.max(1, Math.round(image.height * startingScale));
    let quality = options.quality ?? 0.86;
    let lastBlob: Blob | null = null;

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Image processing is not available in this browser.");
      context.drawImage(image, 0, 0, width, height);

      lastBlob = await toWebpBlob(canvas, quality);
      if (!lastBlob) throw new Error("Image could not be compressed.");
      if (lastBlob.size <= maxBytes) break;

      width = Math.max(320, Math.round(width * 0.82));
      height = Math.max(240, Math.round(height * 0.82));
      quality = Math.max(0.62, quality - 0.07);
    }

    if (!lastBlob || lastBlob.size > maxBytes) {
      throw new Error("That image is still too large after optimisation. Please crop it or choose a smaller file.");
    }

    return new File([lastBlob], `${fileBaseName(file.name)}.webp`, { type: "image/webp" });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function readMediaUploadResponse(response: Response): Promise<MediaUploadPayload> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json() as MediaUploadPayload;
    } catch {
      return { error: "The image upload response could not be read. Please try again." };
    }
  }

  const text = (await response.text()).trim();
  if (response.status === 413 || /payload too large/i.test(text)) {
    return { error: "That image was too large to upload. Try a smaller or cropped image, then upload again." };
  }

  if (contentType.includes("text/html")) {
    return { error: "The upload was not accepted. Refresh the admin page, sign in again if asked, then retry." };
  }

  return { error: text || response.statusText || "Image upload failed." };
}
