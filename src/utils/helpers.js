export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

export const areCropsEqual = (a, b) => a === b || (a.width === b.width && a.height === b.height && a.x === b.x && a.y === b.y && a.unit === b.unit);

export const DEFAULT_CROP = { x: 0, y: 0, width: 0, height: 0, unit: "px" };

export function convertToPercentCrop(crop, width, height) {
  if (crop.unit === "%") return { ...DEFAULT_CROP, ...crop, unit: "%" };
  return {
    unit: "%",
    x: crop.x ? (crop.x / width) * 100 : 0,
    y: crop.y ? (crop.y / height) * 100 : 0,
    width: crop.width ? (crop.width / width) * 100 : 0,
    height: crop.height ? (crop.height / height) * 100 : 0
  };
}

export function convertToPixelCrop(crop, width, height) {
  if (!crop.unit) return { ...DEFAULT_CROP, ...crop, unit: "px" };
  if (crop.unit === "px") return { ...DEFAULT_CROP, ...crop, unit: "px" };
  return {
    unit: "px",
    x: crop.x ? (crop.x * width) / 100 : 0,
    y: crop.y ? (crop.y * height) / 100 : 0,
    width: crop.width ? (crop.width * width) / 100 : 0,
    height: crop.height ? (crop.height * height) / 100 : 0
  };
}

export function makeAspectCrop(crop, aspect, width, height) {
  const pixelCrop = convertToPixelCrop(crop, width, height);
  if (crop.width) pixelCrop.height = pixelCrop.width / aspect;
  if (crop.height) pixelCrop.width = pixelCrop.height * aspect;
  if (pixelCrop.y + pixelCrop.height > height) {
    pixelCrop.height = height - pixelCrop.y;
    pixelCrop.width = pixelCrop.height * aspect;
  }
  if (pixelCrop.x + pixelCrop.width > width) {
    pixelCrop.width = width - pixelCrop.x;
    pixelCrop.height = pixelCrop.width / aspect;
  }
  return crop.unit === "%" ? convertToPercentCrop(pixelCrop, width, height) : pixelCrop;
}

export function centerCrop(crop, width, height) {
  const pixelCrop = convertToPixelCrop(crop, width, height);
  pixelCrop.x = (width - pixelCrop.width) / 2;
  pixelCrop.y = (height - pixelCrop.height) / 2;
  return crop.unit === "%" ? convertToPercentCrop(pixelCrop, width, height) : pixelCrop;
}

export const generateUniqueId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    try { return crypto.randomUUID(); } catch {}
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const isPlaceholderImage = url => !url || url.includes("via.placeholder.com") || url.includes("dummyimage.com") || url.includes("placeholder.png");
