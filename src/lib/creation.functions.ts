import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type BuilderCollection = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type BuilderDrop = {
  id: string;
  name: string;
  description: string | null;
  drop_date: string | null;
  status: string;
  created_at: string;
};

export type BuilderProduct = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string;
  image_url: string | null;
  tags: string[];
  status: string;
  collection_id: string | null;
  drop_id: string | null;
  created_at: string;
};

type Sb = { from: (t: string) => any };

/** Everything a Builder has made, in one call. */
export const listCreationWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(
    async ({
      context,
    }): Promise<{
      products: BuilderProduct[];
      collections: BuilderCollection[];
      drops: BuilderDrop[];
    }> => {
      const sb = context.supabase as unknown as Sb;
      const [products, collections, drops] = await Promise.all([
        sb
          .from("builder_products")
          .select("*")
          .eq("user_id", context.userId)
          .order("created_at", { ascending: false }),
        sb
          .from("builder_collections")
          .select("*")
          .eq("user_id", context.userId)
          .order("created_at", { ascending: false }),
        sb
          .from("builder_drops")
          .select("*")
          .eq("user_id", context.userId)
          .order("created_at", { ascending: false }),
      ]);
      if (products.error) throw new Error(products.error.message);
      if (collections.error) throw new Error(collections.error.message);
      if (drops.error) throw new Error(drops.error.message);
      return {
        products: (products.data ?? []) as BuilderProduct[],
        collections: (collections.data ?? []) as BuilderCollection[],
        drops: (drops.data ?? []) as BuilderDrop[],
      };
    },
  );

export const createBuilderProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      title: string;
      description?: string;
      price?: string | number | null;
      image_url?: string;
      tags?: string[];
      status?: string;
      collection_id?: string | null;
      drop_id?: string | null;
    }) => {
      const title = (input.title ?? "").trim();
      if (!title) throw new Error("Give your product a name.");
      const rawPrice =
        typeof input.price === "string" ? input.price.trim() : input.price;
      const price =
        rawPrice === "" || rawPrice === null || rawPrice === undefined
          ? null
          : Number(rawPrice);
      if (price !== null && (!Number.isFinite(price) || price < 0))
        throw new Error("Price should be a number like 89.99.");
      return {
        title: title.slice(0, 200),
        description: (input.description ?? "").trim() || null,
        price,
        image_url: (input.image_url ?? "").trim() || null,
        tags: (input.tags ?? []).map((t) => t.trim()).filter(Boolean).slice(0, 12),
        status: input.status || "draft",
        collection_id: input.collection_id || null,
        drop_id: input.drop_id || null,
      };
    },
  )
  .handler(async ({ data, context }): Promise<BuilderProduct> => {
    const sb = context.supabase as unknown as Sb;
    const { data: row, error } = await sb
      .from("builder_products")
      .insert({ ...data, user_id: context.userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as BuilderProduct;
  });

export const updateBuilderProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id: string;
      status?: string;
      collection_id?: string | null;
      drop_id?: string | null;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Sb;
    const patch: Record<string, unknown> = {};
    if (data.status) patch["status"] = data.status;
    if (data.collection_id !== undefined) patch["collection_id"] = data.collection_id;
    if (data.drop_id !== undefined) patch["drop_id"] = data.drop_id;
    const { error } = await sb
      .from("builder_products")
      .update(patch)
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteBuilderProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Sb;
    const { error } = await sb
      .from("builder_products")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createBuilderCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name: string; description?: string }) => {
    const name = (input.name ?? "").trim();
    if (!name) throw new Error("Name your collection.");
    return {
      name: name.slice(0, 120),
      description: (input.description ?? "").trim() || null,
    };
  })
  .handler(async ({ data, context }): Promise<BuilderCollection> => {
    const sb = context.supabase as unknown as Sb;
    const { data: row, error } = await sb
      .from("builder_collections")
      .insert({ ...data, user_id: context.userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as BuilderCollection;
  });

export const deleteBuilderCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Sb;
    const { error } = await sb
      .from("builder_collections")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createBuilderDrop = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { name: string; description?: string; drop_date?: string; status?: string }) => {
      const name = (input.name ?? "").trim();
      if (!name) throw new Error("Name your drop.");
      return {
        name: name.slice(0, 120),
        description: (input.description ?? "").trim() || null,
        drop_date: (input.drop_date ?? "").trim() || null,
        status: input.status || "planned",
      };
    },
  )
  .handler(async ({ data, context }): Promise<BuilderDrop> => {
    const sb = context.supabase as unknown as Sb;
    const { data: row, error } = await sb
      .from("builder_drops")
      .insert({ ...data, user_id: context.userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as BuilderDrop;
  });

export const updateBuilderDrop = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: string }) => input)
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Sb;
    const { error } = await sb
      .from("builder_drops")
      .update({ status: data.status })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteBuilderDrop = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Sb;
    const { error } = await sb
      .from("builder_drops")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
