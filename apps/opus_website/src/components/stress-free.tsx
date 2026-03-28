import { ShieldCheck, Calendar, Users } from 'lucide-react'

export default function StressFree() {
  return (
    <section className="py-24 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-16 mb-20">
        <div className="flex-1">
          <h2 className="text-4xl md:text-6xl lg:text-[80px] font-black tracking-tighter uppercase leading-[0.85] mb-6 text-[#1A1A1A]">
            STRESS-FREE PLANNING
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md font-medium">
            Every month, millions of couples trust us to keep their wedding planning organized, on track, and perfectly
            executed.
          </p>
          <button className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-8 py-4 rounded-full font-bold transition-colors">
            See our planning tools
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/images/authentic_couple.jpg"
            alt="Authentic couple"
            className="w-full max-w-md rounded-3xl object-cover aspect-square shadow-2xl"
            style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-200 pt-16">
        <div>
          <ShieldCheck className="mb-6 text-[var(--accent)]" size={32} />
          <p className="font-medium text-[#1A1A1A]">
            Our dedicated support team works to keep your planning smooth
          </p>
        </div>
        <div>
          <Calendar className="mb-6 text-[var(--accent)]" size={32} />
          <p className="font-medium text-[#1A1A1A]">
            We use smart checklists to ensure you never miss a deadline
          </p>
        </div>
        <div>
          <Users className="mb-6 text-[var(--accent)]" size={32} />
          <p className="font-medium text-[#1A1A1A]">
            We keep your guest data and RSVPs perfectly synced and secure
          </p>
        </div>
      </div>
    </section>
  )
}
