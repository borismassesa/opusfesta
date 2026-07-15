export default function Footer() {
  return (
    <footer className="w-full py-16 border-t border-outline-variant/30 bg-white">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto px-margin-page gap-12">
        <div className="font-display-md text-2xl tracking-tight">Amina & Juma</div>
        <div className="flex gap-12">
          <a className="text-secondary hover:text-primary transition-colors text-[10px] font-bold uppercase tracking-[0.2em]" href="#">RSVP</a>
          <a className="text-secondary hover:text-primary transition-colors text-[10px] font-bold uppercase tracking-[0.2em]" href="#">Contact</a>
          <a className="text-secondary hover:text-primary transition-colors text-[10px] font-bold uppercase tracking-[0.2em]" href="#">Privacy</a>
        </div>
        <p className="text-[10px] text-secondary/50 font-bold uppercase tracking-[0.2em]">© 2026 Made with love</p>
      </div>
    </footer>
  );
}
