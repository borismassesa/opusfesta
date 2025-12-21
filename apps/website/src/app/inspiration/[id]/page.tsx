"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Share2, Heart, Bookmark, Facebook, Twitter, Mail, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { Navbar } from "@/components/layout/Navbar";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { Footer } from "@/components/layout/Footer";

// This would come from your CMS or database
const BLOG_POSTS = [
  {
    id: 1,
    title: "10 Stunning Beach Wedding Ideas in Zanzibar",
    excerpt: "Discover breathtaking beach wedding inspiration from Tanzania's most romantic island paradise. From sunset ceremonies to tropical decor.",
    category: "Venues & Locations",
    author: "Amani Hassan",
    authorAvatar: "https://i.pravatar.cc/150?img=5",
    authorBio: "Wedding planner and destination wedding specialist based in Zanzibar. Over 10 years of experience creating magical beach celebrations.",
    date: "2025-12-15",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070",
    content: `
      <p>Zanzibar, with its pristine white-sand beaches and turquoise waters, offers the perfect backdrop for an unforgettable beach wedding. Whether you're dreaming of an intimate sunset ceremony or a grand celebration under the stars, this island paradise has everything you need.</p>

      <h2>1. Choose the Perfect Beach Location</h2>
      <p>Zanzibar boasts numerous stunning beaches, each with its own unique charm. Nungwi Beach offers dramatic sunsets and calm waters, perfect for evening ceremonies. Paje Beach provides a more intimate setting with swaying palm trees and powdery sand. For a luxurious experience, consider private beach resorts like Mnemba Island or Matemwe.</p>

      <h2>2. Timing is Everything</h2>
      <p>The best time for a beach wedding in Zanzibar is during the dry season (June to October and December to February). Plan your ceremony for late afternoon, about 90 minutes before sunset, to capture that magical golden hour light in your photos.</p>

      <h2>3. Barefoot Elegance</h2>
      <p>Embrace the relaxed beach vibe while maintaining elegance. Choose lightweight fabrics like chiffon or organza for the bride's dress, and encourage guests to dress in light, breathable materials. Going barefoot or wearing elegant sandals is not just acceptable – it's encouraged!</p>

      <h2>4. Tropical Decor Elements</h2>
      <p>Incorporate local elements into your decor: palm fronds, tropical flowers like frangipani and hibiscus, bamboo arches, and coconut shell centerpieces. Use natural materials like driftwood for signage and seating arrangements.</p>

      <h2>5. Weather Backup Plan</h2>
      <p>Always have a Plan B. Most beach resorts offer beautiful indoor or covered spaces. Consider renting elegant tents or gazebos that can serve as both rain protection and shade during sunny ceremonies.</p>

      <h2>6. Sound System Essentials</h2>
      <p>Beach environments can be challenging for audio. Invest in a quality wireless sound system to ensure your vows and music can be heard clearly over the sound of waves.</p>

      <h2>7. Sunset Cocktails & Fresh Seafood</h2>
      <p>Take advantage of Zanzibar's incredible seafood and spices. Offer a cocktail hour with local specialties: grilled octopus, coconut prawns, and Zanzibar pizza. Create signature cocktails using local ingredients like passion fruit and lemongrass.</p>

      <h2>8. Cultural Touches</h2>
      <p>Honor Zanzibar's rich Swahili heritage by incorporating traditional elements: Taarab music performances, henna artists for guests, or local dancers. This adds authentic cultural flavor to your celebration.</p>

      <h2>9. Photography Considerations</h2>
      <p>Work with a photographer experienced in beach weddings. The intense sunlight requires specific techniques. Schedule a sunrise or sunset photo session – the soft light creates absolutely stunning images.</p>

      <h2>10. Guest Comfort</h2>
      <p>Provide welcome bags with essentials: sunscreen, bug spray, flip-flops, and cold drinks. Set up shaded areas with fans for guests to cool off. Consider the heat when planning your timeline.</p>

      <h2>Final Thoughts</h2>
      <p>A Zanzibar beach wedding offers a unique blend of natural beauty, cultural richness, and romantic ambiance. With proper planning and attention to these details, you'll create memories that last a lifetime. The island's stunning scenery does most of the decorating for you – just add your personal touches and celebrate!</p>

      <p><em>Ready to start planning your Zanzibar beach wedding? Browse our directory of Zanzibar wedding vendors including planners, photographers, and venues to bring your dream to life.</em></p>
    `,
  },
  {
    id: 2,
    title: "Traditional Tanzanian Wedding Customs & Ceremonies",
    excerpt: "Honor your heritage with these beautiful traditional customs. Learn about dowry ceremonies, kanga traditions, and cultural celebrations.",
    category: "Culture & Traditions",
    author: "Grace Mwangi",
    authorAvatar: "https://i.pravatar.cc/150?img=9",
    authorBio: "Cultural consultant and traditional wedding ceremony coordinator. Passionate about preserving and celebrating East African wedding traditions.",
    date: "2025-12-12",
    readTime: "12 min read",
    image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070",
    content: `
      <p>Tanzanian weddings are rich with cultural significance, blending ancient traditions with modern celebrations. Whether you're planning a fully traditional ceremony or want to incorporate meaningful customs into your wedding, understanding these traditions helps create a deeper connection to your heritage.</p>

      <h2>The Engagement Ceremony (Michano)</h2>
      <p>The journey begins with Michano, a formal meeting between the families. The groom's family visits the bride's family, traditionally bringing gifts and discussing the dowry (mahari). This is more than a transaction – it's about building bonds between families and showing respect for the bride's family.</p>

      <h2>Dowry Negotiations</h2>
      <p>The mahari varies across different Tanzanian ethnic groups. In some cultures, it includes livestock, monetary gifts, or valuable items. Modern couples often incorporate symbolic items while honoring tradition. The process typically involves elders from both families and can be quite ceremonial and joyful.</p>

      <h2>The Kanga Ceremony</h2>
      <p>Kangas (traditional East African cloths) play a significant role in weddings. The bride might receive kangas from her mother and female relatives, each carrying wisdom and blessings through their printed sayings. These are often displayed during the wedding and become cherished keepsakes.</p>

      <h2>Traditional Attire</h2>
      <p>Many couples incorporate traditional dress at some point during their wedding celebrations. Women might wear kitenge or kanga in vibrant African prints, while men wear kanzu (a long white robe) or suits with traditional accessories. The combination of traditional and modern attire creates a beautiful cultural fusion.</p>

      <h2>The Wedding Week</h2>
      <p>Traditional Tanzanian weddings aren't single-day events. They can span several days of celebrations, each with specific customs:</p>
      <ul>
        <li><strong>Ndoa ya Kiislamu:</strong> Islamic marriage ceremony (for Muslim couples)</li>
        <li><strong>Church Ceremony:</strong> Christian religious service (for Christian couples)</li>
        <li><strong>Reception Celebration:</strong> Grand feast with extended family and community</li>
        <li><strong>Kupamba:</strong> Henna ceremony for the bride</li>
      </ul>

      <h2>Food and Feast</h2>
      <p>Food is central to Tanzanian celebrations. Traditional wedding menus might include pilau rice, biryani, mishkaki (grilled meat), samosas, and mandazi. The feast represents abundance and hospitality, with enough food to feed the entire community.</p>

      <h2>Music and Dance</h2>
      <p>Traditional Tanzanian music and dance bring energy to the celebration. Taarab music (Swahili coastal music), ngoma (traditional drumming), and modern Tanzanian hits all have their place. Expect enthusiastic dancing from all generations!</p>

      <h2>Blessings and Prayers</h2>
      <p>Elders play a crucial role, offering prayers and blessings to the couple. These moments are deeply meaningful, connecting the couple to their ancestors and community. The blessings often invoke prosperity, fertility, and happiness.</p>

      <h2>Modern Adaptations</h2>
      <p>Today's Tanzanian couples often blend traditional customs with contemporary elements. You might have a traditional engagement ceremony followed by a modern Western-style wedding, or incorporate traditional elements into your decor and program.</p>

      <h2>Honoring Both Families</h2>
      <p>If couples come from different ethnic groups or backgrounds, weddings become beautiful fusions of multiple traditions. This requires thoughtful planning and communication with both families to ensure all customs are honored respectfully.</p>

      <h2>Preserving Traditions</h2>
      <p>Even in urban areas with Western influence, many Tanzanians maintain traditional wedding elements. These customs preserve cultural identity and create meaningful connections between generations. Don't hesitate to ask elders about specific traditions – they're often delighted to share their knowledge.</p>

      <p><em>Planning a traditional Tanzanian wedding? Connect with cultural consultants and traditional ceremony coordinators in our vendor directory who can help you honor your heritage authentically.</em></p>
    `,
  },
  // Additional posts would be added here
];

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const postId = parseInt(params?.id as string);
  const post = BLOG_POSTS.find((p) => p.id === postId);

  useEffect(() => {
    if (!post) return;

    const ctx = gsap.context(() => {
      gsap.from(".article-header", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".article-content", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.2,
      });
    }, contentRef);

    return () => ctx.revert();
  }, [post]);

  if (!post) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">Article Not Found</h1>
          <p className="text-secondary mb-8">The article you're looking for doesn't exist.</p>
          <Link
            href="/inspiration"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-background rounded-full font-semibold hover:bg-primary/90 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inspiration
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-primary min-h-screen">
      <Navbar isOpen={menuOpen} onMenuClick={() => setMenuOpen(!menuOpen)} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <article ref={contentRef} className="pt-24 pb-16">
        {/* Back Button */}
        <div className="max-w-4xl mx-auto px-6 lg:px-12 mb-8">
          <Link
            href="/inspiration"
            className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Inspiration
          </Link>
        </div>

        {/* Article Header */}
        <header className="article-header max-w-4xl mx-auto px-6 lg:px-12 mb-12">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-surface text-primary text-sm font-medium rounded-full border border-border">
              {post.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 leading-[1.1]">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-secondary mb-8">
            <div className="flex items-center gap-3">
              <img
                src={post.authorAvatar}
                alt={post.author}
                className="w-12 h-12 rounded-full border border-border"
              />
              <div>
                <p className="font-semibold text-primary">{post.author}</p>
                <p className="text-xs text-secondary">Wedding Expert</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </div>
          </div>

          {/* Social Actions */}
          <div className="flex items-center gap-4 pb-8 border-b border-border">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                isLiked
                  ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-950 dark:border-red-800"
                  : "bg-surface border-border text-secondary hover:border-primary/30"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-sm font-medium">
                {isLiked ? "Liked" : "Like"}
              </span>
            </button>

            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                isBookmarked
                  ? "bg-primary text-background border-primary"
                  : "bg-surface border-border text-secondary hover:border-primary/30"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
              <span className="text-sm font-medium">
                {isBookmarked ? "Saved" : "Save"}
              </span>
            </button>

            <div className="flex-1"></div>

            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-secondary hover:border-primary/30 transition-all">
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </header>

        {/* Featured Image */}
        <div className="article-content max-w-6xl mx-auto px-6 lg:px-12 mb-12">
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-surface border border-border">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Article Content */}
        <div className="article-content max-w-3xl mx-auto px-6 lg:px-12">
          <div
            className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-primary prose-headings:mb-4 prose-headings:mt-8
              prose-h2:text-3xl prose-h3:text-2xl
              prose-p:text-secondary prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-primary prose-a:underline prose-a:decoration-primary/30 hover:prose-a:decoration-primary
              prose-ul:text-secondary prose-ul:space-y-2 prose-li:marker:text-accent
              prose-strong:text-primary prose-strong:font-semibold
              prose-em:text-secondary/90"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Author Bio */}
          <div className="mt-16 p-8 bg-surface rounded-2xl border border-border">
            <div className="flex items-start gap-4">
              <img
                src={post.authorAvatar}
                alt={post.author}
                className="w-16 h-16 rounded-full border border-border flex-shrink-0"
              />
              <div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  About {post.author}
                </h3>
                <p className="text-secondary leading-relaxed">
                  {post.authorBio}
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 p-8 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-border text-center">
            <h3 className="text-2xl font-bold text-primary mb-3">
              Ready to Start Planning?
            </h3>
            <p className="text-secondary mb-6 max-w-2xl mx-auto">
              Browse our curated directory of wedding vendors and start bringing your dream wedding to life.
            </p>
            <Link
              href="/vendors"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-background rounded-full font-semibold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20"
            >
              Browse Vendors
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
