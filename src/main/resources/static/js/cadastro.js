// cadastro.js — Momento Café
(() => {
  // >>> Troque aqui o código que o gerente precisa digitar <<<
  const CODIGO_GERENTE = 'CAFE2026';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const form = $('#formCadastro');
  const campoCodigo = $('#campoCodigo');
  const inputCodigo = $('#codigoGerente');
  const senha = $('#senha');

  const perfilAtual = () => $('input[name="perfil"]:checked').value;

  // ---------- Erros ----------
  function erro(campo, msg) {
    const small = $(`[data-erro-de="${campo}"]`);
    const input = $(`#${campo}`);
    if (small) small.textContent = msg || '';
    if (input && input.type !== 'checkbox') input.classList.toggle('is-invalid', !!msg);
    return !msg;
  }

  // ---------- Perfil: mostra/esconde o código ----------
  function atualizarPerfil() {
    const gerente = perfilAtual() === 'gerente';
    campoCodigo.classList.toggle('d-none', !gerente);
    if (!gerente) {
      inputCodigo.value = '';
      erro('codigoGerente', '');
    }
  }
  $$('input[name="perfil"]').forEach(r => r.addEventListener('change', atualizarPerfil));
  atualizarPerfil();

  // ---------- Mostrar/ocultar senha ----------
  $$('.ver-senha').forEach(btn => btn.addEventListener('click', () => {
    const alvo = document.getElementById(btn.dataset.alvo);
    const mostrar = alvo.type === 'password';
    alvo.type = mostrar ? 'text' : 'password';
    btn.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
    $('i', btn).className = mostrar ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill';
  }));

  // ---------- Força da senha ----------
  const TEXTOS = ['Use letras e números', 'Senha fraca', 'Senha razoável', 'Senha boa', 'Senha forte'];
  senha.addEventListener('input', () => {
    const v = senha.value;
    let nivel = 0;
    if (v.length >= 8) nivel++;
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) nivel++;
    if (/\d/.test(v)) nivel++;
    if (/[^A-Za-z0-9]/.test(v)) nivel++;
    if (!v) nivel = 0;
    $('#forcaSenha').dataset.nivel = nivel;
    $('#forcaTexto').textContent = TEXTOS[nivel];
  });

  // ---------- Máscara de telefone ----------
  $('#telefone').addEventListener('input', e => {
    let d = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (d.length > 10) d = d.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    else if (d.length > 6) d = d.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    else if (d.length > 2) d = d.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    else if (d.length) d = d.replace(/^(\d*)$/, '($1');
    e.target.value = d;
  });

  // ---------- Validação ----------
  function validar() {
    const v = id => $(`#${id}`).value.trim();
    let ok = true;

    ok = erro('nome', v('nome').split(/\s+/).length >= 2 ? '' : 'Informe nome e sobrenome.') && ok;
    ok = erro('email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email')) ? '' : 'Informe um e-mail válido.') && ok;
    ok = erro('telefone', v('telefone').replace(/\D/g, '').length >= 10 ? '' : 'Informe um telefone com DDD.') && ok;

    const s = senha.value;
    ok = erro('senha', s.length >= 8 && /[A-Za-z]/.test(s) && /\d/.test(s)
      ? '' : 'Mínimo 8 caracteres, com letras e números.') && ok;
    ok = erro('confirmarSenha', $('#confirmarSenha').value === s && s ? '' : 'As senhas não conferem.') && ok;

    if (perfilAtual() === 'gerente') {
      const digitado = inputCodigo.value.trim().toUpperCase();
      ok = erro('codigoGerente',
        !digitado ? 'Informe o código de acesso.' :
        digitado !== CODIGO_GERENTE.toUpperCase() ? 'Código de acesso inválido.' : '') && ok;
    }

    ok = erro('termos', $('#termos').checked ? '' : 'Você precisa aceitar os termos.') && ok;
    return ok;
  }

  // limpa o erro do campo ao digitar
  $$('input', form).forEach(i => i.addEventListener('input', () => {
    if (i.id) erro(i.id, '');
    $('#erroGeral').textContent = '';
  }));

  // ---------- Envio ----------
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validar()) return;

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const email = $('#email').value.trim().toLowerCase();

    if (usuarios.some(u => u.email === email)) {
      $('#erroGeral').textContent = 'Este e-mail já está cadastrado.';
      return;
    }

    usuarios.push({
      nome: $('#nome').value.trim(),
      email,
      telefone: $('#telefone').value.trim(),
      senha: senha.value,
      tipo: perfilAtual()
    });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    $('#sucessoMensagem').textContent = perfilAtual() === 'gerente'
      ? 'Sua conta de gerente foi criada. Faça login para acessar o painel.'
      : 'Sua conta foi criada. Faça login para fazer seu primeiro pedido.';
    $('#cadastroConteudo').classList.add('d-none');
    $('#cadastroSucesso').classList.remove('d-none');
  });
})();