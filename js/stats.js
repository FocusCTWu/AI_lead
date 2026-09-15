window.AILeadStats = (() => {
  // v0.1 預設為真實 0。正式上線時只需替換 API_BASE，即可接 Supabase/Cloudflare 等後端。
  const API_BASE = '';
  const fallback = { views: 0, likes: 0, completions: 0 };

  async function getMissionStats(id) {
    if (!API_BASE) return { ...fallback };
    try {
      const r = await fetch(`${API_BASE}/stats/${encodeURIComponent(id)}`);
      if (!r.ok) throw new Error('stats fetch failed');
      return await r.json();
    } catch { return { ...fallback }; }
  }

  async function increment(id, field) {
    if (!API_BASE) return { ...fallback };
    try {
      const r = await fetch(`${API_BASE}/stats/${encodeURIComponent(id)}/${field}`, { method: 'POST' });
      if (!r.ok) throw new Error('stats update failed');
      return await r.json();
    } catch { return { ...fallback }; }
  }

  return { getMissionStats, increment };
})();
