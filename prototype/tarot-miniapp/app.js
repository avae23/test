/* Таро-расклад дня — прототип Telegram Mini App. Без зависимостей. */
(function () {
  'use strict';

  // ---------- Telegram WebApp ----------
  const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  const inTelegram = !!(tg && tg.initData); // initData пуст вне клиента Telegram
  if (tg) {
    try { tg.ready(); tg.expand(); tg.setHeaderColor && tg.setHeaderColor('#14102a'); } catch (e) { /* noop */ }
  }
  const haptic = (type) => { try { tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred(type || 'light'); } catch (e) {} };

  // Ссылку на инвойс должен выдавать бэкенд (Bot API createInvoiceLink, currency XTR, 50 Stars).
  const INVOICE_URL = 'https://t.me/$PLACEHOLDER_INVOICE';
  const HISTORY_KEY = 'tarot_history_v1';

  // ---------- Колода: 22 старших аркана ----------
  const G = '#e7c06a'; // золото
  const S = `stroke="${G}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  const F = `fill="${G}"`;
  const star = (cx, cy, r, n = 5, inner = 0.45) => {
    let p = '';
    for (let i = 0; i < n * 2; i++) {
      const rr = i % 2 ? r * inner : r;
      const a = (Math.PI / n) * i - Math.PI / 2;
      p += `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)} `;
    }
    return `<polygon points="${p}" ${F}/>`;
  };
  const rays = (cx, cy, r1, r2, n) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const a = (2 * Math.PI / n) * i;
      d += `M${(cx + r1 * Math.cos(a)).toFixed(1)} ${(cy + r1 * Math.sin(a)).toFixed(1)}L${(cx + r2 * Math.cos(a)).toFixed(1)} ${(cy + r2 * Math.sin(a)).toFixed(1)}`;
    }
    return `<path d="${d}" ${S}/>`;
  };

  // Символы рисуются в зоне ~ x:16..88, y:28..124 (viewBox 104x170)
  const CARDS = [
    { n: 0, name: 'Шут', key: 'Начало пути',
      text: 'Сегодня день для смелого первого шага и спонтанных решений. Доверьтесь любопытству — новое начинание может оказаться удачнее, чем кажется. Главное — не терять голову полностью.',
      art: `${rays(76, 42, 9, 15, 10)}<circle cx="76" cy="42" r="6" ${F}/><path d="M16 118 L56 104 L58 124" ${S}/><circle cx="44" cy="64" r="6" ${S}/><path d="M44 70 L44 92 M44 92 L36 104 M44 92 L52 104 M44 76 L32 70 M44 76 L58 72 L64 60" ${S}/><circle cx="66" cy="57" r="4" ${F}/>` },
    { n: 1, name: 'Маг', key: 'Воля и мастерство',
      text: 'У вас есть все инструменты, чтобы воплотить задуманное. Сосредоточьтесь на одной цели и действуйте уверенно. Слова и намерения сегодня обладают особой силой.',
      art: `<path d="M34 40 C34 28 52 28 52 40 C52 52 70 52 70 40 C70 28 52 28 52 40 C52 52 34 52 34 40Z" ${S}/><path d="M52 60 L52 112" ${S}/>${star(52, 60, 7, 4)}<path d="M24 114 H80" ${S}/><circle cx="30" cy="104" r="5" ${S}/><path d="M68 98 l6 12 h-12z" ${S}/>` },
    { n: 2, name: 'Верховная Жрица', key: 'Интуиция',
      text: 'Ответы уже внутри вас — прислушайтесь к интуиции и снам. Не торопитесь раскрывать планы, сейчас важнее наблюдать. Тайное скоро станет явным.',
      art: `<path d="M26 30 V122 M78 30 V122" ${S}/><rect x="22" y="26" width="8" height="6" ${F}/><rect x="74" y="26" width="8" height="6" ${F}/><path d="M60 50 A16 16 0 1 1 60 80 A12 12 0 1 0 60 50Z" ${F}/><path d="M38 96 h28 v20 h-28z M42 102 h20 M42 108 h14" ${S}/>` },
    { n: 3, name: 'Императрица', key: 'Изобилие',
      text: 'Время заботы, творчества и удовольствий. Всё, во что вы вкладываете любовь, сегодня растёт и плодоносит. Побалуйте себя и близких.',
      art: `<path d="M52 36 C30 36 30 64 52 64 C74 64 74 36 52 36Z" ${S}/><path d="M52 64 V76 M44 70 H60" ${S}/><path d="M24 120 C32 96 40 96 44 120 M46 120 C54 92 62 92 66 120 M68 120 C74 100 80 100 84 120" ${S}/>${star(52, 26, 6, 6)}` },
    { n: 4, name: 'Император', key: 'Порядок и власть',
      text: 'День для структуры, планов и твёрдых решений. Возьмите ответственность на себя — вас услышат. Дисциплина сейчас приносит больше, чем вдохновение.',
      art: `<path d="M28 120 V66 H76 V120 M22 120 H82" ${S}/><path d="M34 66 V48 L44 58 L52 40 L60 58 L70 48 V66" ${S}/><path d="M40 82 h24 M40 94 h24 M40 106 h24" ${S}/>` },
    { n: 5, name: 'Иерофант', key: 'Традиция',
      text: 'Опирайтесь на проверенные правила и опыт наставников. Хороший совет от старшего или эксперта сэкономит много сил. Сегодня полезно учиться и учить.',
      art: `<path d="M52 30 V120 M38 44 H66 M42 58 H62 M46 72 H58" ${S}/><path d="M30 104 l10 -10 l10 10 l-10 10z M54 104 l10 -10 l10 10 l-10 10z" ${S}/>` },
    { n: 6, name: 'Влюблённые', key: 'Выбор сердца',
      text: 'Важен выбор, сделанный в согласии с собой. Отношения — личные или деловые — выходят на новый уровень честности. Слушайте сердце, но не отключайте разум.',
      art: `${rays(52, 40, 10, 16, 12)}<circle cx="52" cy="40" r="7" ${F}/><path d="M52 112 C24 92 30 66 44 70 C50 72 52 78 52 82 C52 78 54 72 60 70 C74 66 80 92 52 112Z" ${S}/>` },
    { n: 7, name: 'Колесница', key: 'Победа',
      text: 'Вы набираете скорость — держите курс и не отвлекайтесь. Противоречия можно обуздать силой воли. Победа достанется тому, кто управляет собой.',
      art: `<path d="M24 60 H80 V96 H24Z M30 60 V40 H74 V60" ${S}/>${star(52, 50, 6)}<circle cx="34" cy="106" r="12" ${S}/><circle cx="70" cy="106" r="12" ${S}/><circle cx="34" cy="106" r="3" ${F}/><circle cx="70" cy="106" r="3" ${F}/>` },
    { n: 8, name: 'Сила', key: 'Мягкая сила',
      text: 'Ваша сила сегодня — в терпении и доброте, а не в нажиме. Укротите эмоции, и ситуация покорится сама. Вы способны на большее, чем думаете.',
      art: `<path d="M34 40 C34 28 52 28 52 40 C52 52 70 52 70 40 C70 28 52 28 52 40 C52 52 34 52 34 40Z" ${S}/><circle cx="52" cy="90" r="20" ${S}/>${rays(52, 90, 22, 30, 16)}<circle cx="45" cy="86" r="2.5" ${F}/><circle cx="59" cy="86" r="2.5" ${F}/><path d="M46 98 Q52 103 58 98" ${S}/>` },
    { n: 9, name: 'Отшельник', key: 'Поиск истины',
      text: 'Возьмите паузу и побудьте наедине с собой. Тишина подскажет то, что не услышать в суете. Свет, который вы ищете, вы уже несёте сами.',
      art: `<path d="M52 34 L28 120 H76 Z" ${S}/><path d="M76 60 V100" ${S}/><path d="M68 60 h16 l-3 14 h-10z" ${S}/>${star(76, 67, 5, 6)}` },
    { n: 10, name: 'Колесо Фортуны', key: 'Перемены',
      text: 'Колесо повернулось — ждите неожиданных поворотов, чаще в вашу пользу. Используйте шанс, не цепляясь за прежнее. Всё меняется, и это хорошо.',
      art: `<circle cx="52" cy="78" r="32" ${S}/><circle cx="52" cy="78" r="20" ${S}/><circle cx="52" cy="78" r="5" ${F}/>${rays(52, 78, 5, 32, 8)}` },
    { n: 11, name: 'Справедливость', key: 'Равновесие',
      text: 'Всё возвращается по заслугам — будьте честны в словах и поступках. Хороший день для договоров и важных решений. Взвесьте факты, а не эмоции.',
      art: `<path d="M52 32 V118 M40 118 H64 M24 50 H80" ${S}/><path d="M24 50 L16 80 H32 Z M80 50 L72 80 H88 Z" ${S}/><path d="M16 80 Q24 88 32 80 M72 80 Q80 88 88 80" ${S}/>${star(52, 32, 5, 4)}` },
    { n: 12, name: 'Повешенный', key: 'Новый взгляд',
      text: 'Взгляните на ситуацию под другим углом — решение найдётся там, где не ждали. Иногда пауза полезнее действия. Отпустите контроль, и станет легче.',
      art: `<path d="M22 34 H82 M52 34 V60" ${S}/><path d="M52 60 L52 92 M52 60 L42 72 M52 60 L62 72 M52 92 L40 98 M52 92 L64 98" ${S}/><circle cx="52" cy="104" r="7" ${S}/>${rays(52, 104, 10, 15, 10)}` },
    { n: 13, name: 'Смерть', key: 'Трансформация',
      text: 'Что-то завершается, чтобы освободить место новому. Не бойтесь закрывать старые главы — это обновление, а не потеря. Отпустите то, что отжило.',
      art: `<path d="M20 112 Q52 96 84 112" ${S}/><circle cx="52" cy="112" r="10" ${F} opacity=".35"/>${rays(52, 112, 13, 20, 9)}<path d="M52 36 C40 50 40 62 52 76 C64 62 64 50 52 36Z" ${S}/><path d="M52 76 V92 M44 84 C46 78 50 78 52 84 C54 78 58 78 60 84" ${S}/>` },
    { n: 14, name: 'Умеренность', key: 'Гармония',
      text: 'Ищите золотую середину во всём — в делах, еде, эмоциях. Терпение и постепенность принесут лучший результат. Сочетайте несочетаемое, и родится новое.',
      art: `<path d="M26 44 h16 l-2 26 h-12z M62 82 h16 l-2 26 h-12z" ${S}/><path d="M40 60 C52 64 56 74 66 86" ${S} stroke-dasharray="3 4"/>${star(52, 36, 6)}<path d="M28 120 Q52 112 76 120" ${S}/>` },
    { n: 15, name: 'Дьявол', key: 'Искушение',
      text: 'Обратите внимание на привычки и связи, которые держат вас крепче, чем хотелось бы. Искушение сегодня сильно — помните о цене. Цепи часто не заперты.',
      art: `<polygon points="52,112 30,46 84,86 20,86 74,46" ${S}/><path d="M30 36 Q36 46 44 44 M74 36 Q68 46 60 44" ${S}/><path d="M36 120 h32" ${S}/><circle cx="40" cy="120" r="3" ${S}/><circle cx="52" cy="120" r="3" ${S}/><circle cx="64" cy="120" r="3" ${S}/>` },
    { n: 16, name: 'Башня', key: 'Внезапный поворот',
      text: 'Неожиданные события могут разрушить старые планы — и это откроет путь к правде. Не держитесь за то, что рушится. После бури воздух становится чище.',
      art: `<path d="M38 120 V56 H66 V120 M34 56 h36 l-4 -10 h-28z" ${S}/><path d="M48 120 v-12 a4 4 0 0 1 8 0 v12 M46 74 h4 v8 h-4z M56 88 h4 v8 h-4z" ${S}/><path d="M78 24 L62 46 L70 46 L58 62" ${S}/>${star(30, 70, 3, 4)}${star(76, 84, 3, 4)}` },
    { n: 17, name: 'Звезда', key: 'Надежда',
      text: 'После трудностей приходит время исцеления и вдохновения. Верьте в лучшее — Вселенная на вашей стороне. Хороший день для мечтаний и творческих замыслов.',
      art: `${star(52, 58, 22, 8, 0.4)}${star(26, 40, 5, 8)}${star(78, 40, 5, 8)}${star(26, 82, 5, 8)}${star(78, 82, 5, 8)}<path d="M22 112 Q37 102 52 112 T82 112 M22 120 Q37 110 52 120 T82 120" ${S}/>` },
    { n: 18, name: 'Луна', key: 'Иллюзии',
      text: 'Не всё таково, каким кажется: доверяйте интуиции, но проверяйте факты. Тревоги сегодня сильнее реальной угрозы. Подождите, пока туман рассеется.',
      art: `<path d="M56 36 A24 24 0 1 1 56 80 A18 18 0 1 0 56 36Z" ${F}/><path d="M24 120 V90 h10 v30 M70 120 V90 h10 v30" ${S}/><path d="M38 122 Q52 104 66 122" ${S}/>` },
    { n: 19, name: 'Солнце', key: 'Радость',
      text: 'Один из самых светлых дней: успех, ясность и тепло. Делитесь радостью — она умножается. Всё, что вы начинаете сегодня, получит энергию роста.',
      art: `<circle cx="52" cy="70" r="18" ${F}/>${rays(52, 70, 24, 36, 16)}<path d="M20 120 C36 108 68 108 84 120" ${S}/>` },
    { n: 20, name: 'Суд', key: 'Пробуждение',
      text: 'Время подвести итоги и услышать свой внутренний зов. Прошлое отпускает вас — можно начать заново. Важное решение будет верным, если оно честное.',
      art: `<path d="M30 52 L66 36 L70 44 L34 60 Z M66 36 L80 26 V54 L70 44" ${S}/><path d="M24 120 V100 h14 v20 M46 120 V94 h12 v26 M66 120 V100 h14 v20" ${S}/><path d="M78 64 h6 M78 70 l5 3" ${S}/>` },
    { n: 21, name: 'Мир', key: 'Завершение',
      text: 'Цикл успешно завершён — вы на своём месте. Наслаждайтесь гармонией и достигнутым. Скоро откроется новая, ещё более широкая дорога.',
      art: `<ellipse cx="52" cy="78" rx="26" ry="38" ${S}/><ellipse cx="52" cy="78" rx="20" ry="32" ${S} stroke-dasharray="2 4"/>${star(22, 36, 5, 4)}${star(82, 36, 5, 4)}${star(22, 120, 5, 4)}${star(82, 120, 5, 4)}<circle cx="52" cy="78" r="6" ${F}/>` },
  ];

  const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];

  function cardFrontSVG(c) {
    const id = 'g' + c.n + Math.random().toString(36).slice(2, 6);
    return `<svg viewBox="0 0 104 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${c.name}">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d2270"/><stop offset="1" stop-color="#160f38"/></linearGradient></defs>
      <rect width="104" height="170" rx="9" fill="url(#${id})"/>
      <rect x="5" y="5" width="94" height="160" rx="6" fill="none" stroke="${G}" stroke-width="1.2" opacity=".8"/>
      <text x="52" y="21" text-anchor="middle" fill="${G}" font-family="Georgia,serif" font-size="12" font-weight="700">${ROMAN[c.n]}</text>
      <g>${c.art}</g>
      <rect x="10" y="138" width="84" height="20" rx="4" fill="rgba(0,0,0,.35)"/>
      <text x="52" y="152" text-anchor="middle" fill="#f6ecd2" font-family="Georgia,serif" font-size="${c.name.length > 12 ? 8.5 : 10.5}">${c.name}</text>
    </svg>`;
  }

  function cardBackSVG() {
    const id = 'b' + Math.random().toString(36).slice(2, 7);
    return `<svg viewBox="0 0 104 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><pattern id="${id}" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M7 0 L14 7 L7 14 L0 7Z" fill="none" stroke="${G}" stroke-width=".6" opacity=".45"/></pattern></defs>
      <rect width="104" height="170" rx="9" fill="#3a1f7a"/>
      <rect x="6" y="6" width="92" height="158" rx="6" fill="url(#${id})" stroke="${G}" stroke-width="1.4"/>
      <circle cx="52" cy="85" r="24" fill="#3a1f7a" stroke="${G}" stroke-width="1.4"/>
      ${star(52, 85, 16, 8, 0.4)}
      <path d="M44 85 A10 10 0 1 0 54 75 A8 8 0 1 1 44 85Z" fill="#3a1f7a"/>
    </svg>`;
  }

  // ---------- Утилиты ----------
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  function randInt(max) {
    if (window.crypto && crypto.getRandomValues) {
      const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % max;
    }
    return Math.floor(Math.random() * max);
  }
  function drawCards(count) {
    const pool = CARDS.map((c) => c.n);
    const out = [];
    for (let i = 0; i < count; i++) out.push(pool.splice(randInt(pool.length), 1)[0]);
    return out;
  }
  function fmtDate(ts) {
    return new Date(ts).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  }

  // ---------- Хранилище ----------
  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch (e) { return []; }
  }
  function saveHistory(list) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 50))); } catch (e) { /* приватный режим */ }
  }
  function addHistory(entry) { const l = loadHistory(); l.unshift(entry); saveHistory(l); }

  // ---------- Навигация ----------
  let current = null; // { count, cards, opened }
  const stack = [];
  function show(name, push = true) {
    const prev = $('.screen.active');
    if (push && prev) stack.push(prev.id.replace('screen-', ''));
    $$('.screen').forEach((s) => s.classList.toggle('active', s.id === 'screen-' + name));
    window.scrollTo(0, 0);
    if (tg && tg.BackButton) { name === 'home' ? tg.BackButton.hide() : tg.BackButton.show(); }
    if (name === 'history') renderHistory();
    if (name === 'home') stack.length = 0;
  }
  function back() { show(stack.pop() || 'home', false); }
  if (tg && tg.BackButton) tg.BackButton.onClick(back);

  // ---------- Главный экран ----------
  function renderHome() {
    $('#today').textContent = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
    const pv = $('#deck-preview');
    const picks = [0, 17, 19, 18, 21];
    pv.innerHTML = picks.map((n, i) => (i === 2 ? cardBackSVG() : cardFrontSVG(CARDS[n]))).join('');
    Array.from(pv.children).forEach((el, i) => {
      const k = i - 2;
      el.style.transform = `translateX(-50%) rotate(${k * 13}deg) translateY(${Math.abs(k) * 6}px)`;
      el.style.zIndex = String(10 - Math.abs(k));
    });
  }

  // ---------- Расклад ----------
  const POSITIONS = { 1: ['Карта дня'], 3: ['Прошлое', 'Настоящее', 'Будущее'] };

  function startSpread(count) {
    haptic('medium');
    current = { count, cards: drawCards(count), opened: 0, ts: Date.now(), saved: false };
    $('#spread-title').textContent = count === 1 ? 'Карта дня' : 'Три карты';
    $('#spread-hint').textContent = count === 1 ? 'Нажмите на карту, чтобы открыть её' : 'Открывайте карты по одной';
    const table = $('#table');
    table.className = 'table' + (count === 1 ? ' single' : '');
    table.innerHTML = current.cards.map((n, i) => `
      <div class="slot">
        <div class="card" data-i="${i}" role="button" tabindex="0" aria-label="Открыть карту ${i + 1}">
          <div class="face back">${cardBackSVG()}</div>
          <div class="face front">${cardFrontSVG(CARDS[n])}</div>
        </div>
        <span class="slot-label">${POSITIONS[count][i]}</span>
      </div>`).join('');
    $('#readings').innerHTML = '';
    $('#spread-actions').hidden = true;
    $$('#table .card').forEach((el) => {
      el.addEventListener('click', () => flip(el));
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') flip(el); });
    });
    show('spread');
  }

  function flip(el) {
    if (el.classList.contains('flipped')) return;
    haptic('light');
    el.classList.add('flipped');
    const i = +el.dataset.i;
    const c = CARDS[current.cards[i]];
    current.opened++;
    const div = document.createElement('div');
    div.className = 'reading';
    div.innerHTML = `<h4>${c.name}<small>${POSITIONS[current.count][i]} · ${c.key}</small></h4><p>${c.text}</p>`;
    // Чтобы порядок толкований совпадал с порядком карт
    setTimeout(() => {
      const list = $('#readings');
      const after = Array.from(list.children).find((x) => +x.dataset.i > i);
      div.dataset.i = i;
      list.insertBefore(div, after || null);
    }, 450);
    if (current.opened === current.count) finishSpread();
  }

  function finishSpread() {
    $('#spread-hint').textContent = 'Расклад готов';
    if (!current.saved) {
      addHistory({ ts: current.ts, count: current.count, cards: current.cards.slice() });
      current.saved = true;
    }
    setTimeout(() => { $('#spread-actions').hidden = false; }, 600);
    try { tg && tg.HapticFeedback && tg.HapticFeedback.notificationOccurred('success'); } catch (e) {}
  }

  // ---------- Paywall ----------
  function openPaywall() {
    const box = $('#pw-cards');
    const ids = current ? current.cards : [17, 19, 21];
    const list = ids.length === 1 ? [ids[0]] : ids;
    box.innerHTML = list.map((n) => cardFrontSVG(CARDS[n])).join('');
    Array.from(box.children).forEach((el, i) => {
      const k = i - (list.length - 1) / 2;
      el.style.transform = `translateX(-50%) translateX(${k * 62}px) rotate(${k * 8}deg)`;
    });
    show('paywall');
  }

  function pay() {
    haptic('medium');
    if (inTelegram && typeof tg.openInvoice === 'function') {
      try {
        tg.openInvoice(INVOICE_URL, (status) => {
          // status: paid | cancelled | failed | pending. Факт оплаты подтверждает только бэкенд (successful_payment).
          if (status === 'paid') tg.showAlert('Спасибо! Подробный расклад откроется после подтверждения оплаты.');
          else if (status === 'failed') tg.showAlert('Оплата не прошла. Попробуйте ещё раз.');
        });
        return;
      } catch (e) { /* падаем в заглушку */ }
    }
    alert('Прототип: здесь откроется оплата 50 ⭐ через Telegram Stars.\n(Telegram.WebApp.openInvoice недоступен вне Telegram)');
  }

  // ---------- История ----------
  function renderHistory() {
    const list = loadHistory();
    const box = $('#history-list');
    if (!list.length) { box.innerHTML = '<p class="empty">Пока нет раскладов.<br>Сделайте первый!</p>'; return; }
    box.innerHTML = list.map((h) => `
      <div class="h-item">
        <div class="h-date">${fmtDate(h.ts)} · ${h.count === 1 ? 'Карта дня' : 'Три карты'}</div>
        <div class="h-cards">${h.cards.map((n) => cardFrontSVG(CARDS[n])).join('')}</div>
        <div class="h-names">${h.cards.map((n) => CARDS[n].name).join(' · ')}</div>
      </div>`).join('');
  }

  // ---------- События ----------
  $$('.spread-btn').forEach((b) => b.addEventListener('click', () => startSpread(+b.dataset.count)));
  $$('[data-go]').forEach((b) => b.addEventListener('click', () => {
    const t = b.dataset.go; t === 'home' ? show('home', false) : back();
  }));
  $('#btn-history').addEventListener('click', () => show('history'));
  $('#btn-premium').addEventListener('click', openPaywall);
  $('#btn-pay').addEventListener('click', pay);
  $('#btn-clear').addEventListener('click', () => {
    const doClear = () => { saveHistory([]); renderHistory(); };
    if (inTelegram && tg.showConfirm) tg.showConfirm('Очистить историю?', (ok) => ok && doClear());
    else if (confirm('Очистить историю?')) doClear();
  });

  renderHome();
  // Для отладки/тестов
  window.__tarot = { CARDS, cardFrontSVG, startSpread, openPaywall, show };
})();
