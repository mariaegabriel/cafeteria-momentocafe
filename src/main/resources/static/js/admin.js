/* ==================== ADMINISTRATIVO (somente gerentes) ==================== */

const CHAVE_USUARIO = 'usuarioLogado';
const CHAVE_PEDIDOS = 'pedidos';

const STATUS = {
    novo: { texto: 'Novo', icone: 'bi-bell-fill', classe: 'status-novo' },
    preparo: { texto: 'Em preparo', icone: 'bi-fire', classe: 'status-preparo' },
    pronto: { texto: 'Pronto', icone: 'bi-cup-hot-fill', classe: 'status-pronto' },
    entregue: { texto: 'Entregue', icone: 'bi-check2-all', classe: 'status-finalizado' },
    cancelado: { texto: 'Cancelado', icone: 'bi-x-circle', classe: 'status-cancelado' }
};

const PROXIMA_ETAPA = {
    novo: { status: 'preparo', texto: 'Iniciar preparo', icone: 'bi-play-fill' },
    preparo: { status: 'pronto', texto: 'Marcar como pronto', icone: 'bi-check-lg' },
    pronto: { status: 'entregue', texto: 'Finalizar', icone: 'bi-check2-all' }
};

const EM_ATENDIMENTO = ['novo', 'preparo', 'pronto'];
const FINALIZADOS = ['entregue', 'cancelado'];

// ---------- Utilitários ----------

function obterUsuario() {
    return JSON.parse(localStorage.getItem(CHAVE_USUARIO) || 'null');
}

function obterPedidos() {
    return JSON.parse(localStorage.getItem(CHAVE_PEDIDOS) || '[]');
}

function salvarPedidos(pedidos) {
    localStorage.setItem(CHAVE_PEDIDOS, JSON.stringify(pedidos));
}

function formatarPreco(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarHora(dataIso) {
    return new Date(dataIso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function ehHoje(dataIso) {
    return new Date(dataIso).toDateString() === new Date().toDateString();
}

function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
}

function correspondeBusca(pedido, termo) {
    if (!termo) return true;
    const alvo = `${pedido.id} #${pedido.id} ${pedido.cliente.nome} ${pedido.local}`.toLowerCase();
    return alvo.includes(termo.toLowerCase());
}

// Pedidos de exemplo para a primeira vez que o painel é aberto
function criarPedidosExemplo() {
    const minutosAtras = (min) => new Date(Date.now() - min * 60000).toISOString();

    return [
        { id: 1024, cliente: { nome: 'Ana Souza', email: 'ana@email.com' }, itens: [{ nome: 'Cappuccino', preco: 12, qtd: 2 }, { nome: 'Pão de Queijo', preco: 8, qtd: 1 }], local: 'Mesa 05', observacao: '', status: 'novo', data: minutosAtras(5) },
        { id: 1023, cliente: { nome: 'Carlos Lima', email: 'carlos@email.com' }, itens: [{ nome: 'Café Expresso', preco: 8, qtd: 1 }, { nome: 'Croissant', preco: 10, qtd: 1 }], local: 'Balcão', observacao: '', status: 'preparo', data: minutosAtras(12) },
        { id: 1022, cliente: { nome: 'Juliana Alves', email: 'juliana@email.com' }, itens: [{ nome: 'Café Gelado', preco: 11, qtd: 1 }, { nome: 'Brownie', preco: 12, qtd: 1 }], local: 'Mesa 12', observacao: '', status: 'pronto', data: minutosAtras(25) },
        { id: 1021, cliente: { nome: 'Pedro Martins', email: 'pedro@email.com' }, itens: [{ nome: 'Frappé', preco: 15, qtd: 2 }], local: 'Delivery - Rua das Flores, 45', observacao: 'Um sem açúcar, por favor.', status: 'preparo', data: minutosAtras(32) },
        { id: 1020, cliente: { nome: 'Mariana Costa', email: 'mariana@email.com' }, itens: [{ nome: 'Cappuccino', preco: 12, qtd: 2 }, { nome: 'Brownie', preco: 12, qtd: 1 }], local: 'Mesa 08', observacao: '', status: 'entregue', data: minutosAtras(50) },
        { id: 1019, cliente: { nome: 'Lucas Ferreira', email: 'lucas@email.com' }, itens: [{ nome: 'Cold Brew', preco: 14, qtd: 1 }], local: 'Balcão', observacao: '', status: 'cancelado', data: minutosAtras(70) }
    ].map(p => ({ ...p, total: p.itens.reduce((soma, i) => soma + i.preco * i.qtd, 0), atualizadoEm: p.data }));
}

// ---------- Renderização ----------

function renderizarCard(pedido) {
    const status = STATUS[pedido.status];
    const proxima = PROXIMA_ETAPA[pedido.status];

    const itens = pedido.itens.map(item => `
        <li><span>${item.qtd}x ${escaparHtml(item.nome)}</span> <span>${formatarPreco(item.preco * item.qtd)}</span></li>
    `).join('');

    const observacao = pedido.observacao ? `
        <div class="pedido-observacao">
            <i class="bi bi-chat-left-text-fill"></i>
            ${escaparHtml(pedido.observacao)}
        </div>` : '';

    const iconeLocal = pedido.local.startsWith('Delivery') ? 'bi-truck'
        : pedido.local.startsWith('Balcão') ? 'bi-bag-fill' : 'bi-geo-alt-fill';

    return `
        <div class="col-md-6 col-xxl-4">
            <div class="pedido-card">

                <div class="pedido-topo">
                    <h4>Pedido #${pedido.id}</h4>
                    <span class="status ${status.classe}">
                        <i class="bi ${status.icone}"></i>
                        ${status.texto}
                    </span>
                </div>

                <div class="pedido-cliente">
                    <i class="bi bi-person-fill"></i>
                    ${escaparHtml(pedido.cliente.nome)}
                    <span class="pedido-hora"><i class="bi bi-clock"></i> ${formatarHora(pedido.data)}</span>
                </div>

                <ul class="pedido-itens">${itens}</ul>

                ${observacao}

                <div class="pedido-info">
                    <span><i class="bi ${iconeLocal}"></i> ${escaparHtml(pedido.local)}</span>
                    <strong>${formatarPreco(pedido.total)}</strong>
                </div>

                <div class="pedido-acoes">
                    <button type="button" class="btn btn-cafe btn-sm" data-acao="avancar" data-id="${pedido.id}">
                        <i class="bi ${proxima.icone}"></i>
                        ${proxima.texto}
                    </button>
                    <button type="button" class="btn btn-outline-cafe btn-sm" data-acao="cancelar" data-id="${pedido.id}">
                        <i class="bi bi-x-lg"></i>
                        Cancelar
                    </button>
                </div>

            </div>
        </div>
    `;
}

function renderizarLinha(pedido) {
    const status = STATUS[pedido.status];
    const itens = pedido.itens.map(i => `${i.qtd}x ${i.nome}`).join(', ');

    return `
        <tr>
            <td><strong>#${pedido.id}</strong></td>
            <td>${escaparHtml(pedido.cliente.nome)}</td>
            <td>${escaparHtml(itens)}</td>
            <td>${escaparHtml(pedido.local)}</td>
            <td>${formatarHora(pedido.data)}</td>
            <td><strong>${formatarPreco(pedido.total)}</strong></td>
            <td><span class="status ${status.classe}"><i class="bi ${status.icone}"></i> ${status.texto}</span></td>
        </tr>
    `;
}

function renderizarResumo(pedidos) {
    const emAtendimento = pedidos.filter(p => EM_ATENDIMENTO.includes(p.status)).length;
    const finalizados = pedidos.filter(p => FINALIZADOS.includes(p.status)).length;
    const faturamento = pedidos
        .filter(p => p.status === 'entregue' && ehHoje(p.data))
        .reduce((soma, p) => soma + p.total, 0);

    document.getElementById('resumoHoje').textContent = pedidos.filter(p => ehHoje(p.data)).length;
    document.getElementById('resumoAtendimento').textContent = emAtendimento;
    document.getElementById('resumoFinalizados').textContent = finalizados;
    document.getElementById('resumoFaturamento').textContent = formatarPreco(faturamento);
    document.getElementById('contadorAtendimento').textContent = emAtendimento;
    document.getElementById('contadorFinalizados').textContent = finalizados;
}

function renderizarAtendimento(pedidos) {
    const termo = document.getElementById('buscaAtendimento').value.trim();
    const lista = pedidos
        .filter(p => EM_ATENDIMENTO.includes(p.status) && correspondeBusca(p, termo))
        .sort((a, b) => new Date(a.data) - new Date(b.data));

    document.getElementById('listaAtendimento').innerHTML = lista.map(renderizarCard).join('');
    document.getElementById('atendimentoVazio').classList.toggle('d-none', lista.length > 0);
}

function renderizarFinalizados(pedidos) {
    const termo = document.getElementById('buscaFinalizados').value.trim();
    const lista = pedidos
        .filter(p => FINALIZADOS.includes(p.status) && correspondeBusca(p, termo))
        .sort((a, b) => new Date(b.atualizadoEm || b.data) - new Date(a.atualizadoEm || a.data));

    const tabela = document.getElementById('tabelaFinalizados');
    tabela.innerHTML = lista.map(renderizarLinha).join('');
    tabela.closest('.tabela-card').classList.toggle('d-none', lista.length === 0);
    document.getElementById('finalizadosVazio').classList.toggle('d-none', lista.length > 0);
}

function renderizarTudo() {
    const pedidos = obterPedidos();
    renderizarResumo(pedidos);
    renderizarAtendimento(pedidos);
    renderizarFinalizados(pedidos);
}

// ---------- Ações ----------

function atualizarStatus(id, novoStatus) {
    const pedidos = obterPedidos();
    const pedido = pedidos.find(p => p.id === id);
    if (!pedido) return;

    pedido.status = novoStatus;
    pedido.atualizadoEm = new Date().toISOString();
    salvarPedidos(pedidos);
    renderizarTudo();
}

function tratarCliqueAcao(evento) {
    const botao = evento.target.closest('[data-acao]');
    if (!botao) return;

    const id = Number(botao.dataset.id);
    const pedido = obterPedidos().find(p => p.id === id);
    if (!pedido) return;

    if (botao.dataset.acao === 'avancar') {
        atualizarStatus(id, PROXIMA_ETAPA[pedido.status].status);
    } else if (confirm(`Deseja cancelar o pedido #${id}?`)) {
        atualizarStatus(id, 'cancelado');
    }
}

// ---------- Inicialização ----------

function iniciarPainel(usuario) {
    document.querySelectorAll('[data-usuario-nome]').forEach(el => {
        el.textContent = usuario.nome;
    });

    if (localStorage.getItem(CHAVE_PEDIDOS) === null) {
        salvarPedidos(criarPedidosExemplo());
    }

    document.getElementById('listaAtendimento').addEventListener('click', tratarCliqueAcao);
    document.getElementById('buscaAtendimento').addEventListener('input', renderizarTudo);
    document.getElementById('buscaFinalizados').addEventListener('input', renderizarTudo);

    document.getElementById('btnSair').addEventListener('click', (evento) => {
        evento.preventDefault();
        localStorage.removeItem(CHAVE_USUARIO);
        window.location.href = 'login.html';
    });

    // Atualiza o painel quando um cliente faz um pedido em outra aba
    window.addEventListener('storage', (evento) => {
        if (evento.key === CHAVE_PEDIDOS) renderizarTudo();
        if (evento.key === CHAVE_USUARIO && obterUsuario()?.perfil !== 'gerente') {
            window.location.replace('login.html?redirect=admin.html');
        }
    });

    renderizarTudo();
}

const usuarioAtual = obterUsuario();

if (!usuarioAtual || usuarioAtual.perfil !== 'gerente') {
    window.location.replace('login.html?redirect=admin.html');
} else {
    iniciarPainel(usuarioAtual);
}
