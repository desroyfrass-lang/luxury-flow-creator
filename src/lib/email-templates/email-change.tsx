import * as React from 'react'
import { Button, Text } from '@react-email/components'
import { FrassEmail, button, footer, plain, text } from './brand'

interface EmailChangeEmailProps {
  siteName: string
  // oldEmail is the user's current address (HookData.OldEmail). For the
  // NEW-recipient half of a secure email_change fanout, `email` equals the
  // recipient (NEW), so the "from" line must render oldEmail to read
  // "from OLD to NEW" instead of "from NEW to NEW".
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({ oldEmail, newEmail, confirmationUrl }: EmailChangeEmailProps) => (
  <FrassEmail preview="Confirm your new Frass email address" heading="Confirm your email change">
    <Text style={text}>
      You asked to move your Frass account from <strong>{oldEmail}</strong> to <strong>{newEmail}</strong>. Confirm
      below and the change takes effect right away.
    </Text>
    <Button style={button} href={confirmationUrl}>
      Confirm the change
    </Button>
    <Text style={plain}>
      Here's what this means: we ask both addresses to agree before moving your account — like changing
      your mailing address in person rather than by note.
    </Text>
    <Text style={footer}>If you didn't request this change, ignore this email and nothing will move.</Text>
  </FrassEmail>
)

export default EmailChangeEmail
