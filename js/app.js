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
      <button class="btn ${m.active?'primary':'ghost'}" ${m.active?'':'disabled'}>${m.active?'開始任務':'即將開放'}</button>`;
    if(m.active) card.querySelector('button').addEventListener('click',()=>openMission(m));
    missionGrid.appendChild(card);
  }
}

async function openMission(m){
  await window.AILeadStats.increment(m.id,'views');
  renderMission(m);
  dialog.showModal();
}

function renderMission(m){
  const liked = localStorage.getItem(likedKey(m.id)) === '1';
  missionContent.innerHTML = `
    <p class="eyebrow">${escapeHtml(m.level)} · ${escapeHtml(m.tags.join(' / '))}</p>
    <h2>${escapeHtml(m.title)}</h2>
    <p>這一關不是要求你相信 AI，而是學會讓 AI 提供「可回頭查證」的工作結果。</p>

    <section class="step">
      <h3>1. 先判斷資料風險</h3>
      <p>下面哪一種資料最適合直接拿來練習？</p>
      <div class="choice-grid" id="riskChoices">
        <button type="button" class="choice" data-correct="true">公開或模擬的計畫書</button>
        <button type="button" class="choice">含身分證字號的申請附件</button>
        <button type="button" class="choice">未確認可否使用的內部敏感資料</button>
      </div>
      <div class="feedback" id="riskFeedback" aria-live="polite"></div>
    </section>

    <section class="step">
      <h3>2. 把工作說清楚</h3>
      <p>你真正要 AI 做的不是「幫我看這份文件」，而是：擷取指定欄位、指出來源、找不到就明講。</p>
      <textarea id="promptBox" class="prompt-box">請根據我提供的計畫書，擷取行政初審所需資訊。\n\n只能使用文件中明確出現的內容；若找不到，請標示「文件未載明」，不得自行補充或推測。\n\n請以「欄位｜擷取結果｜原文依據｜頁碼」格式呈現，並將無法確定之處另列為「需人工確認」。</textarea>
      <div class="feedback">這段指令的核心不是華麗，而是限制資料來源、要求證據、容許回答「找不到」。</div>
    </section>

    <section class="step">
      <h3>3. 驗收 AI，而不是照單全收</h3>
      <p>若 AI 回答「執行期間：2026/1/1–2026/12/31」，你的下一步是？</p>
      <div class="choice-grid" id="verifyChoices">
        <button type="button" class="choice">直接貼進表格</button>
        <button type="button" class="choice" data-correct="true">回到原始文件確認日期與頁碼</button>
        <button type="button" class="choice">叫 AI 改寫得更正式</button>
      </div>
      <div class="feedback" id="verifyFeedback" aria-live="polite"></div>
    </section>

    <section class="step">
      <h3>4. 帶回你的工作</h3>
      <p><strong>AI 負責：</strong>找資訊、結構化、指出缺漏。<br><strong>人負責：</strong>理解規定、確認依據、正式登載。</p>
      <button type="button" class="btn primary" id="completeBtn">我完成這個任務</button>
      <button type="button" class="btn ghost like-btn ${liked?'active':''}" id="likeBtn">${liked?'👍 已標記有幫助':'👍 這對我有幫助'}</button>
      <div class="feedback" id="doneFeedback" aria-live="polite"></div>
    </section>`;

  document.querySelectorAll('#riskChoices .choice').forEach(btn => btn.addEventListener('click',()=>markChoice(btn,'riskFeedback','正確：先用公開或模擬資料練習。')));
  document.querySelectorAll('#verifyChoices .choice').forEach(btn => btn.addEventListener('click',()=>markChoice(btn,'verifyFeedback','正確：AI 幫你找，人要回到原文驗證。')));
  document.querySelector('#completeBtn').addEventListener('click', async ()=>{
    await window.AILeadStats.increment(m.id,'completions');
    document.querySelector('#doneFeedback').textContent='完成。下一次請換成你自己的低風險工作案例。';
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
    document.querySelector(`#${feedbackId}`).textContent='這個選擇風險較高。先處理資料風險或回到原始依據，再進下一步。';
  }
}

loadMissions().catch(err=>{
  missionGrid.innerHTML='<p>教材載入失敗，請確認網站是透過 GitHub Pages/HTTP 開啟，而不是直接雙擊本機 HTML。</p>';
  console.error(err);
});
