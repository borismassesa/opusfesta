import { redirect } from 'next/navigation'

// Couple dashboard is unified on OpusPass — hand off there (see my/dashboard).
export default function MyPage() {
  redirect('/opuspass/my/dashboard')
}
