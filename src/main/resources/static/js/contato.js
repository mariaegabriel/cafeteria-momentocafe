/* ==========================================================
   Momento Café — Página de contato
   Formulário com validação, horário de funcionamento "aberto agora"
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const CHAVE_MENSAGENS = 'momentoCafe_mensagens';

  const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
  const $$ = (seletor, raiz = document) => Array.from(raiz.querySelectorAll(seletor));

  /* ==========================================================
     1) HORÁRIO DE FUNCIONAMENTO
     Se mudar os horários, altere aqui e também na lista do HTML.
     Chave = dia da semana (0 = domingo ... 6 = sábado); [abre, fecha] em horas.
     ========================================================== */

  const HORARIOS = {
    0: [8, 14],
    1: [7, 20],
    2: [7, 20],
    3: [7, 20],
    4: [7, 20],
    5: [7, 20],
    6: [8, 18],
  };

  function atualizarStatusLoja() {
    const agora = new Date();
    const dia = agora.getDay();
    const horaDecimal = agora.getHours() + agora.getMinutes() / 60;
    const [abre, fecha] = HORARIOS[dia];
    const aberto = horaDecimal >= abre && horaDecimal < fecha;

    const selo = $('#statusLoja');
    const texto = $('#statusTexto');
    if (selo && texto) {
      selo.classList.toggle('aberto', aberto);
      selo.classList.toggle('fechado', !aberto);
      texto.textContent = aberto ? 'Aberto agora' : 'Fechado agora';
    }

    // destaca a linha do dia de hoje
    $$('#horariosLista li').forEach((li) => {
      const dias = (li.dataset.dias || '').split(',').map(Number);
      li.classList.toggle('hoje', dias.includes(dia));
    });
  }

  atualizarStatusLoja();
  setInterval(atualizarStatusLoja, 60 * 1000);

  /* ==========================================================
     2) FORMULÁRIO
     ========================================================== */

  const form = $('#formContato');
  const conteudo = $('#contatoConteudo');
  const sucesso = $('#contatoSucesso');
  const erroGeral = $('#erroGeral');
  const contador = $('#contadorMensagem');

  const campos = {
    nome: $('#nome'),
    email: $('#email'),
    telefone: $('#telefone'),
    assunto: $('#assunto'),
    mensagem: $('#mensagem'),
  };

  const somenteDigitos = (v) => v.replace(/\D/g, '');

  const validadores = {
    nome(v) {
      const valor = v.trim();
      if (valor.length < 2) return 'Informe seu nome.';
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' ]+$/.test(valor)) return 'Use apenas letras no nome.';
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
      if (!n) return ''; // opcional
      if (n.length < 10 || n.length > 11) return 'Telefone inválido. Use DDD + número.';
      return '';
    },
    assunto(v) {
      return v ? '' : 'Selecione um assunto.';
    },
    mensagem(v) {
      const valor = v.trim();
      if (valor.length < 10) return 'Escreva pelo menos 10 caracteres.';
      return '';
    },
  };

  function mostrarErro(nome, mensagem) {
    const aviso = $(`[data-erro-de="${nome}"]`);
    if (aviso) aviso.textContent = mensagem;

    const caixa = campos[nome].closest('.campo-cafe');
    if (caixa) caixa.classList.toggle('invalido', Boolean(mensagem));
  }

  function validarCampo(nome) {
    const mensagem = validadores[nome](campos[nome].value);
    mostrarErro(nome, mensagem);
    return !mensagem;
  }

  Object.keys(campos).forEach((nome) => {
    const campo = campos[nome];
    campo.addEventListener(campo.tagName === 'SELECT' ? 'change' : 'blur', () => validarCampo(nome));

    campo.addEventListener('input', () => {
      const caixa = campo.closest('.campo-cafe');
      if (caixa && caixa.classList.contains('invalido')) validarCampo(nome);
      erroGeral.textContent = '';
    });
  });

  // contador de caracteres
  campos.mensagem.addEventListener('input', () => {
    contador.textContent = `${campos.mensagem.value.length} / ${campos.mensagem.maxLength}`;
  });

  // máscara de telefone
  campos.telefone.addEventListener('input', () => {
    const n = somenteDigitos(campos.telefone.value).slice(0, 11);
    let texto = n;
    if (n.length > 10) texto = `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
    else if (n.length > 6) texto = `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
    else if (n.length > 2) texto = `(${n.slice(0, 2)}) ${n.slice(2)}`;
    campos.telefone.value = texto;
  });

  const lerMensagens = () => {
    try {
      const lista = JSON.parse(localStorage.getItem(CHAVE_MENSAGENS));
      return Array.isArray(lista) ? lista : [];
    } catch (e) {
      return [];
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    erroGeral.textContent = '';

    const ordem = ['nome', 'email', 'telefone', 'assunto', 'mensagem'];
    const invalidos = ordem.filter((nome) => !validarCampo(nome));

    if (invalidos.length) {
      campos[invalidos[0]].focus();
      return;
    }

    const registro = {
      id: 'MSG' + Date.now(),
      data: new Date().toISOString(),
      nome: campos.nome.value.trim().replace(/\s+/g, ' '),
      email: campos.email.value.trim().toLowerCase(),
      telefone: campos.telefone.value.trim(),
      assunto: campos.assunto.value,
      mensagem: campos.mensagem.value.trim(),
      lida: false,
    };

    try {
      const mensagens = lerMensagens();
      mensagens.push(registro);
      localStorage.setItem(CHAVE_MENSAGENS, JSON.stringify(mensagens));
    } catch (erro) {
      erroGeral.textContent = 'Não foi possível enviar agora. Tente novamente.';
      return;
    }

    const primeiroNome = registro.nome.split(' ')[0];
    $('#sucessoTexto').textContent =
      `Obrigado pelo contato, ${primeiroNome}! Recebemos sua mensagem e responderemos em ${registro.email} em até 1 dia útil.`;

    conteudo.classList.add('d-none');
    sucesso.classList.remove('d-none');
  });

  // "Enviar outra mensagem"
  $('#novaMensagem').addEventListener('click', () => {
    form.reset();
    Object.keys(campos).forEach((nome) => mostrarErro(nome, ''));
    contador.textContent = `0 / ${campos.mensagem.maxLength}`;
    sucesso.classList.add('d-none');
    conteudo.classList.remove('d-none');
    campos.nome.focus();
  });
});