const missionGrid = document.querySelector('#missionGrid');
const dialog = document.querySelector('#missionDialog');
const missionContent = document.querySelector('#missionContent');

const likedKey = id => `ai-lead-liked:${id}`;

function escapeHtml(s='') {
  return s.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
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
    <p class="eyebrow">${escapeHtml(m.level)} · 看圖一步一步做</p>
    <h2>${escapeHtml(m.title)}</h2>
    <p class="mission-intro">這一課不用先學 Prompt 原理。照著六張圖完成一次，最後只做一件事：回到原始文件驗證 AI 擷取結果。</p>

    <div class="official-note">
      <strong>先確認使用環境</strong>
      <p>Microsoft 官方說明：使用工作／學校帳號的 Copilot Chat 具有 Enterprise Data Protection (EDP)，介面上方會顯示綠色盾牌。工作內容可透過貼上、上傳檔案或選取有權限的檔案加入提示；上傳檔案會存於使用者的 OneDrive for Business。</p>
      <p><strong>但：</strong>這不代表所有政府內部資料都可直接上傳。仍須遵守機關資料分類、個資、保密及生成式 AI 使用規範。</p>
      <div class="source-links">
        <a href="https://learn.microsoft.com/en-us/copilot/privacy-and-protections" target="_blank" rel="noopener">Microsoft：Privacy & protections ↗</a>
        <a href="https://support.microsoft.com/zh-tw/microsoft-365-copilot/add-content-to-microsoft-365-copilot-chat-prompts" target="_blank" rel="noopener">Microsoft：在 Copilot Chat 新增內容 ↗</a>
      </div>
    </div>

    ${stepCard(1,'確認你在公務／工作帳號環境','進入 Copilot Chat 後，先確認使用的是 Microsoft 365 工作帳號，並找介面上方的綠色盾牌。','assets/copilot/01-edp-shield.svg','Copilot Chat 綠色盾牌位置示意','沒有看到工作帳號／綠色盾牌時，先不要上傳公務文件。')}

    ${stepCard(2,'點輸入框旁的「＋」','在 Message Copilot 輸入框旁點「＋」，開啟「新增和管理來源」。','assets/copilot/02-add-content.svg','Copilot Chat 加號按鈕位置示意','Microsoft 官方目前將這個入口稱為 Add and manage sources／新增和管理來源。')}

    ${stepCard(3,'選「上傳影像和檔案」','從來源選單選擇「上傳影像和檔案」，再從電腦選取要處理的文件。','assets/copilot/03-upload-file.svg','Copilot Chat 上傳影像和檔案選單示意','第一輪練習建議使用公開、模擬或已確認可在公務 Copilot 使用的文件。')}

    ${stepCard(4,'確認檔案真的掛上去了','看到檔名出現在提示輸入區後再繼續。若沒有看到附件，先不要送出指令。','assets/copilot/04-file-attached.svg','Copilot Chat 檔案附件顯示示意','Copilot Chat 也支援拖放檔案；正式公務流程仍建議依機關核准方式操作。')}

    <section class="guide-step">
      <div class="step-number">步驟 5</div>
      <h3>貼上這段指令</h3>
      <p>先用固定版本成功一次，再學怎麼改。</p>
      <textarea id="promptBox" class="prompt-box">請根據我提供的計畫書，擷取行政初審所需資訊。\n\n只能使用文件中明確出現的內容；若找不到，請標示「文件未載明」，不得自行補充或推測。\n\n請以「欄位｜擷取結果｜原文依據｜頁碼」格式呈現，並將無法確定之處另列為「需人工確認」。</textarea>
      <div class="prompt-actions"><button type="button" class="btn ghost" id="copyPromptBtn">複製指令</button><span id="copyFeedback" class="feedback" aria-live="polite"></span></div>
      <figure class="guide-figure"><img src="assets/copilot/05-prompt-send.svg" alt="貼上 Prompt 並送出的介面示意"><figcaption>介面示意｜依 Microsoft 官方文件整理，畫面版本：2026-09</figcaption></figure>
    </section>

    ${stepCard(6,'回原始文件核對至少一筆','Copilot 回答後，不要直接登載。挑一筆日期、金額或資格條件，依它提供的原文／頁碼回到文件核對。','assets/copilot/06-review-source.svg','Copilot 回答後查看來源並核對示意','AI 負責找與整理；正式判斷、登載與責任仍由人完成。')}

    <section class="step knowledge-check">
      <h3>完成前最後一題</h3>
      <p>Copilot 擷取「執行期間：2026/1/1–2026/12/31」，最適當的下一步是？</p>
      <div class="choice-grid" id="verifyChoices">
        <button type="button" class="choice">直接貼進正式表格</button>
        <button type="button" class="choice" data-correct="true">回到原始文件確認日期與頁碼</button>
        <button type="button" class="choice">再請 AI 改寫得更正式</button>
      </div>
      <div class="feedback" id="verifyFeedback" aria-live="polite"></div>
    </section>

    <section class="step finish-step">
      <h3>完成：你已跑完一次完整工作循環</h3>
      <p><strong>AI 負責：</strong>找資訊、結構化、指出缺漏。<br><strong>人負責：</strong>確認資料可用、理解規定、核對依據、正式登載。</p>
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
  document.querySelectorAll('#verifyChoices .choice').forEach(btn => btn.addEventListener('click',()=>markChoice(btn,'verifyFeedback','正確：AI 幫你定位，人回到原文完成驗證。')));
  document.querySelector('#completeBtn').addEventListener('click', async ()=>{
    await window.AILeadStats.increment(m.id,'completions');
    document.querySelector('#doneFeedback').textContent='完成。下一次可換成已確認適合使用的實際工作文件。';
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
    document.querySelector(`#${feedbackId}`).textContent='這一步仍需要人回到原始資料驗證，不能只依 AI 文字完成正式登載。';
  }
}

loadMissions().catch(err=>{
  missionGrid.innerHTML='<p>教材載入失敗，請確認網站是透過 GitHub Pages/HTTP 開啟，而不是直接雙擊本機 HTML。</p>';
  console.error(err);
});
