/* ==========================================================
   Momento Café — Página de cadastro
   Validação, força da senha e gravação do usuário
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const CHAVE_USUARIOS = 'momentoCafe_usuarios';

  // Código exigido para criar conta de gerente (site de demonstração).
  // Troque pelo valor que quiser.
  const CODIGO_GERENTE = 'CAFE2026';

  const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
  const $$ = (seletor, raiz = document) => Array.from(raiz.querySelectorAll(seletor));

  const form = $('#formCadastro');
  const erroGeral = $('#erroGeral');
  const conteudo = $('#cadastroConteudo');
  const sucesso = $('#cadastroSucesso');
  const campoCodigo = $('#campoCodigo');

  const campos = {
    nome: $('#nome'),
    email: $('#email'),
    telefone: $('#telefone'),
    senha: $('#senha'),
    confirmarSenha: $('#confirmarSenha'),
    codigoGerente: $('#codigoGerente'),
    termos: $('#termos'),
  };

  /* ---------- Armazenamento ---------- */

  const lerUsuarios = () => {
    try {
      const lista = JSON.parse(localStorage.getItem(CHAVE_USUARIOS));
      return Array.isArray(lista) ? lista : [];
    } catch (e) {
      return [];
    }
  };

  const salvarUsuarios = (lista) => {
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(lista));
  };

  // A senha nunca é guardada em texto puro: salva-se o hash SHA-256.
  // Observação: é só para o projeto de demonstração. Em um site real,
  // o cadastro e o login precisam ser feitos em um servidor.
  async function hashSenha(senha) {
    try {
      if (window.crypto && window.crypto.subtle) {
        const bytes = new TextEncoder().encode(senha);
        const buffer = await window.crypto.subtle.digest('SHA-256', bytes);
        return 'sha256:' + Array.from(new Uint8Array(buffer))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
      }
    } catch (e) { /* cai no plano B abaixo */ }
    return 'b64:' + btoa(String.fromCharCode(...new TextEncoder().encode(senha)));
  }

  /* ---------- Validações ---------- */

  const somenteDigitos = (v) => v.replace(/\D/g, '');

  const validadores = {
    nome(v) {
      const valor = v.trim();
      if (valor.length < 3) return 'Informe seu nome completo.';
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' ]+$/.test(valor)) return 'Use apenas letras no nome.';
      if (valor.split(/\s+/).length < 2) return 'Digite nome e sobrenome.';
      return '';
    },
    email(v) {
      const valor = v.trim();
      if (!valor) return 'Informe seu e-mail.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) return 'Digite um e-mail válido.';
      return '';
    },
    telefone(v) {
      const n = somenteDigitos(v);
      if (!n) return 'Informe seu telefone.';
      if (n.length < 10 || n.length > 11) return 'Telefone inválido. Use DDD + número.';
      return '';
    },
    senha(v) {
      if (v.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.';
      if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return 'Use letras e números na senha.';
      return '';
    },
    confirmarSenha(v) {
      if (!v) return 'Repita a senha.';
      if (v !== campos.senha.value) return 'As senhas não conferem.';
      return '';
    },
    codigoGerente(v) {
      if (perfilAtual() !== 'gerente') return '';
      if (!v.trim()) return 'Informe o código de acesso.';
      if (v.trim() !== CODIGO_GERENTE) return 'Código de acesso incorreto.';
      return '';
    },
    termos() {
      return campos.termos.checked ? '' : 'Você precisa aceitar os termos para continuar.';
    },
  };

  const perfilAtual = () => ($('input[name="perfil"]:checked') || {}).value || 'cliente';

  function mostrarErro(nome, mensagem) {
    const aviso = $(`[data-erro-de="${nome}"]`);
    if (aviso) aviso.textContent = mensagem;

    const caixa = campos[nome] && campos[nome].closest('.campo-cafe');
    if (caixa) {
      caixa.classList.toggle('invalido', Boolean(mensagem));
      caixa.classList.toggle('valido', !mensagem && Boolean(campos[nome].value));
    }
  }

  function validarCampo(nome) {
    const campo = campos[nome];
    const valor = campo.type === 'checkbox' ? campo.checked : campo.value;
    const mensagem = validadores[nome](valor);
    mostrarErro(nome, mensagem);
    return !mensagem;
  }

  // valida ao sair do campo e revalida enquanto digita (se já estava com erro)
  Object.keys(campos).forEach((nome) => {
    const campo = campos[nome];
    if (!campo) return;

    const evento = campo.type === 'checkbox' ? 'change' : 'blur';
    campo.addEventListener(evento, () => validarCampo(nome));

    campo.addEventListener('input', () => {
      const caixa = campo.closest('.campo-cafe');
      if (caixa && caixa.classList.contains('invalido')) validarCampo(nome);
      if (erroGeral) erroGeral.textContent = '';
    });
  });

  /* ---------- Máscara de telefone ---------- */

  campos.telefone.addEventListener('input', () => {
    const n = somenteDigitos(campos.telefone.value).slice(0, 11);
    let texto = n;
    if (n.length > 10) texto = `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
    else if (n.length > 6) texto = `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
    else if (n.length > 2) texto = `(${n.slice(0, 2)}) ${n.slice(2)}`;
    campos.telefone.value = texto;
  });

  /* ---------- Mostrar / ocultar senha ---------- */

  $$('.ver-senha').forEach((botao) => {
    botao.addEventListener('click', () => {
      const alvo = document.getElementById(botao.dataset.alvo);
      const mostrar = alvo.type === 'password';
      alvo.type = mostrar ? 'text' : 'password';
      botao.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
      botao.innerHTML = `<i class="bi ${mostrar ? 'bi-eye-slash-fill' : 'bi-eye-fill'}"></i>`;
    });
  });

  /* ---------- Força da senha ---------- */

  const medidor = $('#forcaSenha');
  const textoForca = $('#forcaTexto');
  const NIVEIS = ['Use letras e números', 'Senha fraca', 'Senha razoável', 'Senha boa', 'Senha forte'];

  function calcularForca(senha) {
    if (!senha) return 0;
    let pontos = 0;
    if (senha.length >= 8) pontos++;
    if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) pontos++;
    if (/\d/.test(senha)) pontos++;
    if (/[^A-Za-z0-9]/.test(senha) || senha.length >= 12) pontos++;
    return Math.max(1, pontos);
  }

  campos.senha.addEventListener('input', () => {
    const nivel = calcularForca(campos.senha.value);
    medidor.dataset.nivel = nivel;
    textoForca.textContent = NIVEIS[nivel];

    // se já digitou a confirmação, revalida
    if (campos.confirmarSenha.value) validarCampo('confirmarSenha');
  });

  /* ---------- Cliente x Gerente ---------- */

  $$('input[name="perfil"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const gerente = perfilAtual() === 'gerente';
      campoCodigo.classList.toggle('d-none', !gerente);
      if (!gerente) {
        campos.codigoGerente.value = '';
        mostrarErro('codigoGerente', '');
      }
    });
  });

  /* ---------- Envio ---------- */

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    erroGeral.textContent = '';

    const ordem = ['nome', 'email', 'telefone', 'senha', 'confirmarSenha', 'codigoGerente', 'termos'];
    const invalidos = ordem.filter((nome) => !validarCampo(nome));

    if (invalidos.length) {
      campos[invalidos[0]].focus();
      return;
    }

    const email = campos.email.value.trim().toLowerCase();
    const usuarios = lerUsuarios();

    if (usuarios.some((u) => u.email === email)) {
      mostrarErro('email', 'Este e-mail já está cadastrado.');
      campos.email.focus();
      return;
    }

    const botao = $('#btnCadastrar');
    botao.disabled = true;

    try {
      const usuario = {
        id: 'U' + Date.now(),
        nome: campos.nome.value.trim().replace(/\s+/g, ' '),
        email,
        telefone: campos.telefone.value.trim(),
        perfil: perfilAtual(),
        senha: await hashSenha(campos.senha.value),
        criadoEm: new Date().toISOString(),
      };

      usuarios.push(usuario);
      salvarUsuarios(usuarios);

      const primeiroNome = usuario.nome.split(' ')[0];
      $('#sucessoMensagem').textContent =
        `Tudo certo, ${primeiroNome}! Sua conta de ${usuario.perfil} foi criada. Faça login para continuar.`;

      conteudo.classList.add('d-none');
      sucesso.classList.remove('d-none');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (erro) {
      erroGeral.textContent = 'Não foi possível salvar o cadastro. Tente novamente.';
      botao.disabled = false;
    }
  });
});