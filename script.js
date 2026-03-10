const largura = window.innerWidth;
const altura = window.innerHeight;
const horizonteY = altura * 0.45;
const centroX = largura / 2;

let velocidade = 0;
const velocidadeMaxima = 0.025;
const aceleracao = 0.0006;


const instrucao = d3.select("body").append("h1")
    .text("Segure o clique para acelerar")
    .style("position", "absolute")
    .style("top", "35%")
    .style("width", "100%")
    .style("color", "black")
    .style("pointer-events", "none"); 
    
const svg = d3.select("body").append("svg")
  .attr("width", largura)
  .attr("height", altura);

svg.append("rect") // Ceu
  .attr("width", largura)
  .attr("height", horizonteY)
  .attr("fill", "#87CEEB");

svg.append("rect") // Grama
  .attr("y", horizonteY)
  .attr("width", largura)
  .attr("height", altura - horizonteY)
  .attr("fill", "#2d8a2d");

svg.append("polygon") // Estrada
  .attr("points", [
    [centroX - 20, horizonteY],
    [centroX + 20, horizonteY],
    [largura, altura],
    [0, altura]
  ].map(p => p.join(",")).join(" "))
  .attr("fill", "#333");

const grupoFaixas = svg.append("g");
const grupoCenario = svg.append("g");

let dadosFaixas = [0, 0.2, 0.4, 0.6, 0.8];
let dadosArvores = [
  { progresso: 0.1, lado: -1 },
  { progresso: 0.4, lado: 1 },
  { progresso: 0.7, lado: -1 }
];

function atualizarTela() {
  const faixas = grupoFaixas.selectAll(".faixa").data(dadosFaixas);

  faixas.join("polygon")
    .attr("class", "faixa")
    .attr("fill", "white")
    .attr("points", p => {
      const y1 = horizonteY + (p * (altura - horizonteY));
      const y2 = horizonteY + ((p + 0.1) * (altura - horizonteY));
      const w1 = 2 + (p * 50);
      const w2 = 2 + ((p + 0.1) * 50);

      return [
        [centroX - w1 / 2, y1], [centroX + w1 / 2, y1],
        [centroX + w2 / 2, y2], [centroX - w2 / 2, y2]
      ].map(p => p.join(",")).join(" ");
    });

  const arvores = grupoCenario.selectAll(".arvore").data(dadosArvores);

  const arvoreEntrando = arvores.join("g").attr("class", "arvore");

  arvoreEntrando.selectAll("*").remove();

  arvoreEntrando.each(function (d) {
    const g = d3.select(this);
    const y = horizonteY + (d.progresso * (altura - horizonteY));
    const escala = d.progresso * 100;
    const distCentro = (d.lado * 60) + (d.lado * d.progresso * largura * 0.5);

    g.append("rect")
      .attr("x", centroX + distCentro - (escala / 10))
      .attr("y", y)
      .attr("width", escala / 5)
      .attr("height", escala)
      .attr("fill", "#5D4037");

    g.append("circle")
      .attr("cx", centroX + distCentro)
      .attr("cy", y)
      .attr("r", escala / 2)
      .attr("fill", "#1B5E20");
  });
}

const carro = svg.append("g")
  .attr("transform", `translate(${centroX}, ${altura - 130})`);

carro.append("rect") 
  .attr("x", -60).attr("y", 10).attr("width", 120).attr("height", 60).attr("rx", 15)
  .attr("fill", "#d32f2f");

carro.append("polygon") 
  .attr("points", "-40,10 40,10 25,-20 -25,-20")
  .attr("fill", "#1a1a1a");

let clicado = false;
window.addEventListener("mousedown", () => clicado = true);
window.addEventListener("mouseup", () => clicado = false);

d3.timer(() => {
  if (clicado) {
    velocidade = Math.min(velocidade + aceleracao, velocidadeMaxima);
  } else {
    velocidade = Math.max(velocidade - aceleracao, 0);
  }

  dadosFaixas = dadosFaixas.map(f => (f + velocidade > 1) ? 0 : f + velocidade);

  dadosArvores.forEach(a => {
    a.progresso += velocidade;
    if (a.progresso > 1) {
      a.progresso = 0;
      a.lado = Math.random() > 0.5 ? 1 : -1; 
    }
  });

  atualizarTela();
});