"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  MessageCircle, 
  Send,
  Loader2,
  X
} from 'lucide-react';
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

  return (
    <>
      <div id="section-about" className="pt-6 scroll-mt-32 lg:scroll-mt-40">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h2 className="text-3xl font-bold text-foreground">About</h2>
          
          <div className="flex items-center gap-3">
            <IconWrapper href={vendor.social_links?.facebook || '#'}>
              <Facebook size={20} />
            </IconWrapper>
            <IconWrapper href={vendor.social_links?.twitter || '#'}>
              <Twitter size={20} />
            </IconWrapper>
            <IconWrapper href={vendor.social_links?.instagram || '#'}>
              <Instagram size={20} />
            </IconWrapper>
          </div>
        </div>


        {/* Content Section */}
        {fullDescription && (
          <div className="space-y-6 text-foreground leading-relaxed text-lg">
            <p>
              {displayDescription}
            </p>
            
            {shouldTruncate && (
              <button 
                onClick={toggleExpand}
                className="text-foreground font-semibold border-b-2 border-foreground hover:text-secondary hover:border-secondary transition-all text-base pb-0.5"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

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
