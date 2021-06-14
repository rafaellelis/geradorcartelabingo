function clickStart() {
  const listaTotal = document.querySelector("#casasBingo").value.split("\n");
  const qtdCartelas = parseInt(document.querySelector("#qtdCartelas").value, 0);
  const nomeBingo = document.querySelector("#nomeBingo").value;
  const imgCartela = document.querySelector("#imgCartela").value;
  const quantidadeCasasLinha = document.querySelector("#quantidadeCasasLinha").value;
  const tipoBingo = parseInt(
    document.querySelector('input[name="tipoBingo"]:checked').value
  );

  if (!listaTotal || listaTotal.length < 30) {
    alert("É necessário uma lista de, pelo menos, 30 items!");
    return;
  }

  if (!quantidadeCasasLinha || quantidadeCasasLinha < 3 || quantidadeCasasLinha > 5) {
    alert("O Bingo deve ter entre 3 e 5 casas por linha!");
    return;
  }

  const gen = new Gerador(listaTotal, imgCartela, tipoBingo, quantidadeCasasLinha);
  const out = document.querySelector("#output");
  out.className = "";
  out.innerHTML = "";
  out.classList.add(tipoBingo === 1 ? "bingo-num" : "bingo-text");

  for (let i = 0; i < qtdCartelas; i++) {
    var t = new Cartela(nomeBingo, gen.GerarCartela(), quantidadeCasasLinha);
    out.append(t.genNode(quantidadeCasasLinha, tipoBingo));
  }
}

function gerarValoresPadroes() {
  const tipoBingo = parseInt(
    document.querySelector('input[name="tipoBingo"]:checked').value
  );

  const valores = document.querySelector("#casasBingo");

  if (tipoBingo === 1) {
    // gerando 90 números das casas
    valores.value = Array(90)
      .fill()
      .map((_, index) => index + 1)
      .toString()
      .split(",")
      .join("\n");
  } else {
    valores.value = "";
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

class Gerador {
  constructor(lista, imagem, tipoBingo, quantidadeItensLinha = 5) {
    this.max = lista.length - 1;
    this.listaBase = [];
    this.tipoBingo = tipoBingo;
    for (let item of lista) {
      this.listaBase.push(new CasaCartela(item.trim()));
    }
    imagem = imagem ? imagem : "passaros.png";
    this.casaImagem = new CasaCartela(null, imagem);
    this.quantidadeItensLinha = quantidadeItensLinha
  }

  GerarCartela = function () {
    let usada = [];
    let i = 0;
    let retorno = [];
    let j;

    const quantidadeCasas = Math.pow(this.quantidadeItensLinha, 2)
    const metade = Math.floor(quantidadeCasas/2)
    const semImagem = quantidadeCasas % 2 === 0

    while (i < quantidadeCasas) {
      if (i == metade && !semImagem) {
        i++;
        continue;
      }

      do {
        j = getRandomInt(0, this.max);
      } while (usada[j] === true);

      usada[j] = true;
      retorno.push(this.listaBase[j]);
      i++;
    }

    // somente se for do tipo numérico
    if (this.tipoBingo === 1) {
      // ordenar os números
      retorno = retorno.sort(
        (a, b) => parseInt(a.display, 10) - parseInt(b.display, 10)
      );
    }
    // incluir a casa da imagem no centro da cartela
    if(!semImagem){
      retorno.splice(metade, 0, this.casaImagem);
    }
    return retorno;
  };
}

class Cartela {
  constructor(_titulo, _casas, _quantidadeCasasLinha) {
    this.titulo = _titulo;
    this.casas = [];
    const qtdCasasLinha = parseInt(_quantidadeCasasLinha, 10)
    for(let a = 0; a < qtdCasasLinha; a++){
      this.casas.push([])
    }
    
    let i = 0;
    let j = 0;
    // cria a matriz bidimensional transposta para ordenar corretamente de cima para baixo
    for (let y = 0; y < qtdCasasLinha; y++) {
      for (let x = y, c = 0; c < qtdCasasLinha; x += qtdCasasLinha, c++) {
        this.casas[i][j++] = _casas[x];
        if (j > (qtdCasasLinha - 1)) {
          i++;
          j = 0;
        }

        if (i > (qtdCasasLinha - 1)) break;
      }
    }
  }
}

Cartela.prototype.genNode = function (quantidadeCasasLinha, tipoBingo) {
  let container = document.createElement("div");
  container.classList.add("cartela");
  const qtdCasasLinha = parseInt(quantidadeCasasLinha, 10)
  let alturaLinha = 9 - qtdCasasLinha

  if(tipoBingo === 2){
    if(qtdCasasLinha === 3){
      alturaLinha = 11
    } else if(qtdCasasLinha === 4){
      alturaLinha = 8.5
    } else {
      alturaLinha = 7
    }
  }

  container.innerHTML = `
        <h2 class="cartela-titulo">${this.titulo} </h2>
            <div class ="cartela-corpo">
            ${this.casas
              .map(
                (item, i) => `
                <div class="cartela-linha" style="height: calc(${alturaLinha}vw - 3px);">
                    ${item.map((casa, j) => `${casa.genTemplate(quantidadeCasasLinha)} `).join("")}
                </div>
            `
              )
              .join("")}
        </div>`;
  return container;
};

class CasaCartela {
  constructor(valor, imagem) {
    this.display = valor != null ? valor : imagem;
    this.tipo = valor != null ? 1 : 2;
  }
}

CasaCartela.prototype.genTemplate = function (_quantidadeCasasLinha) {
  const qtdCasasLinha = parseInt(_quantidadeCasasLinha, 10)
  if (this.tipo == 1) return `<div class="cartela-casa" style="max-width: ${100/qtdCasasLinha}%; width: ${100/qtdCasasLinha}%;">${this.display} </div>`;
  else
    return `<div class ="cartela-casa cartela-casa-img" style="max-width: ${100/qtdCasasLinha}%; width: ${100/qtdCasasLinha}%;"><img src='${this.display}' /></div>`;
};

document.addEventListener("DOMContentLoaded", function (event) {
  gerarValoresPadroes();
});
