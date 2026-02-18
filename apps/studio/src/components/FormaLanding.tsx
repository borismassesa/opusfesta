"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const blobVertexShader = `
uniform float uTime;
uniform float uIntensity;
uniform float uSpeed;
uniform vec2 uMouse;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 xn = x_ * ns.x + ns.yyyy;
  vec4 yn = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(xn) - abs(yn);
  vec4 b0 = vec4(xn.xy, yn.xy);
  vec4 b1 = vec4(xn.zw, yn.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vNormal = normalize(normalMatrix * normal);
  float n1 = snoise(position * 0.8 + uTime * uSpeed) * uIntensity;
  float n2 = snoise(position * 1.6 + uTime * uSpeed * 0.6) * uIntensity * 0.5;
  float n3 = snoise(position * 3.2 + uTime * uSpeed * 0.3) * uIntensity * 0.25;
  float displacement = n1 + n2 + n3;
  displacement += uMouse.x * sin(position.y * 2.5 + uTime * 0.5) * 0.1;
  displacement += uMouse.y * cos(position.x * 2.5 + uTime * 0.3) * 0.1;
  vec3 newPosition = position + normal * displacement;
  vDisplacement = displacement;
  vPosition = (modelMatrix * vec4(newPosition, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const blobFragmentShader = `
precision highp float;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uOpacity;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

void main() {
  vec3 viewDirection = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 2.8);
  vec3 color = mix(uColor2, uColor1, smoothstep(-0.15, 0.35, vDisplacement));
  color = mix(color, uColor3, fresnel * 0.35);
  color += uColor1 * fresnel * 0.25;
  float alpha = (0.85 + fresnel * 0.15) * uOpacity;
  gl_FragColor = vec4(color, alpha);
}
`;

const marqueeItems = [
  "Wedding Photography",
  "Cinematic Videography",
  "Engagement Sessions",
  "Event Highlights",
  "Reels & Social Cuts",
  "Album Design",
];

const selectedWorks = [
  {
    number: "01",
    category: "Cinematic Wedding",
    title: "Asha & Daniel: Vows In Motion",
    desc: "An emotive film sequence built around vows, choreography, and texture-rich reception moments.",
    year: "2026",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    size: "work__item--hero",
    craft: "Multi-cam Film",
    location: "Dar es Salaam",
  },
  {
    number: "02",
    category: "Editorial Portraits",
    title: "Bridal Atelier Studies",
    desc: "High-contrast portrait language shaped for couture storytelling and launch editorials.",
    year: "2026",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80",
    size: "work__item--portrait",
    craft: "Art Direction",
    location: "Studio Set",
  },
  {
    number: "03",
    category: "Fine Art Portrait",
    title: "Noir Frame Series",
    desc: "Minimal monochrome compositions inspired by gallery-grade lighting and negative space.",
    year: "2025",
    image:
      "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=1200&q=80",
    size: "work__item--medium",
    craft: "35mm Aesthetic",
    location: "Black Studio",
  },
  {
    number: "04",
    category: "Fashion Motion",
    title: "Velvet Afterhours",
    desc: "Slow-motion editorial reels with stylized movement, grain, and theatrical shadows.",
    year: "2025",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
    size: "work__item--medium",
    craft: "Motion Reel",
    location: "Night Set",
  },
  {
    number: "05",
    category: "Ceremony Documentary",
    title: "Heritage Rituals",
    desc: "Documentary coverage of cultural rituals with observational framing and natural sound.",
    year: "2025",
    image:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
    size: "work__item--tall",
    craft: "Live Story Edit",
    location: "Zanzibar",
  },
  {
    number: "06",
    category: "Brand Campaign",
    title: "Serenity Bridal House",
    desc: "A full launch visual system with campaign stills, behind-the-scenes, and cinematic social cuts.",
    year: "2025",
    image:
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
    size: "work__item--wide",
    craft: "Campaign Visuals",
    location: "Commercial Set",
  },
];

const services = [
  {
    number: "01",
    title: "Photography",
    tags: ["Weddings", "Engagements", "Editorial"],
    desc: "Intentional photography coverage for weddings, events, and campaigns with a clean visual style and reliable delivery timelines.",
  },
  {
    number: "02",
    title: "Videography",
    tags: ["Highlight Films", "Ceremony Edits", "Reels"],
    desc: "Multi-camera video coverage with polished highlight films, social-ready edits, and documentary cuts for full event storytelling.",
  },
  {
    number: "03",
    title: "Cinematography",
    tags: ["Storyboarding", "Drone Shots", "Color Grade"],
    desc: "Cinema-style direction from concept to final grade, crafted for emotional narratives and premium visual impact.",
  },
  {
    number: "04",
    title: "Post-Production",
    tags: ["Retouching", "Sound Design", "Final Delivery"],
    desc: "Professional editing, retouching, and mastering for albums, films, reels, and content packages ready for publishing.",
  },
];

const editorialHeroSlides = [
  {
    tag: "Weddings",
    title: "Vows in Motion",
    description: "Ceremony coverage with cinematic direction and natural emotion.",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  },
  {
    tag: "Portraiture",
    title: "The Human Gaze",
    description: "Editorial portraits crafted with controlled light and timeless framing.",
    image:
      "https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?auto=format&fit=crop&w=1200&q=80",
  },
  {
    tag: "Brand Story",
    title: "Concrete Dreams",
    description: "Visual campaigns for hospitality, events, and premium lifestyle brands.",
    image:
      "https://images.unsplash.com/photo-1486718448742-163732cd1544?auto=format&fit=crop&w=1200&q=80",
  },
];

const editorialProjects = [
  {
    title: "Wedding",
    subtitle: "Oceanfront Ceremony",
    description:
      "A sunset wedding narrative blending documentary moments and cinematic portrait sequences.",
    img1: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
    img2: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Portrait",
    subtitle: "Faces of Dar",
    description:
      "Character-led portrait sessions highlighting style, craft, and personal identity.",
    img1: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
    img2: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Event",
    subtitle: "OpusFesta Summit",
    description:
      "High-volume event documentation with fast-turn social reels and polished recap films.",
    img1: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    img2: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Brand",
    subtitle: "Studio Product Stories",
    description:
      "Commercial content built for digital campaigns, lookbooks, and launch narratives.",
    img1: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
    img2: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
  },
];

const recognitionItems = [
  {
    label: "Global Wedding Awards",
    title: "Visual Storytelling Team 2025",
    cta: "View feature",
  },
  {
    label: "East Africa Creatives",
    title: "Best Cinematic Coverage",
    cta: "Read more",
  },
  {
    label: "Hospitality Media",
    title: "Top Event Film Studio",
    cta: "Read more",
  },
  {
    label: "Editorial Lens Forum",
    title: "Photography Direction Distinction",
    cta: "View list",
  },
];

const studioJournalItems = [
  {
    category: "Gear",
    tag: "Review",
    title: "Cinema Lenses for Wedding Coverage",
    excerpt: "How we select focal lengths for emotional close-ups and clean wide scene composition.",
  },
  {
    category: "Travel",
    tag: "Location",
    title: "Scouting Coastal Ceremony Venues",
    excerpt: "Field notes on lighting windows, movement paths, and backup weather plans.",
  },
  {
    category: "Technique",
    tag: "Workflow",
    title: "From Raw Footage to Final Film",
    excerpt: "Our grading and sound workflow for polished wedding and event narratives.",
  },
];

class InfiniteMarquee {
  private el: HTMLElement;

  private track: HTMLElement;

  private contents: NodeListOf<HTMLElement>;

  private baseSpeed = 0.8;

  private currentSpeed = this.baseSpeed;

  private targetSpeed = this.baseSpeed;

  private position = 0;

  private singleWidth = 0;

  private scrollVelocity = 0;

  private lastScrollY = 0;

  private rafId = 0;

  private onResize: () => void;

  private onScroll: () => void;

  constructor(el: HTMLElement) {
    this.el = el;
    this.track = el.querySelector(".marquee__track") as HTMLElement;
    this.contents = el.querySelectorAll(".marquee__content");
    this.lastScrollY = window.scrollY;

    this.onResize = () => this.measure();
    this.onScroll = () => {
      const velocity = Math.abs(window.scrollY - this.lastScrollY);
      this.scrollVelocity = velocity;
      this.lastScrollY = window.scrollY;
    };

    this.init();
  }

  private init() {
    this.measure();
    window.addEventListener("resize", this.onResize);
    window.addEventListener("scroll", this.onScroll, { passive: true });
    this.animate();
  }

  private measure() {
    this.singleWidth = this.contents[0]?.offsetWidth ?? 0;
  }

  private animate = () => {
    const boost = Math.min(this.scrollVelocity * 0.4, 12);
    this.targetSpeed = this.baseSpeed + boost;
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.08;
    this.scrollVelocity *= 0.92;
    this.position -= this.currentSpeed;

    if (Math.abs(this.position) >= this.singleWidth && this.singleWidth > 0) {
      this.position += this.singleWidth;
    }

    this.track.style.transform = `translate3d(${this.position}px, 0, 0)`;
    this.rafId = window.requestAnimationFrame(this.animate);
  };

  destroy() {
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("scroll", this.onScroll);
    window.cancelAnimationFrame(this.rafId);
  }
}

export function FormaLanding() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [loaderDone, setLoaderDone] = useState(false);
  const [activeService, setActiveService] = useState<number | null>(null);
  const [threeReady, setThreeReady] = useState(false);
  const [threeActive, setThreeActive] = useState(false);
  const [editorialHeroIndex, setEditorialHeroIndex] = useState(0);
  const [editorialProjectIndex, setEditorialProjectIndex] = useState(1);

  const activeEditorialHero = editorialHeroSlides[editorialHeroIndex];
  const activeEditorialProject = editorialProjects[editorialProjectIndex];

  useEffect(() => {
    if ((window as unknown as { THREE?: unknown }).THREE) {
      setThreeReady(true);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let timer = 0;

    const finishLoader = () => {
      timer = window.setTimeout(() => setLoaderDone(true), 600);
    };

    if (document.readyState === "complete") {
      finishLoader();
    } else {
      window.addEventListener("load", finishLoader, { once: true });
    }

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", finishLoader);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;

    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const marqueeEl = root.querySelector("#marquee") as HTMLElement | null;
    const marquee = marqueeEl ? new InfiniteMarquee(marqueeEl) : null;

    const moveHandlers: Array<{
      btn: Element;
      onMouseMove: (e: Event) => void;
      onMouseLeave: (e: Event) => void;
    }> = [];

    root.querySelectorAll(".btn").forEach((btn) => {
      const onMouseMove = (event: Event) => {
        const e = event as MouseEvent;
        const rect = (btn as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.2, y: y * 0.2, duration: 0.3, ease: "power2.out" });
      };

      const onMouseLeave = () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
      };

      btn.addEventListener("mousemove", onMouseMove);
      btn.addEventListener("mouseleave", onMouseLeave);
      moveHandlers.push({ btn, onMouseMove, onMouseLeave });
    });

    const timers: number[] = [];

    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline({ delay: 0.8 });
      heroTl
        .from(".hero__label", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" })
        .from(".hero__line span", { y: "110%", duration: 1.1, stagger: 0.12, ease: "power4.out" }, "-=0.4")
        .from(".hero__subtitle", { y: 30, opacity: 0, duration: 0.9, ease: "power3.out" }, "-=0.6")
        .from(".hero__chips span", { y: 14, opacity: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" }, "-=0.45")
        .from(".hero .btn", { y: 20, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.45")
        .from(".hero__session div", { y: 16, opacity: 0, duration: 0.55, stagger: 0.08, ease: "power2.out" }, "-=0.4");

      gsap.utils.toArray<HTMLElement>(".studio-addon").forEach((el) => {
        gsap.from(el, {
          y: 32,
          autoAlpha: 0,
          duration: 0.85,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 86%" },
        });
      });

      gsap.from(".about__title", {
        x: -50,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: ".about__title", start: "top 82%" },
      });

      gsap.from(".about__desc", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".about__desc", start: "top 85%" },
      });

      gsap.from(".about__accent-line", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1,
        ease: "power3.inOut",
        scrollTrigger: { trigger: ".about__accent-line", start: "top 90%" },
      });

      gsap.from(".stat", {
        scale: 0.85,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "back.out(1.4)",
        scrollTrigger: { trigger: ".about__stats", start: "top 82%" },
      });

      gsap.utils.toArray<HTMLElement>(".stat__number").forEach((el) => {
        const endVal = Number.parseInt(el.textContent ?? "0", 10);
        if (Number.isNaN(endVal)) {
          return;
        }

        const suffix = (el.textContent ?? "").replace(/[0-9]/g, "");
        el.textContent = `0${suffix}`;

        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () => {
            gsap.to({ val: 0 }, {
              val: endVal,
              duration: 2,
              ease: "power2.out",
              onUpdate: function onUpdate() {
                el.textContent = `${Math.round((this.targets()[0] as { val: number }).val)}${suffix}`;
              },
            });
          },
        });
      });

      gsap.from(".process__item", {
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.18,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".process__grid",
          start: "top 78%",
          onEnter: () => {
            root.querySelectorAll(".process__item").forEach((item, i) => {
              const timer = window.setTimeout(() => item.classList.add("is-visible"), i * 250);
              timers.push(timer);
            });
          },
        },
      });

      gsap.utils.toArray<HTMLElement>(".work__item").forEach((item, i) => {
        gsap.from(item, {
          y: 34,
          scale: 0.97,
          opacity: 0,
          duration: 0.95,
          ease: "power3.out",
          delay: i * 0.04,
          scrollTrigger: { trigger: item, start: "top 88%" },
        });
      });

      const testimonialTl = gsap.timeline({
        scrollTrigger: { trigger: ".testimonial", start: "top 75%" },
      });

      testimonialTl
        .from(".testimonial__mark", { scale: 0.5, opacity: 0, duration: 0.8, ease: "back.out(1.5)" })
        .from(".testimonial__text", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.3")
        .from(".testimonial__author", { y: 15, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.4");

      gsap.from(".services__item", {
        x: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".services__list", start: "top 78%" },
      });

      gsap.from(".cta__title span", {
        y: 80,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power4.out",
        scrollTrigger: { trigger: ".cta", start: "top 72%" },
      });

      gsap.from(".cta .btn", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: ".cta", start: "top 65%" },
      });

      gsap.from(".footer__grid > *", {
        y: 25,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: { trigger: ".footer", start: "top 90%" },
      });

      gsap.utils.toArray<HTMLElement>(".section__bg-number").forEach((el) => {
        gsap.to(el, {
          y: -80,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      });

      ScrollTrigger.refresh();
    }, root);

    return () => {
      marquee?.destroy();
      moveHandlers.forEach(({ btn, onMouseMove, onMouseLeave }) => {
        btn.removeEventListener("mousemove", onMouseMove);
        btn.removeEventListener("mouseleave", onMouseLeave);
      });
      timers.forEach((id) => window.clearTimeout(id));
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    if (!threeReady || !canvasRef.current) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setThreeActive(false);
      return;
    }

    const THREE = (window as unknown as { THREE?: any }).THREE;

    if (!THREE) {
      setThreeActive(false);
      return;
    }

    class FormaScene {
      private canvas: HTMLCanvasElement;

      private width = window.innerWidth;

      private height = window.innerHeight;

      private mouse = { x: 0, y: 0, tx: 0, ty: 0 };

      private scroll = { current: 0, target: 0 };

      private scene: any;

      private camera: any;

      private renderer: any;

      private clock: any;

      private blob: any;

      private blobMat: any;

      private wireframe: any;

      private particles: any;

      private floaters: any[] = [];

      private rafId = 0;

      private scrollTrigger?: ScrollTrigger;

      private onMouseMove?: (e: MouseEvent) => void;

      private onResize?: () => void;

      constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.init();
        this.createBlob();
        this.createWireframe();
        this.createParticles();
        this.createFloatingShapes();
        this.setupEvents();
        this.animate();
      }

      private init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
        this.camera.position.set(0, 0, 5.5);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.clock = new THREE.Clock();
      }

      private createBlob() {
        const geo = new THREE.IcosahedronGeometry(1.8, 64);
        this.blobMat = new THREE.ShaderMaterial({
          vertexShader: blobVertexShader,
          fragmentShader: blobFragmentShader,
          uniforms: {
            uTime: { value: 0 },
            uIntensity: { value: 0.38 },
            uSpeed: { value: 0.22 },
            uColor1: { value: new THREE.Color("#c9835a") },
            uColor2: { value: new THREE.Color("#2a1810") },
            uColor3: { value: new THREE.Color("#f0ede6") },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uOpacity: { value: 1 },
          },
          transparent: true,
          depthWrite: false,
        });
        this.blob = new THREE.Mesh(geo, this.blobMat);
        this.blob.position.set(2.2, 0.2, 0);
        this.scene.add(this.blob);
      }

      private createWireframe() {
        const geo = new THREE.IcosahedronGeometry(1.84, 16);
        const mat = new THREE.MeshBasicMaterial({
          color: new THREE.Color("#c9835a"),
          wireframe: true,
          transparent: true,
          opacity: 0.05,
          depthWrite: false,
        });
        this.wireframe = new THREE.Mesh(geo, mat);
        this.wireframe.position.copy(this.blob.position);
        this.scene.add(this.wireframe);
      }

      private createParticles() {
        const count = 1800;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i += 1) {
          const r = 6 + Math.random() * 12;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          positions[i * 3 + 2] = r * Math.cos(phi);
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
          size: 1.2,
          color: new THREE.Color("#c9835a"),
          transparent: true,
          opacity: 0.25,
          sizeAttenuation: true,
          depthWrite: false,
        });
        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);
      }

      private createFloatingShapes() {
        const shapes = [
          new THREE.OctahedronGeometry(0.12, 0),
          new THREE.TetrahedronGeometry(0.1, 0),
          new THREE.IcosahedronGeometry(0.08, 0),
        ];

        const mat = new THREE.MeshBasicMaterial({
          color: new THREE.Color("#c9835a"),
          wireframe: true,
          transparent: true,
          opacity: 0.15,
        });

        for (let i = 0; i < 14; i += 1) {
          const mesh = new THREE.Mesh(shapes[i % shapes.length], mat.clone());
          mesh.position.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6 - 2);
          mesh.userData = {
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            origY: mesh.position.y,
            phase: Math.random() * Math.PI * 2,
          };
          this.floaters.push(mesh);
          this.scene.add(mesh);
        }
      }

      private setupEvents() {
        this.onMouseMove = (e: MouseEvent) => {
          this.mouse.tx = (e.clientX / this.width) * 2 - 1;
          this.mouse.ty = -(e.clientY / this.height) * 2 + 1;
        };

        this.onResize = () => {
          this.width = window.innerWidth;
          this.height = window.innerHeight;
          this.camera.aspect = this.width / this.height;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(this.width, this.height);
        };

        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("resize", this.onResize);

        this.scrollTrigger = ScrollTrigger.create({
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            this.scroll.target = self.progress;
          },
        });
      }

      private animate = () => {
        this.rafId = window.requestAnimationFrame(this.animate);
        const t = this.clock.getElapsedTime();

        this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.04;
        this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.04;
        this.scroll.current += (this.scroll.target - this.scroll.current) * 0.06;

        const sp = this.scroll.current;

        this.blobMat.uniforms.uTime.value = t;
        this.blobMat.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
        this.blobMat.uniforms.uIntensity.value = 0.38 + Math.sin(sp * Math.PI * 2) * 0.12;

        this.blob.position.x = 2.2 - sp * 4.4;
        this.blob.position.y = 0.2 + Math.sin(sp * Math.PI) * 0.8;

        const scale = 1 + Math.sin(sp * Math.PI) * 0.25;
        this.blob.scale.setScalar(scale);
        this.blob.rotation.x = t * 0.06 + this.mouse.y * 0.3;
        this.blob.rotation.y = t * 0.09 + this.mouse.x * 0.3;

        this.wireframe.position.copy(this.blob.position);
        this.wireframe.rotation.copy(this.blob.rotation);
        this.wireframe.scale.copy(this.blob.scale);

        const opacityCurve = 1 - Math.sin(sp * Math.PI) * 0.3;
        this.blobMat.uniforms.uOpacity.value = opacityCurve;
        this.wireframe.material.opacity = 0.05 * opacityCurve;

        this.particles.rotation.y = t * 0.015;
        this.particles.rotation.x = t * 0.008 + sp * 0.3;

        this.floaters.forEach((floater) => {
          const data = floater.userData;
          floater.rotation.x = t * data.speedX;
          floater.rotation.y = t * data.speedY;
          floater.position.y = data.origY + Math.sin(t * 0.5 + data.phase) * 0.3;
        });

        this.renderer.render(this.scene, this.camera);
      };

      destroy() {
        window.cancelAnimationFrame(this.rafId);
        if (this.onMouseMove) {
          window.removeEventListener("mousemove", this.onMouseMove);
        }
        if (this.onResize) {
          window.removeEventListener("resize", this.onResize);
        }
        this.scrollTrigger?.kill();

        this.scene?.traverse((obj: any) => {
          if (obj.geometry) {
            obj.geometry.dispose();
          }
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((mat: any) => mat.dispose?.());
            } else {
              obj.material.dispose?.();
            }
          }
        });

        this.renderer?.dispose();
        this.renderer?.forceContextLoss?.();
      }
    }

    let scene: FormaScene | null = null;

    try {
      scene = new FormaScene(canvasRef.current);
      setThreeActive(true);
    } catch {
      scene = null;
      setThreeActive(false);
    }

    return () => scene?.destroy();
  }, [threeReady]);

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        strategy="afterInteractive"
        onLoad={() => setThreeReady(true)}
        onReady={() => setThreeReady(true)}
      />

      <div ref={rootRef} className="forma-page">
        <div className={`loader ${loaderDone ? "is-loaded" : ""}`}>
          <div className="loader__brand">OPUSFESTA STUDIO</div>
        </div>

        <canvas id="webgl" ref={canvasRef} />

        <nav className={`nav ${navScrolled ? "is-scrolled" : ""}`}>
          <div className="container nav__inner">
            <a href="#hero" className="nav__logo">
              OpusFesta Studio
            </a>
            <div className="nav__links">
              <a href="#work">Work</a>
              <a href="#about">Studio</a>
              <a href="#services">Services</a>
              <a href="#stories">Stories</a>
            </div>
            <a href="#contact" className="nav__cta">
              Let&apos;s Talk
              <span aria-hidden="true">&rarr;</span>
            </a>
            <button className="nav__toggle" type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <span aria-hidden="true">&#9776;</span>
            </button>
          </div>
        </nav>

        <div className={`mobile-menu ${mobileOpen ? "is-open" : ""}`}>
          <div className="mobile-menu__header">
            <a href="#hero" className="nav__logo">
              OpusFesta Studio
            </a>
            <button
              className="mobile-menu__close"
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <nav className="mobile-menu__nav">
            <a href="#work" onClick={() => setMobileOpen(false)}>
              Work
            </a>
            <a href="#about" onClick={() => setMobileOpen(false)}>
              Studio
            </a>
            <a href="#services" onClick={() => setMobileOpen(false)}>
              Services
            </a>
            <a href="#stories" onClick={() => setMobileOpen(false)}>
              Stories
            </a>
            <a href="#contact" onClick={() => setMobileOpen(false)}>
              Contact
            </a>
          </nav>
        </div>

        <section className="hero" id="hero">
          <div className="container">
            <div className="hero__content">
              <div className="hero__label">Photography • Videography • Cinematography</div>
              <h1 className="hero__title">
                <span className="hero__line">
                  <span>WE CAPTURE</span>
                </span>
                <span className="hero__line">
                  <span>MOMENTS</span>
                </span>
                <span className="hero__line hero__line--accent">
                  <span>THAT LAST</span>
                </span>
              </h1>
              <p className="hero__subtitle">
                OpusFesta Studio creates premium visual stories for weddings, events, and brands through photography, videography, and cinematic production.
              </p>
              <div className="hero__chips">
                <span>Color Pipeline</span>
                <span>Dual Audio</span>
                <span>Cloud Delivery</span>
              </div>
              <a href="#work" className="btn btn--primary">
                View Portfolio
                <span aria-hidden="true">&rarr;</span>
              </a>
              <div className="hero__session">
                <div>
                  <span>Mode</span>
                  <strong>Multi-Cam</strong>
                </div>
                <div>
                  <span>Timeline</span>
                  <strong>06:42</strong>
                </div>
                <div>
                  <span>Output</span>
                  <strong>4K Master</strong>
                </div>
              </div>
            </div>
            <div className={`hero__visual-fallback ${threeActive ? "is-hidden" : ""}`} aria-hidden="true">
              <span className="hero__visual-orb" />
              <span className="hero__visual-ring hero__visual-ring--one" />
              <span className="hero__visual-ring hero__visual-ring--two" />
              <span className="hero__visual-glow" />
            </div>
          </div>
        </section>

        <div className="marquee" id="marquee">
          <div className="marquee__track">
            <div className="marquee__content">
              {[...marqueeItems, ...marqueeItems].map((item, idx) => (
                <span key={`marquee-main-${item}-${idx}`}>
                  <span className="marquee__item">{item}</span>
                  <span className="marquee__sep">/</span>
                </span>
              ))}
            </div>
            <div className="marquee__content" aria-hidden="true">
              {[...marqueeItems, ...marqueeItems].map((item, idx) => (
                <span key={`marquee-copy-${item}-${idx}`}>
                  <span className="marquee__item">{item}</span>
                  <span className="marquee__sep">/</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="divider">
          <div className="container">
            <div className="divider__line">
              <div className="divider__dot" />
            </div>
          </div>
        </div>

        <section className="section section--poetic" id="about">
          <div className="container">
            <span className="section__bg-number">01</span>
            <div className="section-label">About</div>
            <div className="about__grid">
              <div>
                <h2 className="about__title">
                  We turn milestones
                  <br />
                  into timeless
                  <br />
                  visual stories.
                </h2>
                <p className="about__desc">
                  From intimate ceremonies to large-scale productions, our team plans every frame with intention. We blend creativity and technical precision so your memories and campaigns look elevated across every channel.
                </p>
                <div className="about__accent-line" />
              </div>
              <div className="about__stats">
                <div className="stat">
                  <span className="stat__number">10+</span>
                  <span className="stat__label">Years Capturing Stories</span>
                </div>
                <div className="stat">
                  <span className="stat__number">500+</span>
                  <span className="stat__label">Events Documented</span>
                </div>
                <div className="stat">
                  <span className="stat__number">60K+</span>
                  <span className="stat__label">Photos Delivered</span>
                </div>
                <div className="stat">
                  <span className="stat__number">900+</span>
                  <span className="stat__label">Films & Reels Produced</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section section--lab" id="process">
          <div className="container">
            <span className="section__bg-number">02</span>
            <div className="section-label">Our Process</div>
            <div className="process__grid">
              {[
                ["01", "Pre-Production", "Creative brief, timeline planning, shot lists, and location coordination before cameras roll."],
                ["02", "Production Day", "On-site photography and videography coverage with direction that keeps moments natural and cinematic."],
                ["03", "Post-Production", "Careful selection, retouching, editing, color grading, and sound design for polished final assets."],
                ["04", "Delivery", "Structured galleries, films, social cuts, and archive-ready files delivered on schedule."],
              ].map(([number, title, desc]) => (
                <div key={number} className="process__item">
                  <div className="process__number">{number}</div>
                  <div className="process__line">
                    <div className="process__line-fill" />
                    <div className="process__dot" />
                  </div>
                  <h3 className="process__title">{title}</h3>
                  <p className="process__desc">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--gallery" id="work">
          <div className="container">
            <span className="section__bg-number">03</span>
            <div className="section-header">
              <div className="section-label section-label--tight">Selected Work</div>
              <a href="#" className="section-link">
                View Full Portfolio
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
            <div className="work__stage">
              <div className="work__grid">
                {selectedWorks.map((work) => (
                  <div key={work.number} className={`work__item ${work.size}`}>
                    <div className="work__image" style={{ backgroundImage: `url('${work.image}')` }} />
                    <span className="work__number">{work.number}</span>
                    <div className="work__pills">
                      <span>{work.craft}</span>
                      <span>{work.location}</span>
                    </div>
                    <div className="work__overlay">
                      <span className="work__category">{work.category}</span>
                      <h3 className="work__title">{work.title}</h3>
                      <p className="work__desc">{work.desc}</p>
                      <span className="work__year">{work.year}</span>
                    </div>
                    <div className="work__arrow">
                      <span aria-hidden="true">&#8599;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section section--quote" id="testimonial">
          <div className="container">
            <div className="testimonial">
              <span className="testimonial__mark">&quot;</span>
              <blockquote className="testimonial__text">
                OpusFesta Studio captured our wedding with so much intention. The photos felt timeless, the film felt cinematic, and every important detail was documented beautifully.
              </blockquote>
              <div className="testimonial__author">
                <span className="testimonial__name">Neema Joseph</span>
                <span className="testimonial__role">Wedding Planner, Dar es Salaam</span>
              </div>
            </div>
          </div>
        </section>

        <div className="divider">
          <div className="container">
            <div className="divider__line">
              <div className="divider__dot" />
            </div>
          </div>
        </div>

        <section className="section section--craft" id="services">
          <div className="container">
            <span className="section__bg-number">04</span>
            <div className="section-label">What We Do</div>
            <div className="services__list">
              {services.map((service, index) => {
                const isActive = activeService === index;
                return (
                  <div
                    key={service.number}
                    className={`services__item ${isActive ? "is-active" : ""}`}
                    onClick={() => setActiveService((prev) => (prev === index ? null : index))}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveService((prev) => (prev === index ? null : index));
                      }
                    }}
                  >
                    <span className="services__number">{service.number}</span>
                    <div className="services__content">
                      <div className="services__header">
                        <h3 className="services__title">{service.title}</h3>
                      </div>
                      <div className="services__tags">
                        {service.tags.map((tag) => (
                          <span key={tag} className="services__tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="services__body">
                        <p className="services__desc">{service.desc}</p>
                      </div>
                    </div>
                    <span className="services__arrow">
                      <span aria-hidden="true">+</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section section--journal-intro" id="stories">
          <div className="container">
            <span className="section__bg-number">05</span>
            <div className="section-label">Stories</div>
            <div className="stories-intro">
              <p className="stories-intro__lead">
                Behind-the-scenes breakdowns, wedding day highlights, and production insights from recent shoots are coming soon.
              </p>
              <div className="stories-intro__meta">
                <span>Weekly Drops</span>
                <span>Behind the Lens</span>
                <span>Color & Narrative</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section studio-addon" id="studio-editorial">
          <div className="container studio-addon__hero">
            <div className="studio-addon__intro">
              <p className="studio-addon__kicker">Visual Narratives</p>
              <h3>LIGHT, MOVEMENT, EMOTION</h3>
              <p>
                A dedicated editorial layer for campaigns, weddings, and cinematic event coverage.
              </p>
              <div className="studio-addon__links">
                <a href="#work">View Galleries</a>
                <a href="#contact">Book Studio</a>
              </div>
            </div>
            <div className="studio-addon__stage">
              <img src={activeEditorialHero.image} alt={activeEditorialHero.title} />
              <div className="studio-addon__stage-overlay" />
              <div className="studio-addon__meta">
                <span>{activeEditorialHero.tag}</span>
                <h4>{activeEditorialHero.title}</h4>
                <p>{activeEditorialHero.description}</p>
              </div>
              <div className="studio-addon__controls">
                <button
                  type="button"
                  aria-label="Previous slide"
                  onClick={() =>
                    setEditorialHeroIndex((prev) => (prev - 1 + editorialHeroSlides.length) % editorialHeroSlides.length)
                  }
                >
                  &larr;
                </button>
                <span>
                  {String(editorialHeroIndex + 1).padStart(2, "0")} / {String(editorialHeroSlides.length).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  aria-label="Next slide"
                  onClick={() =>
                    setEditorialHeroIndex((prev) => (prev + 1) % editorialHeroSlides.length)
                  }
                >
                  &rarr;
                </button>
              </div>
            </div>
            <div className="studio-addon__metric">
              <p>Projects archived</p>
              <strong>214</strong>
            </div>
          </div>
        </section>

        <section className="section studio-addon">
          <div className="container studio-addon__explore">
            <div className="studio-addon__explore-images">
              <img src={activeEditorialProject.img1} alt={activeEditorialProject.title} />
              <img src={activeEditorialProject.img2} alt={activeEditorialProject.subtitle} />
            </div>
            <div className="studio-addon__explore-copy">
              <h3>{activeEditorialProject.title}</h3>
              <h4>{activeEditorialProject.subtitle}</h4>
              <p>{activeEditorialProject.description}</p>
              <div className="studio-addon__explore-footer">
                <div className="studio-addon__controls studio-addon__controls--inline">
                  <button
                    type="button"
                    aria-label="Previous project"
                    onClick={() =>
                      setEditorialProjectIndex((prev) => (prev - 1 + editorialProjects.length) % editorialProjects.length)
                    }
                  >
                    &larr;
                  </button>
                  <span>
                    {String(editorialProjectIndex + 1).padStart(2, "0")} / {String(editorialProjects.length).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    aria-label="Next project"
                    onClick={() =>
                      setEditorialProjectIndex((prev) => (prev + 1) % editorialProjects.length)
                    }
                  >
                    &rarr;
                  </button>
                </div>
                <a href="#work" className="studio-addon__button">All Projects</a>
              </div>
            </div>
          </div>
        </section>

        <section className="section studio-addon">
          <div className="container studio-addon__split">
            <div className="studio-addon__panel">
              <h3>FEATURED CASE STUDY</h3>
              <h4>Studio Workflow</h4>
              <p>
                Every production moves through planning, capture, and post with a documented process
                so quality is consistent across weddings, events, and branded work.
              </p>
              <div className="studio-addon__facts">
                <div><span>Format</span><strong>4K RAW</strong></div>
                <div><span>Audio</span><strong>Dual Rec</strong></div>
                <div><span>Delivery</span><strong>Cloud</strong></div>
              </div>
            </div>
            <div className="studio-addon__image">
              <img
                src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80"
                alt="Production process"
              />
            </div>
          </div>
        </section>

        <section className="section studio-addon">
          <div className="container studio-addon__split studio-addon__split--method">
            <div className="studio-addon__image">
              <img
                src="https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=1200&q=80"
                alt="Methodology"
              />
            </div>
            <div className="studio-addon__panel">
              <p className="studio-addon__kicker">Methodology</p>
              <h3>FRAME, FOCUS, FEEL</h3>
              <p>
                We translate your moments into complete visual narratives, from pre-visualization to
                grading and final delivery.
              </p>
              <div className="studio-addon__list">
                <div><span>01</span><p>Pre-Visualization and location-light planning.</p></div>
                <div><span>02</span><p>Intentional capture with cinematic direction.</p></div>
                <div><span>03</span><p>Post-production for polish, rhythm, and emotion.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="section studio-addon">
          <div className="container">
            <div className="studio-addon__head">
              <h3>Recognition</h3>
              <a href="#stories" className="studio-addon__button">Press Kit</a>
            </div>
            <div className="studio-addon__cards">
              {recognitionItems.map((item) => (
                <article key={item.title}>
                  <p>{item.label}</p>
                  <h4>{item.title}</h4>
                  <a href="#stories">{item.cta} &rarr;</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section studio-addon">
          <div className="container studio-addon__journal">
            <article className="studio-addon__journal-feature">
              <img
                src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80"
                alt="Featured story"
              />
              <div className="studio-addon__journal-overlay" />
              <div className="studio-addon__journal-content">
                <span>Featured Diary</span>
                <h3>The Art of Printing</h3>
                <p>
                  Exploring post-production craft where color, texture, and pacing transform raw captures into timeless visuals.
                </p>
              </div>
            </article>
            <div className="studio-addon__journal-list">
              <header>
                <h3>Journal</h3>
                <a href="#stories" className="studio-addon__button">Archive</a>
              </header>
              {studioJournalItems.map((item) => (
                <article key={item.title}>
                  <p>{item.category} • {item.tag}</p>
                  <h4>{item.title}</h4>
                  <p>{item.excerpt}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cta" id="contact">
          <div className="container">
            <h2 className="cta__title">
              <span>LET&apos;S TELL</span>
              <span>YOUR STORY</span>
              <span className="cta__title--accent">TOGETHER</span>
            </h2>
            <a href="mailto:studio@opusfesta.com" className="btn btn--primary btn--large">
              Start a Project
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </section>

        <footer className="footer">
          <div className="container">
            <div className="footer__grid">
              <div>
                <span className="footer__logo">OpusFesta Studio</span>
                <p className="footer__tagline">Photography, videography, and cinematography for weddings, events, and branded storytelling.</p>
              </div>
              <div className="footer__col">
                <h4>Navigation</h4>
                <a href="#work">Work</a>
                <a href="#about">Studio</a>
                <a href="#services">Services</a>
                <a href="#stories">Stories</a>
              </div>
              <div className="footer__col">
                <h4>Social</h4>
                <a href="#">Instagram</a>
                <a href="#">Twitter / X</a>
                <a href="#">LinkedIn</a>
                <a href="#">Dribbble</a>
              </div>
              <div className="footer__col">
                <h4>Contact</h4>
                <a href="mailto:studio@opusfesta.com">studio@opusfesta.com</a>
                <a href="tel:+12345678900">+1 (234) 567-8900</a>
                <a href="#">Dar es Salaam, TZ</a>
              </div>
            </div>
            <div className="footer__bottom">
              <span>2026 OpusFesta Studio. All rights reserved.</span>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

        .forma-page {
          --bg: #10151d;
          --bg-elevated: #161d28;
          --text: #eceae4;
          --text-muted: #8d93a0;
          --accent: #c9835a;
          --accent-light: #e8c4a0;
          --accent-dark: #352218;
          --border: #2a3342;
          --surface: rgba(22, 28, 40, 0.82);
          --surface-strong: rgba(17, 24, 35, 0.94);
          --surface-border: color-mix(in oklab, var(--border) 78%, var(--accent) 22%);
          --radius-panel: 14px;
          --font-heading: 'Space Grotesk', sans-serif;
          --font-body: 'Inter', sans-serif;
          --container: 1340px;

          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
          background:
            radial-gradient(120% 90% at 8% -12%, rgba(201, 131, 90, 0.12), transparent 56%),
            radial-gradient(95% 70% at 92% 4%, rgba(114, 138, 178, 0.14), transparent 58%),
            linear-gradient(180deg, #131a25 0%, #111822 44%, #0f141d 100%);
          color: var(--text);
          font-family: var(--font-body);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .forma-page,
        .forma-page *,
        .forma-page *::before,
        .forma-page *::after {
          box-sizing: border-box;
        }

        .forma-page *::selection {
          background: var(--accent);
          color: var(--bg);
        }

        .forma-page a {
          color: inherit;
          text-decoration: none;
        }

        .forma-page button {
          border: none;
          background: none;
          color: inherit;
          cursor: pointer;
          font-family: inherit;
        }

        .forma-page .container {
          width: 100%;
          max-width: var(--container);
          margin: 0 auto;
          padding: 0 clamp(1.25rem, 4vw, 3rem);
        }

        .forma-page .loader {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: var(--bg-elevated);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.6s;
        }

        .forma-page .loader.is-loaded {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .forma-page .loader__brand {
          font-family: var(--font-heading);
          font-size: clamp(0.9rem, 2.2vw, 1.2rem);
          font-weight: 600;
          letter-spacing: 0.08em;
          color: var(--accent);
          position: relative;
          text-align: center;
        }

        .forma-page .loader__brand::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 100%;
          height: 1px;
          background: var(--accent);
          animation: loaderLine 1.2s ease-in-out infinite;
        }

        @keyframes loaderLine {
          0%,
          100% {
            transform: scaleX(0);
            transform-origin: left;
          }
          50% {
            transform: scaleX(1);
            transform-origin: left;
          }
          51% {
            transform-origin: right;
          }
        }

        .forma-page #webgl {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
        }

        .forma-page .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 0.85rem 0;
          transition: padding 0.35s ease;
        }

        .forma-page .nav.is-scrolled {
          padding: 0.6rem 0;
        }

        .forma-page .nav__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid var(--surface-border);
          border-radius: 16px;
          padding: 0.55rem 0.9rem;
          background: linear-gradient(165deg, rgba(16, 23, 34, 0.88), rgba(10, 16, 25, 0.92));
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 12px 26px rgba(3, 8, 15, 0.3);
        }

        .forma-page .nav__logo {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text);
          white-space: nowrap;
        }

        .forma-page .nav__links {
          display: flex;
          align-items: center;
          gap: 2.5rem;
        }

        .forma-page .nav__links a {
          font-size: 0.82rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: var(--text-muted);
          transition: color 0.3s ease;
          position: relative;
        }

        .forma-page .nav__links a::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--accent);
          transition: width 0.3s ease;
        }

        .forma-page .nav__links a:hover {
          color: var(--text);
        }

        .forma-page .nav__links a:hover::after {
          width: 100%;
        }

        .forma-page .nav__cta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.82rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          padding: 0.6rem 1.4rem;
          border: 1px solid var(--border);
          border-radius: 100px;
          transition: all 0.35s ease;
        }

        .forma-page .nav__cta:hover {
          background: var(--accent);
          border-color: var(--accent);
          color: var(--bg);
        }

        .forma-page .nav__toggle {
          display: none;
          color: var(--text);
        }

        .forma-page .mobile-menu {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: var(--bg-elevated);
          display: flex;
          flex-direction: column;
          padding: 1.5rem clamp(1.25rem, 4vw, 3rem);
          transform: translateX(100%);
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .forma-page .mobile-menu.is-open {
          transform: translateX(0);
        }

        .forma-page .mobile-menu__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .forma-page .mobile-menu__close {
          color: var(--text-muted);
        }

        .forma-page .mobile-menu__nav {
          display: flex;
          flex-direction: column;
          margin-top: 4rem;
        }

        .forma-page .mobile-menu__nav a {
          font-family: var(--font-heading);
          font-size: clamp(2rem, 8vw, 3.5rem);
          font-weight: 600;
          letter-spacing: -0.03em;
          padding: 0.6rem 0;
          color: var(--text-muted);
          transition: color 0.3s ease;
          border-bottom: 1px solid var(--border);
        }

        .forma-page .mobile-menu__nav a:hover {
          color: var(--accent);
        }

        .forma-page .hero {
          position: relative;
          z-index: 2;
          min-height: 100vh;
          min-height: 100svh;
          display: flex;
          align-items: center;
          padding: 8.8rem 0 4rem;
        }

        .forma-page .hero__content {
          max-width: 720px;
        }

        .forma-page .hero .container {
          position: relative;
        }

        .forma-page .hero__visual-fallback {
          position: absolute;
          right: clamp(1rem, 6vw, 4rem);
          top: 50%;
          width: clamp(260px, 33vw, 520px);
          aspect-ratio: 1;
          transform: translateY(-48%);
          border-radius: 50%;
          pointer-events: none;
          opacity: 0.85;
          transition: opacity 0.4s ease, visibility 0.4s ease;
          visibility: visible;
        }

        .forma-page .hero__visual-fallback.is-hidden {
          opacity: 0;
          visibility: hidden;
        }

        .forma-page .hero__visual-orb,
        .forma-page .hero__visual-ring,
        .forma-page .hero__visual-glow {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          display: block;
        }

        .forma-page .hero__visual-orb {
          background:
            radial-gradient(circle at 35% 30%, rgba(236, 234, 228, 0.14), rgba(201, 131, 90, 0.2) 34%, rgba(53, 34, 24, 0.16) 60%, rgba(15, 20, 29, 0) 72%),
            radial-gradient(circle at 60% 70%, rgba(201, 131, 90, 0.2), rgba(15, 20, 29, 0) 58%);
          filter: saturate(1.05);
          animation: heroFallbackPulse 7s ease-in-out infinite;
        }

        .forma-page .hero__visual-ring {
          border: 1px solid rgba(201, 131, 90, 0.22);
        }

        .forma-page .hero__visual-ring--one {
          transform: scale(1.08);
          opacity: 0.65;
        }

        .forma-page .hero__visual-ring--two {
          transform: scale(1.18);
          opacity: 0.34;
        }

        .forma-page .hero__visual-glow {
          inset: -12%;
          background: radial-gradient(circle, rgba(201, 131, 90, 0.22), rgba(201, 131, 90, 0));
          filter: blur(22px);
          opacity: 0.5;
        }

        @keyframes heroFallbackPulse {
          0%,
          100% {
            transform: scale(0.98) rotate(0deg);
          }
          50% {
            transform: scale(1.02) rotate(3deg);
          }
        }

        .forma-page .hero__label {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 2rem;
        }

        .forma-page .hero__label::before {
          content: '';
          width: 32px;
          height: 1px;
          background: var(--accent);
        }

        .forma-page .hero__title {
          font-family: var(--font-heading);
          font-size: clamp(3.2rem, 8.5vw, 7.5rem);
          font-weight: 700;
          line-height: 0.92;
          letter-spacing: -0.04em;
          margin-bottom: 2rem;
        }

        .forma-page .hero__line {
          display: block;
          overflow: hidden;
        }

        .forma-page .hero__line span {
          display: block;
        }

        .forma-page .hero__line--accent {
          color: var(--accent);
        }

        .forma-page .hero__subtitle {
          font-size: clamp(0.95rem, 1.3vw, 1.1rem);
          line-height: 1.7;
          color: var(--text-muted);
          max-width: 440px;
          margin-bottom: 2.5rem;
          letter-spacing: -0.005em;
        }

        .forma-page .hero__chips {
          margin-bottom: 1rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .forma-page .hero__chips span {
          border: 1px solid var(--surface-border);
          border-radius: 999px;
          padding: 0.3rem 0.65rem;
          font-size: 0.58rem;
          text-transform: uppercase;
          letter-spacing: 0.13em;
          font-weight: 700;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.02);
        }

        .forma-page .hero__session {
          margin-top: 1.1rem;
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-panel);
          background: linear-gradient(160deg, var(--surface), var(--surface-strong));
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.45rem;
          padding: 0.75rem;
          max-width: 510px;
        }

        .forma-page .hero__session div {
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0.52rem 0.58rem;
          background: rgba(255, 255, 255, 0.02);
        }

        .forma-page .hero__session span {
          display: block;
          font-size: 0.56rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--text-muted);
          margin-bottom: 0.32rem;
          font-weight: 700;
        }

        .forma-page .hero__session strong {
          font-family: var(--font-heading);
          font-size: 0.86rem;
          letter-spacing: 0.01em;
          color: var(--text);
        }

        .forma-page .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          font-family: var(--font-heading);
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          padding: 1rem 2rem;
          border-radius: 100px;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }

        .forma-page .btn--primary {
          background: var(--accent);
          color: var(--bg);
        }

        .forma-page .btn--primary:hover {
          background: var(--accent-light);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(201, 131, 90, 0.25);
        }

        .forma-page .btn--outline {
          border: 1px solid var(--border);
          color: var(--text);
        }

        .forma-page .btn--outline:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .forma-page .btn--large {
          font-size: 1rem;
          padding: 1.2rem 2.8rem;
        }

        .forma-page .marquee {
          position: relative;
          z-index: 2;
          overflow: hidden;
          padding: 1.8rem 0;
          background: color-mix(in oklab, var(--bg-elevated) 86%, var(--bg) 14%);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
        }

        .forma-page .marquee__track {
          display: flex;
          width: max-content;
          will-change: transform;
        }

        .forma-page .marquee__content {
          display: flex;
          align-items: center;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .forma-page .marquee__item {
          font-family: var(--font-heading);
          font-size: clamp(1rem, 2vw, 1.5rem);
          font-weight: 300;
          letter-spacing: -0.01em;
          color: var(--text-muted);
          padding: 0 1.5rem;
        }

        .forma-page .marquee__sep {
          color: var(--accent);
          opacity: 0.4;
          font-size: 0.6em;
        }

        .forma-page .section {
          position: relative;
          z-index: 2;
          --section-bg: linear-gradient(160deg, rgba(16, 22, 33, 0.7), rgba(11, 17, 27, 0.8));
          background: var(--section-bg);
          padding: clamp(5rem, 10vw, 8rem) 0;
        }

        .forma-page .section--poetic {
          --section-bg:
            radial-gradient(120% 120% at 88% 6%, rgba(201, 131, 90, 0.16), transparent 56%),
            linear-gradient(165deg, rgba(19, 27, 39, 0.84), rgba(13, 19, 30, 0.9));
        }

        .forma-page .section--lab {
          --section-bg:
            radial-gradient(120% 120% at 10% 20%, rgba(114, 142, 185, 0.15), transparent 52%),
            linear-gradient(165deg, rgba(15, 24, 37, 0.86), rgba(10, 18, 29, 0.92));
        }

        .forma-page .section--gallery {
          --section-bg:
            radial-gradient(130% 120% at 92% 10%, rgba(201, 131, 90, 0.12), transparent 54%),
            linear-gradient(160deg, rgba(18, 24, 34, 0.9), rgba(11, 17, 27, 0.95));
        }

        .forma-page .section--quote {
          --section-bg:
            radial-gradient(140% 120% at 14% 0%, rgba(132, 150, 181, 0.14), transparent 56%),
            linear-gradient(170deg, rgba(16, 24, 35, 0.86), rgba(10, 16, 26, 0.92));
        }

        .forma-page .section--craft {
          --section-bg:
            radial-gradient(130% 120% at 84% 10%, rgba(201, 131, 90, 0.13), transparent 54%),
            linear-gradient(165deg, rgba(18, 25, 36, 0.9), rgba(11, 18, 28, 0.95));
        }

        .forma-page .section--journal-intro {
          --section-bg:
            radial-gradient(120% 120% at 10% 12%, rgba(121, 145, 177, 0.14), transparent 58%),
            linear-gradient(165deg, rgba(17, 24, 35, 0.87), rgba(10, 17, 27, 0.93));
        }

        .forma-page .section.studio-addon {
          --section-bg:
            radial-gradient(120% 120% at 86% 14%, rgba(201, 131, 90, 0.1), transparent 56%),
            linear-gradient(165deg, rgba(16, 23, 34, 0.86), rgba(9, 15, 24, 0.92));
        }

        .forma-page section[id] {
          scroll-margin-top: 6.8rem;
        }

        .forma-page .section > .container {
          position: relative;
        }

        .forma-page .section--poetic::after,
        .forma-page .section--lab::after,
        .forma-page .section--gallery::after,
        .forma-page .section--craft::after,
        .forma-page .section--journal-intro::after {
          content: '';
          position: absolute;
          width: clamp(180px, 28vw, 320px);
          aspect-ratio: 1;
          border-radius: 999px;
          filter: blur(48px);
          opacity: 0.17;
          pointer-events: none;
          z-index: -1;
        }

        .forma-page .section--poetic::after {
          right: 4%;
          top: 12%;
          background: radial-gradient(circle, rgba(201, 131, 90, 0.45), rgba(201, 131, 90, 0));
        }

        .forma-page .section--lab::after {
          left: 6%;
          top: 16%;
          background: radial-gradient(circle, rgba(118, 145, 189, 0.42), rgba(118, 145, 189, 0));
        }

        .forma-page .section--gallery::after {
          display: none;
        }

        .forma-page .section--craft::after {
          left: 8%;
          top: 10%;
          background: radial-gradient(circle, rgba(201, 131, 90, 0.3), rgba(201, 131, 90, 0));
        }

        .forma-page .section--journal-intro::after {
          right: 8%;
          top: 14%;
          background: radial-gradient(circle, rgba(132, 150, 181, 0.34), rgba(132, 150, 181, 0));
        }

        .forma-page .section-label {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: clamp(2.5rem, 5vw, 4rem);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .forma-page .section-label--tight {
          margin-bottom: 0;
          flex: 1;
        }

        .forma-page .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 2rem;
          margin-bottom: clamp(2.5rem, 5vw, 4rem);
        }

        .forma-page .section-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--text-muted);
          transition: color 0.3s ease;
          flex-shrink: 0;
        }

        .forma-page .section-link:hover {
          color: var(--accent);
        }

        .forma-page .section--poetic .about__title,
        .forma-page .section--gallery .section-label,
        .forma-page .section--craft .section-label {
          text-shadow: 0 8px 28px rgba(0, 0, 0, 0.3);
        }

        .forma-page .section--lab .process__item:nth-child(odd) {
          transform: translateY(8px);
        }

        .forma-page .section--lab .process__item:nth-child(even) {
          transform: translateY(-8px);
        }

        .forma-page .section--lab .process__item {
          transition: transform 0.35s ease, border-color 0.35s ease;
        }

        .forma-page .section--lab .process__item:hover {
          transform: translateY(0);
          border-color: color-mix(in oklab, var(--accent) 58%, var(--border) 42%);
        }

        .forma-page .section--quote .testimonial {
          border: 1px solid var(--surface-border);
          border-radius: calc(var(--radius-panel) + 2px);
          background: linear-gradient(160deg, var(--surface), var(--surface-strong));
          padding: clamp(1.6rem, 3vw, 2.4rem);
          box-shadow: 0 18px 38px rgba(0, 0, 0, 0.22);
        }

        .forma-page .stories-intro {
          border: 1px solid var(--surface-border);
          border-radius: calc(var(--radius-panel) + 2px);
          background: linear-gradient(160deg, rgba(20, 28, 40, 0.78), rgba(16, 24, 35, 0.9));
          padding: clamp(1.1rem, 2.4vw, 1.6rem);
          max-width: 820px;
          box-shadow: 0 16px 34px rgba(0, 0, 0, 0.22);
        }

        .forma-page .stories-intro__lead {
          margin: 0;
          font-family: var(--font-heading);
          font-size: clamp(1rem, 2vw, 1.28rem);
          line-height: 1.6;
          letter-spacing: -0.014em;
          color: color-mix(in oklab, var(--text) 88%, #fff 12%);
        }

        .forma-page .stories-intro__meta {
          margin-top: 0.95rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }

        .forma-page .stories-intro__meta span {
          border: 1px solid color-mix(in oklab, var(--border) 70%, var(--accent) 30%);
          border-radius: 999px;
          padding: 0.26rem 0.62rem;
          font-size: 0.58rem;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.02);
        }

        .forma-page .section__bg-number {
          position: absolute;
          top: 0.3em;
          right: 5%;
          font-family: var(--font-heading);
          font-size: clamp(10rem, 22vw, 20rem);
          font-weight: 700;
          color: var(--text);
          opacity: 0.02;
          line-height: 1;
          pointer-events: none;
          user-select: none;
          z-index: 0;
        }

        .forma-page .about__grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(3rem, 6vw, 6rem);
          align-items: start;
        }

        .forma-page .about__title {
          font-family: var(--font-heading);
          font-size: clamp(1.8rem, 3.5vw, 2.8rem);
          font-weight: 600;
          line-height: 1.15;
          letter-spacing: -0.035em;
          margin-bottom: 1.5rem;
        }

        .forma-page .about__desc {
          font-size: clamp(0.9rem, 1.1vw, 1rem);
          line-height: 1.8;
          color: var(--text-muted);
          max-width: 520px;
          margin-bottom: 2rem;
        }

        .forma-page .about__accent-line {
          width: 48px;
          height: 2px;
          background: var(--accent);
        }

        .forma-page .about__stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          padding-top: 0.5rem;
        }

        .forma-page .stat {
          padding: 1.2rem 1rem;
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-panel);
          background: linear-gradient(160deg, var(--surface), var(--surface-strong));
        }

        .forma-page .stat__number {
          font-family: var(--font-heading);
          font-size: clamp(2.2rem, 4vw, 3rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          color: var(--accent);
          display: block;
          margin-bottom: 0.4rem;
        }

        .forma-page .stat__label {
          font-size: 0.8rem;
          line-height: 1.5;
          color: var(--text-muted);
        }

        .forma-page .process__grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(1.5rem, 3vw, 2.5rem);
        }

        .forma-page .process__item {
          position: relative;
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-panel);
          background: linear-gradient(160deg, var(--surface), var(--surface-strong));
          padding: 1.15rem;
        }

        .forma-page .process__number {
          font-family: var(--font-heading);
          font-size: clamp(2.5rem, 4vw, 3.5rem);
          font-weight: 700;
          color: var(--accent);
          opacity: 0.15;
          line-height: 1;
          margin-bottom: 1.5rem;
        }

        .forma-page .process__line {
          width: 100%;
          height: 1px;
          background: var(--border);
          margin-bottom: 1.5rem;
          position: relative;
        }

        .forma-page .process__line-fill {
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 100%;
          background: var(--accent);
          transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .forma-page .process__item.is-visible .process__line-fill {
          width: 100%;
        }

        .forma-page .process__dot {
          position: absolute;
          top: -3px;
          left: 0;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--accent);
        }

        .forma-page .process__title {
          font-family: var(--font-heading);
          font-size: clamp(1rem, 1.4vw, 1.2rem);
          font-weight: 600;
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
        }

        .forma-page .process__desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.7;
        }

        .forma-page .work__stage {
          position: relative;
          border: 1px solid var(--surface-border);
          border-radius: 22px;
          padding: clamp(0.75rem, 1.6vw, 1.05rem);
          background: linear-gradient(165deg, color-mix(in oklab, var(--surface) 90%, #070c14 10%), color-mix(in oklab, var(--surface-strong) 86%, #060a11 14%));
          box-shadow: 0 22px 52px rgba(0, 0, 0, 0.28);
          overflow: hidden;
        }

        .forma-page .work__stage::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(255, 255, 255, 0.04), transparent 38%);
          pointer-events: none;
        }

        .forma-page .work__grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          grid-auto-rows: 84px;
          gap: 0.9rem;
        }

        .forma-page .work__item {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          min-height: 220px;
          isolation: isolate;
          border: 1px solid color-mix(in oklab, var(--border) 72%, var(--accent) 28%);
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.35s ease;
        }

        .forma-page .work__item::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(7, 12, 20, 0.1) 0%, rgba(7, 12, 20, 0.5) 100%);
          z-index: 1;
          pointer-events: none;
        }

        .forma-page .work__item--hero {
          grid-column: span 8;
          grid-row: span 5;
        }

        .forma-page .work__item--portrait {
          grid-column: span 4;
          grid-row: span 5;
        }

        .forma-page .work__item--tall {
          grid-column: span 4;
          grid-row: span 4;
        }

        .forma-page .work__item--medium {
          grid-column: span 4;
          grid-row: span 4;
        }

        .forma-page .work__item--wide {
          grid-column: span 12;
          grid-row: span 3;
        }

        .forma-page .work__image {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          background-color: var(--accent-dark);
          filter: grayscale(10%) contrast(102%) saturate(96%);
          transform: scale(1.01);
          transition: transform 0.75s cubic-bezier(0.22, 1, 0.36, 1), filter 0.4s ease;
        }

        .forma-page .work__item:hover .work__image {
          transform: scale(1.055);
          filter: grayscale(0%) contrast(106%) saturate(102%);
        }

        .forma-page .work__item:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 32px rgba(0, 0, 0, 0.32);
          border-color: color-mix(in oklab, var(--accent) 52%, var(--border) 48%);
        }

        .forma-page .work__overlay {
          position: absolute;
          inset: 0;
          z-index: 3;
          background: linear-gradient(to top, rgba(7, 11, 18, 0.94) 0%, rgba(7, 11, 18, 0.48) 42%, rgba(7, 11, 18, 0.04) 74%);
          padding: 1.35rem;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .forma-page .work__pills {
          position: absolute;
          left: 0.8rem;
          right: 0.8rem;
          top: 0.8rem;
          z-index: 4;
          display: flex;
          gap: 0.38rem;
          flex-wrap: wrap;
          pointer-events: none;
        }

        .forma-page .work__pills span {
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 999px;
          padding: 0.18rem 0.46rem;
          font-size: 0.52rem;
          letter-spacing: 0.11em;
          text-transform: uppercase;
          font-weight: 700;
          background: rgba(8, 12, 19, 0.56);
          color: color-mix(in oklab, var(--text) 90%, #fff 10%);
        }

        .forma-page .work__number {
          position: absolute;
          bottom: 0.8rem;
          right: 0.95rem;
          font-family: var(--font-heading);
          font-size: 0.64rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: color-mix(in oklab, var(--text-muted) 76%, var(--accent) 24%);
          z-index: 4;
        }

        .forma-page .work__category {
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: color-mix(in oklab, var(--accent) 88%, #f2c29c 12%);
          margin-bottom: 0.45rem;
        }

        .forma-page .work__title {
          font-family: var(--font-heading);
          font-size: clamp(1.16rem, 1.8vw, 1.52rem);
          font-weight: 600;
          letter-spacing: -0.02em;
          margin-bottom: 0.28rem;
          max-width: 28ch;
        }

        .forma-page .work__desc {
          font-size: 0.76rem;
          color: color-mix(in oklab, var(--text-muted) 92%, #a6b2c8 8%);
          line-height: 1.5;
          max-width: 44ch;
        }

        .forma-page .work__year {
          margin-top: 0.52rem;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: color-mix(in oklab, var(--text-muted) 74%, var(--accent) 26%);
        }

        .forma-page .work__arrow {
          position: absolute;
          top: 0.85rem;
          right: 0.95rem;
          width: 34px;
          height: 34px;
          border-radius: 999px;
          background: color-mix(in oklab, var(--accent) 90%, #f0c6a5 10%);
          color: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          transform: translateY(-6px);
          opacity: 0;
          transition: transform 0.28s ease, opacity 0.28s ease;
          z-index: 4;
        }

        .forma-page .work__item:hover .work__arrow {
          transform: translateY(0);
          opacity: 1;
        }

        .forma-page .testimonial {
          text-align: center;
          max-width: 820px;
          margin: 0 auto;
        }

        .forma-page .testimonial__mark {
          font-family: Georgia, serif;
          font-size: clamp(5rem, 12vw, 9rem);
          font-weight: 400;
          color: var(--accent);
          opacity: 0.12;
          line-height: 0.4;
          margin-bottom: 2.5rem;
          display: block;
        }

        .forma-page .testimonial__text {
          font-family: var(--font-heading);
          font-size: clamp(1.2rem, 2.3vw, 1.8rem);
          font-weight: 400;
          line-height: 1.5;
          letter-spacing: -0.015em;
          margin-bottom: 2.5rem;
          font-style: italic;
          color: var(--text);
        }

        .forma-page .testimonial__author {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .forma-page .testimonial__name {
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .forma-page .testimonial__role {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .forma-page .services__list {
          display: grid;
          gap: 0.9rem;
        }

        .forma-page .services__item {
          display: flex;
          align-items: flex-start;
          gap: clamp(1.5rem, 3vw, 3rem);
          padding: clamp(1.5rem, 2.5vw, 2.2rem) 0;
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-panel);
          background: linear-gradient(160deg, var(--surface), var(--surface-strong));
          padding-inline: clamp(1rem, 2vw, 1.4rem);
          cursor: pointer;
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.35s ease;
        }

        .forma-page .services__item:hover {
          transform: translateY(-2px);
          border-color: color-mix(in oklab, var(--accent) 62%, var(--border) 38%);
        }

        .forma-page .services__number {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--accent);
          min-width: 2.5rem;
          padding-top: 0.15rem;
        }

        .forma-page .services__content {
          flex: 1;
        }

        .forma-page .services__header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .forma-page .services__title {
          font-family: var(--font-heading);
          font-size: clamp(1.2rem, 2.5vw, 1.8rem);
          font-weight: 600;
          letter-spacing: -0.025em;
          transition: color 0.3s ease;
        }

        .forma-page .services__item:hover .services__title,
        .forma-page .services__item.is-active .services__title {
          color: var(--accent);
        }

        .forma-page .services__tags {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.6rem;
          flex-wrap: wrap;
        }

        .forma-page .services__tag {
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          padding: 0.25rem 0.7rem;
          border: 1px solid var(--border);
          border-radius: 100px;
          color: var(--text-muted);
        }

        .forma-page .services__body {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease, margin 0.4s ease;
          margin-top: 0;
        }

        .forma-page .services__item.is-active .services__body {
          max-height: 200px;
          opacity: 1;
          margin-top: 1rem;
        }

        .forma-page .services__desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          max-width: 520px;
          line-height: 1.7;
        }

        .forma-page .services__arrow {
          color: var(--text-muted);
          transition: all 0.4s ease;
          flex-shrink: 0;
          margin-left: auto;
          padding-top: 0.15rem;
        }

        .forma-page .services__item:hover .services__arrow,
        .forma-page .services__item.is-active .services__arrow {
          color: var(--accent);
          transform: rotate(45deg);
        }

        .forma-page .cta {
          position: relative;
          z-index: 2;
          padding: clamp(6rem, 14vw, 12rem) 0;
          text-align: center;
          background: transparent;
        }

        .forma-page .cta__title {
          font-family: var(--font-heading);
          font-size: clamp(2.8rem, 8vw, 7rem);
          font-weight: 700;
          line-height: 0.92;
          letter-spacing: -0.04em;
          margin-bottom: 3rem;
        }

        .forma-page .cta__title span {
          display: block;
        }

        .forma-page .cta__title--accent {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .forma-page .footer {
          position: relative;
          z-index: 2;
          background: var(--bg-elevated);
          border-top: 1px solid var(--border);
          padding: clamp(3rem, 6vw, 5rem) 0 2rem;
        }

        .forma-page .footer__grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: clamp(2rem, 4vw, 4rem);
          margin-bottom: clamp(3rem, 5vw, 4rem);
        }

        .forma-page .footer__logo {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          display: block;
          margin-bottom: 1rem;
        }

        .forma-page .footer__tagline {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.6;
          max-width: 280px;
        }

        .forma-page .footer__col h4 {
          font-family: var(--font-heading);
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 1.2rem;
        }

        .forma-page .footer__col a {
          display: block;
          font-size: 0.85rem;
          color: var(--text-muted);
          padding: 0.35rem 0;
          transition: color 0.3s ease;
        }

        .forma-page .footer__col a:hover {
          color: var(--accent);
        }

        .forma-page .footer__bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 2rem;
          border-top: 1px solid var(--border);
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .forma-page .footer__bottom a {
          color: var(--text-muted);
          transition: color 0.3s ease;
        }

        .forma-page .footer__bottom a:hover {
          color: var(--accent);
        }

        .forma-page .divider {
          position: relative;
          z-index: 2;
          background: transparent;
          padding: 0;
          height: 1px;
        }

        .forma-page .divider__line {
          width: 100%;
          height: 1px;
          background: var(--border);
          position: relative;
        }

        .forma-page .divider__dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--accent);
          opacity: 0.4;
        }

        .forma-page .studio-addon {
          background: transparent;
          border-top: 1px solid var(--border);
          border-bottom: none;
        }

        .forma-page .studio-addon + .studio-addon {
          border-top: none;
        }

        .forma-page .studio-addon__kicker {
          margin: 0 0 0.8rem;
          font-size: 0.67rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: var(--accent);
          font-weight: 700;
        }

        .forma-page .studio-addon__hero {
          display: grid;
          grid-template-columns: 0.9fr 1.6fr 0.5fr;
          gap: 1rem;
          align-items: stretch;
        }

        .forma-page .studio-addon__intro,
        .forma-page .studio-addon__metric,
        .forma-page .studio-addon__stage {
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-panel);
          background: linear-gradient(160deg, var(--surface), var(--surface-strong));
          box-shadow: 0 18px 42px rgba(0, 0, 0, 0.22);
        }

        .forma-page .studio-addon__intro {
          padding: 1.3rem;
          display: flex;
          flex-direction: column;
        }

        .forma-page .studio-addon__intro h3 {
          margin: 0 0 0.9rem;
          font-family: var(--font-heading);
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          letter-spacing: -0.034em;
          line-height: 0.95;
        }

        .forma-page .studio-addon__intro p {
          margin: 0;
          color: var(--text-muted);
          font-size: 0.86rem;
          line-height: 1.7;
        }

        .forma-page .studio-addon__links {
          margin-top: auto;
          padding-top: 1rem;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .forma-page .studio-addon__links a {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--text);
          font-weight: 600;
        }

        .forma-page .studio-addon__stage {
          position: relative;
          overflow: hidden;
          min-height: 430px;
        }

        .forma-page .studio-addon__stage img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(1);
        }

        .forma-page .studio-addon__stage-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(14, 20, 30, 0.86), rgba(14, 20, 30, 0.14) 56%);
        }

        .forma-page .studio-addon__meta {
          position: absolute;
          left: 1rem;
          right: 1rem;
          bottom: 1rem;
        }

        .forma-page .studio-addon__meta span {
          display: inline-block;
          border: 1px solid rgba(240, 237, 230, 0.32);
          padding: 0.22rem 0.6rem;
          font-size: 0.62rem;
          text-transform: uppercase;
          letter-spacing: 0.13em;
          margin-bottom: 0.4rem;
        }

        .forma-page .studio-addon__meta h4 {
          margin: 0 0 0.25rem;
          font-family: var(--font-heading);
          font-size: 1.3rem;
          letter-spacing: -0.02em;
        }

        .forma-page .studio-addon__meta p {
          margin: 0;
          font-size: 0.82rem;
          color: rgba(240, 237, 230, 0.78);
        }

        .forma-page .studio-addon__controls {
          position: absolute;
          right: 0.9rem;
          top: 0.9rem;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          border: 1px solid rgba(240, 237, 230, 0.2);
          background: rgba(16, 22, 33, 0.7);
          padding: 0.22rem;
        }

        .forma-page .studio-addon__controls--inline {
          position: static;
        }

        .forma-page .studio-addon__controls span {
          font-size: 0.66rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(240, 237, 230, 0.84);
          padding: 0 0.45rem;
          white-space: nowrap;
        }

        .forma-page .studio-addon__controls button {
          width: 30px;
          height: 30px;
          border: 1px solid rgba(240, 237, 230, 0.22);
          background: rgba(240, 237, 230, 0.08);
          color: var(--text);
          transition: all 0.25s ease;
        }

        .forma-page .studio-addon__controls button:hover {
          background: var(--accent);
          border-color: var(--accent);
          color: var(--bg);
        }

        .forma-page .studio-addon__metric {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
        }

        .forma-page .studio-addon__metric p {
          margin: 0 0 0.35rem;
          font-size: 0.62rem;
          text-transform: uppercase;
          letter-spacing: 0.17em;
          color: var(--text-muted);
        }

        .forma-page .studio-addon__metric strong {
          font-family: var(--font-heading);
          font-size: clamp(2.4rem, 5vw, 4rem);
          line-height: 0.9;
          letter-spacing: -0.04em;
        }

        .forma-page .studio-addon__explore {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .forma-page .studio-addon__explore-images {
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-panel);
          background: linear-gradient(160deg, var(--surface), var(--surface-strong));
          overflow: hidden;
          padding: 1rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.8rem;
        }

        .forma-page .studio-addon__explore-images img {
          width: 100%;
          height: 300px;
          object-fit: cover;
          filter: grayscale(1);
        }

        .forma-page .studio-addon__explore-copy {
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-panel);
          padding: 1.2rem;
          background: linear-gradient(160deg, var(--surface), var(--surface-strong));
          box-shadow: 0 18px 42px rgba(0, 0, 0, 0.22);
          display: flex;
          flex-direction: column;
        }

        .forma-page .studio-addon__explore-copy h3 {
          margin: 0;
          font-family: var(--font-heading);
          font-size: clamp(2rem, 5.6vw, 3.4rem);
          line-height: 0.9;
          letter-spacing: -0.035em;
          text-transform: uppercase;
        }

        .forma-page .studio-addon__explore-copy h4 {
          margin: 0.5rem 0 0.75rem;
          font-size: 1.05rem;
          color: var(--text-muted);
        }

        .forma-page .studio-addon__explore-copy p {
          margin: 0;
          line-height: 1.75;
          color: var(--text-muted);
          font-size: 0.86rem;
          max-width: 480px;
        }

        .forma-page .studio-addon__explore-footer {
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
          display: flex;
          gap: 0.9rem;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
        }

        .forma-page .studio-addon__button {
          border: 1px solid var(--surface-border);
          border-radius: 999px;
          padding: 0.5rem 0.9rem;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.13em;
          font-weight: 700;
          color: var(--text);
          background: rgba(255, 255, 255, 0.01);
          transition: border-color 0.25s ease, color 0.25s ease, background 0.25s ease;
        }

        .forma-page .studio-addon__button:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(201, 131, 90, 0.08);
        }

        .forma-page .studio-addon__split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .forma-page .studio-addon__panel,
        .forma-page .studio-addon__image {
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-panel);
          background: linear-gradient(160deg, var(--surface), var(--surface-strong));
          box-shadow: 0 18px 42px rgba(0, 0, 0, 0.22);
        }

        .forma-page .studio-addon__panel {
          padding: 1.25rem;
        }

        .forma-page .studio-addon__panel h3 {
          margin: 0 0 0.6rem;
          font-family: var(--font-heading);
          text-transform: uppercase;
          letter-spacing: -0.034em;
          font-size: clamp(1.7rem, 3.1vw, 2.45rem);
        }

        .forma-page .studio-addon__panel h4 {
          margin: 0 0 0.6rem;
          font-size: 1rem;
        }

        .forma-page .studio-addon__panel > p {
          margin: 0;
          font-size: 0.86rem;
          color: var(--text-muted);
          line-height: 1.7;
        }

        .forma-page .studio-addon__facts {
          margin-top: 1rem;
          padding-top: 0.9rem;
          border-top: 1px solid var(--border);
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.7rem;
        }

        .forma-page .studio-addon__facts span {
          display: block;
          margin-bottom: 0.2rem;
          font-size: 0.62rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--accent);
          font-weight: 700;
        }

        .forma-page .studio-addon__facts strong {
          font-family: var(--font-heading);
          font-size: 1.1rem;
        }

        .forma-page .studio-addon__image img {
          width: 100%;
          height: 100%;
          min-height: 360px;
          object-fit: cover;
          filter: grayscale(1);
        }

        .forma-page .studio-addon__split--method .studio-addon__panel .studio-addon__list {
          margin-top: 0.9rem;
          border-top: 1px solid var(--border);
        }

        .forma-page .studio-addon__list > div {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0.8rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border);
        }

        .forma-page .studio-addon__list span {
          font-size: 0.66rem;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: 0.13em;
          margin-top: 0.2rem;
        }

        .forma-page .studio-addon__list p {
          margin: 0;
          color: var(--text-muted);
          font-size: 0.83rem;
          line-height: 1.55;
        }

        .forma-page .studio-addon__head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.95rem;
        }

        .forma-page .studio-addon__head h3 {
          margin: 0;
          font-family: var(--font-heading);
          text-transform: uppercase;
          font-size: clamp(1.75rem, 3.8vw, 2.7rem);
          letter-spacing: -0.034em;
        }

        .forma-page .studio-addon__cards {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.8rem;
        }

        .forma-page .studio-addon__cards article {
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-panel);
          padding: 1rem;
          background: linear-gradient(160deg, var(--surface), var(--surface-strong));
          transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .forma-page .studio-addon__cards article:hover {
          transform: translateY(-3px);
          border-color: color-mix(in oklab, var(--accent) 56%, var(--border) 44%);
        }

        .forma-page .studio-addon__cards article p {
          margin: 0 0 0.45rem;
          font-size: 0.62rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--accent);
          font-weight: 700;
        }

        .forma-page .studio-addon__cards article h4 {
          margin: 0 0 0.7rem;
          font-size: 0.96rem;
          line-height: 1.45;
        }

        .forma-page .studio-addon__cards article a {
          font-size: 0.66rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--text-muted);
          font-weight: 700;
        }

        .forma-page .studio-addon__journal {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .forma-page .studio-addon__journal-feature {
          position: relative;
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-panel);
          min-height: 460px;
          overflow: hidden;
          box-shadow: 0 18px 42px rgba(0, 0, 0, 0.22);
        }

        .forma-page .studio-addon__journal-feature img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(1);
        }

        .forma-page .studio-addon__journal-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(14, 20, 30, 0.9), rgba(14, 20, 30, 0.16));
        }

        .forma-page .studio-addon__journal-content {
          position: absolute;
          left: 1rem;
          right: 1rem;
          bottom: 1rem;
        }

        .forma-page .studio-addon__journal-content span {
          display: inline-block;
          margin-bottom: 0.5rem;
          border: 1px solid rgba(240, 237, 230, 0.3);
          padding: 0.2rem 0.55rem;
          font-size: 0.61rem;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .forma-page .studio-addon__journal-content h3 {
          margin: 0 0 0.45rem;
          font-family: var(--font-heading);
          text-transform: uppercase;
          font-size: clamp(1.7rem, 3.8vw, 2.55rem);
          line-height: 0.95;
          letter-spacing: -0.034em;
        }

        .forma-page .studio-addon__journal-content p {
          margin: 0;
          font-size: 0.84rem;
          color: rgba(240, 237, 230, 0.78);
          line-height: 1.65;
        }

        .forma-page .studio-addon__journal-list {
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-panel);
          background: linear-gradient(160deg, var(--surface), var(--surface-strong));
          box-shadow: 0 18px 42px rgba(0, 0, 0, 0.22);
          overflow: hidden;
        }

        .forma-page .studio-addon__journal-list header {
          padding: 0.95rem 1rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .forma-page .studio-addon__journal-list header h3 {
          margin: 0;
          text-transform: uppercase;
          font-family: var(--font-heading);
          font-size: clamp(1.4rem, 3vw, 2.1rem);
          letter-spacing: -0.03em;
        }

        .forma-page .studio-addon__journal-list article {
          padding: 0.9rem 1rem;
          border-bottom: 1px solid var(--border);
        }

        .forma-page .studio-addon__journal-list article:last-child {
          border-bottom: none;
        }

        .forma-page .studio-addon__journal-list article p:first-child {
          margin: 0 0 0.35rem;
          font-size: 0.61rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--accent);
          font-weight: 700;
        }

        .forma-page .studio-addon__journal-list article h4 {
          margin: 0 0 0.32rem;
          font-size: 0.95rem;
          letter-spacing: -0.01em;
        }

        .forma-page .studio-addon__journal-list article p:last-child {
          margin: 0;
          font-size: 0.81rem;
          line-height: 1.6;
          color: var(--text-muted);
        }

        @media (max-width: 1024px) {
          .forma-page .studio-addon__hero {
            grid-template-columns: 1fr 1.2fr;
          }

          .forma-page .studio-addon__metric {
            display: none;
          }

          .forma-page .studio-addon__cards {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .forma-page .about__grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }

          .forma-page .process__grid {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }

          .forma-page .footer__grid {
            grid-template-columns: 1fr 1fr;
            gap: 2.5rem;
          }

          .forma-page .work__grid {
            grid-template-columns: repeat(6, minmax(0, 1fr));
            grid-auto-rows: 72px;
          }

          .forma-page .work__item--hero,
          .forma-page .work__item--wide {
            grid-column: span 6;
            grid-row: span 3;
          }

          .forma-page .work__item--portrait,
          .forma-page .work__item--tall {
            grid-column: span 3;
            grid-row: span 4;
          }

          .forma-page .work__item--medium {
            grid-column: span 3;
            grid-row: span 3;
          }

          .forma-page .section__bg-number {
            font-size: clamp(8rem, 18vw, 14rem);
          }
        }

        @media (max-width: 768px) {
          .forma-page .section--lab .process__item:nth-child(odd),
          .forma-page .section--lab .process__item:nth-child(even) {
            transform: none;
          }

          .forma-page .studio-addon__hero,
          .forma-page .studio-addon__explore,
          .forma-page .studio-addon__split,
          .forma-page .studio-addon__journal {
            grid-template-columns: 1fr;
          }

          .forma-page .studio-addon__stage,
          .forma-page .studio-addon__journal-feature {
            min-height: 360px;
          }

          .forma-page .studio-addon__explore-images {
            grid-template-columns: 1fr;
          }

          .forma-page .studio-addon__explore-images img {
            height: 220px;
          }

          .forma-page .studio-addon__cards {
            grid-template-columns: 1fr;
          }

          .forma-page .nav__links,
          .forma-page .nav__cta {
            display: none;
          }

          .forma-page .nav__toggle {
            display: block;
          }

          .forma-page .hero {
            padding: 7rem 0 3rem;
          }

          .forma-page .hero__visual-fallback {
            right: -0.5rem;
            width: clamp(220px, 44vw, 300px);
            opacity: 0.48;
            transform: translateY(-54%);
          }

          .forma-page .hero__subtitle {
            max-width: 100%;
          }

          .forma-page .hero__label {
            margin-bottom: 1.5rem;
          }

          .forma-page .hero__session {
            grid-template-columns: 1fr;
            max-width: 100%;
          }

          .forma-page .about__stats {
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
          }

          .forma-page .process__grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }

          .forma-page .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .forma-page .work__stage {
            border-radius: 18px;
            padding: 0.75rem;
          }

          .forma-page .work__grid {
            grid-template-columns: 1fr;
            grid-auto-rows: auto;
          }

          .forma-page .work__item--hero,
          .forma-page .work__item--portrait,
          .forma-page .work__item--tall,
          .forma-page .work__item--medium,
          .forma-page .work__item--wide {
            grid-column: span 1;
            grid-row: span 1;
            min-height: clamp(220px, 55vw, 320px);
          }

          .forma-page .work__overlay,
          .forma-page .work__arrow,
          .forma-page .work__number {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }

          .forma-page .testimonial {
            padding: 0 0.5rem;
          }

          .forma-page .services__item:hover {
            transform: none;
          }

          .forma-page .services__tags {
            display: none;
          }

          .forma-page .footer__grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .forma-page .section__bg-number {
            font-size: clamp(6rem, 16vw, 10rem);
          }

          .forma-page .stories-intro {
            max-width: 100%;
          }
        }

        @media (max-width: 480px) {
          .forma-page .studio-addon__stage,
          .forma-page .studio-addon__journal-feature {
            min-height: 280px;
          }

          .forma-page .studio-addon__controls {
            right: 0.55rem;
            top: 0.55rem;
          }

          .forma-page .hero__title {
            font-size: clamp(2.5rem, 13vw, 4rem);
          }

          .forma-page .hero__visual-fallback {
            display: none;
          }

          .forma-page .hero__subtitle {
            font-size: 0.9rem;
            margin-bottom: 2rem;
          }

          .forma-page .hero__chips span {
            font-size: 0.54rem;
          }

          .forma-page .about__title {
            font-size: clamp(1.5rem, 6vw, 2rem);
          }

          .forma-page .about__stats {
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          .forma-page .stat {
            padding: 1rem 0.9rem;
          }

          .forma-page .stat__number {
            font-size: clamp(1.8rem, 8vw, 2.5rem);
          }

          .forma-page .work__item--hero,
          .forma-page .work__item--portrait,
          .forma-page .work__item--tall,
          .forma-page .work__item--medium,
          .forma-page .work__item--wide {
            min-height: 220px;
          }

          .forma-page .work__overlay {
            padding: 1.2rem;
          }

          .forma-page .work__pills span {
            font-size: 0.5rem;
          }

          .forma-page .work__title {
            font-size: 1.1rem;
          }

          .forma-page .work__desc {
            font-size: 0.75rem;
          }

          .forma-page .services__number {
            min-width: 2rem;
          }

          .forma-page .services__title {
            font-size: 1.1rem;
          }

          .forma-page .cta {
            padding: clamp(4rem, 10vw, 6rem) 0;
          }

          .forma-page .cta__title {
            font-size: clamp(2rem, 11vw, 3.5rem);
            margin-bottom: 2rem;
          }

          .forma-page .btn--large {
            width: 100%;
            justify-content: center;
            padding: 1rem 1.5rem;
            font-size: 0.9rem;
          }

          .forma-page .testimonial__text {
            font-size: 1.05rem;
            line-height: 1.6;
          }

          .forma-page .testimonial__mark {
            font-size: 4rem;
          }

          .forma-page .footer__bottom {
            flex-direction: column;
            gap: 0.6rem;
            text-align: center;
          }

          .forma-page .section__bg-number {
            font-size: clamp(4rem, 14vw, 7rem);
            opacity: 0.015;
          }
        }

        @media (hover: none) {
          .forma-page .work__item:hover {
            transform: none;
            box-shadow: none;
          }

          .forma-page .services__item:hover {
            transform: none;
          }

          .forma-page .services__item:hover .services__title {
            color: inherit;
          }

          .forma-page .services__item:hover .services__arrow {
            color: var(--text-muted);
            transform: none;
          }

          .forma-page .services__item.is-active .services__title {
            color: var(--accent);
          }

          .forma-page .services__item.is-active .services__arrow {
            color: var(--accent);
            transform: rotate(45deg);
          }

          .forma-page .work__item:hover .work__image {
            transform: none;
          }

          .forma-page .work__overlay,
          .forma-page .work__arrow,
          .forma-page .work__number {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }

          .forma-page .nav__cta:hover {
            background: transparent;
            border-color: var(--border);
            color: inherit;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .forma-page *,
          .forma-page *::before,
          .forma-page *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
}
