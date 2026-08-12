// FRASS-0488 — server-only identity work: passkey ceremonies, trusted devices,
// and the verification audit trail. Never imported by a component.

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { getRequest } from "@tanstack/react-start/server";

const RP_NAME = "Frass";

function relyingParty() {
  const url = new URL(getRequest().url);
  return { rpID: url.hostname, origin: url.origin };
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function putChallenge(userId: string, challenge: string, purpose: string) {
  const db = await admin();
  await db.from("webauthn_challenges").upsert(
    {
      user_id: userId,
      challenge,
      purpose,
      expires_at: new Date(Date.now() + 5 * 60_000).toISOString(),
    },
    { onConflict: "user_id" },
  );
}

async function takeChallenge(userId: string, purpose: string): Promise<string | null> {
  const db = await admin();
  const { data } = await db
    .from("webauthn_challenges")
    .select("challenge, purpose, expires_at")
    .eq("user_id", userId)
    .maybeSingle();
  await db.from("webauthn_challenges").delete().eq("user_id", userId);
  if (!data || data.purpose !== purpose) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) return null;
  return data.challenge;
}

export async function logVerification(
  userId: string,
  action: string,
  method: string,
  succeeded: boolean,
) {
  try {
    const db = await admin();
    await db.from("sensitive_verifications").insert({
      user_id: userId,
      action,
      method,
      succeeded,
    });
  } catch {
    /* the check already happened; the note is secondary */
  }
}

export async function registrationOptionsFor(userId: string) {
  const { rpID } = relyingParty();
  const db = await admin();
  const { data: existing } = await db
    .from("user_passkeys")
    .select("credential_id, transports")
    .eq("user_id", userId);

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID,
    userName: userId,
    userID: new TextEncoder().encode(userId),
    attestationType: "none",
    excludeCredentials: (existing ?? []).map((c) => ({ id: c.credential_id })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
      authenticatorAttachment: "platform",
    },
  });
  await putChallenge(userId, options.challenge, "register");
  return options;
}

export async function saveRegistration(
  userId: string,
  response: unknown,
  label: string,
  deviceKind: string,
) {
  const { rpID, origin } = relyingParty();
  const expectedChallenge = await takeChallenge(userId, "register");
  if (!expectedChallenge) return { ok: false as const, reason: "expired" };

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response: response as any,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: false,
    });
  } catch {
    return { ok: false as const, reason: "rejected" };
  }
  if (!verification.verified || !verification.registrationInfo) {
    return { ok: false as const, reason: "rejected" };
  }

  const info = verification.registrationInfo;
  const db = await admin();
  const { error } = await db.from("user_passkeys").insert({
    user_id: userId,
    credential_id: info.credential.id,
    public_key: Buffer.from(info.credential.publicKey).toString("base64"),
    counter: info.credential.counter,
    transports: info.credential.transports ?? [],
    device_label: label,
    device_kind: deviceKind,
    backed_up: info.credentialBackedUp,
  });
  if (error) return { ok: false as const, reason: "duplicate" };
  await logVerification(userId, "register_passkey", "passkey", true);
  return { ok: true as const };
}

export async function authenticationOptionsFor(userId: string) {
  const { rpID } = relyingParty();
  const db = await admin();
  const { data: creds } = await db
    .from("user_passkeys")
    .select("credential_id, transports")
    .eq("user_id", userId);

  if (!creds || creds.length === 0) return { available: false as const };

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    allowCredentials: creds.map((c) => ({
      id: c.credential_id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transports: (c.transports ?? []) as any,
    })),
  });
  await putChallenge(userId, options.challenge, "verify");
  return { available: true as const, options };
}

export async function verifyAuthentication(userId: string, response: unknown, action: string) {
  const { rpID, origin } = relyingParty();
  const expectedChallenge = await takeChallenge(userId, "verify");
  if (!expectedChallenge) {
    await logVerification(userId, action, "passkey", false);
    return { ok: false as const, reason: "expired" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const credentialId = (response as any)?.id as string | undefined;
  const db = await admin();
  const { data: cred } = await db
    .from("user_passkeys")
    .select("id, credential_id, public_key, counter, transports")
    .eq("user_id", userId)
    .eq("credential_id", credentialId ?? "")
    .maybeSingle();
  if (!cred) {
    await logVerification(userId, action, "passkey", false);
    return { ok: false as const, reason: "unknown_device" };
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response: response as any,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: false,
      credential: {
        id: cred.credential_id,
        publicKey: new Uint8Array(Buffer.from(cred.public_key, "base64")),
        counter: Number(cred.counter),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transports: (cred.transports ?? []) as any,
      },
    });
  } catch {
    await logVerification(userId, action, "passkey", false);
    return { ok: false as const, reason: "rejected" };
  }

  if (!verification.verified) {
    await logVerification(userId, action, "passkey", false);
    return { ok: false as const, reason: "rejected" };
  }

  await db
    .from("user_passkeys")
    .update({
      counter: verification.authenticationInfo.newCounter,
      last_used_at: new Date().toISOString(),
    })
    .eq("id", cred.id);
  await logVerification(userId, action, "biometric", true);
  return { ok: true as const };
}

export async function touchDevice(userId: string, deviceKey: string, label: string) {
  const db = await admin();
  const { data: existing } = await db
    .from("auth_devices")
    .select("id, trusted, label")
    .eq("user_id", userId)
    .eq("device_key", deviceKey)
    .maybeSingle();

  if (existing) {
    await db
      .from("auth_devices")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", existing.id);
    return { isNew: false as const, trusted: existing.trusted };
  }

  await db.from("auth_devices").insert({
    user_id: userId,
    device_key: deviceKey,
    label,
    platform: label,
  });
  return { isNew: true as const, trusted: true };
}

export async function identityCenter(userId: string) {
  const db = await admin();
  const [passkeys, devices, checks] = await Promise.all([
    db
      .from("user_passkeys")
      .select("id, device_label, device_kind, backed_up, last_used_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    db
      .from("auth_devices")
      .select("id, label, platform, approx_location, trusted, first_seen_at, last_seen_at")
      .eq("user_id", userId)
      .order("last_seen_at", { ascending: false })
      .limit(25),
    db
      .from("sensitive_verifications")
      .select("action, method, succeeded, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const recentFailures = (checks.data ?? []).filter(
    (c) => !c.succeeded && Date.now() - new Date(c.created_at).getTime() < 24 * 3600_000,
  ).length;
  const newDevice = (devices.data ?? []).find(
    (d) => Date.now() - new Date(d.first_seen_at).getTime() < 48 * 3600_000,
  );

  return {
    passkeys: passkeys.data ?? [],
    devices: devices.data ?? [],
    checks: checks.data ?? [],
    signals: {
      recentFailures,
      newDeviceLabel: newDevice?.label ?? null,
      newDeviceAt: newDevice?.first_seen_at ?? null,
    },
  };
}
