# Shopify reconnection — read-only diagnosis

## Plain English first
No, I can't reconnect Shopify without you. The store's temporary pass has expired. Shopify only gives a new pass when the store owner signs in and approves it. It works like a hotel key card: once it runs out, the front desk (Shopify) only issues a new one to the guest whose name is on the booking (you). I can't print one myself.

## Verified evidence (checked today)
- Authorization status: the store is claimed, but your Shopify account was never connected. Lovable was running on a temporary store token.
- A harmless read (list 1 product) failed: "Online access token expired or missing." So the temporary token has expired.
- There is no refresh key that would let the backend renew access on its own. A new approval needs your Shopify login.

## Two separate Shopify connections in the app
1. Storefront (the shop customers see): `src/lib/shopify.ts` uses the public storefront token. It is unaffected, so the live shop keeps showing products.
2. Admin access (needed to create CJ draft products): this is the Lovable Shopify tool connection that just expired. Some app code (`rewards.functions.ts`, `frassy-tools.server.ts`) also mentions an admin token, `SHOPIFY_ACCESS_TOKEN`. I have not confirmed whether that token is saved or still valid, and I did not read or change it.

CJ import needs #2 (admin access), not the storefront.

## What you need to do (one step)
Approve this plan. I will then bring up Shopify's "Connect your Shopify account" approval card in chat. Sign in to Shopify as the store owner and click Approve. There is no separate web link: the approval card is the official path. If you prefer, you can also start it from the Shopify button in the editor's top bar.

## After you approve, and only then
- Repeat the harmless read (list 1 product) to confirm access is back. Nothing gets written.
- Report the result. No products are created, published or deleted. No credentials are changed or shown. Nothing is deployed.
- The CJ pilot draft stays blocked until you confirm the pricing allocation (8% in the database vs 10% in memory) and the collection.
