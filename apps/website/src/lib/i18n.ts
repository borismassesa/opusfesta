import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: process.env.NEXT_PUBLIC_I18N_DEBUG === "true",
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: {
          nav: {
            planning: "Planning Tools",
            vendors: "Vendors",
            guests: "Guests",
            websites: "Websites",
            inspiration: "Advice & Ideas",
            attireAndRings: "Attire & Rings",
            login: "Log In",
            getStarted: "Get Started"
          },
          hero: {
            headline: {
              prefix: "Plan Less,",
              celebrate: "Celebrate More.",
              stress: "Stress Less.",
              dream: "Dream Bigger.",
              party: "Party Harder."
            },
            subhead: "The all-in-one marketplace for venues, vendors, and planning tools. Discover inspiration and manage every detail in one place.",
            search: "Search",
            browse: "Browse",
            searchPlaceholder: "Search...",
            searchPlaceholders: {
              venues: "Search for rustic barns, beach resorts...",
              vendors: "Search photographers, florists, planners...",
              planning: "Search checklists, guest lists, budgets...",
              inspiration: "Search real weddings, style guides..."
            },
            join: "Join {{countVal}}+ couples planning today",
            typing: ["Celebrate More.", "Stress Less.", "Dream Bigger.", "Party Harder."]
          },
          tabs: {
            venues: "Venues",
            vendors: "Vendors",
            planning: "Planning Tools",
            inspiration: "Advice & Ideas"
          },
          about: {
            title: "About Us",
            headline: [
              { text: "We are a planning", highlight: true },
              { text: "intelligence engine" },
              { text: "dedicated to" },
              { text: "transforming how" },
              { text: "couples" },
              { text: "visualize", highlight: true },
              { text: "their big day.", highlight: true },
              { text: "With a team of" },
              { text: "planners, engineers," },
              { text: "and artists, we build" },
              { text: "tools that empower" },
              { text: "ambitious couples", highlight: true },
              { text: "to design, organize," },
              { text: "and celebrate at the" },
              { text: "speed of" },
              { text: "love.", highlight: true, italic: true }
            ],
            stats: {
              weddings: "Weddings Planned",
              satisfaction: "Couple Satisfaction",
              guests: "Guests Managed",
              rating: "Average Rating"
            },
            featured: "Featured in & Trusted By"
          }
        }
      },
      sw: {
        translation: {
          nav: {
            planning: "Zana za Mipango",
            vendors: "Wauzaji",
            guests: "Wageni",
            websites: "Tovuti",
            inspiration: "Hamasa",
            attireAndRings: "Mavazi & Pete",
            login: "Ingia",
            getStarted: "Anza Sasa"
          },
          hero: {
            headline: {
              prefix: "Punguza Mipango,",
              celebrate: "Sherehekea Zaidi.",
              stress: "Punguza Mawazo.",
              dream: "Ota Ndoto Kubwa.",
              party: "Sherehekea Sana."
            },
            subhead: "Soko la kila kitu kwa ajili yaumbi, wauzaji, na zana za kupanga. Gundua hamasa na simamia kila undani mahali pamoja.",
            search: "Tafuta",
            browse: "Vinjari",
            searchPlaceholder: "Tafuta...",
            searchPlaceholders: {
              venues: "Tafuta ukumbi, bustani, fukwe...",
              vendors: "Tafuta wapiga picha, wapambaji, wapangaji...",
              planning: "Tafuta orodha ya mambo, wageni, bajeti...",
              inspiration: "Tafuta harusi za kweli, mitindo..."
            },
            join: "Jiunge na wanandoa {{countVal}}+ wanaopanga leo",
            typing: ["Sherehekea Zaidi.", "Punguza Mawazo.", "Ota Ndoto Kubwa.", "Sherehekea Sana."]
          },
          tabs: {
            venues: "Ukumbi",
            vendors: "Wauzaji",
            planning: "Zana za Mipango",
            inspiration: "Hamasa"
          },
          about: {
            title: "Kuhusu Sisi",
            headline: [
              { text: "Sisi ni injini", highlight: true },
              { text: "ya kupanga mipango" },
              { text: "iliyojitolea" },
              { text: "kubadilisha jinsi" },
              { text: "wanandoa" },
              { text: "wanavyoona", highlight: true },
              { text: "siku yao kuu.", highlight: true },
              { text: "Pamoja na timu ya" },
              { text: "wapangaji, wahandisi," },
              { text: "na wasanii, tunajenga" },
              { text: "zana zinazowawezesha" },
              { text: "wanandoa wenye malengo", highlight: true },
              { text: "kubuni, kupanga," },
              { text: "na kusherehekea kwa" },
              { text: "kasi ya" },
              { text: "upendo.", highlight: true, italic: true }
            ],
            stats: {
              weddings: "Harusi Zilizopangwa",
              satisfaction: "Kuridhika kwa Wanandoa",
              guests: "Wageni Waliosimamiwa",
              rating: "Wastani wa Ukadiriaji"
            },
            featured: "Inaangaziwa na Kuaminiwa Na"
          }
        }
      }
    }
  });

export default i18n;
