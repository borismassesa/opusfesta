import type { StaticImageData } from "next/image";

export type AssetLike = string | StaticImageData;

export function resolveAssetSrc(asset: AssetLike): string {
  return typeof asset === "string" ? asset : asset.src;
}
