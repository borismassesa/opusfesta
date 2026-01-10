-- Seed data for Careers - Job Postings
-- This populates the database with sample job postings for testing and development

-- Insert sample job postings
INSERT INTO job_postings (
  id,
  title,
  department,
  location,
  employment_type,
  description,
  requirements,
  responsibilities,
  salary_range,
  is_active
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Senior Software Engineer',
    'Engineering',
    'Dar es Salaam, Tanzania',
    'Full-time',
    'We are looking for an experienced Software Engineer to join our growing engineering team. You will work on building scalable features for our event planning platform, collaborating with a talented team of designers and product managers.',
    ARRAY[
      '5+ years of experience in software development',
      'Strong proficiency in TypeScript, React, and Node.js',
      'Experience with PostgreSQL and database design',
      'Familiarity with cloud platforms (AWS, Vercel)',
      'Excellent problem-solving and communication skills'
    ],
    ARRAY[
      'Design and implement new features for our platform',
      'Collaborate with cross-functional teams',
      'Write clean, maintainable, and well-tested code',
      'Participate in code reviews and technical discussions',
      'Mentor junior developers'
    ],
    'TZS 3,000,000 - TZS 5,000,000',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Product Designer',
    'Design',
    'Dar es Salaam, Tanzania',
    'Full-time',
    'Join our design team to create beautiful, intuitive experiences for couples planning their special events. You will work closely with product managers and engineers to bring designs to life.',
    ARRAY[
      '3+ years of product design experience',
      'Strong portfolio showcasing UX/UI design skills',
      'Proficiency in Figma, Sketch, or similar tools',
      'Experience with user research and testing',
      'Understanding of web and mobile design principles'
    ],
    ARRAY[
      'Create user flows, wireframes, and high-fidelity designs',
      'Conduct user research and usability testing',
      'Collaborate with engineers to implement designs',
      'Maintain and evolve our design system',
      'Present design work to stakeholders'
    ],
    'TZS 2,500,000 - TZS 4,000,000',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'Marketing Manager',
    'Marketing',
    'Dar es Salaam, Tanzania',
    'Full-time',
    'We are seeking a creative and data-driven Marketing Manager to lead our marketing efforts and help grow OpusFesta brand across Tanzania and East Africa.',
    ARRAY[
      '5+ years of marketing experience',
      'Experience with digital marketing channels',
      'Strong analytical and data interpretation skills',
      'Excellent written and verbal communication',
      'Experience managing marketing campaigns and budgets'
    ],
    ARRAY[
      'Develop and execute marketing strategies',
      'Manage social media and content marketing',
      'Plan and execute marketing campaigns',
      'Analyze marketing metrics and optimize performance',
      'Build partnerships with influencers and media'
    ],
    'TZS 2,800,000 - TZS 4,500,000',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004',
    'Customer Success Specialist',
    'Customer Success',
    'Remote',
    'Full-time',
    'Help our customers succeed by providing exceptional support and guidance. You will be the bridge between our users and our product, ensuring they have the best experience possible.',
    ARRAY[
      '2+ years of customer support or success experience',
      'Excellent communication and problem-solving skills',
      'Empathetic and patient approach to customer issues',
      'Familiarity with CRM tools',
      'Ability to work independently and in a team'
    ],
    ARRAY[
      'Respond to customer inquiries via email and chat',
      'Onboard new customers and provide training',
      'Gather customer feedback and share insights',
      'Identify upsell and expansion opportunities',
      'Maintain high customer satisfaction scores'
    ],
    'TZS 1,800,000 - TZS 2,800,000',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440005',
    'Sales Development Representative',
    'Sales',
    'Dar es Salaam, Tanzania',
    'Full-time',
    'Join our sales team to help grow our vendor network and connect with event professionals across Tanzania. This is a great opportunity to build your sales career in a fast-growing startup.',
    ARRAY[
      '1+ years of sales or business development experience',
      'Strong communication and interpersonal skills',
      'Goal-oriented and self-motivated',
      'Comfortable with cold outreach and prospecting',
      'Basic understanding of CRM systems'
    ],
    ARRAY[
      'Prospect and qualify new vendor leads',
      'Conduct outreach via email, phone, and social media',
      'Schedule and conduct discovery calls',
      'Maintain accurate records in CRM',
      'Collaborate with sales team to close deals'
    ],
    'TZS 1,500,000 - TZS 2,500,000 + Commission',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440006',
    'Product Manager',
    'Product',
    'Dar es Salaam, Tanzania',
    'Full-time',
    'Lead product initiatives that help couples plan their perfect events. You will work closely with engineering, design, and business teams to define and deliver features that delight our users.',
    ARRAY[
      '3+ years of product management experience',
      'Strong analytical and problem-solving skills',
      'Experience with agile development methodologies',
      'Excellent communication and stakeholder management',
      'Technical background or understanding preferred'
    ],
    ARRAY[
      'Define product strategy and roadmap',
      'Write detailed product requirements',
      'Work with engineering and design teams',
      'Analyze user data and feedback',
      'Prioritize features and manage product backlog'
    ],
    'TZS 3,500,000 - TZS 5,500,000',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440007',
    'Operations Coordinator',
    'Operations',
    'Dar es Salaam, Tanzania',
    'Full-time',
    'Support our operations team in ensuring smooth day-to-day operations. You will work on various projects to improve efficiency and support our growing team.',
    ARRAY[
      '2+ years of operations or administrative experience',
      'Strong organizational and multitasking skills',
      'Proficiency with office software and tools',
      'Attention to detail and problem-solving ability',
      'Excellent communication skills'
    ],
    ARRAY[
      'Coordinate team activities and events',
      'Manage office operations and supplies',
      'Support HR and administrative tasks',
      'Assist with vendor onboarding processes',
      'Maintain operational documentation'
    ],
    'TZS 1,500,000 - TZS 2,200,000',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440008',
    'Frontend Developer',
    'Engineering',
    'Remote',
    'Full-time',
    'Build beautiful, responsive user interfaces for our web platform. You will work with modern technologies like React, Next.js, and TypeScript to create exceptional user experiences.',
    ARRAY[
      '3+ years of frontend development experience',
      'Strong proficiency in React and TypeScript',
      'Experience with Next.js or similar frameworks',
      'Understanding of responsive design principles',
      'Familiarity with CSS frameworks (Tailwind CSS)'
    ],
    ARRAY[
      'Develop new user-facing features',
      'Build reusable components and libraries',
      'Optimize applications for performance',
      'Collaborate with designers and backend developers',
      'Write unit and integration tests'
    ],
    'TZS 2,200,000 - TZS 3,800,000',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440009',
    'Content Writer',
    'Marketing',
    'Remote',
    'Part-time',
    'Create engaging content that helps couples plan their events. You will write blog posts, guides, and marketing materials that resonate with our audience.',
    ARRAY[
      '2+ years of content writing experience',
      'Excellent writing and editing skills',
      'Understanding of SEO best practices',
      'Ability to write for different audiences',
      'Portfolio of published work'
    ],
    ARRAY[
      'Write blog posts and articles',
      'Create marketing copy and social media content',
      'Edit and proofread content',
      'Research topics and trends',
      'Collaborate with marketing team'
    ],
    'TZS 800,000 - TZS 1,500,000',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440010',
    'Backend Developer',
    'Engineering',
    'Dar es Salaam, Tanzania',
    'Full-time',
    'Build robust, scalable backend systems that power our platform. You will work with Node.js, PostgreSQL, and cloud infrastructure to deliver reliable services.',
    ARRAY[
      '3+ years of backend development experience',
      'Strong proficiency in Node.js and TypeScript',
      'Experience with PostgreSQL and database design',
      'Understanding of RESTful APIs and GraphQL',
      'Familiarity with cloud platforms and DevOps'
    ],
    ARRAY[
      'Design and implement API endpoints',
      'Optimize database queries and performance',
      'Implement authentication and authorization',
      'Write comprehensive tests',
      'Monitor and maintain production systems'
    ],
    'TZS 2,500,000 - TZS 4,200,000',
    true
  )
ON CONFLICT (id) DO NOTHING;
