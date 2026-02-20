import FAQ from '@/components/shadcn-studio/blocks/faq-component-12/faq-component-12'

const faqItems = [
  {
    question: 'What does your company do?',
    answer:
      "Our company specializes in delivering high-quality solutions that are tailored to meet the evolving needs of businesses and individuals. Whether it's a digital product, a creative service, or a custom solution.",
    linkText: 'Learn more'
  },
  {
    question: 'Do you offer custom packages?',
    answer:
      "Yes, we believe that one size doesn't fit all. Every client and project is unique, so we offer flexible, customizable packages that can be tailored to your specific needs, goals, and budget.",
    linkText: 'Learn more'
  },
  {
    question: 'What is your pricing structure?',
    answer:
      "Absolutely. We believe that long-term support is just as important as the initial launch. That's why we offer ongoing maintenance, updates, and support services to make sure everything runs smoothly after your project goes live.",
    linkText: 'Learn more'
  },
  {
    question: 'How do you handle project timelines?',
    answer:
      'We work closely with our clients to establish realistic timelines based on project scope and complexity. Our agile approach allows for flexibility while maintaining quality standards.',
    linkText: 'Learn more'
  },
  {
    question: 'What makes your service unique?',
    answer:
      'Our personalized approach, attention to detail, and commitment to long-term client relationships set us apart. We focus on understanding your business goals first.',
    linkText: 'Learn more'
  },
  {
    question: 'Do you provide ongoing support?',
    answer:
      'Yes, we offer comprehensive post-launch support including maintenance, updates, troubleshooting, and feature enhancements to ensure your solution continues to perform optimally.',
    linkText: 'Learn more'
  }
]

const FAQPage = () => {
  return <FAQ faqItems={faqItems} />
}

export default FAQPage
