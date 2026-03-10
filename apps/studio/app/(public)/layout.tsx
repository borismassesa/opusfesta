import BookingModalProvider from "@/components/BookingModalProvider";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <BookingModalProvider>{children}</BookingModalProvider>;
}
