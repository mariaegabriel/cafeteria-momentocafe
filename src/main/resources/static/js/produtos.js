// produtos.js — Cardápio do Momento Café
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const normalizar = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const paraNumero = t => parseFloat(t.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  const moeda = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\u00a0/g, ' ');
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* =====================================================
     1) TIPO DE ATENDIMENTO (cards do topo <-> opções do pedido)
  ===================================================== */
  const cardsAtend = $$('.atendimento-card');
  const radiosAtend = $$('input[name="atendimento"]');

  function setAtendimento(tipo) {
    cardsAtend.forEach(c => {
      const ativo = c.dataset.atendimento === tipo;
      c.classList.toggle('ativo', ativo);
      c.setAttribute('aria-pressed', ativo);
    });
    radiosAtend.forEach(r => { r.checked = r.value === tipo; });
    $('#campoMesa').classList.toggle('d-none', tipo !== 'mesa');
    $('#campoDelivery').classList.toggle('d-none', tipo !== 'delivery');
    $('#carrinhoErro').textContent = '';
    localStorage.setItem('atendimentoPreferido', tipo);
  }
  const tipoAtual = () => ($('input[name="atendimento"]:checked') || {}).value || 'balcao';

  cardsAtend.forEach(c => c.addEventListener('click', () => setAtendimento(c.dataset.atendimento)));
  radiosAtend.forEach(r => r.addEventListener('change', () => setAtendimento(r.value)));
  setAtendimento(localStorage.getItem('atendimentoPreferido') || 'balcao');

  /* =====================================================
     2) FILTROS + BUSCA
  ===================================================== */
  let filtroAtivo = 'todos';
  const busca = $('#buscaProdutos');

  function filtrar() {
    const termo = normalizar(busca.value.trim());
    let total = 0;

    $$('.category').forEach(sec => {
      const daCategoria = filtroAtivo === 'todos' || sec.dataset.categoria === filtroAtivo;
      let visiveis = 0;

      $$('.product-card', sec).forEach(card => {
        const texto = normalizar($('h3', card).textContent + ' ' + $('p', card).textContent);
        const mostra = daCategoria && texto.includes(termo);
        card.classList.toggle('d-none', !mostra);
        if (mostra) visiveis++;
      });

      sec.classList.toggle('d-none', visiveis === 0);
      total += visiveis;
    });

    $('#semResultados').classList.toggle('d-none', total > 0);
  }

  $('#filtros').addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    $$('.filter-btn').forEach(b => b.classList.toggle('active', b === btn));
    filtroAtivo = btn.dataset.filtro;
    filtrar();
  });
  busca.addEventListener('input', filtrar);
  filtrar();

  /* =====================================================
     3) MEU PEDIDO (carrinho)
  ===================================================== */
  let itens = [];
  const painel = $('#carrinhoPainel');
  const overlay = $('#carrinhoOverlay');
  const listaEl = $('#carrinhoItens');
  const formEl = $('#formPedido');
  const vazioEl = $('#carrinhoVazio');
  const sucessoEl = $('#carrinhoSucesso');
  const contador = $('#contadorPedido');
  const erroEl = $('#carrinhoErro');

  function abrir() {
    painel.classList.add('is-aberto');
    overlay.classList.add('is-aberto');
    painel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function fechar() {
    painel.classList.remove('is-aberto');
    overlay.classList.remove('is-aberto');
    painel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  $('#btnMeuPedido').addEventListener('click', abrir);
  $('#carrinhoFechar').addEventListener('click', fechar);
  overlay.addEventListener('click', fechar);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fechar(); });

  function render() {
    const qtd = itens.reduce((s, i) => s + i.qtd, 0);
    const total = itens.reduce((s, i) => s + i.qtd * i.preco, 0);

    contador.textContent = qtd;
    contador.hidden = qtd === 0;
    contador.classList.toggle('d-none', qtd === 0);

    sucessoEl.classList.add('d-none');
    vazioEl.classList.toggle('d-none', qtd > 0);
    listaEl.classList.toggle('d-none', qtd === 0);
    formEl.classList.toggle('d-none', qtd === 0);

    listaEl.innerHTML = itens.map((i, idx) => `
      <li class="item-pedido">
        <div class="item-info"><strong>${esc(i.nome)}</strong><span>${moeda(i.preco)}</span></div>
        <div class="item-qtd">
          <button type="button" data-acao="menos" data-i="${idx}" aria-label="Diminuir ${esc(i.nome)}">−</button>
          <span>${i.qtd}</span>
          <button type="button" data-acao="mais" data-i="${idx}" aria-label="Aumentar ${esc(i.nome)}">+</button>
        </div>
      </li>`).join('');

    $('#carrinhoTotal').textContent = moeda(total);
  }

  listaEl.addEventListener('click', e => {
    const b = e.target.closest('button[data-acao]');
    if (!b) return;
    const i = itens[Number(b.dataset.i)];
    if (!i) return;
    i.qtd += b.dataset.acao === 'mais' ? 1 : -1;
    if (i.qtd <= 0) itens = itens.filter(x => x !== i);
    render();
  });

  // Botões "Selecionar"
  document.addEventListener('click', e => {
    const btn = e.target.closest('.product-card .select-btn');
    if (!btn) return;
    const card = btn.closest('.product-card');
    const nome = $('h3', card).textContent.trim();
    const preco = paraNumero($('.price', card).textContent);

    const existente = itens.find(i => i.nome === nome);
    existente ? existente.qtd++ : itens.push({ nome, preco, qtd: 1 });
    render();

    btn.textContent = 'Adicionado ✓';
    btn.classList.add('adicionado');
    setTimeout(() => { btn.textContent = 'Selecionar'; btn.classList.remove('adicionado'); }, 900);
  });

  $('#carrinhoLimpar').addEventListener('click', () => { itens = []; erroEl.textContent = ''; render(); });

  // Nome já preenchido se a pessoa estiver logada
  const nomeLogado = localStorage.getItem('nomeUsuario');
  if (nomeLogado) $('#pedidoNome').value = nomeLogado;

  /* ---------- Envio do pedido ---------- */
  formEl.addEventListener('submit', e => {
    e.preventDefault();
    const tipo = tipoAtual();
    const nome = $('#pedidoNome').value.trim();
    const mesa = $('#pedidoMesa').value;
    const endereco = $('#pedidoEndereco').value.trim();
    const telefone = $('#pedidoTelefone').value.trim();

    if (!itens.length) return (erroEl.textContent = 'Adicione ao menos um item ao pedido.');
    if (nome.length < 2) return (erroEl.textContent = 'Informe seu nome.');
    if (tipo === 'mesa' && !mesa) return (erroEl.textContent = 'Selecione o número da mesa.');
    if (tipo === 'delivery') {
      if (endereco.length < 5) return (erroEl.textContent = 'Informe o endereço de entrega.');
      if (telefone.replace(/\D/g, '').length < 10) return (erroEl.textContent = 'Informe um telefone com DDD.');
    }
    erroEl.textContent = '';

    const total = itens.reduce((s, i) => s + i.qtd * i.preco, 0);
    const lista = JSON.parse(localStorage.getItem('pedidosEnviados') || '[]');
    const numero = 1025 + lista.length;

    lista.push({
      numero, cliente: nome, atendimento: tipo,
      mesa: tipo === 'mesa' ? mesa : '', endereco: tipo === 'delivery' ? endereco : '',
      telefone: tipo === 'delivery' ? telefone : '',
      observacao: $('#pedidoObs').value.trim(),
      itens, total,
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'novo'
    });
    localStorage.setItem('pedidosEnviados', JSON.stringify(lista));

    const msg = {
      balcao: 'Avisaremos quando estiver pronto para retirada no balcão.',
      mesa: `Levaremos até a mesa ${mesa}.`,
      delivery: 'Seu pedido sairá para entrega em breve.'
    }[tipo];
    $('#sucessoTexto').textContent = `Pedido #${numero} recebido, ${nome}! ${msg} Total: ${moeda(total)}.`;

    vazioEl.classList.add('d-none');
    listaEl.classList.add('d-none');
    formEl.classList.add('d-none');
    sucessoEl.classList.remove('d-none');

    itens = [];
    contador.hidden = true;
    contador.classList.add('d-none');
    formEl.reset();
    setAtendimento(tipo);
    if (nomeLogado) $('#pedidoNome').value = nomeLogado;
  });

  $('#sucessoFechar').addEventListener('click', () => { fechar(); render(); });

  render();
})();