import type { IconType } from 'react-icons';
import { BsFacebook, BsInstagram, BsTiktok, BsLinkedin, BsYoutube } from 'react-icons/bs';

interface SocialLink {
  label: string;
  href: string;
  Icon: IconType;
}

interface SocialLinksProps {
  containerClassName?: string;
  linkClassName?: string;
  iconClassName?: string;
}

const socialLinks: SocialLink[] = [
  { label: 'Facebook', href: 'https://facebook.com', Icon: BsFacebook },
  { label: 'Instagram', href: 'https://instagram.com', Icon: BsInstagram },
  { label: 'TikTok', href: 'https://tiktok.com', Icon: BsTiktok },
  { label: 'LinkedIn', href: 'https://linkedin.com', Icon: BsLinkedin },
  { label: 'YouTube', href: 'https://youtube.com', Icon: BsYoutube },
];

export default function SocialLinks({
  containerClassName = 'flex flex-wrap gap-3',
  linkClassName = 'inline-flex h-10 w-10 items-center justify-center border-2 border-white/60 bg-white/10 text-white/90 transition-all duration-200 hover:border-brand-accent hover:bg-brand-accent hover:text-white',
  iconClassName = 'h-[18px] w-[18px] shrink-0',
}: SocialLinksProps) {
  return (
    <div className={containerClassName}>
      {socialLinks.map(({ label, href, Icon }) => (
        <a
          key={label}
          aria-label={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          className={linkClassName}
        >
          <Icon aria-hidden="true" focusable="false" className={iconClassName} />
        </a>
      ))}
    </div>
  );
}
