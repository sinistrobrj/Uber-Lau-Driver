// Uber Lau Driver - script.js completo com todas as funcionalidades integradas
// Mostra o app após o splash
function removerSplash() {
  document.getElementById("splash-screen").style.display = "none";
  document.getElementById("app-container").classList.remove("hidden");
  document.getElementById("tela1").classList.remove("hidden"); // garante que o calendário apareça
}

// Dispara após 1.5 segundos
window.addEventListener("load", () => {
  setTimeout(removerSplash, 1500);
});


let dataAtual = new Date();
let dataSelecionada = null;
let dadosUber = JSON.parse(localStorage.getItem('dadosUber') || '{}');

function alterarMes(direcao) {
  dataAtual.setMonth(dataAtual.getMonth() + direcao);
  atualizarCalendario();
}

function atualizarCalendario() {
  const calendario = document.getElementById('calendario');
  const mesAnoLabel = document.getElementById('mesAnoAtual');
  calendario.innerHTML = '';

  const ano = dataAtual.getFullYear();
  const mes = dataAtual.getMonth();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  const nomeMes = dataAtual.toLocaleString('pt-BR', { month: 'long' });
  mesAnoLabel.textContent = `${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} ${ano}`;

  const meta = parseFloat(document.getElementById('metaDiaria')?.value) || 250;

  for (let i = 0; i < primeiroDia; i++) {
    calendario.appendChild(document.createElement('div'));
  }

  for (let dia = 1; dia <= diasNoMes; dia++) {
    const div = document.createElement('div');
    const dataStr = `${ano}-${(mes + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    div.textContent = dia;

    const dadosDia = dadosUber[dataStr];
    const lucro = calcularLucroDoDia(dadosDia);

    if (dadosDia) div.classList.add('com-dados');
    else div.classList.add('sem-dados');

    if (lucro >= meta) div.classList.add('meta-batida');

    const hoje = new Date();
    if (dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear()) {
      div.classList.add('hoje');
    }

    div.onclick = () => abrirDia(dataStr);
    calendario.appendChild(div);
  }

  atualizarResumoGeral();
}

function calcularLucroDoDia(dadosDia) {
  if (!dadosDia) return 0;
  const total = dadosDia.corridas?.reduce((s, c) => s + c.valor, 0) || 0;
  const despesas = dadosDia.despesas || {};
  const gasto = ['combustivel', 'alimentacao', 'limpeza'].reduce((a, k) => a + (parseFloat(despesas[k]) || 0), 0);
  return total - gasto;
}

function abrirDia(dataStr) {
  dataSelecionada = dataStr;
  document.getElementById('tela1').classList.add('hidden');
  document.getElementById('conteudo-dia').classList.remove('hidden');
  document.getElementById('tela-despesas').classList.add('hidden');
  document.getElementById('dataSelecionada').textContent = dataStr;
  mostrarFormulario(dataStr);
}

function mostrarFormulario(dataStr) {
  const dados = dadosUber[dataStr] || { odometroInicial: '', odometroFinal: '', corridas: [], despesas: {} };
  const container = document.getElementById('dados-formulario');

  container.innerHTML = `
    <label>Odômetro Inicial:</label>
    <input type="number" id="odInicial" value="${dados.odometroInicial}">
    <label>Odômetro Final:</label>
    <input type="number" id="odFinal" value="${dados.odometroFinal}">
    <h3>Nova Corrida</h3>
    <input type="number" id="novaKm" placeholder="KM">
    <input type="number" id="novoValor" placeholder="Valor (R$)">
    <button onclick="salvarCorrida()">Salvar Corrida</button>
    <h3>Corridas Salvas</h3>
    <div id="lista-corridas"></div>
    <button onclick="abrirTelaDespesas()">Ir para Despesas</button>
    <button onclick="salvarDadosDia()">Salvar Dados do Dia</button>
  `;

  atualizarListaCorridas(dados.corridas);
}

function salvarCorrida() {
  const km = parseFloat(document.getElementById('novaKm').value);
  const valor = parseFloat(document.getElementById('novoValor').value);
  if (isNaN(km) || isNaN(valor)) return alert('Preencha KM e Valor corretamente.');
  if (!dadosUber[dataSelecionada]) dadosUber[dataSelecionada] = { corridas: [], despesas: {} };
  dadosUber[dataSelecionada].corridas.push({ km, valor });
  document.getElementById('novaKm').value = '';
  document.getElementById('novoValor').value = '';
  atualizarListaCorridas(dadosUber[dataSelecionada].corridas);
}

function atualizarListaCorridas(lista) {
  const div = document.getElementById('lista-corridas');
  div.innerHTML = '';
  lista.forEach((c, i) => {
    const item = document.createElement('div');
    item.textContent = `🚗 Corrida ${i + 1} - ${c.km} km - R$ ${c.valor.toFixed(2)}`;
    div.appendChild(item);
  });
}

function abrirTelaDespesas() {
  const dados = dadosUber[dataSelecionada] || { despesas: {} };
  document.getElementById('tela-despesas').classList.remove('hidden');
  document.getElementById('conteudo-dia').classList.add('hidden');
  document.getElementById('dataDespesas').textContent = dataSelecionada;
  document.getElementById('combustivel').value = dados.despesas.combustivel || '';
  document.getElementById('alimentacao').value = dados.despesas.alimentacao || '';
  document.getElementById('limpeza').value = dados.despesas.limpeza || '';
}

function salvarDespesas() {
  const combustivel = parseFloat(document.getElementById('combustivel').value) || 0;
  const alimentacao = parseFloat(document.getElementById('alimentacao').value) || 0;
  const limpeza = parseFloat(document.getElementById('limpeza').value) || 0;
  if (!dadosUber[dataSelecionada]) dadosUber[dataSelecionada] = { corridas: [], despesas: {} };
  dadosUber[dataSelecionada].despesas = { combustivel, alimentacao, limpeza };
  localStorage.setItem('dadosUber', JSON.stringify(dadosUber));
  alert('Despesas salvas!');
  voltarParaCorridas();
}

function voltarParaCorridas() {
  document.getElementById('tela-despesas').classList.add('hidden');
  document.getElementById('conteudo-dia').classList.remove('hidden');
  mostrarFormulario(dataSelecionada);
}

function salvarDadosDia() {
  const odInicial = parseFloat(document.getElementById('odInicial').value);
  const odFinal = parseFloat(document.getElementById('odFinal').value);

  if (isNaN(odInicial) || isNaN(odFinal)) return alert('Preencha os campos de odômetro corretamente.');
  if (odFinal < odInicial) return alert('O odômetro final não pode ser menor que o inicial.');

  const dataAnterior = new Date(dataSelecionada);
  dataAnterior.setDate(dataAnterior.getDate() - 1);
  const dataAntStr = dataAnterior.toISOString().split('T')[0];
  const odFinalAnterior = dadosUber[dataAntStr]?.odometroFinal;

  if (odFinalAnterior && odInicial < odFinalAnterior) {
    return alert(`Odômetro inicial deve ser maior ou igual a ${odFinalAnterior} (final do dia anterior).`);
  }

  if (!dadosUber[dataSelecionada]) dadosUber[dataSelecionada] = { corridas: [], despesas: {} };
  dadosUber[dataSelecionada].odometroInicial = odInicial;
  dadosUber[dataSelecionada].odometroFinal = odFinal;
  localStorage.setItem('dadosUber', JSON.stringify(dadosUber));
  alert('Dados salvos com sucesso!');
  voltarParaCalendario();
}

function voltarParaCalendario() {
  document.getElementById('tela1').classList.remove('hidden');
  document.getElementById('conteudo-dia').classList.add('hidden');
  document.getElementById('tela-despesas').classList.add('hidden');
  atualizarCalendario();
}

function atualizarResumoGeral() {
  const hoje = new Date();
  const semanaInicio = new Date(hoje); semanaInicio.setDate(hoje.getDate() - hoje.getDay());
  const mesInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  document.getElementById('resumo-semana').innerHTML = formatarResumo(calcularResumoPeriodo(semanaInicio, hoje));
  document.getElementById('resumo-mes').innerHTML = formatarResumo(calcularResumoPeriodo(mesInicio, hoje));
}

function calcularResumoPeriodo(inicio, fim) {
  let totalKm = 0, totalCorridas = 0, totalDespesas = 0;
  for (const data in dadosUber) {
    const dt = new Date(data);
    if (dt >= inicio && dt <= fim) {
      const e = dadosUber[data];
      totalKm += (e.odometroFinal - e.odometroInicial) || 0;
      totalCorridas += e.corridas.reduce((a, c) => a + c.valor, 0);
      const d = e.despesas || {};
      totalDespesas += ['combustivel', 'alimentacao', 'limpeza'].reduce((s, k) => s + (parseFloat(d[k]) || 0), 0);
    }
  }
  const lucro = totalCorridas - totalDespesas;
  return { totalKm, totalCorridas, totalDespesas, lucro, lucroPorKm: totalKm > 0 ? lucro / totalKm : 0 };
}

function formatarResumo(r) {
  return `
    <p>Distância total: ${r.totalKm.toFixed(2)} km</p>
    <p>Ganhos brutos: R$ ${r.totalCorridas.toFixed(2)}</p>
    <p>Despesas: R$ ${r.totalDespesas.toFixed(2)}</p>
    <p><strong>Lucro: R$ ${r.lucro.toFixed(2)}</strong></p>
    <p>Lucro por km: R$ ${r.lucroPorKm.toFixed(2)}</p>`;
}

function atualizarGraficoLucro() {
  const filtro = document.getElementById('filtroPeriodo').value;
  const hoje = new Date();
  let inicio, fim;

  if (filtro === 'semana') {
    inicio = new Date(hoje); inicio.setDate(hoje.getDate() - hoje.getDay()); fim = new Date(hoje);
  } else if (filtro === 'mes') {
    inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  } else {
    inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
  }

  const dadosPorDia = [];
  for (const dataStr in dadosUber) {
    const dt = new Date(dataStr);
    if (dt >= inicio && dt <= fim) {
      const entrada = dadosUber[dataStr];
      const lucro = calcularLucroDoDia(entrada);
      dadosPorDia.push({ dia: dt.getDate(), lucro });
    }
  }

  dadosPorDia.sort((a, b) => a.dia - b.dia);
  const meta = parseFloat(document.getElementById('metaDiaria').value) || 250;

  const ctx = document.getElementById('lucroChart').getContext('2d');
  if (window.graficoLucroInstance) window.graficoLucroInstance.destroy();

  window.graficoLucroInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dadosPorDia.map(d => `Dia ${d.dia}`),
      datasets: [
        { label: 'Lucro (R$)', data: dadosPorDia.map(d => d.lucro), backgroundColor: '#2ecc71' },
        { type: 'line', label: 'Meta Diária', data: dadosPorDia.map(() => meta), borderColor: '#e74c3c', fill: false, pointRadius: 0 }
      ]
    },
    options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }
  });
}

// Corrigido: inicialização após o splash
function inicializarApp() {
  document.getElementById('tela1').classList.remove('hidden');
  atualizarCalendario();
  atualizarGraficoLucro();
}

window.onload = function () {
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'none';
    inicializarApp();
  }, 2000);
};

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker registrado com sucesso."))
    .catch(error => console.error("Falha ao registrar o Service Worker:", error));
}
