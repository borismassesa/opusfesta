import assert from 'node:assert/strict'
import test from 'node:test'
import { buildArticleEditorExtensions } from './extensions'

test('contributor editor mode does not register a Section node', () => {
  const extensions = buildArticleEditorExtensions({ mode: 'contributor' })
  const names = extensions.map((extension) => extension.name)
  assert.equal(names.includes('section'), false)
  assert.equal(names.includes('Section'), false)
})
