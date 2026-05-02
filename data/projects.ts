export type ProductPlatform = "ios" | "android" | "web";
export type ProductLaunchedItem = {
  name: string;
  description: string;
  links: { platform: ProductPlatform; url: string; comingSoon?: boolean }[];
  image: string;
  images: string[];
};

export const projects: ProductLaunchedItem[] = [
  {
    name: "Biggya",
    description: "Book Verified Experts for Real-Time Consultations.",
    image: "/biggya/home.png",
    images: ["/biggya/home.png"],
    links: [
      { platform: "web", url: "https://biggya.com" },
      { platform: "android", url: "#", comingSoon: true },
      { platform: "ios", url: "#", comingSoon: true },
    ],
  },
  {
    name: "Ekagajpatra",
    description: "Generate Government Documents for financial needs.",
    image: "/ekp/home.png",
    images: ["/ekp/home.png", "/ekp/confirmation.png"],
    links: [
      {
        platform: "web",
        url: "https://https://www.ekagajpatra.com",
      },
    ],
  },
  {
    name: "Clamphook Mobile App",
    description:
      "Mobile learning app for entrance exam preparation with Latex rendered content, online classes and payments.",
    image: "/clamphook/home.png",
    images: ["/clamphook/home.png", "/clamphook/tests.png"],
    links: [
      {
        platform: "android",
        url: "https://play.google.com/store/apps/details?id=com.clamphook.clamphook",
      },
      {
        platform: "ios",
        url: "https://apps.apple.com/np/app/clamphook-academy/id6737482974",
      },
    ],
  },
  {
    name: "Production Ready Ecommerce",
    description:
      "Production-ready e-commerce implementation with Next.js, Tailwind CSS, and Stripe integration.",
    image: "/ecom/landing.png",
    images: [
      "/ecom/landing.png",
      "/ecom/collections.png",
      "/ecom/product-detials.png",
      "/ecom/checkout.png",
      "/ecom/manage-account.png",
    ],
    links: [
      {
        platform: "web",
        url: "https://ecom.roopaish.com",
      },
    ],
  },
  {
    name: "Real-Estate Platform",
    description:
      "Real-estate listing and management platform with admin dashboard.",
    image: "/real-estate/landing.png",
    images: [
      "/real-estate/landing.png",
      "/real-estate/property-details.png",
      "/real-estate/add-property.png",
      "/real-estate/account.png",
      "/real-estate/admin-property-management.png",
    ],
    links: [
      {
        platform: "web",
        url: "https://real-estate.roopaish.com",
      },
    ],
  },
  {
    name: "Aagaman",
    description:
      "Restaurant discovery and pre-booking mobile app with real-time availability.",
    image: "/aagaman/home.png",
    images: [
      "/aagaman/home.png",
      "/aagaman/search.png",
      "/aagaman/bookings.png",
    ],
    links: [
      {
        platform: "android",
        url: "https://play.google.com/store/apps/details?id=com.aagaman.bookingapp",
      },
    ],
  },
  {
    name: "Menzz",
    description: "E-commerce platform for men grooming products.",
    image: "/menzz/home.png",
    images: ["/menzz/home.png", "/menzz/product-details.png"],
    links: [
      {
        platform: "web",
        url: "https://menzz.co",
      },
    ],
  },
];
