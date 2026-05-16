import Link from 'next/link'
import { ShoppingCart, MapPin, CreditCard, CheckCircle2, ChevronRight } from 'lucide-react'

export type CheckoutStep = 'cart' | 'address' | 'payment' | 'confirmation'

type Step = {
  id: CheckoutStep
  label: string
  href: string
  Icon: typeof ShoppingCart
}

const STEPS: Step[] = [
  { id: 'cart', label: 'Cart', href: '/attire-and-rings/cart', Icon: ShoppingCart },
  { id: 'address', label: 'Address', href: '/attire-and-rings/address', Icon: MapPin },
  { id: 'payment', label: 'Payment', href: '/attire-and-rings/checkout', Icon: CreditCard },
  { id: 'confirmation', label: 'Confirmation', href: '/attire-and-rings/confirmation', Icon: CheckCircle2 },
]

export default function CheckoutStepper({ current }: { current: CheckoutStep }) {
  const currentIdx = STEPS.findIndex((s) => s.id === current)

  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="flex items-center justify-center gap-3 sm:gap-6 lg:gap-12 flex-wrap">
        {STEPS.map((step, i) => {
          const status: 'done' | 'current' | 'todo' =
            i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'todo'
          const isLink = status === 'done' && i < currentIdx
          const StepIcon = step.Icon

          const content = (
            <span className="flex flex-col items-center gap-1.5 group">
              <span
                className={`w-12 h-12 rounded-md flex items-center justify-center transition-colors ${
                  status === 'current'
                    ? 'text-gray-900'
                    : status === 'done'
                      ? 'text-gray-900'
                      : 'text-gray-400'
                }`}
              >
                <StepIcon size={26} strokeWidth={1.5} />
              </span>
              <span
                className={`text-sm transition-colors ${
                  status === 'current'
                    ? 'font-bold text-gray-900'
                    : status === 'done'
                      ? 'font-medium text-gray-700 group-hover:text-gray-900'
                      : 'font-medium text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </span>
          )

          return (
            <li key={step.id} className="flex items-center gap-3 sm:gap-6 lg:gap-12">
              {isLink ? (
                <Link href={step.href} aria-current={undefined}>
                  {content}
                </Link>
              ) : (
                <span aria-current={status === 'current' ? 'step' : undefined}>{content}</span>
              )}

              {i < STEPS.length - 1 && (
                <ChevronRight size={16} className="text-gray-300" aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
