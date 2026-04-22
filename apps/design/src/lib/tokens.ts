import tokens from '../../tokens.json'

export default tokens
export { tokens }

export type BrandColor = keyof typeof tokens.color.brand
export type GrayStep = keyof typeof tokens.color.gray
export type CategoryKey = keyof typeof tokens.color.category
