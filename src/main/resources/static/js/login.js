/* ==================== LOGIN ==================== */
if (tipoUsuario === "gerente") {
    localStorage.setItem("tipoUsuario", "gerente");
    window.location.href = "../templates/admin.html";
} else {
    localStorage.setItem("tipoUsuario", "cliente");
    window.location.href = "../templates/pedidos.html";
}
const CHAVE_USUARIO = 'usuarioLogado';
const CHAVE_EMAIL_LEMBRADO = 'emailLembrado';

// Contas de gerente (simulação enquanto não há backend)
const GERENTES = [
    { nome: 'Gerente', email: 'gerente@momentocafe.com.br', senha: 'admin123' }
];

const form = document.getElementById('loginForm');
const campoEmail = document.getElementById('email');
const campoSenha = document.getElementById('senha');
const campoLembrar = document.getElementById('lembrar');
const btnEntrar = document.getElementById('btnEntrar');
const mensagem = document.getElementById('mensagemLogin');

function mostrarMensagem(texto, tipo) {
    mensagem.className = `alert alert-${tipo}`;
    mensagem.textContent = texto;
}

function esconderMensagem() {
    mensagem.className = 'alert d-none';
    mensagem.textContent = '';
}

function perfilSelecionado() {
    return document.querySelector('input[name="perfil"]:checked').value;
}

function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function nomeAPartirDoEmail(email) {
    const nome = email.split('@')[0].split(/[._-]/)[0];
    return nome.charAt(0).toUpperCase() + nome.slice(1);
}

// Aceita apenas páginas internas (ex.: "pedidos.html") como destino
function destinoAposLogin(perfil) {
    const redirect = new URLSearchParams(window.location.search).get('redirect');

    if (redirect && /^[\w-]+\.html$/.test(redirect)) {
        if (redirect === 'admin.html' && perfil !== 'gerente') return '../index.html';
        return redirect;
    }

    return perfil === 'gerente' ? 'admin.html' : '../index.html';
}

function autenticar(email, senha, perfil) {
    if (perfil === 'gerente') {
        const gerente = GERENTES.find(g => g.email === email && g.senha === senha);
        return gerente ? { nome: gerente.nome, email: gerente.email, perfil: 'gerente' } : null;
    }

    return { nome: nomeAPartirDoEmail(email), email, perfil: 'cliente' };
}

form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    esconderMensagem();

    const email = campoEmail.value.trim().toLowerCase();
    const senha = campoSenha.value;
    const perfil = perfilSelecionado();

    if (!emailValido(email)) {
        mostrarMensagem('Informe um e-mail válido.', 'danger');
        campoEmail.focus();
        return;
    }

    if (senha.length < 6) {
        mostrarMensagem('A senha deve ter pelo menos 6 caracteres.', 'danger');
        campoSenha.focus();
        return;
    }

    const usuario = autenticar(email, senha, perfil);

    if (!usuario) {
        mostrarMensagem('E-mail ou senha de gerente inválidos.', 'danger');
        return;
    }

    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));

    if (campoLembrar.checked) {
        localStorage.setItem(CHAVE_EMAIL_LEMBRADO, email);
    } else {
        localStorage.removeItem(CHAVE_EMAIL_LEMBRADO);
    }

    mostrarMensagem(`Bem-vindo(a), ${usuario.nome}! Redirecionando...`, 'success');
    btnEntrar.disabled = true;

    setTimeout(() => {
        window.location.href = destinoAposLogin(usuario.perfil);
    }, 1200);
});

document.getElementById('linkEsqueciSenha').addEventListener('click', (evento) => {
    evento.preventDefault();

    const email = campoEmail.value.trim();

    if (!emailValido(email)) {
        mostrarMensagem('Digite seu e-mail no campo acima para recuperar a senha.', 'warning');
        campoEmail.focus();
        return;
    }

    mostrarMensagem(`Enviamos as instruções de recuperação para ${email}.`, 'info');
});

document.querySelectorAll('input[name="perfil"]').forEach(radio => {
    radio.addEventListener('change', () => {
        esconderMensagem();
        campoEmail.placeholder = perfilSelecionado() === 'gerente'
            ? 'gerente@momentocafe.com.br'
            : 'seuemail@exemplo.com';
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const emailLembrado = localStorage.getItem(CHAVE_EMAIL_LEMBRADO);
    if (emailLembrado) {
        campoEmail.value = emailLembrado;
        campoLembrar.checked = true;
    }

    const usuario = JSON.parse(localStorage.getItem(CHAVE_USUARIO) || 'null');
    if (usuario) {
        mostrarMensagem(`Você já está conectado como ${usuario.nome}. Entre novamente para trocar de conta.`, 'info');
    }
});
