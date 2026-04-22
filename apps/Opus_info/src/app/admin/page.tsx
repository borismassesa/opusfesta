import AdminClient from './AdminClient'

export const metadata = {
  title: 'Admin | OpusFesta Info',
  robots: { index: false, follow: false },
}

export default function AdminPage() {
  return <AdminClient />
}
