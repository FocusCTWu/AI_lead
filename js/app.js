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
    <p class="eyebrow">${escapeHtml(m.level)} · 雙文件對照</p>
    <h2>${escapeHtml(m.title)}</h2>
    <p class="mission-intro">這一課的重點不是叫 AI 猜「行政初審表要填什麼」，而是把機關既有的行政初審表範例當成欄位與格式參考，再用本次計畫書逐欄找證據。</p>

    <div class="official-note">
      <strong>先分清三種角色</strong>
      <p><strong>空白／既有初審表：</strong>告訴 Copilot「有哪些欄位要填」。<br><strong>填寫範例：</strong>告訴 Copilot「回答大概多細、格式長什麼樣」。<br><strong>正式規定／審查要點：</strong>才是判斷是否符合規範的依據。</p>
      <p><strong>重要：</strong>範例不是規則。前案曾怎麼填，不代表本案也應該得到相同結論。</p>
    </div>

    ${stepCard(1,'確認你在公務／工作帳號環境','進入 Copilot Chat 後，先確認使用的是 Microsoft 365 工作帳號，並找介面上方的綠色盾牌。','assets/copilot/01-edp-shield.svg','Copilot Chat 綠色盾牌位置示意','沒有看到工作帳號／綠色盾牌時，先不要上傳公務文件。')}

    ${stepCard(2,'先上傳「行政初審表範例」','點輸入框旁的「＋」，選擇上傳檔案，先把機關既有的行政初審表範例掛上去。','assets/copilot/02-add-content.svg','Copilot Chat 加號按鈕位置示意','如果同時有空白表、填寫範例與正式審查要點，建議一起提供並清楚命名。')}

    ${stepCard(3,'再上傳「本次計畫書」','接著再上傳這次要審的計畫書。確認兩個檔名都出現在提示區後再繼續。','assets/copilot/04-file-attached.svg','Copilot Chat 同時附加兩份文件示意','檔名最好一眼就分得出來，例如「行政初審表範例」與「本次計畫書」。')}

    <section class="guide-step">
      <div class="step-number">步驟 4</div>
      <h3>先叫 Copilot 辨識欄位，不要立刻填表</h3>
      <p>第一個動作只是讓 Copilot 說明它看到了哪些欄位，避免一開始就混淆「欄位」和「答案」。</p>
      <textarea class="prompt-box" readonly>請先只分析「行政初審表範例」。

請列出：
1. 需要填寫的欄位名稱
2. 每一欄大致需要什麼類型的內容
3. 哪些欄位是直接擷取事實
4. 哪些欄位涉及計算、一致性檢查或行政判斷

此步驟先不要填入本次計畫書內容。</textarea>
      <div class="step-tip">你要先確認 Copilot 對「表格結構」的理解是對的，再進下一步。</div>
    </section>

    <section class="guide-step">
      <div class="step-number">步驟 5</div>
      <h3>再逐欄對照本次計畫書</h3>
      <p>現在才開始填。這段固定指令會要求原文、頁碼與狀態，避免 Copilot 用推測補空白。</p>
      <textarea id="promptBox" class="prompt-box">請以「行政初審表範例」的欄位為架構，根據「本次計畫書」逐欄擷取資訊。

請遵守以下規則：
1. 只能使用本次計畫書中明確出現的內容。
2. 不得因範例中曾出現某種答案，就假設本次案件也相同。
3. 找不到時請寫「文件未載明」，不得自行補充或推測。
4. 每一欄都要提供原文依據與頁碼。
5. 涉及資格、法規、政策目的、經費合理性或行政裁量者，不得自行下結論，請標示「需人工判斷」。

請以以下欄位輸出：
「初審表欄位｜AI 建議填入內容｜原文依據｜頁碼｜狀態」

狀態只使用：
- 明確
- 需確認
- 文件未載明
- 需人工判斷</textarea>
      <div class="prompt-actions"><button type="button" class="btn ghost" id="copyPromptBtn">複製指令</button><span id="copyFeedback" class="feedback" aria-live="polite"></span></div>
    </section>

    <section class="guide-step">
      <div class="step-number">步驟 6</div>
      <h3>看懂 Copilot 的輸出：不是「完成版初審表」，而是「待確認草稿」</h3>
      <div class="example-table-wrap">
        <table class="example-table">
          <thead><tr><th>欄位</th><th>AI 建議填入</th><th>原文依據</th><th>頁碼</th><th>狀態</th></tr></thead>
          <tbody>
            <tr><td>執行期間</td><td>2026/1/1–12/31</td><td>「本計畫執行期間…」</td><td>4</td><td>🟢 明確</td></tr>
            <tr><td>總經費</td><td>3,200,000</td><td>「申請經費總額…」</td><td>18</td><td>🟢 明確</td></tr>
            <tr><td>是否符合資格</td><td>—</td><td>涉及資格規定</td><td>—</td><td>🟡 需人工判斷</td></tr>
            <tr><td>缺少附件</td><td>附件 3 未見</td><td>目錄列有附件 3</td><td>2</td><td>🟡 需確認</td></tr>
          </tbody>
        </table>
      </div>
      <div class="step-tip">真正要追求的是「可核對」，不是讓 AI 看起來像已經替你完成行政判斷。</div>
    </section>

    ${stepCard(7,'回原始文件核對至少一筆','挑一筆日期、金額、附件或其他客觀欄位，依 Copilot 提供的原文與頁碼回到計畫書核對。','assets/copilot/06-review-source.svg','Copilot 回答後查看來源並核對示意','如果頁碼或原文對不上，這一列就不能直接進正式初審表。')}

    <section class="step knowledge-check">
      <h3>完成前最後一題</h3>
      <p>範例裡「是否符合資格」填的是「是」，Copilot 因此也把本案填成「是」。你應該怎麼處理？</p>
      <div class="choice-grid" id="verifyChoices">
        <button type="button" class="choice">範例既然這樣填，就接受</button>
        <button type="button" class="choice" data-correct="true">要求回到正式資格規定與本案資料，重新人工判斷</button>
        <button type="button" class="choice">請 Copilot 把理由寫得更正式</button>
      </div>
      <div class="feedback" id="verifyFeedback" aria-live="polite"></div>
    </section>

    <section class="step finish-step">
      <h3>完成：把 AI 放在「擷取與對照」的位置</h3>
      <p><strong>AI 負責：</strong>辨識欄位、找資訊、結構化、比對、指出缺漏。<br><strong>人負責：</strong>確認資料可用、理解正式規範、做行政判斷、正式登載。</p>
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
  document.querySelectorAll('#verifyChoices .choice').forEach(btn => btn.addEventListener('click',()=>markChoice(btn,'verifyFeedback','正確：範例只能提供欄位與寫法參考，不能代替正式規定與本案判斷。')));
  document.querySelector('#completeBtn').addEventListener('click', async ()=>{
    await window.AILeadStats.increment(m.id,'completions');
    document.querySelector('#doneFeedback').textContent='完成。你現在已經跑過一次「範例定義欄位、計畫書提供證據、人完成判斷」的流程。';
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
    document.querySelector(`#${feedbackId}`).textContent='這一步不能只看範例或 AI 文字，仍要回到正式規定與本案原始資料。';
  }
}

loadMissions().catch(err=>{
  missionGrid.innerHTML='<p>教材載入失敗，請確認網站是透過 GitHub Pages/HTTP 開啟，而不是直接雙擊本機 HTML。</p>';
  console.error(err);
});
