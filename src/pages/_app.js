import { SessionProvider } from "next-auth/react";
import "@/styles/globals.css";
import ThemeProvider from "@/components/theme-provider";

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <SessionProvider session={pageProps.session}>
        <Component {...pageProps} />
      </SessionProvider>
    </ThemeProvider>
  );
}
