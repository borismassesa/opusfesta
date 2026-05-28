import Link from 'next/link'
import { cn } from '@/lib/utils'

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
  showPromo = true,
  selectedSwatch,
  onSwatchSelect,
}: {
  product: Product
  showPromo?: boolean
  selectedSwatch?: number
  onSwatchSelect?: (index: number) => void
}) {
  const unitNow = Math.round(product.priceNow / PACK_QTY / 10) * 10
  const unitWas = product.priceWas
    ? Math.round(product.priceWas / PACK_QTY / 10) * 10
    : undefined
  const discountPct = product.priceWas
    ? Math.round((1 - product.priceNow / product.priceWas) * 100)
    : 0
  const onSale = discountPct > 0

  return (
    <>
      {/* Color swatches — bigger (20px) with hover scale + hex tooltip */}
      <div className="mt-3 flex items-center gap-2">
        {product.swatches.slice(0, 4).map((c, i) => (
          <button
            key={`${product.id}-sw-${i}`}
            type="button"
            title={c}
            aria-label={`Color variant ${i + 1}`}
            aria-pressed={selectedSwatch === i}
            onClick={onSwatchSelect ? (e) => { e.preventDefault(); onSwatchSelect(i) } : undefined}
            className={cn(
              'h-5 w-5 rounded-full border shadow-sm transition-transform hover:scale-110',
              selectedSwatch === i
                ? 'border-[#1A1A1A] ring-2 ring-offset-1 ring-[#1A1A1A]'
                : 'border-black/15',
              onSwatchSelect ? 'cursor-pointer' : 'cursor-default',
            )}
            style={{ backgroundColor: c }}
          />
        ))}
        {product.swatches.length > 4 && (
          <span className="text-[11px] text-[#1A1A1A]/60">
            + {product.swatches.length - 4}
          </span>
        )}
      </div>

      {/* Category label — lighter for hierarchy */}
      <p className="mt-3 text-[11px] text-[#1A1A1A]/50">{product.category}</p>

      {/* Title — bigger and bolder, capped at 2 lines for consistent card heights */}
      <p className="mt-1 text-[15px] sm:text-[16px] font-bold text-[#1A1A1A] leading-snug line-clamp-2">
        <Link href="#" className="hover:underline underline-offset-2">{product.name}</Link>
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
            <span className="text-[11px] text-[#1A1A1A]/45 line-through">
              TZS {unitWas.toLocaleString('en-US')}
            </span>
          )}
          <span className="text-[15px] sm:text-[16px] font-bold text-[#1A1A1A]">
            TZS {unitNow.toLocaleString('en-US')} ea.
          </span>
          <span className="text-[11px] text-[#1A1A1A]/60">({PACK_QTY_MIN}&ndash;{PACK_QTY_MAX} qty)</span>
        </div>
      )}

      {/* Feature pills — Free RSVP page is included with every digital card; paper discount as a secondary note */}
      {showPromo && product.digitalUnitPrice && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-sm bg-[#1A1A1A] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Free RSVP page
          </span>
          {onSale && (
            <span className="inline-flex items-center rounded-sm bg-[#7A1F2B] px-2 py-0.5 text-[10px] font-bold text-white">
              -{discountPct}% paper add-on
            </span>
          )}
        </div>
      )}
    </>
  )
}
