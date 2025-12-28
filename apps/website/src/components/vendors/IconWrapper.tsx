import React from 'react';

interface IconWrapperProps {
  children: React.ReactNode;
  href?: string;
}

const IconWrapper: React.FC<IconWrapperProps> = ({ children, href = '#' }) => {
  return (
    <a
      href={href}
      className="flex items-center justify-center w-10 h-10 border border-foreground rounded-full text-foreground hover:bg-surface transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

export default IconWrapper;
