import { WORLD_ROUTES } from "../src/lib/founder/world-teleporter";
import { cardNumber } from "../src/lib/founder/teleporter-audit";
import { resolveAuditIdentity } from "../src/lib/founder/audit-registry";
for (const n of [25,41,19]) {
  const r = WORLD_ROUTES.find(x=>cardNumber(x)===n);
  console.log(n, r?.path, r?.title, JSON.stringify(resolveAuditIdentity(r?.path ?? "")));
}
