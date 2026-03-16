'use client';

import { useState } from 'react';
import { BsInfoCircle, BsChevronDown, BsChevronUp, BsBoxArrowUpRight } from 'react-icons/bs';

interface AdminPageHeaderProps {
  title: string;
  description: string;
  tips?: string[];
  livePage?: { label: string; href: string };
}

export default function AdminPageHeader({ title, description, tips, livePage }: AdminPageHeaderProps) {
  const [tipsOpen, setTipsOpen] = useState(false);

  return (
    <div className="mb-6 space-y-3">
      {/* Title + Description */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[color:rgba(51,51,51,0.6)] leading-relaxed max-w-2xl">
            {description}
          </p>
        </div>
        {livePage && (
          <a
            href={livePage.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-[var(--admin-primary)] hover:underline flex-shrink-0"
          >
            <BsBoxArrowUpRight className="w-3 h-3" />
            {livePage.label}
          </a>
        )}
      </div>

      {/* Tips accordion */}
      {tips && tips.length > 0 && (
        <div className="border border-blue-100 bg-blue-50/50 rounded-[var(--admin-radius)]">
          <button
            onClick={() => setTipsOpen(!tipsOpen)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-medium text-blue-700 hover:bg-blue-50 transition-colors rounded-[var(--admin-radius)]"
          >
            <BsInfoCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Tips &amp; Info</span>
            {tipsOpen ? (
              <BsChevronUp className="w-3 h-3 ml-auto" />
            ) : (
              <BsChevronDown className="w-3 h-3 ml-auto" />
            )}
          </button>
          {tipsOpen && (
            <ul className="px-4 pb-3 space-y-1.5">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-blue-600/80 leading-relaxed">
                  <span className="mt-0.5 text-blue-400">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
