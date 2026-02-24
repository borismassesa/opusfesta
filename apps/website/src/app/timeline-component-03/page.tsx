import Process from '@/components/shadcn-studio/blocks/timeline-component-03/timeline-component-03'

const processSteps = [
  {
    icon: 'LightbulbIcon',
    title: 'Research & Ideation',
    description:
      'We start by understanding user needs, market trends, and business goals to generate innovative product ideas.',
    progress: 35,
    progressLabel: '12%',
    duration: '~1 week'
  },
  {
    icon: 'CodeIcon',
    title: 'Design & Development',
    description:
      'Concepts evolve into tangible experiences through structured UX design, polished interfaces, and agile engineering.',
    progress: 70,
    progressLabel: '75%',
    duration: '~3 weeks'
  },
  {
    icon: 'BoxIcon',
    title: 'Production & Quality Testing',
    description:
      'Each element of the product undergoes thorough validation. We test functionality, usability, accessibility, and performance.',
    progress: 80,
    progressLabel: '80%',
    duration: '~1 month'
  },
  {
    icon: 'RocketIcon',
    title: 'Launch & Support',
    description: 'Once launched, we monitor performance, resolve issues quickly, and continuously refine the product.',
    progress: 100,
    progressLabel: '100%',
    duration: 'Launch Completed'
  }
]

const ProcessPage = () => {
  return <Process steps={processSteps} />
}

export default ProcessPage
