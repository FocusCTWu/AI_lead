const missionGrid = document.querySelector('#missionGrid');
const dialog = document.querySelector('#missionDialog');
const missionContent = document.querySelector('#missionContent');

const likedKey = id => `ai-lead-liked:${id}`;

function escapeHtml(s='') {
  return s.replace(/[&<>'\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
}

async function loadMissions(){
  const missions = await fetch('data/missions.json').then(r=>r.json());
  missionGrid.innerHTML = '';
  for(const m of missions){
    const stats = await window.AILeadStats.getMissionStats(m.id);
    const card = document.createElement('article');
    card.className = 'mission-card';
    card.innerHTML = `
      <div class="mission-meta"><span class="pill">${escapeHtml(m.level)}</span>${m.tags.map(t=>`<span class="pill">${escapeHtml(t)}</span>`).join('')}</div>
      <h3>${escapeHtml(m.title)}</h3>
      <p>${escapeHtml(m.description)}</p>
      <div class="mission-stats"><span>👁 ${stats.views||0}</span><span>✅ ${stats.completions||0}</span><span>👍 ${stats.likes||0}</span></div>
      <button class="btn ${m.active?'primary':'ghost'}" ${m.active?'':'disabled'}>${m.active?'開始看圖操作':'即將開放'}</button>`;
    if(m.active) card.querySelector('button').addEventListener('click',()=>openMission(m));
    missionGrid.appendChild(card);
  }
}

async function openMission(m){
  await window.AILeadStats.increment(m.id,'views');
  renderMission(m);
  dialog.showModal();
}

function stepCard(n, title, body, image, alt, tip=''){
  return `
    <section class="guide-step">
      <div class="step-number">步驟 ${n}</div>
      <h3>${title}</h3>
      <p>${body}</p>
      <figure class="guide-figure">
        <img src="${image}" alt="${alt}" loading="lazy">
        <figcaption>介面示意｜依 Microsoft 官方文件整理，畫面版本：2026-09</figcaption>
      </figure>
      ${tip ? `<div class="step-tip">${tip}</div>` : ''}
    </section>`;
}

function renderMission(m){
  const liked = localStorage.getItem(likedKey(m.id)) === '1';
  missionContent.innerHTML = `
    <p class="eyebrow">${escapeHtml(m.level)} · 模板導向雙文件對照</p>
    <h2>${escapeHtml(m.title)}</h2>
    <p class="mission-intro">這一課的核心邏輯是：<strong>現行空白初審表／欄位表決定「要填什麼」；本次計畫書提供「這次案件的證據」；已填範例若有，只用來參考寫法，不能拿來決定規則。</strong></p>

    <div class="official-note">
      <strong>先分清四種文件角色</strong>
      <p><strong>現行空白初審表／欄位表：</strong>定義欄位，是主要 schema。<br><strong>本次計畫書：</strong>提供本案事實與原文證據。<br><strong>已填範例：</strong>可選，只參考文字粒度與呈現方式。<br><strong>正式規定／審查要點：</strong>才是資格、合規與行政判斷的依據。</p>
      <p><strong>重要：</strong>已填範例不能新增、刪除或改寫現行模板欄位，也不能替代正式規定。</p>
    </div>

    ${stepCard(1,'確認你在公務／工作帳號環境','進入 Copilot Chat 後，先確認使用的是 Microsoft 365 工作帳號，並找介面上方的綠色盾牌。','assets/copilot/01-edp-shield.svg','Copilot Chat 綠色盾牌位置示意','沒有看到工作帳號／綠色盾牌時，先不要上傳公務文件。')}

    ${stepCard(2,'點「＋」開啟新增來源','在 Message Copilot 輸入框旁點「＋」。這一步只是開啟來源選單，還沒有完成上傳。','assets/copilot/02-add-content.svg','Copilot Chat 加號按鈕位置示意','先確認你找得到「＋」，再進下一步。')}

    ${stepCard(3,'選「上傳影像和檔案」','在「新增和管理來源」中選擇「上傳影像和檔案」，先選現行行政初審表空白模板／欄位表，再選本次計畫書。','assets/copilot/03-upload-file.svg','Copilot Chat 上傳影像和檔案選單示意','若另有已填範例，可第三個再上傳，但它只是可選的寫法參考。')}

    ${stepCard(4,'確認必要的兩份檔案都已附加','提示區至少要同時看到「行政初審表模板」與「本次計畫書」。若只看到一份，就先補上另一份。','assets/copilot/04-file-attached.svg','Copilot Chat 同時附加行政初審表模板與本次計畫書示意','模板定義欄位；計畫書提供證據。這兩者角色不同。')}

    <section class="guide-step">
      <div class="step-number">步驟 5</div>
      <h3>先只讀模板，確認欄位結構</h3>
      <p>第一個 Prompt 不填表，只確認 Copilot 有沒有正確理解現行模板。若欄位都抓錯，後面填得再漂亮也沒有意義。</p>
      <textarea class="prompt-box" readonly>請先只分析「行政初審表空白模板／欄位表」。

請列出：
1. 需要填寫的欄位名稱，依模板原順序排列。
2. 每一欄需要的是：事實擷取、計算／一致性檢查、或行政判斷。
3. 不得新增模板中不存在的欄位。
4. 不得使用「本次計畫書」內容填答。
5. 若我另附「已填範例」，此步驟也不要用範例改變欄位結構。</textarea>
      <div class="step-tip">先人工掃一眼：欄位名稱、順序、分組是否和真正的初審表一致。</div>
    </section>

    <section class="guide-step">
      <div class="step-number">步驟 6</div>
      <h3>再用本次計畫書逐欄找證據</h3>
      <p>確認欄位結構正確後，才開始填入本案資訊。已填範例如果存在，只能影響「怎麼寫」，不能影響「填什麼」與「判定結果」。</p>
      <textarea id="promptBox" class="prompt-box">請以「行政初審表空白模板／欄位表」的現行欄位與順序為唯一表格架構，根據「本次計畫書」逐欄擷取資訊。

若另有「已填範例」，只能參考回答的文字粒度與呈現方式，不得用它新增、刪除、改名或重新解釋模板欄位，也不得把前案結論套用到本案。

請遵守以下規則：
1. 事實欄位只能使用本次計畫書中明確出現的內容。
2. 找不到時寫「文件未載明」，不得自行補充或推測。
3. 每一欄都提供原文依據與頁碼；若頁碼無法可靠取得，請寫「頁碼需人工確認」。
4. 涉及資格、法規、政策目的、經費合理性或行政裁量時，不得自行作最終結論，請標示「需人工判斷」。
5. 計算或一致性檢查可以提出結果，但要列出計算依據或互相比對的來源。

請輸出：
「初審表欄位｜建議填入內容｜原文／計算依據｜頁碼｜狀態」

狀態只使用：
- 明確
- 需確認
- 文件未載明
- 需人工判斷</textarea>
      <div class="prompt-actions"><button type="button" class="btn ghost" id="copyPromptBtn">複製指令</button><span id="copyFeedback" class="feedback" aria-live="polite"></span></div>
    </section>

    <section class="guide-step">
      <div class="step-number">步驟 7</div>
      <h3>看懂輸出：這是「待確認草稿」，不是正式初審結果</h3>
      <div class="example-table-wrap">
        <table class="example-table">
          <thead><tr><th>欄位</th><th>建議填入</th><th>原文／計算依據</th><th>頁碼</th><th>狀態</th></tr></thead>
          <tbody>
            <tr><td>執行期間</td><td>2026/1/1–12/31</td><td>「本計畫執行期間…」</td><td>4</td><td>🟢 明確</td></tr>
            <tr><td>總經費</td><td>3,200,000</td><td>經費表總額</td><td>18</td><td>🟢 明確</td></tr>
            <tr><td>是否符合資格</td><td>—</td><td>需依正式資格規定比對</td><td>—</td><td>🟡 需人工判斷</td></tr>
            <tr><td>附件完整性</td><td>疑似缺少附件 3</td><td>目錄列有附件 3，但目前文件集未見</td><td>2</td><td>🟡 需確認</td></tr>
          </tbody>
        </table>
      </div>
      <div class="step-tip">注意：「需人工判斷」和「需確認」不同。前者是人必須作決策；後者通常是資料或證據還沒核實。</div>
    </section>

    ${stepCard(8,'回原始文件核對至少一筆','挑一筆日期、金額、附件或其他客觀欄位，依 Copilot 提供的原文與頁碼回到計畫書核對。','assets/copilot/06-review-source.svg','Copilot 回答後查看來源並核對示意','如果原文或頁碼對不上，這一列就不能直接進正式初審表。')}

    <section class="step knowledge-check">
      <h3>完成前最後一題</h3>
      <p>已填範例裡「是否符合資格」寫的是「是」，但現行模板只提供這個欄位，正式資格仍要依規定判定。Copilot 把本案也填成「是」，你應該怎麼處理？</p>
      <div class="choice-grid" id="verifyChoices">
        <button type="button" class="choice">範例既然這樣填，就接受</button>
        <button type="button" class="choice" data-correct="true">回到正式資格規定與本案證據，人工判斷；範例不能當規則</button>
        <button type="button" class="choice">請 Copilot 把理由寫得更正式</button>
      </div>
      <div class="feedback" id="verifyFeedback" aria-live="polite"></div>
    </section>

    <section class="step finish-step">
      <h3>完成：模板定義欄位，計畫書提供證據，人完成判斷</h3>
      <p><strong>AI 負責：</strong>讀取模板、逐欄找資訊、整理證據、做可驗證的計算／一致性檢查、指出缺漏。<br><strong>人負責：</strong>確認資料使用合規、核對原文、解讀正式規定、做行政裁量與正式登載。</p>
      <button type="button" class="btn primary" id="completeBtn">✅ 我已完成並核對一筆</button>
      <button type="button" class="btn ghost like-btn ${liked?'active':''}" id="likeBtn">${liked?'👍 已標記有幫助':'👍 這對我有幫助'}</button>
      <div class="feedback" id="doneFeedback" aria-live="polite"></div>
    </section>`;

  document.querySelector('#copyPromptBtn').addEventListener('click', async ()=>{
    const box = document.querySelector('#promptBox');
    try{
      await navigator.clipboard.writeText(box.value);
      document.querySelector('#copyFeedback').textContent='已複製，可切到 Copilot 貼上。';
    }catch{
      box.select();
      document.querySelector('#copyFeedback').textContent='請按 Ctrl+C 複製選取內容。';
    }
  });
  document.querySelectorAll('#verifyChoices .choice').forEach(btn => btn.addEventListener('click',()=>markChoice(btn,'verifyFeedback','正確：現行模板定義欄位，正式規定決定判斷；已填範例只能參考寫法。')));
  document.querySelector('#completeBtn').addEventListener('click', async ()=>{
    await window.AILeadStats.increment(m.id,'completions');
    document.querySelector('#doneFeedback').textContent='完成。你已跑過一次「模板定義欄位 → 計畫書提供證據 → 人完成判斷」的完整流程。';
  });
  document.querySelector('#likeBtn').addEventListener('click', async e=>{
    if(localStorage.getItem(likedKey(m.id))==='1') return;
    localStorage.setItem(likedKey(m.id),'1');
    await window.AILeadStats.increment(m.id,'likes');
    e.currentTarget.textContent='👍 已標記有幫助';
    e.currentTarget.classList.add('active');
  });
}

function markChoice(btn, feedbackId, correctMsg){
  const group = btn.parentElement.querySelectorAll('.choice');
  group.forEach(x=>x.classList.remove('correct','wrong'));
  if(btn.dataset.correct==='true'){
    btn.classList.add('correct');
    document.querySelector(`#${feedbackId}`).textContent=correctMsg;
  }else{
    btn.classList.add('wrong');
    document.querySelector(`#${feedbackId}`).textContent='這一步不能只看範例或 AI 文字，仍要回到現行模板、正式規定與本案原始資料。';
  }
}

loadMissions().catch(err=>{
  missionGrid.innerHTML='<p>教材載入失敗，請確認網站是透過 GitHub Pages/HTTP 開啟，而不是直接雙擊本機 HTML。</p>';
  console.error(err);
});
