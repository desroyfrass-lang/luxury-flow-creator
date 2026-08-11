import * as React from 'react'
import { Text } from '@react-email/components'
import { FrassEmail, codeStyle, footer, plain, text } from './brand'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <FrassEmail preview="Your Frass verification code" heading="Confirm it's you">
    <Text style={text}>Use this code to confirm your identity:</Text>
    <Text style={codeStyle}>{token}</Text>
    <Text style={plain}>
      What this means in plain English: Frass will never ask you for this code by phone, chat or message. Anyone who
      does is not us.
    </Text>
    <Text style={footer}>If you didn't request this code, ignore this email.</Text>
  </FrassEmail>
)

export default ReauthenticationEmail
