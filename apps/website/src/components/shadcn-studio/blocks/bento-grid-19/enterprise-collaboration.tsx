import { Orbiting } from "@/components/ui/orbiting";

import Logo from "@/assets/svg/logo";

const EnterpriseCollaboration = () => {
  return (
    <div className="relative flex min-h-58 flex-1 items-center justify-center overflow-hidden">
      <div className="absolute flex size-88 flex-col items-center justify-center">
        <Orbiting duration={30} radius={175} strokeWidth={1} startingAngle={45}>
          <span className="grid size-13 place-content-center">
            <img
              src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/amazon-logo.png"
              alt="Amazon"
              className="h-5 w-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
            />
          </span>
          <span className="grid size-13 place-content-center">
            <img
              src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/google-logo.png"
              alt="Google"
              className="h-5 w-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
            />
          </span>
          <span className="grid size-13 place-content-center">
            <img
              src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/airbnb-logo.png"
              alt="Airbnb"
              className="h-5 w-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
            />
          </span>
          <span className="grid size-13 place-content-center">
            <img
              src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/bookmyshow-logo.png"
              alt="Book My Show"
              className="h-5 w-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
            />
          </span>
        </Orbiting>
        <Orbiting duration={30} radius={135.5} strokeWidth={1} startingAngle={90}>
          <span className="grid size-13 place-content-center">
            <img
              src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/microsoft-logo.png"
              alt="Microsoft"
              className="h-5 w-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
            />
          </span>
          <span className="grid size-13 place-content-center">
            <img
              src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/fedex-logo.png"
              alt="Fedex"
              className="h-5 w-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
            />
          </span>
        </Orbiting>
        <Orbiting duration={30} radius={90} strokeWidth={1}>
          <span className="grid size-13 place-content-center">
            <img
              src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/walmart-logo.png"
              alt="Walmart"
              className="h-5 w-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
            />
          </span>
          <span className="grid size-13 place-content-center">
            <img
              src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/hubspot-logo.png"
              alt="Hubspot"
              className="h-5 w-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
            />
          </span>
        </Orbiting>

        <Logo className="absolute top-1/2 left-1/2 z-10 size-20.5 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="from-card pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b to-transparent" />
      <div className="from-card pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l to-transparent" />
      <div className="from-card pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t to-transparent" />
      <div className="from-card pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r to-transparent" />
    </div>
  );
};

export default EnterpriseCollaboration;
