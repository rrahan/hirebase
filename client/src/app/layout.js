import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";


export const metadata = {
  title: {
    default: "hirebase | Tech Jobs in Kerala | IT & Startup Jobs in Kerala",
    template: "%s | hirebase",
  },
  description: "Raw feed of tech opportunities across Kerala. Updated in real-time directly from company career portals. Find jobs in Technopark, Infopark, Cyberpark and Kerala startups.",
  keywords: [
    "Jobs in Kerala",
    "Tech jobs in Kochi",
    "Technopark jobs",
    "Infopark Kochi vacancies",
    "Startup jobs Kerala",
    "Software engineer jobs Kerala",
    "Frontend developer Kochi",
    "Python developer Kerala",
    "UI/UX designer Kerala",
    "Remote jobs for Keralites",
    "Fresher tech jobs Kerala",
    "Immediate joiners Kerala",
    "Direct company jobs Kerala",
  ],
  authors: [{ name: "hirebase" }],
  creator: "hirebase",
  publisher: "hirebase",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "hirebase",
    title: "Find your next role in Kerala's tech scene",
    description: "No middlemen or expired posts. A direct feed of jobs from Kerala's most ambitious teams.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "hirebase - Tech Jobs in Kerala",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech Jobs in Kerala | hirebase",
    description: "Raw feed of tech opportunities across Kerala. Updated in real-time.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
