// admin.js — painel do gerente (Momento Café)
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const lista = $('#lista-atendimento');
  const tabela = $('#tabela-finalizados');

  // ---------- Etapas do pedido ----------
  const ETAPAS = {
    novo: { classe: 'status-novo', icone: 'bi-bell-fill', texto: 'Novo', botao: ['bi-play-fill', 'Iniciar preparo'], proximo: 'preparo' },
    preparo: { classe: 'status-preparo', icone: 'bi-fire', texto: 'Em preparo', botao: ['bi-check-lg', 'Marcar como pronto'], proximo: 'pronto' },
    pronto: { classe: 'status-pronto', icone: 'bi-cup-hot-fill', texto: 'Pronto', botao: ['bi-check2-all', 'Finalizar'], proximo: null }
  };

  const etapaDe = card => Object.keys(ETAPAS).find(k => $('.status', card).classList.contains(ETAPAS[k].classe));

  function setEtapa(card, chave) {
    const e = ETAPAS[chave];
    const status = $('.status', card);
    status.className = `status ${e.classe}`;
    status.innerHTML = `<i class="bi ${e.icone}"></i> ${e.texto}`;
    $('.btn-cafe', card).innerHTML = `<i class="bi ${e.botao[0]}"></i> ${e.botao[1]}`;
  }

  // ---------- Utilitários ----------
  const normalizar = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const paraNumero = t => parseFloat(t.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  const moeda = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\u00a0/g, ' ');
  const esc = t => t.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function aviso(msg, tipo = 'success') {
    const el = document.createElement('div');
    el.className = `toast align-items-center text-bg-${tipo} border-0`;
    el.setAttribute('role', 'status');
    el.innerHTML = `<div class="d-flex"><div class="toast-body">${esc(msg)}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fechar"></button></div>`;
    $('#toast-area').appendChild(el);
    el.addEventListener('hidden.bs.toast', () => el.remove());
    new bootstrap.Toast(el, { delay: 3000 }).show();
  }

  // ---------- Dados do pedido ----------
  function dadosDoCard(card) {
    const cliente = $('.pedido-cliente', card).cloneNode(true);
    $$('.pedido-hora, i', cliente).forEach(n => n.remove());
    return {
      id: $('h4', card).textContent.replace('Pedido', '').trim(),
      cliente: cliente.textContent.trim(),
      itens: $$('.pedido-itens li', card).map(li => $('span', li).textContent.trim()).join(', '),
      local: $('.pedido-info span', card).textContent.trim(),
      hora: $('.pedido-hora', card).textContent.trim(),
      total: $('.pedido-info strong', card).textContent.trim()
    };
  }

  function criarLinha(d, cancelado) {
    const tr = document.createElement('tr');
    tr.className = 'nova-linha';
    const status = cancelado
      ? '<span class="status status-cancelado"><i class="bi bi-x-circle"></i> Cancelado</span>'
      : '<span class="status status-finalizado"><i class="bi bi-check2-all"></i> Entregue</span>';
    tr.innerHTML = `<td><strong>${esc(d.id)}</strong></td><td>${esc(d.cliente)}</td><td>${esc(d.itens)}</td>
      <td>${esc(d.local)}</td><td>${esc(d.hora)}</td><td><strong>${esc(d.total)}</strong></td><td>${status}</td>`;
    return tr;
  }

  function encerrar(card, cancelado) {
    const dados = dadosDoCard(card);
    const coluna = card.closest('[class*="col-"]');
    card.classList.add('saindo');
    setTimeout(() => {
      coluna.remove();
      tabela.prepend(criarLinha(dados, cancelado));
      atualizar();
    }, 250);
    aviso(cancelado ? `Pedido ${dados.id} cancelado.` : `Pedido ${dados.id} finalizado.`, cancelado ? 'danger' : 'success');
  }

  // ---------- Ações dos botões ----------
  lista.addEventListener('click', e => {
    const btn = e.target.closest('button');
    const card = btn && btn.closest('.pedido-card');
    if (!card) return;

    if (btn.classList.contains('btn-outline-cafe')) {
      const id = $('h4', card).textContent;
      if (confirm(`Cancelar o ${id}?`)) encerrar(card, true);
      return;
    }

    const etapa = ETAPAS[etapaDe(card)];
    if (etapa.proximo) {
      setEtapa(card, etapa.proximo);
      aviso(`${$('h4', card).textContent}: ${ETAPAS[etapa.proximo].texto.toLowerCase()}.`, 'info');
    } else {
      encerrar(card, false);
    }
  });

  // ---------- Busca ----------
  function vazio(ref, id) {
    const p = document.createElement('p');
    p.id = id;
    p.className = 'vazio-estado';
    p.hidden = true;
    ref.after(p);
    return p;
  }
  const vazioLista = vazio(lista, 'vazio-atendimento');
  const vazioTabela = vazio($('.table-responsive'), 'vazio-finalizados');

  function filtrar() {
    const q1 = normalizar($('#busca-atendimento').value.trim());
    const cols = $$('[class*="col-"]', lista);
    cols.forEach(c => c.classList.toggle('d-none', !normalizar(c.textContent).includes(q1)));
    const vis1 = cols.filter(c => !c.classList.contains('d-none')).length;
    vazioLista.hidden = vis1 > 0;
    vazioLista.textContent = cols.length ? 'Nenhum pedido encontrado.' : 'Nenhum pedido em atendimento. ☕';

    const q2 = normalizar($('#busca-finalizados').value.trim());
    const linhas = $$('tr', tabela);
    linhas.forEach(tr => tr.classList.toggle('d-none', !normalizar(tr.textContent).includes(q2)));
    const vis2 = linhas.filter(tr => !tr.classList.contains('d-none')).length;
    vazioTabela.hidden = vis2 > 0;
    vazioTabela.textContent = linhas.length ? 'Nenhum pedido encontrado.' : 'Nenhum pedido finalizado ainda.';
  }
  $('#busca-atendimento').addEventListener('input', filtrar);
  $('#busca-finalizados').addEventListener('input', filtrar);

  // ---------- Contadores e faturamento ----------
  function atualizar() {
    const ativos = $$('.pedido-card', lista);
    const linhas = $$('tr', tabela);
    // Faturamento = soma dos pedidos não cancelados
    const total =
      ativos.reduce((s, c) => s + paraNumero($('.pedido-info strong', c).textContent), 0) +
      linhas.filter(tr => !$('.status-cancelado', tr))
        .reduce((s, tr) => s + paraNumero($('td:nth-child(6)', tr).textContent), 0);

    $('#contador-atendimento').textContent = ativos.length;
    $('#contador-finalizados').textContent = linhas.length;
    $('#resumo-atendimento').textContent = ativos.length;
    $('#resumo-finalizados').textContent = linhas.length;
    $('#resumo-total').textContent = ativos.length + linhas.length;
    $('#resumo-faturamento').textContent = moeda(total);
    filtrar();
  }

  // ---------- Abas (botões no topo) ----------
  $$('.aba-btn').forEach(btn => btn.addEventListener('click', () => {
    $$('.aba-btn').forEach(b => {
      const ativo = b === btn;
      b.classList.toggle('ativo', ativo);
      b.setAttribute('aria-selected', ativo);
    });
    $$('.painel').forEach(p => p.classList.toggle('ativo', p.id === btn.dataset.alvo));
  }));

  // ---------- Login do funcionário ----------
  const raiz = document.documentElement;
  const definirAcesso = gerente => {
    raiz.classList.toggle('is-gerente', gerente);
    raiz.classList.toggle('is-visitante', !gerente);
  };

  $('#formLoginFuncionario').addEventListener('submit', e => {
    e.preventDefault();
    const email = $('#funcEmail').value.trim().toLowerCase();
    const senha = $('#funcSenha').value;
    const erroEl = $('#funcErro');
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const user = usuarios.find(u => u.email === email && u.senha === senha);

    if (!email || !senha) { erroEl.textContent = 'Informe e-mail e senha.'; return; }
    if (!user) { erroEl.textContent = 'E-mail ou senha incorretos.'; return; }
    if (user.tipo !== 'gerente') { erroEl.textContent = 'Esta conta não tem acesso de gerente.'; return; }

    erroEl.textContent = '';
    localStorage.setItem('tipoUsuario', 'gerente');
    e.target.reset();
    definirAcesso(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // login.js — Momento Café
    // Valida e-mail e senha contra as contas criadas no cadastro (localStorage, chave "usuarios").
    (() => {
      const form = document.querySelector('form');
      if (!form) return;

      const campoSenha = form.querySelector('input[type="password"]');
      const campoEmail =
        form.querySelector('input[type="email"]') ||
        [...form.querySelectorAll('input')].find(i => !['password', 'checkbox', 'hidden'].includes(i.type));

      // Mensagem de erro (usa uma existente ou cria uma)
      let erroEl = form.querySelector('[role="alert"], .form-erro-geral, .erro-login');
      if (!erroEl) {
        erroEl = document.createElement('p');
        erroEl.setAttribute('role', 'alert');
        erroEl.style.cssText = 'color:#b3261e;font-size:.9rem;margin:.5rem 0';
        form.querySelector('button[type="submit"]').before(erroEl);
      }
      const mostrarErro = msg => { erroEl.textContent = msg; };

      [campoEmail, campoSenha].forEach(c => c.addEventListener('input', () => mostrarErro('')));

      form.setAttribute('novalidate', '');
      form.addEventListener('submit', e => {
        e.preventDefault();

        const email = campoEmail.value.trim().toLowerCase();
        const senha = campoSenha.value;

        if (!email || !senha) return mostrarErro('Informe e-mail e senha.');

        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        const user = usuarios.find(u => u.email === email && u.senha === senha);

        if (!user) return mostrarErro('E-mail ou senha incorretos.');

        localStorage.setItem('tipoUsuario', user.tipo);   // "cliente" ou "gerente"
        localStorage.setItem('nomeUsuario', user.nome);
        localStorage.setItem('usuarioLogado', JSON.stringify({ nome: user.nome, email: user.email, tipo: user.tipo }));

        window.location.href = user.tipo === 'gerente' ? 'admin.html' : 'pedidos.html';
      });
    })();
  });

  // ---------- Sair ----------
  $('#btn-sair').addEventListener('click', e => {
    e.preventDefault();
    localStorage.removeItem('tipoUsuario');
    definirAcesso(false);
    window.scrollTo({ top: 0 });
  });

  atualizar();
})();