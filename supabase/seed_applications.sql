-- Seed data for Careers - Job Applications
-- This populates the database with sample job applications for testing and development
-- Note: This assumes job postings from seed_careers.sql already exist

-- Insert sample job applications
INSERT INTO job_applications (
  id,
  job_posting_id,
  full_name,
  email,
  phone,
  cover_letter,
  cover_letter_url,
  portfolio_url,
  linkedin_url,
  experience,
  education,
  reference_info,
  status,
  notes,
  created_at,
  updated_at
) VALUES
  (
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001', -- Senior Software Engineer
    'John Mwangi',
    'john.mwangi@example.com',
    '+255 712 345 678',
    'Dear Hiring Manager,

I am writing to express my strong interest in the Senior Software Engineer position at TheFesta. With over 6 years of experience in full-stack development, I am excited about the opportunity to contribute to your innovative event planning platform.

In my current role at TechSolutions Ltd, I have led the development of several scalable web applications using TypeScript, React, and Node.js. I am particularly drawn to TheFesta because of its mission to help couples create memorable events, and I would love to bring my technical expertise to help build features that make a real difference in people''s lives.

I am confident that my experience with modern web technologies, database design, and cloud platforms aligns well with your requirements. I look forward to discussing how I can contribute to your team.

Best regards,
John Mwangi',
    NULL, -- cover_letter_url
    'https://johnmwangi.dev',
    'https://linkedin.com/in/johnmwangi',
    'Senior Software Engineer at TechSolutions Ltd (2020 - Present)
- Led development of a microservices architecture serving 100K+ users
- Implemented CI/CD pipelines reducing deployment time by 60%
- Mentored 3 junior developers

Software Engineer at Digital Innovations (2018 - 2020)
- Built responsive web applications using React and Node.js
- Collaborated with cross-functional teams to deliver features on time
- Improved application performance by 40% through optimization

Junior Developer at StartupHub (2017 - 2018)
- Developed and maintained web applications
- Participated in code reviews and agile ceremonies',
    'BSc. Computer Science - University of Dar es Salaam (2017)
- Graduated with First Class Honors
- Relevant coursework: Data Structures, Algorithms, Database Systems, Software Engineering',
    'Dr. Sarah Kimathi
Professor, University of Dar es Salaam
Email: s.kimathi@udsm.ac.tz
Phone: +255 22 241 0000

Mr. David Ochieng
CTO, TechSolutions Ltd
Email: d.ochieng@techsolutions.co.tz
Phone: +255 713 000 000',
    'pending',
    NULL,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002', -- Product Designer
    'Amina Hassan',
    'amina.hassan@example.com',
    '+255 755 123 456',
    'Hello TheFesta Team,

I am thrilled to apply for the Product Designer position. As someone who is passionate about creating meaningful user experiences, I am excited about the opportunity to help couples plan their special events through thoughtful design.

With 4 years of experience in product design, I have worked on various projects ranging from mobile apps to web platforms. My design philosophy centers around empathy and user-centric thinking, which I believe aligns perfectly with TheFesta''s mission.

I would love to bring my skills in UX/UI design, user research, and design systems to your team. Thank you for considering my application.

Warm regards,
Amina Hassan',
    NULL, -- cover_letter_url
    'https://aminahassan.design',
    'https://linkedin.com/in/aminahassan',
    'Product Designer at Design Studio (2021 - Present)
- Designed user experiences for 5+ mobile and web applications
- Conducted user research and usability testing sessions
- Established and maintained design systems

UX Designer at Creative Agency (2019 - 2021)
- Created wireframes, prototypes, and high-fidelity designs
- Collaborated with developers to ensure design implementation
- Presented design concepts to clients and stakeholders

Junior Designer at Marketing Firm (2018 - 2019)
- Created marketing materials and social media graphics
- Assisted senior designers on various projects',
    'BFA in Graphic Design - Zanzibar University (2018)
- Specialized in Digital Design
- Portfolio featured in university exhibition',
    'Ms. Fatuma Juma
Senior Designer, Design Studio
Email: f.juma@designstudio.co.tz
Phone: +255 714 111 222',
    'reviewing',
    'Strong portfolio, good communication skills. Schedule interview.',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001', -- Senior Software Engineer
    'Peter Omondi',
    'peter.omondi@example.com',
    '+255 768 987 654',
    'Dear TheFesta Team,

I am writing to apply for the Senior Software Engineer position. With 7 years of experience building scalable applications, I am excited about the opportunity to contribute to your platform.

I have extensive experience with the technologies mentioned in your job posting and have a proven track record of delivering high-quality software solutions. I am particularly interested in working on features that directly impact user experience.

Thank you for your consideration.

Best,
Peter Omondi',
    NULL, -- cover_letter_url
    NULL, -- portfolio_url
    'https://linkedin.com/in/peteromondi',
    'Senior Software Engineer at FinTech Solutions (2019 - Present)
- Architected and implemented payment processing system
- Led team of 5 developers
- Reduced system downtime by 80%

Software Engineer at E-commerce Platform (2017 - 2019)
- Developed features for high-traffic e-commerce site
- Optimized database queries improving response time by 50%',
    'MSc. Computer Science - Makerere University (2017)
BSc. Computer Science - University of Nairobi (2015)',
    'Dr. James Otieno
Technical Lead, FinTech Solutions
Email: j.otieno@fintech.co.ke',
    'interviewed',
    'Completed technical interview. Strong candidate. Proceed to final round.',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440003', -- Marketing Manager
    'Grace Wanjiru',
    'grace.wanjiru@example.com',
    '+255 711 222 333',
    'Dear Hiring Manager,

I am excited to apply for the Marketing Manager position at TheFesta. With 6 years of experience in digital marketing, I am confident that I can help grow your brand and reach more couples planning their special events.

I have successfully managed marketing campaigns that resulted in significant growth in brand awareness and customer acquisition. I am particularly drawn to TheFesta because of its unique value proposition in the event planning space.

I look forward to discussing how I can contribute to your marketing efforts.

Sincerely,
Grace Wanjiru',
    NULL, -- cover_letter_url
    NULL, -- portfolio_url
    'https://linkedin.com/in/gracewanjiru',
    'Marketing Manager at Event Company (2020 - Present)
- Increased brand awareness by 150% through digital campaigns
- Managed marketing budget of $500K annually
- Built and managed team of 3 marketing specialists

Marketing Specialist at Startup (2018 - 2020)
- Executed social media and content marketing strategies
- Analyzed marketing metrics and optimized campaigns
- Collaborated with sales team on lead generation',
    'MBA in Marketing - Strathmore University (2018)
BCom in Marketing - University of Nairobi (2016)',
    'Mr. Michael Kariuki
CEO, Event Company
Email: m.kariuki@eventco.co.ke',
    'pending',
    NULL,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440004', -- Customer Success Specialist
    'Mary Achieng',
    'mary.achieng@example.com',
    '+255 744 555 666',
    'Hello TheFesta Team,

I am writing to express my interest in the Customer Success Specialist position. I am passionate about helping customers succeed and believe that exceptional customer support is key to building lasting relationships.

With 3 years of experience in customer support, I have developed strong communication skills and a deep understanding of customer needs. I am excited about the opportunity to help couples plan their perfect events.

Thank you for considering my application.

Best regards,
Mary Achieng',
    NULL, -- cover_letter_url
    NULL, -- portfolio_url
    NULL, -- linkedin_url
    'Customer Support Representative at SaaS Company (2021 - Present)
- Handled 50+ customer inquiries daily via email and chat
- Achieved 95% customer satisfaction rating
- Identified and escalated product issues to development team

Customer Service Agent at Retail Company (2019 - 2021)
- Assisted customers with product inquiries and issues
- Processed returns and exchanges
- Maintained positive customer relationships',
    'Diploma in Business Administration - Technical College (2019)
- Customer Service Excellence Certificate',
    'Ms. Jane Kamau
Customer Success Manager, SaaS Company
Email: j.kamau@saascompany.co.ke',
    'reviewing',
    NULL,
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440005', -- Sales Development Representative
    'James Kipchoge',
    'james.kipchoge@example.com',
    '+255 733 777 888',
    'Dear Hiring Manager,

I am excited to apply for the Sales Development Representative position. As someone who thrives in a fast-paced environment, I am eager to help grow TheFesta''s vendor network.

With 2 years of experience in sales and business development, I have a proven track record of prospecting, qualifying leads, and building relationships. I am confident that I can contribute to your sales team''s success.

I look forward to discussing this opportunity further.

Best,
James Kipchoge',
    NULL, -- cover_letter_url
    NULL, -- portfolio_url
    'https://linkedin.com/in/jameskipchoge',
    'Sales Representative at B2B Company (2022 - Present)
- Exceeded sales targets by 25% consistently
- Generated 100+ qualified leads monthly
- Conducted 20+ discovery calls per week

Business Development Intern at Startup (2021 - 2022)
- Assisted with lead generation and prospecting
- Maintained CRM records
- Participated in sales meetings and training',
    'BCom in Sales and Marketing - Moi University (2021)
- Sales Excellence Award recipient',
    'Mr. Robert Mutua
Sales Manager, B2B Company
Email: r.mutua@b2bcompany.co.ke',
    'pending',
    NULL,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440006', -- Product Manager
    'Sarah Njoroge',
    'sarah.njoroge@example.com',
    '+255 722 999 000',
    'Dear TheFesta Team,

I am writing to apply for the Product Manager position. With 4 years of experience in product management, I am excited about the opportunity to help shape the future of your platform.

I have successfully led product initiatives from conception to launch, working closely with engineering, design, and business teams. I am particularly drawn to TheFesta because of its mission to help couples create memorable events.

I would love to discuss how I can contribute to your product team.

Best regards,
Sarah Njoroge',
    NULL, -- cover_letter_url
    'https://sarahnjoroge.com',
    'https://linkedin.com/in/sarahnjoroge',
    'Product Manager at Tech Startup (2021 - Present)
- Led development of mobile app reaching 50K+ users
- Defined product roadmap and prioritized features
- Collaborated with cross-functional teams to deliver products

Associate Product Manager at Software Company (2019 - 2021)
- Wrote product requirements and user stories
- Conducted user research and analyzed data
- Managed product backlog and sprint planning',
    'MSc. Information Systems - University of Cape Town (2019)
BSc. Computer Science - University of Nairobi (2017)',
    'Ms. Linda Wambui
VP of Product, Tech Startup
Email: l.wambui@techstartup.co.ke',
    'interviewed',
    'Excellent product thinking. Strong technical background. Good cultural fit.',
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440008',
    '550e8400-e29b-41d4-a716-446655440007', -- Operations Coordinator
    'David Mwangi',
    'david.mwangi@example.com',
    '+255 755 111 222',
    'Hello,

I am interested in the Operations Coordinator position at TheFesta. With 3 years of experience in operations and administration, I am confident that I can help ensure smooth day-to-day operations.

I am organized, detail-oriented, and enjoy working on various projects to improve efficiency. I would love to contribute to your growing team.

Thank you for your consideration.

Best,
David Mwangi',
    NULL, -- cover_letter_url
    NULL, -- portfolio_url
    NULL, -- linkedin_url
    'Operations Assistant at Logistics Company (2021 - Present)
- Coordinated daily operations and logistics
- Managed inventory and supplies
- Assisted with vendor management

Administrative Assistant at Consulting Firm (2019 - 2021)
- Handled administrative tasks and office management
- Coordinated meetings and events
- Maintained documentation and records',
    'Diploma in Business Administration - Technical Institute (2019)',
    'Ms. Patricia Ochieng
Operations Manager, Logistics Company
Email: p.ochieng@logistics.co.ke',
    'pending',
    NULL,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440009',
    '550e8400-e29b-41d4-a716-446655440008', -- Frontend Developer
    'Faith Chebet',
    'faith.chebet@example.com',
    '+255 711 333 444',
    'Dear Hiring Manager,

I am excited to apply for the Frontend Developer position. As a frontend developer with 4 years of experience, I am passionate about creating beautiful and responsive user interfaces.

I have extensive experience with React, TypeScript, and Next.js, and I am always eager to learn new technologies. I am particularly drawn to TheFesta because of its focus on creating exceptional user experiences.

I look forward to discussing this opportunity.

Best regards,
Faith Chebet',
    NULL, -- cover_letter_url
    'https://faithchebet.dev',
    'https://linkedin.com/in/faithchebet',
    'Frontend Developer at Web Agency (2020 - Present)
- Built responsive web applications using React and Next.js
- Created reusable component libraries
- Optimized applications for performance

Junior Frontend Developer at Startup (2018 - 2020)
- Developed user interfaces for web applications
- Collaborated with designers and backend developers
- Wrote unit tests for components',
    'BSc. Computer Science - Kenyatta University (2018)
- Web Development specialization',
    'Mr. Brian Ochieng
Lead Developer, Web Agency
Email: b.ochieng@webagency.co.ke',
    'hired',
    'Outstanding candidate. Strong technical skills and great attitude. Offer extended.',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440009', -- Content Writer
    'Lucy Wanjala',
    'lucy.wanjala@example.com',
    '+255 744 555 777',
    'Hello TheFesta Team,

I am writing to apply for the Content Writer position. As a content writer with 3 years of experience, I am passionate about creating engaging content that resonates with audiences.

I have written blog posts, guides, and marketing materials for various clients, and I am excited about the opportunity to create content that helps couples plan their special events.

Thank you for considering my application.

Best,
Lucy Wanjala',
    NULL, -- cover_letter_url
    'https://lucywanjala.medium.com',
    'https://linkedin.com/in/lucywanjala',
    'Content Writer (Freelance) (2021 - Present)
- Written 50+ blog posts and articles for various clients
- Created social media content and marketing copy
- Conducted research on various topics

Content Writer at Marketing Agency (2019 - 2021)
- Wrote blog posts and articles for client websites
- Created email marketing campaigns
- Edited and proofread content',
    'BA in Journalism - University of Nairobi (2019)
- Writing Excellence Award',
    'Ms. Angela Muthoni
Content Manager, Marketing Agency
Email: a.muthoni@marketingagency.co.ke',
    'rejected',
    'Good writing skills but lacks experience in event planning content.',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440010', -- Backend Developer
    'Michael Otieno',
    'michael.otieno@example.com',
    '+255 733 888 999',
    'Dear TheFesta Team,

I am writing to express my interest in the Backend Developer position. With 5 years of experience building robust backend systems, I am excited about the opportunity to work on your platform.

I have extensive experience with Node.js, TypeScript, PostgreSQL, and cloud infrastructure. I am particularly interested in working on scalable systems that can handle growth.

I look forward to discussing this opportunity.

Best regards,
Michael Otieno',
    NULL, -- cover_letter_url
    NULL, -- portfolio_url
    'https://linkedin.com/in/michaelotieno',
    'Backend Developer at FinTech Company (2020 - Present)
- Designed and implemented RESTful APIs
- Optimized database queries improving performance by 60%
- Implemented authentication and authorization systems

Software Engineer at Software Company (2018 - 2020)
- Developed backend services using Node.js
- Worked with PostgreSQL and MongoDB databases
- Wrote comprehensive unit and integration tests',
    'BSc. Computer Science - Jomo Kenyatta University (2018)
- Software Engineering specialization',
    'Mr. Kevin Mwangi
Senior Engineer, FinTech Company
Email: k.mwangi@fintech.co.ke',
    'reviewing',
    NULL,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440001', -- Senior Software Engineer
    'Esther Nyambura',
    'esther.nyambura@example.com',
    '+255 722 444 555',
    'Dear Hiring Manager,

I am excited to apply for the Senior Software Engineer position. With 6 years of experience in software development, I am confident that I can contribute to your engineering team.

I have worked on various projects using TypeScript, React, and Node.js, and I am always eager to take on new challenges. I am particularly drawn to TheFesta because of its innovative approach to event planning.

Thank you for considering my application.

Best,
Esther Nyambura',
    NULL, -- cover_letter_url
    'https://esthernyambura.dev',
    'https://linkedin.com/in/esthernyambura',
    'Senior Software Engineer at E-commerce Platform (2020 - Present)
- Led development of payment processing system
- Implemented microservices architecture
- Mentored junior developers

Software Engineer at Tech Company (2018 - 2020)
- Developed features for web applications
- Participated in code reviews
- Wrote unit and integration tests',
    'MSc. Software Engineering - University of Nairobi (2018)
BSc. Computer Science - Kenyatta University (2016)',
    'Dr. Peter Kamau
Engineering Manager, E-commerce Platform
Email: p.kamau@ecommerce.co.ke',
    'pending',
    NULL,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;
