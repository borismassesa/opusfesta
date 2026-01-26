export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  github?: string;
  instagram?: string;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  socials: SocialLinks;
}

export interface ValueItem {
  id: string;
  title: string;
  description: string;
}

export const VALUES_DATA: ValueItem[] = [
  { id: 'reliability', title: 'Reliability', description: 'Performing consistently under pressure, delivering excellence when it matters most, and building trust through unwavering dependability.' },
  { id: 'precision', title: 'Precision', description: 'Built with exacting engineering standards, where every detail matters and quality is never compromised.' },
  { id: 'creativity', title: 'Creativity', description: 'Ideas shaped into smart machines, transforming innovative concepts into powerful solutions that solve real-world challenges.' },
  { id: 'dedication', title: 'Dedication', description: 'Committed to meaningful innovation that creates lasting impact and drives positive change in everything we build.' },
  { id: 'breakthroughs', title: 'Breakthroughs', description: 'Setting new tech benchmarks and pushing boundaries to achieve what was once thought impossible.' },
  { id: 'expansion', title: 'Expansion', description: 'Reaching new industries globally, bringing transformative solutions to markets and communities worldwide.' },
  { id: 'evolution', title: 'Evolution', description: 'Improving with every iteration, continuously refining our approach to stay ahead of the curve.' },
  { id: 'advancement', title: 'Advancement', description: 'Driving robotics into the future with cutting-edge technology that redefines what\'s possible.' },
  { id: 'empowerment', title: 'Empowerment', description: 'Enhancing human capability through technology that amplifies potential and unlocks new possibilities.' },
];

export const HERO_VERBS = [
  'sustaining',
  'refining',
  'imagining',
  'persisting',
  'pioneering',
  'scaling',
  'adapting',
  'progressing',
  'enabling'
];
