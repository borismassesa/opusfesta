// Shared Clerk <SignIn>/<SignUp> appearance for OpusPass.
//
// Strips the default Clerk card chrome (shadow / border / background / header)
// so the form sits flush on the white LEFT pane of AuthShell — mirroring the
// OpusFesta Admin and Vendors Portal two-pane auth design. We keep Clerk's
// rendered form (this app is on Clerk v7, where the component is the supported
// pattern across the ecosystem — see opus_website's sign-in) and just restyle
// it. Accent is OpusPass purple (#C9A0DC focus ring, #7E5896 links).
//
// All values are plain strings so the object stays serializable and can be
// passed from the (server-component) auth pages straight into <SignIn>.

export const authAppearance = {
  layout: { socialButtonsPlacement: 'top' as const },
  variables: {
    colorPrimary: '#1A1A1A',
    colorText: '#1A1A1A',
    colorTextSecondary: '#6B7280',
    colorDanger: '#DC2626',
    borderRadius: '0.5rem',
    fontSize: '15px',
  },
  elements: {
    rootBox: 'w-full',
    // `!` (Tailwind important) is required: Clerk's default card chrome
    // (shadow, border, rounded box, padding) otherwise wins on specificity, and
    // we want the form to sit flush on the white pane like Admin / Vendors Portal.
    cardBox: 'w-full !rounded-none !border-0 !shadow-none',
    card: 'w-full gap-6 !rounded-none !border-0 !bg-transparent !p-0 !shadow-none',
    header: 'hidden',
    headerTitle: 'hidden',
    headerSubtitle: 'hidden',
    socialButtonsBlockButton:
      'rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-[#1A1A1A] hover:bg-gray-50',
    socialButtonsBlockButtonText: 'font-medium',
    dividerLine: 'bg-gray-200',
    dividerText: 'text-xs font-medium uppercase tracking-wider text-gray-400',
    formFieldLabel: 'text-sm font-medium text-[#1A1A1A]',
    formFieldInput:
      'rounded-lg border-gray-300 px-4 py-3 text-[15px] text-[#1A1A1A] focus:border-[#C9A0DC] focus:ring-2 focus:ring-[#C9A0DC]/25',
    formFieldAction: 'font-medium text-[#7E5896] hover:underline',
    formButtonPrimary:
      'rounded-lg bg-[#1A1A1A] py-3 text-sm font-semibold normal-case shadow-none hover:bg-black',
    formFieldInputShowPasswordButton: 'text-gray-400 hover:text-gray-600',
    otpCodeFieldInput:
      'rounded-lg border-gray-300 focus:border-[#C9A0DC] focus:ring-2 focus:ring-[#C9A0DC]/25',
    footer: '!border-0 !bg-transparent !bg-none',
    footerActionText: 'text-gray-500',
    footerActionLink: 'font-medium text-[#7E5896] hover:underline',
    identityPreviewEditButton: 'text-[#7E5896]',
  },
}
