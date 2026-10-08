/* ==================== INÍCIO ==================== */

const CHAVE_USUARIO = 'usuarioLogado';

function obterUsuario() {
    return JSON.parse(localStorage.getItem(CHAVE_USUARIO) || 'null');
}

// Troca "Fazer Login" pelo nome do usuário e adiciona a opção "Sair"
function atualizarMenuUsuario() {
    const usuario = obterUsuario();
    const linkLogin = document.querySelector('.navbar-cafe a.nav-link[href$="login.html"]');

    if (!usuario || !linkLogin) return;

    const primeiroNome = usuario.nome.split(' ')[0];
    linkLogin.textContent = '';
    linkLogin.insertAdjacentHTML('afterbegin', '<i class="bi bi-person-circle"></i> ');
    linkLogin.append(`Olá, ${primeiroNome}`);
    linkLogin.href = usuario.perfil === 'gerente'
        ? '../resources/templates/admin.html'
        : '../resources/templates/pedidos.html';

    const itemSair = document.createElement('li');
    itemSair.className = 'nav-item';
    itemSair.innerHTML = '<a class="nav-link" href="#"><i class="bi bi-box-arrow-right"></i> Sair</a>';
    itemSair.querySelector('a').addEventListener('click', (evento) => {
        evento.preventDefault();
        localStorage.removeItem(CHAVE_USUARIO);
        window.location.reload();
    });

    linkLogin.closest('.nav-item').after(itemSair);
}

// Rolagem suave para as âncoras, descontando a altura da navbar fixa
function configurarRolagemSuave() {
    const navbar = document.querySelector('.navbar-cafe');
    const menu = document.getElementById('menu');

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (evento) => {
            const destino = link.getAttribute('href');
            if (destino.length < 2) return;

            const secao = document.querySelector(destino);
            if (!secao) return;

            evento.preventDefault();
            const topo = secao.getBoundingClientRect().top + window.scrollY - (navbar ? navbar.offsetHeight : 0);
            window.scrollTo({ top: topo, behavior: 'smooth' });

            if (menu && menu.classList.contains('show')) {
                bootstrap.Collapse.getOrCreateInstance(menu).hide();
            }
        });
    });
}

// Sombra na navbar ao rolar a página
function configurarNavbar() {
    const navbar = document.querySelector('.navbar-cafe');
    if (!navbar) return;

    const atualizar = () => {
        navbar.style.boxShadow = window.scrollY > 30 ? '0 6px 20px rgba(0, 0, 0, 0.25)' : '';
    };

    window.addEventListener('scroll', atualizar, { passive: true });
    atualizar();
}

// Animação de entrada dos cards quando aparecem na tela
function configurarAnimacoes() {
    const elementos = document.querySelectorAll('.idea-card, .ambiente-card, .timeline-item');
    if (!('IntersectionObserver' in window) || elementos.length === 0) return;

    const observer = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (!entrada.isIntersecting) return;
            entrada.target.style.opacity = '1';
            entrada.target.style.transform = 'translateY(0)';
            observer.unobserve(entrada.target);
        });
    }, { threshold: 0.15 });

    elementos.forEach(elemento => {
        elemento.style.opacity = '0';
        elemento.style.transform = 'translateY(30px)';
        elemento.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(elemento);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    atualizarMenuUsuario();
    configurarRolagemSuave();
    configurarNavbar();
    configurarAnimacoes();
});
