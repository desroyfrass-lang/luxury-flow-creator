import * as React from 'react'
import { Button, Link, Text } from '@react-email/components'
import { FrassEmail, button, footer, link, plain, text } from './brand'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteUrl, confirmationUrl }: InviteEmailProps) => (
  <FrassEmail preview="You've been invited to Frass Hill" heading="You've been invited">
    <Text style={text}>
      You've been invited to build on{' '}
      <Link href={siteUrl} style={link}>
        <strong>Frass Hill</strong>
      </Link>
      . Accept below and Frassy will greet you personally, then walk you through setting your business up.
    </Text>
    <Button style={button} href={confirmationUrl}>
      Accept your invitation
    </Button>
    <Text style={plain}>
      What this means in plain English: this invitation is tied to your address only. It's your name on the guest
      list, not a public door.
    </Text>
    <Text style={footer}>If you weren't expecting this invitation, you can safely ignore it.</Text>
  </FrassEmail>
)

export default InviteEmail
