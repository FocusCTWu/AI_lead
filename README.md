# 心健司 AI PRO — AI_lead v0.1

公務 AI 任務訓練場。第一版以 GitHub Pages 為前端，教學內容放在 JSON，互動統計預留獨立後端接口。

## v0.1 已包含

- 首頁與能力地圖
- 真實統計 UI（初始值 0）
- 第一個可操作任務：「計畫書 → 行政初審表」
- 紅／黃／綠資料風險概念
- Prompt Builder 基礎範例
- AI 結果驗證情境題
- Like 防重複：同一瀏覽器同一任務僅一次（localStorage）
- 後續任務卡片預留

## GitHub Pages

1. 將此目錄內容放到 repository 根目錄。
2. GitHub repository → Settings → Pages。
3. Source 選 `Deploy from a branch`。
4. Branch 選 `main`，folder 選 `/ (root)`。
5. 儲存後等待 GitHub Pages 建置完成。

## 統計後端

目前 `js/stats.js` 的 `API_BASE` 為空字串，因此公開數字真實維持 0，不會製造假資料。

正式接後端時，需要支援：

- `GET /stats/{mission_id}` → `{views, likes, completions}`
- `POST /stats/{mission_id}/views`
- `POST /stats/{mission_id}/likes`
- `POST /stats/{mission_id}/completions`

建議後續接 Supabase 或 Cloudflare Workers/D1，且只存 aggregate counts，不存姓名、email、個人學習紀錄或公務內容。
