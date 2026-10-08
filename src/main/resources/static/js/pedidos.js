/* ==================== MEUS PEDIDOS ==================== */

const CHAVE_USUARIO = 'usuarioLogado';
const CHAVE_PEDIDOS = 'pedidos';

const STATUS = {
    novo: { texto: 'Recebido', icone: 'bi-receipt', classe: 'status-preparo', grupo: 'preparo' },
    preparo: { texto: 'Em preparo', icone: 'bi-fire', classe: 'status-preparo', grupo: 'preparo' },
    pronto: { texto: 'Pronto', icone: 'bi-cup-hot-fill', classe: 'status-preparo', grupo: 'preparo' },
    entregue: { texto: 'Entregue', icone: 'bi-check2-all', classe: 'status-entregue', grupo: 'entregue' },
    cancelado: { texto: 'Cancelado', icone: 'bi-x-circle', classe: 'status-cancelado', grupo: 'cancelado' }
};

let filtroAtual = 'todos';

// ---------- Utilitários ----------

function obterUsuario() {
    return JSON.parse(localStorage.getItem(CHAVE_USUARIO) || 'null');
}

function obterPedidosDoUsuario(usuario) {
    const pedidos = JSON.parse(localStorage.getItem(CHAVE_PEDIDOS) || '[]');
    return pedidos
        .filter(p => p.cliente && p.cliente.email === usuario.email)
        .sort((a, b) => new Date(b.data) - new Date(a.data));
}

function formatarPreco(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(dataIso) {
    const data = new Date(dataIso);
    const dia = data.toLocaleDateString('pt-BR');
    const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${dia} às ${hora}`;
}

function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
}

// ---------- Sessão ----------

function aplicarEstadoLogin(usuario) {
    document.body.classList.toggle('logado', Boolean(usuario));
    document.body.classList.toggle('deslogado', !usuario);

    if (!usuario) return;

    document.querySelectorAll('[data-usuario-nome]').forEach(el => { el.textContent = usuario.nome; });
    document.querySelectorAll('[data-usuario-email]').forEach(el => { el.textContent = usuario.email; });
    document.querySelectorAll('[data-usuario-inicial]').forEach(el => {
        el.textContent = usuario.nome.charAt(0).toUpperCase();
    });
}

// ---------- Renderização ----------

function renderizarPedido(pedido) {
    const status = STATUS[pedido.status] || STATUS.novo;

    const itens = pedido.itens.map(item => `
        <li><span>${item.qtd}x ${escaparHtml(item.nome)}</span><span>${formatarPreco(item.preco * item.qtd)}</span></li>
    `).join('');

    return `
        <article class="pedido-card" data-status="${status.grupo}">

            <div class="pedido-cabecalho">
                <div class="pedido-icon"><i class="bi bi-bag-fill"></i></div>

                <div class="pedido-info">
                    <h3>Pedido #${pedido.id}</h3>
                    <small>
                        <i class="bi bi-calendar3"></i> ${formatarData(pedido.data)}
                        &middot;
                        <i class="bi bi-geo-alt"></i> ${escaparHtml(pedido.local)}
                    </small>
                </div>

                <span class="status-badge ${status.classe}">
                    <i class="bi ${status.icone}"></i>
                    ${status.texto}
                </span>
            </div>

            <ul class="pedido-itens">${itens}</ul>

            <div class="pedido-rodape">
                <span>Total</span>
                <strong>${formatarPreco(pedido.total)}</strong>
            </div>

        </article>
    `;
}

function renderizarPedidos() {
    const usuario = obterUsuario();
    if (!usuario) return;

    const pedidos = obterPedidosDoUsuario(usuario);
    const filtrados = pedidos.filter(p =>
        filtroAtual === 'todos' || (STATUS[p.status] || STATUS.novo).grupo === filtroAtual
    );

    document.getElementById('resumoTotal').textContent = pedidos.length;
    document.getElementById('resumoAndamento').textContent =
        pedidos.filter(p => (STATUS[p.status] || STATUS.novo).grupo === 'preparo').length;

    document.getElementById('listaPedidos').innerHTML = filtrados.map(renderizarPedido).join('');
    document.getElementById('pedidosVazio').classList.toggle('d-none', filtrados.length > 0);
}

// ---------- Eventos ----------

document.querySelectorAll('.filtro').forEach(botao => {
    botao.addEventListener('click', () => {
        document.querySelectorAll('.filtro').forEach(b => b.classList.remove('ativo'));
        botao.classList.add('ativo');
        filtroAtual = botao.dataset.filtro;
        renderizarPedidos();
    });
});

document.getElementById('btnConfirmarSair').addEventListener('click', () => {
    localStorage.removeItem(CHAVE_USUARIO);

    const modal = bootstrap.Modal.getInstance(document.getElementById('modalSair'));
    if (modal) modal.hide();

    aplicarEstadoLogin(null);
});

// Atualiza a lista quando o gerente muda o status em outra aba
window.addEventListener('storage', (evento) => {
    if (evento.key === CHAVE_PEDIDOS || evento.key === CHAVE_USUARIO) {
        aplicarEstadoLogin(obterUsuario());
        renderizarPedidos();
    }
});

aplicarEstadoLogin(obterUsuario());
renderizarPedidos();
