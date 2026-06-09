'use client'

import Link from 'next/link'

// Pricing model: priceWas / priceNow are TOTAL prices for a PACK_QTY-piece pack.
// The UI displays per-unit pricing — total / PACK_QTY rounded to nearest 10 TZS.
// PACK_QTY_MIN / PACK_QTY_MAX show the pack-size range available per design.
export const PACK_QTY = 100
export const PACK_QTY_MIN = 50
export const PACK_QTY_MAX = 500
export const PROMO_CODE = 'KARIBU40'

export type Product = {
  id: string
  category: string
  name: string
  /** Optional — TOTAL price for a PACK_QTY-piece paper pack (used to derive per-piece paper pricing). */
  priceWas?: number
  priceNow: number
  /**
   * Optional — TZS per digital card. When set, ProductInfo shows this as the
   * primary price ("From TZS X per card") instead of the paper per-pack price.
   * Catalog products always set this; editorial/feature products may omit it.
   */
  digitalUnitPrice?: number
  swatches: string[]
}

export function ProductInfo({
  product,
  href,
}: {
  product: Product
  href?: string
}) {
  const unitNow = Math.round(product.priceNow / PACK_QTY / 10) * 10
  const unitWas = product.priceWas
    ? Math.round(product.priceWas / PACK_QTY / 10) * 10
    : undefined

  return (
    <>
      {/* Category label — lighter for hierarchy */}
      <p className="mt-3 text-[11px] text-[#1A1A1A]/50">{product.category}</p>

      {/* Title — bigger and bolder, capped at 2 lines for consistent card heights */}
      <p className="mt-1 text-[15px] sm:text-[16px] font-bold text-[#1A1A1A] leading-snug line-clamp-2">
        {href ? (
          product.name
        ) : (
          <Link href={`/invitations/p/${product.id}`}>{product.name}</Link>
        )}
      </p>

      {/* Pricing — digital per-card is primary when present; falls back to paper per-pack */}
      {product.digitalUnitPrice ? (
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-[15px] sm:text-[16px] font-bold text-[#1A1A1A]">
            From TZS {product.digitalUnitPrice.toLocaleString('en-US')}
          </span>
          <span className="text-[11px] text-[#1A1A1A]/60">per digital card</span>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {unitWas && (
            <span aria-label={`Was TZS ${unitWas.toLocaleString('en-US')}`}>
              <span aria-hidden="true" className="text-[11px] text-[#1A1A1A]/45 line-through">
                TZS {unitWas.toLocaleString('en-US')}
              </span>
            </span>
          )}
          <span className="text-[15px] sm:text-[16px] font-bold text-[#1A1A1A]">
            TZS {unitNow.toLocaleString('en-US')} ea.
          </span>
          <span className="text-[11px] text-[#1A1A1A]/60">({PACK_QTY_MIN}&ndash;{PACK_QTY_MAX} qty)</span>
        </div>
      )}
    </>
  )
}
