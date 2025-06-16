import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="description" content="Cascobol - Jogo inspirado no Mario Party 9" />
        <meta name="keywords" content="jogo, game, mario party, cascobol, multiplayer" />
        <meta name="author" content="Andrei Bonatto" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Cascobol - Mario Party 9" />
        <meta property="og:description" content="Jogo multiplayer inspirado no Mario Party 9" />
        <meta property="og:image" content="/og-image.png" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Cascobol - Mario Party 9" />
        <meta property="twitter:description" content="Jogo multiplayer inspirado no Mario Party 9" />
        <meta property="twitter:image" content="/og-image.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
