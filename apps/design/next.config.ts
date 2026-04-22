import createMDX from '@next/mdx'

const withMDX = createMDX({})

export default withMDX({
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'mdx'],
})
