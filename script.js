// Carrega os dados salvos ou cria um objeto vazio
let dadosUber = JSON.parse(localStorage.getItem("dadosUber")) || {};

// Função para atualizar os resumos semanais e mensais
function atualizarResumoGeral() {
  const hoje = new Date();

  // Início da semana (domingo)
  const semanaInicio = new Date(hoje);
  semanaInicio.setDate(hoje.getDate() - hoje.getDay());

  // Início do mês
  const mesInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const resumoSemana = calcularResumoPeriodo(semanaInicio, hoje);
  const resumoMes = calcularResumoPeriodo(mesInicio, hoje);

  document.getElementById('resumo-semana').innerHTML = formatarResumo(resumoSemana);
  document.getElementById('resumo-mes').innerHTML = formatarResumo(resumoMes);
}

// Calcula os dados de um período (semana ou mês)
function calcularResumoPeriodo(inicio, fim) {
  let totalKm = 0;
  let totalCorridas = 0;
  let totalDespesas = 0;

  for (const data in dadosUber) {
    const dt = new Date(data);
    if (dt >= inicio && dt <= fim) {
      const entrada = dadosUber[data];

      const kmDia = entrada.odometroFinal - entrada.odometroInicial;
      totalKm += isNaN(kmDia) ? 0 : kmDia;

      const valorDia = entrada.corridas.reduce((acc, c) => acc + c.valor, 0);
      totalCorridas += valorDia;

      const despesas = entrada.despesas || {};
      totalDespesas +=
        (parseFloat(despesas.combustivel) || 0) +
        (parseFloat(despesas.alimentacao) || 0) +
        (parseFloat(despesas.limpeza) || 0);
    }
  }

  const lucro = totalCorridas - totalDespesas;
  const lucroPorKm = totalKm > 0 ? lucro / totalKm : 0;

  return {
    totalKm,
    totalCorridas,
    totalDespesas,
    lucro,
    lucroPorKm
  };
}

// Formata os dados de resumo para exibir no HTML
function formatarResumo(r) {
  return `
    <p>Distância total: ${r.totalKm.toFixed(2)} km</p>
    <p>Ganhos brutos: R$ ${r.totalCorridas.toFixed(2)}</p>
    <p>Despesas: R$ ${r.totalDespesas.toFixed(2)}</p>
    <p><strong>Lucro: R$ ${r.lucro.toFixed(2)}</strong></p>
    <p>Lucro por km: R$ ${r.lucroPorKm.toFixed(2)}</p>
  `;
}

// Atualiza o calendário e os resumos gerais
function atualizarCalendario() {
  gerarCalendario(); // Certifique-se de que essa função está definida no seu projeto
  atualizarResumoGeral(); // Agora seguro chamar, pois dadosUber foi carregado
}
