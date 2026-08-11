import * as React from 'react'
import { Button, Text } from '@react-email/components'
import { FrassEmail, button, footer, plain, text } from './brand'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ confirmationUrl }: RecoveryEmailProps) => (
  <FrassEmail preview="Reset your Frass password" heading="Reset your password">
    <Text style={text}>
      We received a request to reset the password on your Frass account. Choose a new one using the button below.
    </Text>
    <Button style={button} href={confirmationUrl}>
      Set a new password
    </Button>
    <Text style={plain}>
      What this means in plain English: we never see or send your password. This link simply lets you set a new one
      yourself, like changing the lock rather than being mailed the old key.
    </Text>
    <Text style={footer}>
      If you didn't request this, ignore this email — your current password stays exactly as it is.
    </Text>
  </FrassEmail>
)

export default RecoveryEmail
