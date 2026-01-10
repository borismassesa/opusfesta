"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Sparkles, Search, Calendar, Clock, ArrowRight, Heart, BookOpen } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Navbar } from "@/components/layout/Navbar";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { Footer } from "@/components/layout/Footer";

gsap.registerPlugin(ScrollTrigger);

// Blog post data with OpusFesta wedding inspiration content
const BLOG_POSTS = [
  {
    id: 1,
    title: "10 Stunning Beach Wedding Ideas in Zanzibar",
    excerpt: "Discover breathtaking beach wedding inspiration from Tanzania's most romantic island paradise. From sunset ceremonies to tropical decor.",
    category: "Venues & Locations",
    author: "Amani Hassan",
    authorAvatar: "https://i.pravatar.cc/150?img=5",
    date: "2025-12-15",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070",
    featured: true,
  },
  {
    id: 2,
    title: "Traditional Tanzanian Wedding Customs & Ceremonies",
    excerpt: "Honor your heritage with these beautiful traditional customs. Learn about dowry ceremonies, kanga traditions, and cultural celebrations.",
    category: "Culture & Traditions",
    author: "Grace Mwangi",
    authorAvatar: "https://i.pravatar.cc/150?img=9",
    date: "2025-12-12",
    readTime: "12 min read",
    image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070",
    featured: true,
  },
  {
    id: 3,
    title: "Budget Wedding Planning: 5M - 15M TZS",
    excerpt: "Plan your dream wedding without breaking the bank. Real budget breakdowns, money-saving tips, and vendor recommendations.",
    category: "Planning & Budget",
    author: "David Kimani",
    authorAvatar: "https://i.pravatar.cc/150?img=12",
    date: "2025-12-10",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2069",
    featured: false,
  },
  {
    id: 4,
    title: "Choosing the Perfect Wedding Photographer",
    excerpt: "Your wedding photos last forever. Learn what to look for in a photographer, questions to ask, and how to get the best value.",
    category: "Vendors & Services",
    author: "Sarah Johnson",
    authorAvatar: "https://i.pravatar.cc/150?img=20",
    date: "2025-12-08",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069",
    featured: false,
  },
  {
    id: 5,
    title: "Garden Wedding Decor Ideas & Inspiration",
    excerpt: "Create an enchanting outdoor celebration with these garden wedding decor ideas. Florals, lighting, and natural elegance.",
    category: "Decor & Styling",
    author: "Emma Moshi",
    authorAvatar: "https://i.pravatar.cc/150?img=45",
    date: "2025-12-05",
    readTime: "9 min read",
    image: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?q=80&w=2070",
    featured: false,
  },
  {
    id: 6,
    title: "12-Month Wedding Planning Timeline",
    excerpt: "Stay organized and stress-free with our comprehensive wedding planning checklist. From engagement to 'I do'.",
    category: "Planning & Budget",
    author: "Michael Omondi",
    authorAvatar: "https://i.pravatar.cc/150?img=33",
    date: "2025-12-03",
    readTime: "15 min read",
    image: "https://images.unsplash.com/photo-1522673607910-04f5c82c4e9e?q=80&w=2070",
    featured: true,
  },
  {
    id: 7,
    title: "Fusion Weddings: Blending Two Cultures",
    excerpt: "Celebrate your unique love story by beautifully merging different cultural traditions in one unforgettable ceremony.",
    category: "Culture & Traditions",
    author: "Fatima Ali",
    authorAvatar: "https://i.pravatar.cc/150?img=27",
    date: "2025-12-01",
    readTime: "11 min read",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070",
    featured: false,
  },
  {
    id: 8,
    title: "Top Wedding Venues in Dar es Salaam",
    excerpt: "From elegant ballrooms to stunning beachfront locations, discover the best wedding venues in Tanzania's largest city.",
    category: "Venues & Locations",
    author: "Joseph Mbarak",
    authorAvatar: "https://i.pravatar.cc/150?img=14",
    date: "2025-11-28",
    readTime: "13 min read",
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=2070",
    featured: false,
  },
  {
    id: 9,
    title: "Bridal Beauty Timeline: When to Book What",
    excerpt: "Perfect your wedding day look with this complete beauty preparation timeline. Hair trials, makeup tests, and skincare.",
    category: "Beauty & Fashion",
    author: "Linda Magesa",
    authorAvatar: "https://i.pravatar.cc/150?img=48",
    date: "2025-11-25",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070",
    featured: false,
  },
];

const CATEGORIES = [
  "All",
  "Planning & Budget",
  "Venues & Locations",
  "Culture & Traditions",
  "Decor & Styling",
  "Vendors & Services",
  "Beauty & Fashion",
];

export default function InspirationPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from(".hero-heading", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.2,
      });

      gsap.from(".hero-description", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.4,
      });

      gsap.from(".hero-stats", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.6,
      });

      // Animate blog cards
      gsap.from(".blog-card", {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".blog-grid",
          start: "top 80%",
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, [filteredPosts]);

  return (
    <div className="bg-background text-primary min-h-screen">
      <Navbar isOpen={menuOpen} onMenuClick={() => setMenuOpen(!menuOpen)} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-16 px-6 lg:px-12 border-b border-border bg-gradient-to-b from-surface/30 to-background">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="w-12 h-[1px] bg-accent"></span>
              <span className="hero-heading font-mono text-accent text-xs tracking-widest uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Wedding Inspiration
              </span>
              <span className="w-12 h-[1px] bg-accent"></span>
            </div>

            <h1 className="hero-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 leading-[1.1]">
              Plan Less, <br />
              <span className="font-serif italic font-normal text-secondary">Celebrate More</span>
            </h1>

            <p className="hero-description text-lg text-secondary leading-relaxed max-w-2xl mx-auto">
              Expert advice, real wedding stories, and creative ideas to help you plan the perfect celebration. From budgets to decor, we've got you covered.
            </p>

            {/* Stats */}
            <div className="hero-stats flex items-center justify-center gap-8 mt-10 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                <span className="text-primary font-semibold">{BLOG_POSTS.length}+ Articles</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-accent" />
                <span className="text-primary font-semibold">Expert Tips</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <span className="text-primary font-semibold">Real Weddings</span>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, tips, and ideas..."
                className="w-full pl-12 pr-4 py-4 bg-surface border border-border rounded-2xl text-primary placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3 justify-center">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-primary text-background shadow-lg shadow-primary/20"
                      : "bg-surface text-secondary hover:bg-surface/80 hover:text-primary border border-border"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto">
          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="w-5 h-5 text-accent" />
                <h2 className="text-2xl font-semibold text-primary">Featured Articles</h2>
              </div>
              <div className="blog-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/inspiration/${post.id}`}
                    className="blog-card group"
                  >
                    <article className="h-full bg-surface rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                      {/* Image */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-background text-xs font-semibold rounded-full">
                            <Sparkles className="w-3 h-3" />
                            Featured
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center gap-4 mb-4 text-xs text-secondary">
                          <span className="px-3 py-1 bg-background rounded-full border border-border">
                            {post.category}
                          </span>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </div>

                        <h3 className="text-xl font-semibold text-primary mb-3 group-hover:text-primary/80 transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-secondary text-sm leading-relaxed mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>

                        {/* Author & Read Time */}
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex items-center gap-3">
                            <img
                              src={post.authorAvatar}
                              alt={post.author}
                              className="w-8 h-8 rounded-full border border-border"
                            />
                            <span className="text-sm font-medium text-primary">
                              {post.author}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-secondary">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Regular Posts */}
          {regularPosts.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-primary mb-8">
                {selectedCategory === "All" ? "All Articles" : selectedCategory}
              </h2>
              <div className="blog-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/inspiration/${post.id}`}
                    className="blog-card group"
                  >
                    <article className="h-full bg-surface rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                      {/* Image */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center gap-4 mb-4 text-xs text-secondary">
                          <span className="px-3 py-1 bg-background rounded-full border border-border">
                            {post.category}
                          </span>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </div>

                        <h3 className="text-xl font-semibold text-primary mb-3 group-hover:text-primary/80 transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-secondary text-sm leading-relaxed mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>

                        {/* Author & Read Time */}
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex items-center gap-3">
                            <img
                              src={post.authorAvatar}
                              alt={post.author}
                              className="w-8 h-8 rounded-full border border-border"
                            />
                            <span className="text-sm font-medium text-primary">
                              {post.author}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-secondary">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-secondary/30 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-primary mb-2">No articles found</h3>
              <p className="text-secondary">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 px-6 lg:px-12 border-t border-border bg-surface/30">
        <div className="max-w-3xl mx-auto text-center">
          <Sparkles className="w-12 h-12 text-accent mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Get Wedding Tips in Your Inbox
          </h2>
          <p className="text-lg text-secondary mb-8">
            Join 10,000+ couples planning their perfect day. Weekly inspiration, expert advice, and exclusive deals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 bg-background border border-border rounded-full text-primary placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
            <button className="px-8 py-3 bg-primary text-background rounded-full font-semibold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
              Subscribe
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
