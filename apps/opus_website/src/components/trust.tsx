import { loadTrustContent } from '@/lib/cms/trust'
import { getTrustIcon } from '@/lib/cms/trust-icons'

export default async function Trust() {
  const { items } = await loadTrustContent()
  if (items.length === 0) return null

  return (
    <section className="px-6 py-16 max-w-6xl mx-auto border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {items.map((item) => {
          const Icon = getTrustIcon(item.icon)
          return (
            <div key={item.id}>
              <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center mb-6">
                <Icon className="text-[#1A1A1A]" size={20} />
              </div>
              <h3 className="font-bold text-lg mb-3 text-[#1A1A1A]">{item.title}</h3>
              <p className="text-gray-600 text-[15px] font-medium leading-relaxed">
                {item.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
