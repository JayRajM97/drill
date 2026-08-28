import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// Web HTML shell — the single place for page metadata (Expo Router web).
const TITLE = 'Drill — Practice interview cases one at a time';
const DESCRIPTION =
  'Drill is a flashcard-style practice app for management interviews. Work through real case studies card by card — framework, clarifying questions, users, key pointers, then the full answer — and keep the numbers every PM should know at your fingertips.';
const URL = 'https://drill-inky.vercel.app';
const IMAGE = 'https://imgh.in/host/sghe4f';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />

        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta
          name="keywords"
          content="product management interview, PM interview prep, product design questions, product strategy, guesstimate, RCA, metrics, case studies, flashcards, market sizing numbers"
        />
        <meta name="application-name" content="Drill" />
        <meta name="theme-color" content="#F3F4F6" />
        <meta name="color-scheme" content="light" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={URL} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Drill" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={URL} />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:image" content={IMAGE} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1672" />
        <meta property="og:image:height" content="941" />
        <meta property="og:image:alt" content="Drill — practice PM interviews one card at a time" />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={IMAGE} />
        <meta name="twitter:image:alt" content="Drill — practice PM interviews one card at a time" />

        {/* Mobile web app */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Drill" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: 'html, body, #root { height: 100%; background: #F3F4F6; } body { overflow: hidden; }' }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
