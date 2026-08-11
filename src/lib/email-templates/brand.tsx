import * as React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'

/**
 * Frass email brand shell — black masthead, gold rule, block-letter wordmark.
 * Body stays white for inbox rendering; the Frass darkness lives in the masthead.
 */
export const frass = {
  ink: '#0b0b0c',
  gold: '#d4af37',
  body: '#3f4147',
  muted: '#8a8d94',
  line: '#e6e6e8',
}

export const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }
export const container = { padding: '0 0 32px', maxWidth: '560px', margin: '0 auto' }
export const inner = { padding: '28px 28px 0' }
export const h1 = {
  fontSize: '26px',
  fontWeight: 'bold' as const,
  letterSpacing: '-0.5px',
  color: frass.ink,
  margin: '0 0 18px',
  textTransform: 'uppercase' as const,
}
export const text = { fontSize: '15px', color: frass.body, lineHeight: '1.65', margin: '0 0 20px' }
export const link = { color: frass.ink, textDecoration: 'underline' }
export const button = {
  backgroundColor: frass.ink,
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 'bold' as const,
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  borderRadius: '2px',
  border: `1px solid ${frass.gold}`,
  padding: '15px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
export const plain = {
  fontSize: '13px',
  color: frass.muted,
  lineHeight: '1.6',
  margin: '28px 0 0',
  borderLeft: `2px solid ${frass.gold}`,
  paddingLeft: '14px',
}
export const footer = {
  fontSize: '11px',
  color: frass.muted,
  lineHeight: '1.6',
  margin: '28px 0 0',
  borderTop: `1px solid ${frass.line}`,
  paddingTop: '16px',
}
export const codeStyle = {
  fontSize: '30px',
  letterSpacing: '10px',
  fontWeight: 'bold' as const,
  color: frass.ink,
  margin: '0 0 24px',
}

const masthead = { backgroundColor: frass.ink, padding: '26px 28px', borderBottom: `3px solid ${frass.gold}` }
const wordmark = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: 'bold' as const,
  letterSpacing: '8px',
  margin: '0',
  textTransform: 'uppercase' as const,
}
const tagline = {
  color: frass.gold,
  fontSize: '9px',
  letterSpacing: '3px',
  margin: '8px 0 0',
  textTransform: 'uppercase' as const,
}

export function FrassEmail({
  preview,
  heading,
  children,
}: {
  preview: string
  heading: string
  children: React.ReactNode
}) {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={masthead}>
            <Text style={wordmark}>Frass</Text>
            <Text style={tagline}>Built by people. Powered by community.</Text>
          </Section>
          <Section style={inner}>
            <Heading style={h1}>{heading}</Heading>
            {children}
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
