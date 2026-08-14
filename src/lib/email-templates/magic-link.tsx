import * as React from 'react'
import { Button, Text } from '@react-email/components'
import { FrassEmail, button, footer, plain, text } from './brand'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ confirmationUrl }: MagicLinkEmailProps) => (
  <FrassEmail preview="Your Frass sign-in link" heading="Your sign-in link">
    <Text style={text}>
      Use the link below to sign in to Frass. It works once, and it expires in 24 hours.
    </Text>
    <Button style={button} href={confirmationUrl}>
      Sign in to Frass
    </Button>
    <Text style={plain}>
      Here's how it works: no password needed this time — the link itself is the key, which is why it
      only opens the door once.
    </Text>
    <Text style={footer}>If you didn't ask to sign in, ignore this email and nothing will happen.</Text>
  </FrassEmail>
)

export default MagicLinkEmail
