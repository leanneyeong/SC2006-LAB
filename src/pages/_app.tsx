import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import Head from "next/head";
import { useEffect } from "react";

import { api } from "~/utils/api";
import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "~/components/ui/sonner";

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <ClerkProvider>
      <Head>
        <link rel="icon" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        storageKey="theme"
      >
        <Component {...pageProps} />
        <Toaster />
      </ThemeProvider>
    </ClerkProvider>
  );
};


export default api.withTRPC(MyApp);