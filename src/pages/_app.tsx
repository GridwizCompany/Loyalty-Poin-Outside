import type { AppProps } from "next/app";
import Layout from "@/pages/components/Layout";
import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="img-src 'self' data:;"
        />
      </Head>

      <Toaster position="top-center" />

      <Component {...pageProps} />
    </Layout>
  );
}
