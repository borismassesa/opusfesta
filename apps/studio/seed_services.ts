import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding services...");
  
  const services = [
    {
      title: 'Full Event Planning',
      description: 'Comprehensive planning from conceptualization to execution. Includes vendor management, design, logistics, and on-site coordination.',
      price: 'Starting at TZS 5,000,000',
      cover_image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200',
      is_active: true,
      sort_order: 1
    },
    {
      title: 'Partial Planning & Design',
      description: 'You handle the basics, we refine the vision. Perfect for hosts who have locked in a venue but need help with design and vendor alignment.',
      price: 'Starting at TZS 3,500,000',
      cover_image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1200',
      is_active: true,
      sort_order: 2
    },
    {
      title: 'Month-Of Coordination',
      description: 'Hand over the reigns 4 weeks before the event. We manage the timeline, vendors, and handle the entire event day so you can relax.',
      price: 'Starting at TZS 2,000,000',
      cover_image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200',
      is_active: true,
      sort_order: 3
    },
    {
      title: 'Styling & Floral Design',
      description: 'Bespoke aesthetic conceptualization, mood boarding, custom installations, and premium floral arrangements for your event.',
      price: 'Custom Quote',
      cover_image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200',
      is_active: true,
      sort_order: 4
    }
  ];

  for (const s of services) {
    const { error } = await supabase.from('studio_services').insert(s);
    if (error) {
      console.error('Failed to insert service:', s.title, error.message);
    } else {
      console.log('Inserted:', s.title);
    }
  }
}

seed();
