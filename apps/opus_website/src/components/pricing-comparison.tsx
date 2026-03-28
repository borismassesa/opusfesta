'use client'

import { ShieldCheck, CalendarCheck, Users, CheckCircle2, Circle } from 'lucide-react'

const CHECKLIST = [
  { label: 'Book photographer',     weeks: 'Done',        done: true  },
  { label: 'Send invitations',      weeks: 'Done',        done: true  },
  { label: 'Confirm catering menu', weeks: '3 wks left',  done: false },
  { label: 'Finalise seating plan', weeks: '6 wks left',  done: false },
  { label: 'Order wedding cake',    weeks: '8 wks left',  done: false },
]

const FEATURES = [
  {
    icon: CalendarCheck,
    title: 'Smart checklists',
    body: 'Personalised to-dos built around your exact wedding date. Get reminders before anything becomes urgent.',
  },
  {
    icon: Users,
    title: 'Guest list & RSVPs',
    body: 'Collect responses, track dietary needs, and manage seating. All updated in real time.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified vendors only',
    body: 'Every vendor on OpusFesta is reviewed and vetted. No surprises, no unreliable listings.',
  },
]

export default function StressFreeGreen() {
  return (
    <section className="bg-[var(--accent)] py-14 sm:py-20 md:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* Top: headline + product preview */}
        <div className="flex flex-col md:flex-row items-center gap-10 sm:gap-12 md:gap-16 mb-12 sm:mb-16">

          {/* Left — text */}
          <div className="flex-1 w-full text-center md:text-left">
            <h2 className="text-4xl md:text-6xl lg:text-[80px] font-black tracking-tighter uppercase leading-[1.05] md:leading-[0.9] mb-6 text-[var(--on-accent)]">
              STRESS-FREE
              <br />
              PLANNING.
            </h2>
            <p className="text-lg text-[var(--on-accent)]/60 max-w-md mx-auto md:mx-0 font-medium leading-relaxed">
              Plan your wedding without the chaos. We handle the details so you can enjoy the moment.
            </p>
            <div className="hidden sm:block mt-8">
              <button className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-8 py-4 rounded-full font-bold transition-colors">
                Start planning today
              </button>
            </div>
          </div>

          {/* Right — bento grid */}
          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3 h-[280px] md:h-[380px]">

            {/* Tall couple photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/images/authentic_couple.jpg"
              alt="Happy couple"
              className="row-span-2 w-full h-full object-cover rounded-2xl"
            />

            {/* Top-right — free to start */}
            <div className="rounded-2xl flex flex-col justify-end gap-2 px-5 pb-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/assets/images/bridewithumbrella.jpg')" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <p className="relative text-white text-3xl font-black tracking-tighter leading-tight">Your big day.<br />Our priority.</p>
              <p className="relative text-white text-[11px] font-semibold leading-relaxed">Everything you need. Nothing you don't.</p>
            </div>

            {/* Bottom-right — mini checklist UI */}
            <div className="bg-[#1A1A1A] rounded-2xl flex flex-col justify-center gap-2 px-4 py-4 overflow-hidden">
              <p className="text-[10px] font-black uppercase tracking-widest text-white mb-1">Your checklist</p>
              {CHECKLIST.slice(0, 4).map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  {item.done
                    ? <CheckCircle2 size={13} className="text-white shrink-0" />
                    : <Circle size={13} className="text-white/40 shrink-0" />
                  }
                  <p className={`text-[11px] font-semibold truncate ${item.done ? 'line-through text-white/20' : 'text-white'}`}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Bottom — 3 feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-[var(--on-accent)]/15 pt-16">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col gap-4">
              <f.icon size={28} className="text-[var(--on-accent)]" />
              <div>
                <h3 className="text-[var(--on-accent)] font-black text-lg uppercase tracking-tight mb-2">{f.title}</h3>
                <p className="text-[var(--on-accent)]/60 text-sm font-medium leading-relaxed">{f.body}</p>
              </div>
            </div>
          ))}
        </div>


      </div>
    </section>
  )
}
