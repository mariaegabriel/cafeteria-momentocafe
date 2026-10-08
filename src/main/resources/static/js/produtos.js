/* ==================== PRODUTOS / CARDÁPIO ==================== */

const CHAVE_USUARIO = 'usuarioLogado';
const CHAVE_CARRINHO = 'carrinho';
const CHAVE_PEDIDOS = 'pedidos';

const TIPOS_ATENDIMENTO = ['Balcão', 'Mesas', 'Delivery'];

let tipoAtendimento = '';

// ---------- Utilitários ----------

function obterUsuario() {
    return JSON.parse(localStorage.getItem(CHAVE_USUARIO) || 'null');
}

function obterCarrinho() {
    return JSON.parse(localStorage.getItem(CHAVE_CARRINHO) || '[]');
}

function salvarCarrinho(carrinho) {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
    atualizarBotaoPedido();
}

function formatarPreco(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function lerPreco(texto) {
    return Number(texto.replace(/[^\d,]/g, '').replace(',', '.'));
}

function gerarId(nome) {
    return nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, '-');
}

function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
}

// ---------- Carrinho ----------

function adicionarAoCarrinho(produto) {
    const carrinho = obterCarrinho();
    const existente = carrinho.find(item => item.id === produto.id);

    if (existente) {
        existente.qtd++;
    } else {
        carrinho.push({ ...produto, qtd: 1 });
    }

    salvarCarrinho(carrinho);
}

function alterarQuantidade(id, delta) {
    const carrinho = obterCarrinho();
    const item = carrinho.find(i => i.id === id);
    if (!item) return;

    item.qtd += delta;
    salvarCarrinho(carrinho.filter(i => i.qtd > 0));
    renderizarCarrinho();
}

function atualizarBotaoPedido() {
    const total = obterCarrinho().reduce((soma, item) => soma + item.qtd, 0);
    document.getElementById('btnMeuPedido').textContent = total > 0 ? `Meu pedido (${total})` : 'Meu pedido';
}

function mostrarFeedback(botao) {
    const textoOriginal = botao.textContent;
    botao.textContent = '✓ Adicionado';
    botao.disabled = true;

    setTimeout(() => {
        botao.textContent = textoOriginal;
        botao.disabled = false;
    }, 1200);
}

// ---------- Painel "Meu pedido" ----------

function criarPainelPedido() {
    document.body.insertAdjacentHTML('beforeend', `
        <div class="carrinho-overlay" id="carrinhoOverlay"></div>

        <aside class="carrinho-painel" id="carrinhoPainel" aria-label="Meu pedido">
            <div class="carrinho-topo">
                <h2><i class="bi bi-bag-fill"></i> Meu pedido</h2>
                <button type="button" class="carrinho-fechar" id="btnFecharCarrinho" aria-label="Fechar">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>

            <ul class="carrinho-itens" id="carrinhoItens"></ul>

            <p class="carrinho-vazio" id="carrinhoVazio">
                <i class="bi bi-cup"></i>
                Seu pedido está vazio. Escolha algo no cardápio!
            </p>

            <form class="carrinho-form" id="carrinhoForm" novalidate>
                <label for="carrinhoTipo">Tipo de atendimento</label>
                <select id="carrinhoTipo">
                    <option value="">Selecione</option>
                    <option value="Balcão">Balcão</option>
                    <option value="Mesas">Mesa</option>
                    <option value="Delivery">Delivery</option>
                </select>

                <div id="carrinhoDetalheGrupo" hidden>
                    <label for="carrinhoDetalhe" id="carrinhoDetalheLabel"></label>
                    <input type="text" id="carrinhoDetalhe">
                </div>

                <label for="carrinhoObs">Observação</label>
                <textarea id="carrinhoObs" rows="2" placeholder="Ex.: sem açúcar"></textarea>

                <div class="carrinho-total">
                    <span>Total</span>
                    <strong id="carrinhoTotal">R$ 0,00</strong>
                </div>

                <p class="carrinho-erro" id="carrinhoErro"></p>

                <button type="submit" class="select-btn">Finalizar pedido</button>
                <button type="button" class="carrinho-limpar" id="btnLimparCarrinho">Limpar pedido</button>
            </form>
        </aside>
    `);

    document.getElementById('carrinhoOverlay').addEventListener('click', fecharPainel);
    document.getElementById('btnFecharCarrinho').addEventListener('click', fecharPainel);
    document.getElementById('carrinhoTipo').addEventListener('change', atualizarCampoDetalhe);
    document.getElementById('carrinhoForm').addEventListener('submit', finalizarPedido);

    document.getElementById('btnLimparCarrinho').addEventListener('click', () => {
        salvarCarrinho([]);
        renderizarCarrinho();
    });

    document.getElementById('carrinhoItens').addEventListener('click', (evento) => {
        const botao = evento.target.closest('[data-qtd]');
        if (botao) alterarQuantidade(botao.dataset.id, Number(botao.dataset.qtd));
    });
}

function atualizarCampoDetalhe() {
    const tipo = document.getElementById('carrinhoTipo').value;
    const grupo = document.getElementById('carrinhoDetalheGrupo');
    const label = document.getElementById('carrinhoDetalheLabel');
    const campo = document.getElementById('carrinhoDetalhe');

    grupo.hidden = tipo !== 'Mesas' && tipo !== 'Delivery';
    label.textContent = tipo === 'Mesas' ? 'Número da mesa' : 'Endereço de entrega';
    campo.placeholder = tipo === 'Mesas' ? 'Ex.: 05' : 'Rua, número e bairro';
}

function renderizarCarrinho() {
    const carrinho = obterCarrinho();
    const total = carrinho.reduce((soma, item) => soma + item.preco * item.qtd, 0);

    document.getElementById('carrinhoItens').innerHTML = carrinho.map(item => `
        <li>
            <div>
                <strong>${escaparHtml(item.nome)}</strong>
                <small>${formatarPreco(item.preco)}</small>
            </div>
            <div class="carrinho-qtd">
                <button type="button" data-id="${item.id}" data-qtd="-1" aria-label="Diminuir">−</button>
                <span>${item.qtd}</span>
                <button type="button" data-id="${item.id}" data-qtd="1" aria-label="Aumentar">+</button>
            </div>
        </li>
    `).join('');

    document.getElementById('carrinhoVazio').hidden = carrinho.length > 0;
    document.getElementById('carrinhoForm').hidden = carrinho.length === 0;
    document.getElementById('carrinhoTotal').textContent = formatarPreco(total);
}

function abrirPainel() {
    const selectTipo = document.getElementById('carrinhoTipo');
    if (tipoAtendimento) selectTipo.value = tipoAtendimento;
    atualizarCampoDetalhe();

    document.getElementById('carrinhoErro').textContent = '';
    renderizarCarrinho();
    document.body.classList.add('carrinho-aberto');
}

function fecharPainel() {
    document.body.classList.remove('carrinho-aberto');
}

function finalizarPedido(evento) {
    evento.preventDefault();

    const erro = document.getElementById('carrinhoErro');
    const carrinho = obterCarrinho();
    const tipo = document.getElementById('carrinhoTipo').value;
    const detalhe = document.getElementById('carrinhoDetalhe').value.trim();

    if (carrinho.length === 0) return;

    if (!tipo) {
        erro.textContent = 'Selecione o tipo de atendimento.';
        return;
    }

    if ((tipo === 'Mesas' || tipo === 'Delivery') && !detalhe) {
        erro.textContent = tipo === 'Mesas' ? 'Informe o número da mesa.' : 'Informe o endereço de entrega.';
        return;
    }

    const usuario = obterUsuario();

    if (!usuario) {
        erro.textContent = 'Faça login para finalizar. Seu pedido ficará salvo.';
        setTimeout(() => { window.location.href = 'login.html?redirect=produtos.html'; }, 1500);
        return;
    }

    const local = tipo === 'Balcão' ? 'Balcão'
        : tipo === 'Mesas' ? `Mesa ${detalhe}`
        : `Delivery - ${detalhe}`;

    const pedidos = JSON.parse(localStorage.getItem(CHAVE_PEDIDOS) || '[]');
    const agora = new Date().toISOString();

    pedidos.push({
        id: pedidos.reduce((maior, p) => Math.max(maior, p.id), 1000) + 1,
        cliente: { nome: usuario.nome, email: usuario.email },
        itens: carrinho.map(({ nome, preco, qtd }) => ({ nome, preco, qtd })),
        local,
        observacao: document.getElementById('carrinhoObs').value.trim(),
        total: carrinho.reduce((soma, item) => soma + item.preco * item.qtd, 0),
        status: 'novo',
        data: agora,
        atualizadoEm: agora
    });

    localStorage.setItem(CHAVE_PEDIDOS, JSON.stringify(pedidos));
    salvarCarrinho([]);
    window.location.href = 'pedidos.html';
}

// ---------- Inicialização ----------

document.addEventListener('DOMContentLoaded', () => {
    criarPainelPedido();
    atualizarBotaoPedido();

    // Botões "Selecionar" dos cards
    document.querySelectorAll('.product-card').forEach(card => {
        const nome = card.querySelector('.product-info h3').textContent.trim();
        const preco = lerPreco(card.querySelector('.price').textContent);
        const botao = card.querySelector('.select-btn');

        botao.addEventListener('click', () => {
            adicionarAoCarrinho({ id: gerarId(nome), nome, preco });
            mostrarFeedback(botao);
        });
    });

    // Filtros de tipo de atendimento (Todos / Balcão / Mesas / Delivery)
    document.querySelectorAll('.filter-btn').forEach(botao => {
        botao.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            botao.classList.add('active');

            const texto = botao.textContent.trim();
            tipoAtendimento = TIPOS_ATENDIMENTO.includes(texto) ? texto : '';
        });
    });

    document.getElementById('btnMeuPedido').addEventListener('click', abrirPainel);

    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape') fecharPainel();
    });

    // Mostra o nome do usuário no menu quando estiver logado
    const usuario = obterUsuario();
    const linkLogin = document.getElementById('linkLogin');
    if (usuario && linkLogin) {
        linkLogin.textContent = `Olá, ${usuario.nome.split(' ')[0]}`;
        linkLogin.href = usuario.perfil === 'gerente' ? 'admin.html' : 'pedidos.html';
    }
});
