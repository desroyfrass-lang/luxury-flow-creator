import * as React from 'react'
import { Button, Link, Text } from '@react-email/components'
import { FrassEmail, button, footer, link, plain, text } from './brand'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({ siteUrl, recipient, confirmationUrl }: SignupEmailProps) => (
  <FrassEmail preview="Confirm your email and Frassy will meet you at the gate." heading="Confirm your email">
    <Text style={text}>
      Welcome to{' '}
      <Link href={siteUrl} style={link}>
        <strong>Frass</strong>
      </Link>
      . One click and you're in — Frassy will meet you at the gate and walk you into the Welcome Hall.
    </Text>
    <Text style={text}>
      We just need to confirm this is your address (
      <Link href={`mailto:${recipient}`} style={link}>
        {recipient}
      </Link>
      ).
    </Text>
    <Button style={button} href={confirmationUrl}>
      Confirm &amp; enter Frass
    </Button>
    <Text style={plain}>
      Here's the takeaway: this is the key to your front door. Clicking it proves the address is yours —
      like showing ID at reception before you're handed the room key.
    </Text>
    <Text style={footer}>If you didn't create a Frass account, you can safely ignore this email.</Text>
  </FrassEmail>
)

export default SignupEmail
