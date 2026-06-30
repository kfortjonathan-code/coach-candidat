const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

export async function checkCredits(userId, type) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/credits?user_id=eq.${userId}&select=credits_simple,credits_photo,subscription_active`,
    { headers }
  );
  const data = await res.json();

  if (!res.ok || !data || data.length === 0) {
    return { ok: false, reason: "no_credits_row" };
  }

  const row = data[0];
  if (row.subscription_active) return { ok: true };

  const balance = type === "photo" ? row.credits_photo : row.credits_simple;
  return { ok: balance > 0, balance };
}

export async function decrementCredit(userId, type, subject = null) {
  const column = type === "photo" ? "credits_photo" : "credits_simple";

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/credits?user_id=eq.${userId}&select=${column}`,
    { headers }
  );
  const data = await res.json();
  if (!res.ok || !data || data.length === 0) return;

  const newValue = data[0][column] - 1;

  await fetch(`${SUPABASE_URL}/rest/v1/credits?user_id=eq.${userId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ [column]: newValue, updated_at: new Date().toISOString() }),
  });

  await fetch(`${SUPABASE_URL}/rest/v1/credits_history`, {
    method: "POST",
    headers,
    body: JSON.stringify({ user_id: userId, type, delta: -1, subject }),
  });
}
