import LogoCloud from "@/components/shadcn-studio/blocks/logo-cloud-08/logo-cloud-08";

const logoColumns = [
  {
    logos: [
      {
        image: "https://cdn.shadcnstudio.com/ss-assets/brand-logo/airbnb-logo.png",
        alt: "Airbnb"
      }
    ]
  },
  {
    logos: [
      {
        image: "https://cdn.shadcnstudio.com/ss-assets/brand-logo/google-logo.png",
        alt: "Google"
      },
      {
        image: "https://cdn.shadcnstudio.com/ss-assets/brand-logo/bookmyshow-logo.png",
        alt: "Book My Show"
      }
    ],
    className: "sm:flex-col"
  },
  {
    logos: [
      {
        image: "https://cdn.shadcnstudio.com/ss-assets/brand-logo/microsoft-logo.png",
        alt: "Microsoft"
      },
      {
        image: "https://cdn.shadcnstudio.com/ss-assets/brand-logo/fedex-logo.png",
        alt: "Fedex"
      },
      {
        image: "https://cdn.shadcnstudio.com/ss-assets/brand-logo/walmart-logo.png",
        alt: "Walmart"
      }
    ],
    className: "sm:flex-col"
  },
  {
    logos: [
      {
        image: "https://cdn.shadcnstudio.com/ss-assets/brand-logo/hubspot-logo.png",
        alt: "Hubspot"
      },
      {
        image: "https://cdn.shadcnstudio.com/ss-assets/brand-logo/ola-logo.png",
        alt: "Ola"
      }
    ],
    className: "sm:flex-col"
  },
  {
    logos: [
      {
        image: "https://cdn.shadcnstudio.com/ss-assets/brand-logo/amazon-logo.png",
        alt: "Amazon"
      }
    ]
  }
];

const LogoCloudPage = () => {
  return <LogoCloud logoColumns={logoColumns} />;
};

export default LogoCloudPage;
