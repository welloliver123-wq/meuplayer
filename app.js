'use strict';

/* ================= Config ================= */
const APP = 'meuplayer';
const API = 'https://api.audius.co/v1';
const GENRES = ['Todos', 'Electronic', 'Hip-Hop/Rap', 'Pop', 'Lo-Fi', 'Latin', 'Devotional', 'Jazz', 'Ambient', 'Rock'];

/* ================= Helpers ================= */
const $ = (s) => document.querySelector(s);

function h(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') e.className = v;
    else if (k === 'svg') e.innerHTML = ICON[v] || '';
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}

const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem storage */ } },
};

const fmt = (s) => {
  s = Math.max(0, Math.floor(s || 0));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
};

const svg = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
const ICON = {
  play: svg('M8 5v14l11-7z'),
  pause: svg('M6 19h4V5H6v14zm8-14v14h4V5h-4z'),
  next: svg('M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z'),
  prev: svg('M6 6h2v12H6zm3.5 6l8.5 6V6z'),
  heart: svg('M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z'),
  heartFill: svg('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'),
  plus: svg('M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'),
  shuffle: svg('M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z'),
  repeat: svg('M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z'),
  repeatOne: svg('M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z'),
  home: svg('M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'),
  search: svg('M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'),
  lists: svg('M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z'),
  gear: svg('M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z'),
  trash: svg('M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'),
};

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ================= Estado ================= */
let cfg = store.get('cfg', { apiKey: '', bearer: '' });
let favs = store.get('favs', []);
let lists = store.get('lists', {});
let queue = [];
let idx = -1;
let shuffleOn = false;
let repeatMode = 0; // 0 = off, 1 = todas, 2 = uma
let errStreak = 0;

const audio = new Audio();
audio.preload = 'auto';

/* ================= API Audius ================= */
function norm(x) {
  return {
    id: x.id,
    title: x.title || 'Sem título',
    artist: (x.user && (x.user.name || x.user.handle)) || 'Artista',
    art: (x.artwork && (x.artwork['480x480'] || x.artwork['150x150'])) || '',
    duration: x.duration || 0,
  };
}

async function api(path, params = {}) {
  const u = new URL(API + path);
  u.searchParams.set('app_name', APP);
  if (cfg.apiKey) u.searchParams.set('api_key', cfg.apiKey);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const opt = cfg.bearer ? { headers: { Authorization: 'Bearer ' + cfg.bearer } } : {};
  let r;
  try {
    r = await fetch(u, opt);
  } catch {
    throw new Error('Sem conexão com o Audius. Verifique sua internet.');
  }
  if (r.status === 401 || r.status === 403) {
    throw new Error('O Audius recusou o acesso (' + r.status + '). Vá em Ajustes e cole sua API key e Bearer token (grátis em api.audius.co/plans).');
  }
  if (!r.ok) throw new Error('Erro do Audius (' + r.status + '). Tente de novo daqui a pouco.');
  const j = await r.json();
  return (j.data || []).filter((t) => t && t.is_streamable !== false).map(norm);
}

function streamUrl(id) {
  const u = new URL(`${API}/tracks/${id}/stream`);
  u.searchParams.set('app_name', APP);
  if (cfg.apiKey) u.searchParams.set('api_key', cfg.apiKey);
  return u.toString();
}

/* ================= Favoritos e playlists ================= */
const isFav = (id) => favs.some((t) => t.id === id);
function toggleFav(t) {
  if (isFav(t.id)) favs = favs.filter((x) => x.id !== t.id);
  else favs.unshift(t);
  store.set('favs', favs);
  refreshHearts();
}
function saveLists() { store.set('lists', lists); }

function refreshHearts() {
  document.querySelectorAll('[data-heart]').forEach((b) => {
    const on = isFav(b.dataset.heart);
    b.innerHTML = ICON[on ? 'heartFill' : 'heart'];
    b.classList.toggle('fav-on', on);
  });
}

function pickList(t) {
  const d = $('#dlg');
  const names = Object.keys(lists);
  const close = () => d.close();
  d.replaceChildren(
    h('h3', {}, 'Adicionar à playlist'),
    ...names.map((n) =>
      h('div', {
        class: 'card',
        onclick: () => {
          if (!lists[n].some((x) => x.id === t.id)) lists[n].push(t);
          saveLists();
          close();
          toast('Adicionada em "' + n + '"');
        },
      }, h('div', {}, h('b', {}, n), h('span', {}, lists[n].length + ' faixas'))),
    ),
    h('div', { class: 'bar' },
      h('button', {
        class: 'btn',
        onclick: () => {
          const n = (prompt('Nome da nova playlist:') || '').trim();
          if (!n) return;
          if (!lists[n]) lists[n] = [];
          if (!lists[n].some((x) => x.id === t.id)) lists[n].push(t);
          saveLists();
          close();
          toast('Playlist "' + n + '" criada');
        },
      }, 'Nova playlist'),
      h('button', { class: 'btn ghost', onclick: close }, 'Cancelar'),
    ),
  );
  d.showModal();
}

/* ================= Player ================= */
function play(tracks, i) {
  queue = tracks.slice();
  idx = i;
  errStreak = 0;
  loadCurrent();
}

function loadCurrent() {
  const t = queue[idx];
  if (!t) return;
  audio.src = streamUrl(t.id);
  audio.play().catch(() => {});
  updateUI();
  setMedia(t);
}

function next(auto) {
  if (!queue.length) return;
  if (auto && repeatMode === 2) { audio.currentTime = 0; audio.play().catch(() => {}); return; }
  if (shuffleOn && queue.length > 1) {
    let n;
    do { n = Math.floor(Math.random() * queue.length); } while (n === idx);
    idx = n;
  } else if (idx + 1 < queue.length) {
    idx++;
  } else if (repeatMode === 1 || !auto) {
    idx = 0;
  } else {
    return; // fim da fila
  }
  loadCurrent();
}

function prev() {
  if (!queue.length) return;
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  idx = idx > 0 ? idx - 1 : queue.length - 1;
  loadCurrent();
}

function toggle() {
  if (!audio.src) return;
  if (audio.paused) audio.play().catch(() => {}); else audio.pause();
}

function updateUI() {
  const t = queue[idx];
  $('#pTitle').textContent = t ? t.title : 'Nada tocando';
  $('#pArtist').textContent = t ? t.artist : 'Escolha uma música';
  const a = $('#pArt');
  if (t && t.art) { a.src = t.art; a.style.visibility = 'visible'; } else { a.removeAttribute('src'); a.style.visibility = 'hidden'; }
  $('#bPlay').innerHTML = ICON[audio.paused ? 'play' : 'pause'];
  document.querySelectorAll('.row').forEach((r) => r.classList.toggle('now', !!t && r.dataset.id === t.id));
}

function setMedia(t) {
  if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: t.title,
    artist: t.artist,
    artwork: t.art ? [{ src: t.art, sizes: '480x480' }] : [],
  });
}

function initControls() {
  $('#bPlay').innerHTML = ICON.play;
  $('#bPrev').innerHTML = ICON.prev;
  $('#bNext').innerHTML = ICON.next;
  $('#bShuffle').innerHTML = ICON.shuffle;
  $('#bRepeat').innerHTML = ICON.repeat;

  $('#bPlay').onclick = toggle;
  $('#bPrev').onclick = prev;
  $('#bNext').onclick = () => next(false);
  $('#bShuffle').onclick = () => {
    shuffleOn = !shuffleOn;
    $('#bShuffle').classList.toggle('on', shuffleOn);
    toast(shuffleOn ? 'Aleatório ligado' : 'Aleatório desligado');
  };
  $('#bRepeat').onclick = () => {
    repeatMode = (repeatMode + 1) % 3;
    $('#bRepeat').innerHTML = ICON[repeatMode === 2 ? 'repeatOne' : 'repeat'];
    $('#bRepeat').classList.toggle('on', repeatMode > 0);
    toast(['Repetir: desligado', 'Repetir: todas', 'Repetir: esta faixa'][repeatMode]);
  };

  const seek = $('#seek');
  let dragging = false;
  seek.addEventListener('input', () => { dragging = true; });
  seek.addEventListener('change', () => {
    if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
    dragging = false;
  });
  audio.addEventListener('timeupdate', () => {
    $('#tCur').textContent = fmt(audio.currentTime);
    if (!dragging && audio.duration) seek.value = Math.round((audio.currentTime / audio.duration) * 1000);
  });
  audio.addEventListener('loadedmetadata', () => { $('#tDur').textContent = fmt(audio.duration); });
  audio.addEventListener('playing', () => { errStreak = 0; updateUI(); });
  audio.addEventListener('play', updateUI);
  audio.addEventListener('pause', updateUI);
  audio.addEventListener('ended', () => next(true));
  audio.addEventListener('error', () => {
    errStreak++;
    if (errStreak >= 3) { toast('Não consegui tocar. Confira Ajustes (API key) e a conexão.'); return; }
    toast('Faixa indisponível, pulando…');
    setTimeout(() => next(true), 800);
  });

  $('#vol').addEventListener('input', (e) => { audio.volume = e.target.value / 100; });

  if ('mediaSession' in navigator) {
    const ms = navigator.mediaSession;
    const set = (a, f) => { try { ms.setActionHandler(a, f); } catch { /* ação não suportada */ } };
    set('play', () => audio.play());
    set('pause', () => audio.pause());
    set('previoustrack', prev);
    set('nexttrack', () => next(false));
    set('seekto', (d) => { if (d.seekTime != null) audio.currentTime = d.seekTime; });
  }
}

/* ================= Telas ================= */
const main = $('#main');
let view = 'home';
let viewArg = null;
let genre = 'Todos';
let token = 0;

function go(v, arg) {
  view = v;
  viewArg = arg == null ? null : arg;
  document.querySelectorAll('#nav button').forEach((b) => {
    b.classList.toggle('on', b.dataset.v === v || (v === 'playlist' && b.dataset.v === 'lists'));
  });
  render();
  main.scrollTop = 0;
}

function render() {
  token++;
  ({ home: renderHome, search: renderSearch, favs: renderFavs, lists: renderLists, playlist: renderPlaylist, settings: renderSettings })[view]();
}

function iconBtn(name, label, fn, extra = {}) {
  return h('button', { class: 'ib', 'aria-label': label, svg: name, onclick: fn, ...extra });
}

function row(t, tracks, i, opts = {}) {
  const playNow = () => play(tracks, i);
  const fav = isFav(t.id);
  return h('div', { class: 'row' + (queue[idx] && queue[idx].id === t.id ? ' now' : ''), 'data-id': t.id },
    h('img', { src: t.art, alt: '', loading: 'lazy', onclick: playNow }),
    h('div', { class: 'meta', onclick: playNow }, h('b', {}, t.title), h('span', {}, t.artist)),
    h('span', { class: 'dur' }, fmt(t.duration)),
    iconBtn(fav ? 'heartFill' : 'heart', 'Curtir', () => toggleFav(t), { 'data-heart': t.id, class: 'ib' + (fav ? ' fav-on' : '') }),
    iconBtn('plus', 'Adicionar à playlist', () => pickList(t)),
    opts.remove ? iconBtn('trash', 'Remover', opts.remove) : null,
  );
}

function trackList(tracks, opts) {
  return h('div', {}, tracks.map((t, i) => row(t, tracks, i, opts && opts.removeFor ? { remove: () => opts.removeFor(t) } : {})));
}

function playAllBar(tracks) {
  return h('div', { class: 'bar' },
    h('button', { class: 'btn', onclick: () => play(tracks, 0) }, '▶ Tocar tudo'),
    h('button', { class: 'btn ghost', onclick: () => { shuffleOn = true; $('#bShuffle').classList.add('on'); play(tracks, Math.floor(Math.random() * tracks.length)); } }, 'Aleatório'),
  );
}

async function fill(box, promise, my, emptyMsg) {
  box.replaceChildren(h('div', { class: 'msg' }, 'Carregando…'));
  try {
    const tracks = await promise;
    if (my !== token) return;
    if (!tracks.length) { box.replaceChildren(h('div', { class: 'empty' }, emptyMsg)); return; }
    box.replaceChildren(playAllBar(tracks), trackList(tracks));
  } catch (e) {
    if (my !== token) return;
    box.replaceChildren(h('div', { class: 'msg err' }, e.message));
  }
}

function renderHome() {
  const my = token;
  const box = h('div', {});
  main.replaceChildren(
    h('h1', {}, 'Em alta'),
    h('div', { class: 'sub' }, 'Mais ouvidas da semana no Audius'),
    h('div', { class: 'chips' }, GENRES.map((g) =>
      h('button', { class: 'chip' + (g === genre ? ' on' : ''), onclick: () => { genre = g; renderHome(); } }, g))),
    box,
  );
  const params = { time: 'week', limit: 40 };
  if (genre !== 'Todos') params.genre = genre;
  fill(box, api('/tracks/trending', params), my, 'Nada encontrado nesse gênero.');
}

function renderSearch() {
  const my = token;
  const box = h('div', {});
  let timer;
  const input = h('input', { type: 'search', placeholder: 'Buscar músicas ou artistas…', autocomplete: 'off', enterkeyhint: 'search' });
  const run = () => {
    const q = input.value.trim();
    if (q.length < 2) { box.replaceChildren(h('div', { class: 'empty' }, 'Digite pelo menos 2 letras.')); return; }
    fill(box, api('/tracks/search', { query: q, limit: 40 }), my, 'Nada encontrado para "' + q + '".');
  };
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 450); });
  main.replaceChildren(h('h1', {}, 'Buscar'), input, h('div', { style: 'height:12px' }), box);
  box.replaceChildren(h('div', { class: 'empty' }, 'Procure por música, artista ou gênero.'));
  input.focus();
}

function renderFavs() {
  main.replaceChildren(h('h1', {}, 'Curtidas'));
  if (!favs.length) { main.append(h('div', { class: 'empty' }, 'Toque no coração de uma música para guardá-la aqui.')); return; }
  main.append(h('div', { class: 'sub' }, favs.length + ' músicas'), playAllBar(favs), trackList(favs));
}

function renderLists() {
  const names = Object.keys(lists);
  main.replaceChildren(
    h('h1', {}, 'Playlists'),
    h('div', { class: 'bar' }, h('button', {
      class: 'btn',
      onclick: () => {
        const n = (prompt('Nome da playlist:') || '').trim();
        if (!n) return;
        if (!lists[n]) lists[n] = [];
        saveLists();
        renderLists();
      },
    }, '+ Nova playlist')),
  );
  if (!names.length) { main.append(h('div', { class: 'empty' }, 'Nenhuma playlist ainda.')); return; }
  names.forEach((n) => main.append(h('div', { class: 'card', onclick: () => go('playlist', n) },
    h('div', {}, h('b', {}, n), h('span', {}, lists[n].length + ' faixas')))));
}

function renderPlaylist() {
  const n = viewArg;
  if (!lists[n]) { go('lists'); return; }
  const tracks = lists[n];
  main.replaceChildren(
    h('div', { class: 'bar' }, h('button', { class: 'btn ghost', onclick: () => go('lists') }, '← Voltar')),
    h('h1', {}, n),
    h('div', { class: 'sub' }, tracks.length + ' faixas'),
  );
  if (tracks.length) main.append(playAllBar(tracks));
  main.append(tracks.length
    ? trackList(tracks, { removeFor: (t) => { lists[n] = lists[n].filter((x) => x.id !== t.id); saveLists(); renderPlaylist(); } })
    : h('div', { class: 'empty' }, 'Vazia. Use o + em qualquer música para adicionar.'));
  main.append(h('div', { class: 'bar', style: 'margin-top:24px' }, h('button', {
    class: 'btn danger',
    onclick: () => { if (confirm('Apagar a playlist "' + n + '"?')) { delete lists[n]; saveLists(); go('lists'); } },
  }, 'Apagar playlist')));
}

function renderSettings() {
  const key = h('input', { type: 'password', placeholder: 'API key', value: cfg.apiKey || '', autocomplete: 'off' });
  const bearer = h('input', { type: 'password', placeholder: 'Bearer token', value: cfg.bearer || '', autocomplete: 'off' });
  main.replaceChildren(
    h('h1', {}, 'Ajustes'),
    h('div', { class: 'note' }, 'O Audius pode exigir uma chave gratuita. Se as músicas não carregarem, crie a sua em ',
      h('a', { href: 'https://api.audius.co/plans', target: '_blank', rel: 'noopener' }, 'api.audius.co/plans'),
      ' e cole abaixo. Ela fica só no seu aparelho.'),
    h('label', {}, 'API key'), key,
    h('label', {}, 'Bearer token'), bearer,
    h('div', { class: 'bar', style: 'margin-top:16px' },
      h('button', {
        class: 'btn',
        onclick: () => { cfg = { apiKey: key.value.trim(), bearer: bearer.value.trim() }; store.set('cfg', cfg); toast('Salvo'); },
      }, 'Salvar')),
    h('div', { class: 'note' }, 'Curtidas e playlists ficam salvas neste navegador. Para instalar como app: menu do navegador → "Adicionar à tela inicial".'),
    h('div', { class: 'note' }, 'As músicas vêm do Audius (plataforma aberta de artistas independentes). Uso pessoal; credite sempre os artistas.'),
  );
}

/* ================= Início ================= */
function init() {
  const tabs = { home: ['home', 'Início'], search: ['search', 'Buscar'], favs: ['heart', 'Curtidas'], lists: ['lists', 'Playlists'], settings: ['gear', 'Ajustes'] };
  document.querySelectorAll('#nav button').forEach((b) => {
    const [ic, label] = tabs[b.dataset.v];
    b.innerHTML = ICON[ic];
    b.setAttribute('aria-label', label);
    b.onclick = () => go(b.dataset.v);
  });
  initControls();
  updateUI();
  render();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
