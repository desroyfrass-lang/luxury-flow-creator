import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LiveBroadcast, LiveComment, LiveDestination, LiveGift } from "@/lib/live";

/** FRASS-0416 — LIVE is a platform-wide status, so everything reads from one place. */

/**
 * A livestream is a public place, but the account IDs behind it are not part of
 * the show. Column privileges hide host_id / author_id / sender_id from
 * anonymous visitors, so every read asks for the columns it is allowed to have.
 */
const BROADCAST_PUBLIC_COLUMNS =
  "id, host_name, host_handle, destination, purpose, title, summary, status, viewer_count, cover_url, product_links, affiliate_url, scheduled_for, started_at, ended_at, replay_url, repurposed_as, created_at, updated_at";

/** Signed-in members also get host_id, so a host recognises their own stream. */
const BROADCAST_MEMBER_COLUMNS = `${BROADCAST_PUBLIC_COLUMNS}, host_id`;

const COMMENT_COLUMNS = "id, broadcast_id, author_name, body, created_at";
const GIFT_COLUMNS =
  "id, broadcast_id, sender_name, gift_key, credits, amount, currency, note, created_at";

async function broadcastColumns(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session ? BROADCAST_MEMBER_COLUMNS : BROADCAST_PUBLIC_COLUMNS;
}

function normalise(row: Record<string, unknown>): LiveBroadcast {
  return {
    ...(row as unknown as LiveBroadcast),
    product_links: Array.isArray(row.product_links) ? (row.product_links as never) : [],
    repurposed_as: Array.isArray(row.repurposed_as) ? (row.repurposed_as as never) : [],
  };
}


/** Every broadcast currently live, across the whole ecosystem. */
export function useLiveNow(destination?: LiveDestination) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["live-now", destination ?? "all"],
    queryFn: async (): Promise<LiveBroadcast[]> => {
      let q = supabase.from("live_broadcasts").select(await broadcastColumns()).eq("status", "live");
      if (destination) q = q.eq("destination", destination);
      const { data, error } = await q.order("started_at", { ascending: false }).limit(60);
      if (error) throw error;
      return ((data ?? []) as unknown as Record<string, unknown>[]).map(normalise);
    },
    staleTime: 20_000,
  });

  useEffect(() => {
    // Unique channel per subscriber: two components can watch LIVE at once
    // without Supabase rejecting a second listener on a shared channel.
    const channel = supabase
      .channel(`live-broadcasts-status-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "live_broadcasts" }, () => {
        qc.invalidateQueries({ queryKey: ["live-now"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);


  return query;
}

/** Recently ended broadcasts — the archive that FV Studios turns into lasting content. */
export function useLiveArchive(destination?: LiveDestination) {
  return useQuery({
    queryKey: ["live-archive", destination ?? "all"],
    queryFn: async (): Promise<LiveBroadcast[]> => {
      let q = supabase.from("live_broadcasts").select(await broadcastColumns()).eq("status", "ended");
      if (destination) q = q.eq("destination", destination);
      const { data, error } = await q.order("ended_at", { ascending: false }).limit(24);
      if (error) throw error;
      return ((data ?? []) as unknown as Record<string, unknown>[]).map(normalise);
    },
    staleTime: 60_000,
  });
}

export function useBroadcast(id: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["live-broadcast", id],
    queryFn: async (): Promise<LiveBroadcast | null> => {
      const { data, error } = await supabase
        .from("live_broadcasts")
        .select(await broadcastColumns())
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? normalise(data as unknown as Record<string, unknown>) : null;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`live-broadcast-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_broadcasts", filter: `id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: ["live-broadcast", id] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, qc]);

  return query;
}

export function useLiveComments(broadcastId: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["live-comments", broadcastId],
    queryFn: async (): Promise<LiveComment[]> => {
      const { data, error } = await supabase
        .from("live_comments")
        .select(COMMENT_COLUMNS)
        .eq("broadcast_id", broadcastId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as LiveComment[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`live-comments-${broadcastId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_comments", filter: `broadcast_id=eq.${broadcastId}` },
        () => qc.invalidateQueries({ queryKey: ["live-comments", broadcastId] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [broadcastId, qc]);

  return query;
}

export function useLiveGifts(broadcastId: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["live-gifts", broadcastId],
    queryFn: async (): Promise<LiveGift[]> => {
      const { data, error } = await supabase
        .from("live_gifts")
        .select(GIFT_COLUMNS)
        .eq("broadcast_id", broadcastId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as LiveGift[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`live-gifts-${broadcastId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_gifts", filter: `broadcast_id=eq.${broadcastId}` },
        () => qc.invalidateQueries({ queryKey: ["live-gifts", broadcastId] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [broadcastId, qc]);

  return query;
}

/** The signed-in member, with the name their broadcast should carry. */
export function useLiveIdentity() {
  const [state, setState] = useState<{ userId: string | null; name: string; ready: boolean }>({
    userId: null,
    name: "Frass Builder",
    ready: false,
  });

  useEffect(() => {
    let active = true;
    const load = async (userId: string | null) => {
      if (!userId) {
        if (active) setState({ userId: null, name: "Frass Builder", ready: true });
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("display_name, full_name")
        .eq("id", userId)
        .maybeSingle();
      if (!active) return;
      setState({
        userId,
        name: data?.display_name || data?.full_name || "Frass Builder",
        ready: true,
      });
    };
    supabase.auth.getSession().then(({ data }) => load(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => load(session?.user.id ?? null));
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export function useStartBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      hostId: string;
      hostName: string;
      destination: LiveDestination;
      purpose: string;
      title: string;
      summary?: string;
    }) => {
      const { data, error } = await supabase
        .from("live_broadcasts")
        .insert({
          host_id: input.hostId,
          host_name: input.hostName,
          destination: input.destination,
          purpose: input.purpose,
          title: input.title,
          summary: input.summary ?? null,
          status: "live",
        })
        .select("*")
        .single();
      if (error) throw error;
      return normalise(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["live-now"] }),
  });
}

export function useEndBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("live_broadcasts")
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ["live-now"] });
      qc.invalidateQueries({ queryKey: ["live-broadcast", id] });
      qc.invalidateQueries({ queryKey: ["live-archive"] });
    },
  });
}

export function usePostComment() {
  return useMutation({
    mutationFn: async (input: { broadcastId: string; authorId: string; authorName: string; body: string }) => {
      const { error } = await supabase.from("live_comments").insert({
        broadcast_id: input.broadcastId,
        author_id: input.authorId,
        author_name: input.authorName,
        body: input.body,
      });
      if (error) throw error;
    },
  });
}

export function useSendGift() {
  return useMutation({
    mutationFn: async (input: {
      broadcastId: string;
      senderId: string;
      senderName: string;
      giftKey: string;
      credits: number;
      amount: number;
    }) => {
      const { error } = await supabase.from("live_gifts").insert({
        broadcast_id: input.broadcastId,
        sender_id: input.senderId,
        sender_name: input.senderName,
        gift_key: input.giftKey,
        credits: input.credits,
        amount: input.amount,
      });
      if (error) throw error;
    },
  });
}
