import type { LucideIcon } from 'lucide-react'
import { Gem, Heart, MessageCircle, Palette, ShieldCheck, Sparkles, Star, Wand2 } from 'lucide-react'
import { loadHomepagePromisesContent, type PromiseIconKey } from '@/lib/cms/homepage-promises'

const ICON_MAP: Record<PromiseIconKey, LucideIcon> = {
  sparkles: Sparkles,
  palette: Palette,
  wand2: Wand2,
  'message-circle': MessageCircle,
  heart: Heart,
  'shield-check': ShieldCheck,
  star: Star,
  gem: Gem,
}

export async function Promises() {
  const content = await loadHomepagePromisesContent()
  return (
    <section className="px-6 pt-4 pb-20 sm:pb-24 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {content.items.map((item) => {
          const Icon = ICON_MAP[item.icon] ?? Sparkles
          return (
            <div key={item.id}>
              <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center mb-6">
                <Icon className="text-[#1A1A1A]" size={20} />
              </div>
              <h3 className="font-bold text-lg mb-3 text-[#1A1A1A]">{item.title}</h3>
              <p className="text-gray-600 text-[15px] font-medium leading-relaxed">{item.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
