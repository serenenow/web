import { Html, Head, Main, NextScript } from 'next/document'
import { generateCSPMetaTag } from '@/lib/utils/csp'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Apply Content Security Policy */}
        <meta httpEquiv="Content-Security-Policy" content={generateCSPMetaTag()} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
