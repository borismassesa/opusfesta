import { Users, Landmark, Headset } from 'lucide-react'

export default function Trust() {
  return (
    <section className="px-6 py-16 max-w-6xl mx-auto border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center mb-6">
            <Users className="text-[#1A1A1A]" size={20} />
          </div>
          <h3 className="font-bold text-lg mb-3 text-[#1A1A1A]">Trusted by millions planning weddings</h3>
          <p className="text-gray-600 text-[15px] font-medium leading-relaxed">
            We help plan over 2 million weddings worldwide every year
          </p>
        </div>
        <div>
          <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center mb-6">
            <Landmark className="text-[#1A1A1A]" size={20} />
          </div>
          <h3 className="font-bold text-lg mb-3 text-[#1A1A1A]">Verified Vendors</h3>
          <p className="text-gray-600 text-[15px] font-medium leading-relaxed">
            OpusFesta features only verified, highly-reviewed{' '}
            <a href="#" className="text-[#1A1A1A] hover:text-gray-600 transition-colors">
              wedding professionals
            </a>{' '}
            in your area
          </p>
        </div>
        <div>
          <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center mb-6">
            <Headset className="text-[#1A1A1A]" size={20} />
          </div>
          <h3 className="font-bold text-lg mb-3 text-[#1A1A1A]">24/7 expert support</h3>
          <p className="text-gray-600 text-[15px] font-medium leading-relaxed">
            Get help from our wedding concierges anytime over email, phone and chat
          </p>
        </div>
      </div>
    </section>
  )
}
