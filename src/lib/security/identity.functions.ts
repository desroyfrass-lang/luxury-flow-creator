// FRASS-0488 — Identity server functions.
//
// Thin wrappers only: every runtime helper lives in identity.server.ts.
// Platform-native passkeys / biometrics (Face ID, Touch ID, Windows Hello,
// Android Biometrics) plus the existing password fallback. Frass never stores
// biometric data — only the public key the device hands over.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const startPasskeyRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { registrationOptionsFor } = await import("./identity.server");
    return registrationOptionsFor(context.userId);
  });

export const finishPasskeyRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { response: unknown; label: string; deviceKind: string }) =>
    z
      .object({
        response: z.unknown(),
        label: z.string().min(1).max(60),
        deviceKind: z.string().min(1).max(30),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { saveRegistration } = await import("./identity.server");
    return saveRegistration(context.userId, data.response, data.label, data.deviceKind);
  });

export const startPasskeyVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { authenticationOptionsFor } = await import("./identity.server");
    return authenticationOptionsFor(context.userId);
  });

export const finishPasskeyVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { response: unknown; action: string }) =>
    z.object({ response: z.unknown(), action: z.string().min(1).max(60) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { verifyAuthentication } = await import("./identity.server");
    return verifyAuthentication(context.userId, data.response, data.action);
  });

export const recordPasswordVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { action: string; succeeded: boolean }) =>
    z.object({ action: z.string().min(1).max(60), succeeded: z.boolean() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { logVerification } = await import("./identity.server");
    await logVerification(context.userId, data.action, "password", data.succeeded);
    return { ok: true as const };
  });

export const getMyIdentityCenter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { identityCenter } = await import("./identity.server");
    return identityCenter(context.userId);
  });

export const seenOnThisDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { deviceKey: string; label: string }) =>
    z.object({ deviceKey: z.string().min(4).max(80), label: z.string().min(1).max(60) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { touchDevice } = await import("./identity.server");
    return touchDevice(context.userId, data.deviceKey, data.label);
  });

export const renameDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; label: string }) =>
    z.object({ id: z.string().uuid(), label: z.string().min(1).max(60) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("auth_devices")
      .update({ label: data.label })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true as const };
  });

export const revokeDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("auth_devices")
      .update({ trusted: false, revoked_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true as const };
  });

export const removePasskey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("user_passkeys").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true as const };
  });
