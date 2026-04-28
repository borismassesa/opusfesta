'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { FieldLabel, TextArea, TextInput } from '@/components/onboard/FormField'
import { useOnboardingDraft, type FAQItem } from '@/lib/onboarding/draft'

const SUGGESTED_QUESTIONS = [
  'How early should we book you?',
  'Do you travel outside Dar es Salaam?',
  'What’s included in your packages?',
  'How does your deposit work?',
  'Do you handle traditional ceremonies?',
  'What happens if it rains?',
  'How long until we get our final files?',
]

const newFaq = (seed?: Partial<FAQItem>): FAQItem => ({
  id:
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `faq-${Math.random().toString(36).slice(2, 10)}`,
  question: '',
  answer: '',
  ...seed,
})

export default function ListingFAQPage() {
  const { draft, update, hydrated } = useOnboardingDraft()
  const [showSuggestions, setShowSuggestions] = useState(false)

  if (!hydrated) return <div className="p-8" aria-hidden />

  const faqs = draft.faqs

  const updateFaq = (id: string, patch: Partial<FAQItem>) => {
    update({ faqs: faqs.map((f) => (f.id === id ? { ...f, ...patch } : f)) })
  }

  const addFaq = (question?: string) => {
    update({ faqs: [...faqs, newFaq({ question: question ?? '' })] })
  }

  const removeFaq = (id: string) => {
    update({ faqs: faqs.filter((f) => f.id !== id) })
  }

  const usedSuggestions = new Set(faqs.map((f) => f.question.trim()))
  const availableSuggestions = SUGGESTED_QUESTIONS.filter(
    (q) => !usedSuggestions.has(q),
  )

  return (
    <div className="px-6 lg:px-10 pt-4 lg:pt-5 pb-32">
      <div className="max-w-4xl">
        {/* Suggestions */}
        {availableSuggestions.length > 0 ? (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 lg:p-7">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-base font-semibold text-gray-900 tracking-tight">
                Suggested questions
              </h2>
              <button
                type="button"
                onClick={() => setShowSuggestions((v) => !v)}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900"
              >
                {showSuggestions ? 'Hide' : 'Show all'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Click to add — you can edit the answer afterwards.
            </p>
            <div className="flex flex-wrap gap-2">
              {(showSuggestions ? availableSuggestions : availableSuggestions.slice(0, 4)).map(
                (q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => addFaq(q)}
                    className="inline-flex items-center gap-1.5 bg-gray-50 hover:bg-gray-900 hover:text-white border border-gray-200 hover:border-gray-900 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    {q}
                  </button>
                ),
              )}
            </div>
          </section>
        ) : null}

        {/* FAQ list */}
        <section className="mt-6">
          {faqs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                No FAQs yet. Pick a suggestion above or write your own — couples spend less time
                messaging you and more time booking.
              </p>
              <button
                type="button"
                onClick={() => addFaq()}
                className="inline-flex items-center gap-2 mt-5 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add a question
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <FaqCard
                  key={faq.id}
                  index={i + 1}
                  faq={faq}
                  onChange={(patch) => updateFaq(faq.id, patch)}
                  onRemove={() => removeFaq(faq.id)}
                />
              ))}

              <button
                type="button"
                onClick={() => addFaq()}
                className="w-full bg-white rounded-2xl border border-dashed border-gray-300 hover:border-gray-500 hover:bg-gray-50 transition-colors py-5 inline-flex items-center justify-center gap-2 text-sm font-semibold text-gray-900"
              >
                <Plus className="w-4 h-4" />
                Add another question
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function FaqCard({
  index,
  faq,
  onChange,
  onRemove,
}: {
  index: number
  faq: FAQItem
  onChange: (patch: Partial<FAQItem>) => void
  onRemove: () => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 lg:p-7">
      <div className="flex items-start justify-between gap-4 mb-4">
        <span className="inline-flex items-center bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          Question {index}
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove question"
          className="-mr-2 -mt-2 p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <FieldLabel required>Question</FieldLabel>
          <TextInput
            placeholder="e.g. How early should we book you?"
            value={faq.question}
            onChange={(e) => onChange({ question: e.target.value })}
          />
        </div>
        <div>
          <FieldLabel required>Answer</FieldLabel>
          <TextArea
            placeholder="Be specific and friendly — couples are reading this to decide."
            value={faq.answer}
            onChange={(e) => onChange({ answer: e.target.value })}
            rows={4}
          />
        </div>
      </div>
    </div>
  )
}
