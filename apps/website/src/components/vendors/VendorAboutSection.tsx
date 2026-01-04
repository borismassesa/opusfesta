"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  MessageCircle, 
  Send,
  Loader2,
  X,
  Globe,
  Phone,
  Calendar,
  Users,
  MessageSquare
} from 'lucide-react';
import Image from 'next/image';
import IconWrapper from './IconWrapper';
import { getGeminiResponse } from '@/lib/services/geminiService';
import type { Vendor } from '@/lib/supabase/vendors';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface VendorAboutSectionProps {
  vendor: Vendor;
}

export const VendorAboutSection: React.FC<VendorAboutSectionProps> = ({ vendor }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    try {
      const vendorBio = vendor.description || vendor.bio || `${vendor.business_name} is a ${vendor.category} vendor${vendor.location?.city ? ` located in ${vendor.location.city}` : ''}.`;
      const response = await getGeminiResponse(prompt, vendorBio);
      const aiMessage: ChatMessage = { role: 'model', content: response || "I'm sorry, I couldn't process that." };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fullDescription = vendor.description || vendor.bio || '';
  
  // Split into sentences and show first 3-4 sentences
  const sentences = fullDescription.match(/[^.!?]+[.!?]+/g) || [fullDescription];
  const visibleSentences = 4; // Show 4 sentences before truncating
  const shouldTruncate = sentences.length > visibleSentences;
  const truncatedText = sentences.slice(0, visibleSentences).join(' ').trim();
  const displayDescription = isExpanded || !shouldTruncate 
    ? fullDescription 
    : truncatedText + (truncatedText.length < fullDescription.length ? '...' : '');

  // Get team size label
  const getTeamSizeLabel = () => {
    if (!vendor.team_size) return null;
    if (vendor.team_size <= 2) return 'Small team (1-2 members)';
    if (vendor.team_size <= 10) return 'Small team (2-10 members)';
    if (vendor.team_size <= 50) return 'Medium team (11-50 members)';
    return 'Large team (50+ members)';
  };

  // Get years in business label
  const getYearsLabel = () => {
    if (!vendor.years_in_business) return null;
    return `${vendor.years_in_business}+ years in business`;
  };

  return (
    <>
      <div id="section-about" className="pt-6 scroll-mt-32 lg:scroll-mt-40">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h2 className="text-3xl font-bold text-foreground">About this venue</h2>
          
          <div className="flex items-center gap-2">
            {vendor.social_links?.facebook && (
              <a
                href={vendor.social_links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center hover:bg-surface transition-colors"
              >
                <Facebook size={18} className="text-foreground" />
              </a>
            )}
            {vendor.social_links?.twitter && (
              <a
                href={vendor.social_links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center hover:bg-surface transition-colors"
              >
                <Twitter size={18} className="text-foreground" />
              </a>
            )}
            {vendor.social_links?.instagram && (
              <a
                href={vendor.social_links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center hover:bg-surface transition-colors"
              >
                <Instagram size={18} className="text-foreground" />
              </a>
            )}
            {vendor.contact_info?.website && (
              <a
                href={vendor.contact_info.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center hover:bg-surface transition-colors"
              >
                <Globe size={18} className="text-foreground" />
              </a>
            )}
            {vendor.contact_info?.phone && (
              <a
                href={`tel:${vendor.contact_info.phone}`}
                className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center hover:bg-surface transition-colors"
              >
                <Phone size={18} className="text-foreground" />
              </a>
            )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Contact Person Card */}
          <div className="lg:col-span-1">
            <div className="bg-background border border-border rounded-2xl p-6 text-center">
              {vendor.logo ? (
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-border">
                  <Image
                    src={vendor.logo}
                    alt={vendor.business_name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-surface border-2 border-border flex items-center justify-center">
                  <span className="text-3xl font-semibold text-foreground">
                    {vendor.business_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <h3 className="text-lg font-semibold text-primary mb-1">
                {vendor.business_name}
              </h3>
              <p className="text-sm text-secondary uppercase mb-6">
                {vendor.category}
              </p>
              <button
                onClick={() => setIsChatOpen(true)}
                className="w-full border-2 border-primary text-primary px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Message Vendor
              </button>
            </div>
          </div>

          {/* Right Column - Description and Business Details */}
          <div className="lg:col-span-2">
        {fullDescription && (
              <div className="space-y-4 mb-6">
                <p className="text-foreground leading-relaxed text-base">
              {displayDescription}
            </p>
            
            {shouldTruncate && (
              <button 
                onClick={toggleExpand}
                    className="text-primary underline font-medium hover:text-primary/80 transition-colors text-sm"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

            {/* Business Attributes */}
            <div className="space-y-3 pt-4 border-t border-border">
              {getYearsLabel() && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-secondary" />
                  <span className="text-sm text-foreground">{getYearsLabel()}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-secondary" />
                <span className="text-sm text-foreground">Speaks English</span>
              </div>
              {getTeamSizeLabel() && (
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-secondary" />
                  <span className="text-sm text-primary">{getTeamSizeLabel()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Helper Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={() => setIsChatOpen(true)}
          className="bg-gray-900 text-white p-4 rounded-full shadow-2xl hover:bg-gray-800 transition-all transform hover:scale-110 flex items-center gap-2 group"
        >
          <MessageCircle size={24} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-medium">
            Ask about {vendor.business_name}
          </span>
        </button>
      </div>

      {/* Chat Sidebar/Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsChatOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{vendor.business_name} Assistant</h3>
                <p className="text-sm text-gray-500">Ask about our services or availability</p>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Chat Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              {messages.length === 0 && (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500">I'm here to help you plan your big day! Ask me anything about {vendor.business_name}.</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${
                    m.role === 'user' 
                      ? 'bg-gray-900 text-white rounded-tr-none' 
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <Loader2 className="animate-spin text-gray-400" size={18} />
                    <span className="text-gray-400 text-sm italic">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type your question here..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                />
                <button 
                  disabled={isLoading || !prompt.trim()}
                  type="submit"
                  className="bg-gray-900 text-white p-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center min-w-[50px]"
                >
                  <Send size={20} />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-4 text-center">
                AI-powered assistant. Answers based on vendor's public profile.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
