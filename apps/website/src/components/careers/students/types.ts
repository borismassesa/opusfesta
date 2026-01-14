export interface Profile {
  id: number;
  name: string;
  image: string;
  filter?: string; // CSS filter string for specific aesthetic effects if needed
  quote?: string; // Student testimonial quote
  role?: string; // Student role/position (e.g., "Software Engineering Intern", "Computer Science Student")
  achievement?: string; // Brief achievement or highlight
}

export interface RulerProps {
  count: number;
  activeIndex: number;
  onChange: (index: number) => void;
}
