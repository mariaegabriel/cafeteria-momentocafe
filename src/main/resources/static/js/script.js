/* ---------- dados ---------- */
const PRODUCTS = {
    "Cafés": [
        { id: 'c1', name: 'Expresso tradicional', desc: 'Grãos de torra média, extração curta e encorpada.', price: 7.5, icon: '☕' },
        { id: 'c2', name: 'Coado Fazenda Marin', desc: 'Método filtrado, notas de caramelo e frutas secas.', price: 9.9, icon: '🫖' },
        { id: 'c3', name: 'Cappuccino cremoso', desc: 'Espresso duplo com leite vaporizado e canela.', price: 12.0, icon: '🥛' },
    ],
    "Doces": [
        { id: 'd1', name: 'Bolo de fubá da casa', desc: 'Receita de família, servido morno com café.', price: 11.0, icon: '🍰' },
        { id: 'd2', name: 'Brownie de cacau 70%', desc: 'Textura densa, com nozes torradas.', price: 10.5, icon: '🍫' },
        { id: 'd3', name: 'Torta de limão siciliano', desc: 'Massa amanteigada e creme azedinho.', price: 13.5, icon: '🍋' },
    ],
    "Salgados": [
        { id: 's1', name: 'Pão de queijo mineiro', desc: 'Porção com 4 unidades, assadas na hora.', price: 9.0, icon: '🧀' },
        { id: 's2', name: 'Croissant de presunto e queijo', desc: 'Massa folhada artesanal recheada.', price: 14.0, icon: '🥐' },
        { id: 's3', name: 'Quiche de alho-poró', desc: 'Fatia individual, massa crocante.', price: 15.5, icon: '🥧' },
    ]
};
const USERS = {
    'cliente@momento.cafe': { pass: 'cliente123', role: 'cliente', name: 'Carolina Souza' },
    'gerente@momento.cafe': { pass: 'gerente123', role: 'gerente', name: 'Diego Martins' }
};
const ORDERS = [
    { id: '#1042', user: 'cliente@momento.cafe', items: '1x Cappuccino, 1x Pão de queijo', status: 'em_atendimento', ts: 'Hoje, 09:12' },
    { id: '#1039', user: 'cliente@momento.cafe', items: '2x Expresso, 1x Brownie', status: 'finalizado', ts: 'Ontem, 16:40' },
    { id: '#1031', user: 'cliente@momento.cafe', items: '1x Coado Fazenda Marin', status: 'finalizado', ts: '22/09, 08:05' },
    { id: '#1044', user: 'outro@cliente.com', items: '3x Croissant, 2x Cappuccino', status: 'em_atendimento', ts: 'Hoje, 10:30' },
];

/* ---------- sessão ---------- */
function getSession() { try { return JSON.parse(localStorage.getItem('mc_session') || 'null') } catch (e) { return null } }
function setSession(s) { try { localStorage.setItem('mc_session', JSON.stringify(s)) } catch (e) { } }

function renderHeader() {
    const s = getSession();
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const navAdmin = document.getElementById('navAdmin');
    if (loginBtn) loginBtn.style.display = s ? 'none' : 'inline-block';
    if (logoutBtn) logoutBtn.style.display = s ? 'inline-block' : 'none';
    if (navAdmin) navAdmin.style.display = (s && s.role === 'gerente') ? 'inline-block' : 'none';
}

function openLogin() { const m = document.getElementById('loginModal'); if (m) { m.style.display = 'flex'; document.getElementById('loginErr').style.display = 'none'; } }
function closeLogin() { const m = document.getElementById('loginModal'); if (m) m.style.display = 'none'; }
function doLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPass').value;
    const u = USERS[email];
    if (!u || u.pass !== pass) { document.getElementById('loginErr').style.display = 'block'; return; }
    setSession({ email, role: u.role, name: u.name });
    closeLogin();
    renderHeader();
    if (document.getElementById('pedidosLocked')) renderPedidos();
    if (document.getElementById('adminLocked')) renderAdmin();
}
function doLogout() {
    try { localStorage.removeItem('mc_session') } catch (e) { }
    const onPrivate = document.getElementById('pedidosLocked') || document.getElementById('adminLocked');
    if (onPrivate) { window.location.href = 'index.html'; } else { renderHeader(); }
}

/* ---------- menu mobile ---------- */
function initNav() {
    const burger = document.getElementById('burgerBtn');
    if (burger) burger.onclick = () => document.getElementById('mainNav').classList.toggle('open');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    if (loginBtn) loginBtn.onclick = openLogin;
    if (logoutBtn) logoutBtn.onclick = doLogout;
}

/* ---------- cardápio ---------- */
let activeGroup = 'Cafés';
function renderMenu() {
    const tabs = document.getElementById('menuTabs');
    if (!tabs) return;
    tabs.innerHTML = Object.keys(PRODUCTS).map(g => `<button data-g="${g}" class="${g === activeGroup ? 'active' : ''}">${g}</button>`).join('');
    tabs.querySelectorAll('button').forEach(b => b.onclick = () => { activeGroup = b.dataset.g; renderMenu(); });
    const grid = document.getElementById('prodGrid');
    grid.innerHTML = PRODUCTS[activeGroup].map(p => `
    <div class="prod-card">
      <div class="photo-frame">${p.icon}</div>
      <div class="prod-body">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="prod-foot">
          <span class="price">R$ ${p.price.toFixed(2).replace('.', ',')}</span>
          <button class="addbtn" id="add-${p.id}" onclick="addItem('${p.id}')">Adicionar</button>
        </div>
      </div>
    </div>`).join('');
}
function addItem(id) {
    const btn = document.getElementById('add-' + id);
    btn.textContent = 'Adicionado ✓';
    btn.classList.add('added');
    setTimeout(() => { btn.textContent = 'Adicionar'; btn.classList.remove('added'); }, 1600);
}
function initModeRow() {
    document.querySelectorAll('.mode-row button').forEach(b => {
        b.onclick = () => { document.querySelectorAll('.mode-row button').forEach(x => x.classList.remove('active')); b.classList.add('active'); };
    });
}

/* ---------- pedidos (cliente) ---------- */
function renderPedidos() {
    const s = getSession();
    const locked = document.getElementById('pedidosLocked');
    const content = document.getElementById('pedidosContent');
    if (!locked) return;
    if (!s) { locked.style.display = 'block'; content.style.display = 'none'; return; }
    locked.style.display = 'none'; content.style.display = 'block';
    document.getElementById('pedUserName').textContent = s.name;
    const mine = ORDERS.filter(o => o.user === s.email);
    document.getElementById('pedList').innerHTML = mine.length ? mine.map(o => `
    <div class="order-card">
      <div><div class="order-id">${o.id}</div><div class="order-items">${o.items}</div><div class="order-items">${o.ts}</div></div>
      <span class="status ${o.status}">${o.status === 'em_atendimento' ? 'Em atendimento' : 'Finalizado'}</span>
    </div>`).join('') : '<p style="color:var(--espresso-2)">Você ainda não fez nenhum pedido.</p>';
}

/* ---------- admin (gerente) ---------- */
let adminFilter = 'em_atendimento';
function renderAdmin() {
    const s = getSession();
    const locked = document.getElementById('adminLocked');
    const content = document.getElementById('adminContent');
    if (!locked) return;
    if (!s || s.role !== 'gerente') { locked.style.display = 'block'; content.style.display = 'none'; return; }
    locked.style.display = 'none'; content.style.display = 'block';
    document.querySelectorAll('.admin-tabs button').forEach(b => b.classList.toggle('active', b.dataset.s === adminFilter));
    const list = ORDERS.filter(o => o.status === adminFilter);
    document.getElementById('admList').innerHTML = list.length ? list.map(o => `
    <div class="adm-row">
      <div><div class="cli">${o.id} — ${o.user}</div><div class="ts">${o.ts}</div></div>
      <div class="order-items">${o.items}</div>
      <button class="adv-btn" onclick="advance('${o.id}')">${o.status === 'em_atendimento' ? 'Marcar finalizado' : 'Reabrir'}</button>
    </div>`).join('') : '<p style="color:var(--espresso-2)">Nenhum pedido nesta categoria.</p>';
}
function advance(id) {
    const o = ORDERS.find(x => x.id === id);
    o.status = o.status === 'em_atendimento' ? 'finalizado' : 'em_atendimento';
    renderAdmin();
}
function initAdminTabs() {
    document.querySelectorAll('.admin-tabs button').forEach(b => {
        b.onclick = () => { adminFilter = b.dataset.s; renderAdmin(); };
    });
}

/* ---------- init comum ---------- */
document.addEventListener('DOMContentLoaded', () => {
    initNav();
    renderHeader();
    renderMenu();
    initModeRow();
    renderPedidos();
    initAdminTabs();
    renderAdmin();
});