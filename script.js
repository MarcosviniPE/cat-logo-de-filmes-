// Variável global para armazenar todos os filmes carregados do JSON
let todosOsFilmes = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarFilmes();
});

// Carrega os filmes do JSON e armazena na variável global
async function carregarFilmes() {
    try {
        const response = await fetch('informações.json');
        if (!response.ok) {
            throw new Error(`Erro na rede: ${response.statusText}`);
        }
        todosOsFilmes = await response.json();
        // Exibe os filmes lucrativos por padrão ao carregar
        exibirFilmesLucrativos();
    } catch (error) {
        console.error('Houve um problema ao carregar os filmes:', error);
    }
}

// --- Funções de Categoria ---
function mostrarTodosOsFilmes() {
    marcarBotaoAtivo('Todos os Filmes');
    // Exibe a lista completa, sem filtros
    exibirFilmes(todosOsFilmes);
}

function exibirAclamadosPelaCritica() {
    marcarBotaoAtivo('Aclamados pela Crítica');
    // Filtra para mostrar apenas os filmes com a tag "aclamado"
    const filmesFiltrados = todosOsFilmes.filter(filme => filme.tags && filme.tags.includes('aclamado'));
    exibirFilmes(filmesFiltrados);
}

function exibirFilmesLucrativos() {
    marcarBotaoAtivo('Filmes Lucrativos');
    // Calcula o lucro, filtra e ordena os filmes
    const filmesComLucro = todosOsFilmes.map(filme => {
        const custo = converterValorParaNumero(filme.custo);
        const bilheteria = converterValorParaNumero(filme.bilheteria);
        const lucro = bilheteria - custo;
        return { ...filme, lucro }; // Adiciona a propriedade lucro
    }).filter(filme => filme.lucro > 0) // Pega apenas os que tiveram lucro
      .sort((a, b) => b.lucro - a.lucro); // Ordena do maior para o menor lucro

    exibirFilmes(filmesComLucro);
}


function exibirMaioresPrejuizos() {
    marcarBotaoAtivo('Maiores Prejuízos');
    // Filtra para mostrar apenas os filmes com a tag "prejuizo_notorio"
    const filmesFiltrados = todosOsFilmes.filter(filme => filme.tags && filme.tags.includes('prejuizo_notorio'));

    // Calcula o prejuízo para os filmes filtrados e os ordena do maior para o menor prejuízo
    const filmesOrdenados = filmesFiltrados.map(filme => {
        const custo = converterValorParaNumero(filme.custo);
        const bilheteria = converterValorParaNumero(filme.bilheteria);
        const prejuizo = bilheteria - custo;
        return { ...filme, prejuizo };
    }).sort((a, b) => a.prejuizo - b.prejuizo); // Ordena pelo menor valor (maior prejuízo)

    exibirFilmes(filmesOrdenados);
}

function exibirMaioresBilheterias() {
    marcarBotaoAtivo('Maiores Bilheterias');
    // Cria uma cópia e ordena os filmes pela bilheteria, do maior para o menor
    const filmesOrdenados = [...todosOsFilmes].sort((a, b) => {
        const bilheteriaA = converterValorParaNumero(a.bilheteria);
        const bilheteriaB = converterValorParaNumero(b.bilheteria);
        return bilheteriaB - bilheteriaA;
    });

    exibirFilmes(filmesOrdenados);
}

// --- Funções Auxiliares ---

// Converte strings como "US$ 1,5 bilhão" ou "US$ 25 milhões" para um número
function converterValorParaNumero(valorString) {
    if (!valorString) return 0;

    // Normaliza a string: remove 'US$', espaços, e troca vírgula por ponto para ter um formato numérico padrão.
    // Também lida com intervalos (ex: "246-287 milhões"), pegando o maior valor.
    if (valorString.includes('-')) {
        valorString = valorString.split('-')[1];
    }

    let valorNormalizado = valorString.replace(/US\$|\s/g, '').replace(',', '.');

    // Converte 'bilhão/bilhões' para o equivalente em milhões (ex: 1.5bilhão -> 1500milhões)
    if (valorNormalizado.includes('bilh')) {
        const numero = parseFloat(valorNormalizado);
        valorNormalizado = (numero * 1000) + 'milhões';
    }

    const numeroFinal = parseFloat(valorNormalizado);

    if (valorNormalizado.includes('milh')) {
        return numeroFinal * 1000000;
    }
    if (valorNormalizado.includes('mil')) {
        return numeroFinal * 1000;
    }

    return numeroFinal;
}

// Formata um número para uma string de moeda legível
function formatarNumeroParaMoeda(numero) {
    const numeroAbsoluto = Math.abs(numero);

    if (numeroAbsoluto >= 1000000000) {
        return `US$ ${(numeroAbsoluto / 1000000000).toFixed(2).replace('.', ',')} bilhões`;
    }
    if (numeroAbsoluto >= 1000000) {
        return `US$ ${(numeroAbsoluto / 1000000).toFixed(1).replace('.', ',')} milhões`;
    }
    if (numeroAbsoluto >= 1000) {
        return `US$ ${(numeroAbsoluto / 1000).toFixed(1).replace('.', ',')} mil`;
    }
    return `US$ ${numeroAbsoluto.toFixed(0)}`;
}
// Marca visualmente qual botão de categoria está ativo
function marcarBotaoAtivo(textoBotao) {
    const buttons = document.querySelectorAll('#category-buttons button');
    buttons.forEach(button => {
        if (button.textContent === textoBotao) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// --- Função Principal de Exibição ---

function exibirFilmes(filmes) {
    const container = document.getElementById('movie-container');
    container.innerHTML = ''; // Limpa o container antes de adicionar novos filmes

    if (filmes.length === 0) {
        container.innerHTML = '<p class="mensagem-vazio">Nenhum filme encontrado para esta categoria.</p>';
        return;
    }

    filmes.forEach(filme => {
        // Cria o card principal
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');

        // Cria a imagem do poster
        const img = document.createElement('img');
        img.src = filme.imagem; // Usa a nova propriedade 'imagem'
        img.alt = `Poster do filme ${filme.nome}`;

        // Cria o container de informações
        const movieInfo = document.createElement('div');
        movieInfo.classList.add('movie-info');

        const titulo = document.createElement('h2');
        titulo.textContent = `${filme.nome} (${filme.lançamento})`;

        const descricao = document.createElement('p');
        descricao.textContent = filme.descrição;

        // Cria os detalhes de custo e bilheteria
        const detalhes = document.createElement('p');
        detalhes.classList.add('financial-details');

        if (filme.lucro > 0) {
            detalhes.innerHTML = `<strong>Custo:</strong> ${filme.custo}<br><strong>Bilheteria:</strong> ${filme.bilheteria}<br><strong class="lucro-label">Lucro: ${formatarNumeroParaMoeda(filme.lucro)}</strong>`;
        } else if (filme.prejuizo < 0) {
            detalhes.innerHTML = `<strong>Custo:</strong> ${filme.custo}<br><strong>Bilheteria:</strong> ${filme.bilheteria}<br><strong class="prejuizo-label">Prejuízo: ${formatarNumeroParaMoeda(filme.prejuizo)}</strong>`;
        } else {
            detalhes.innerHTML = `<strong>Custo:</strong> ${filme.custo}<br><strong>Bilheteria:</strong> ${filme.bilheteria}`;
        }

        const link = document.createElement('a');
        link.href = filme.link;
        link.textContent = 'Ver no IMDb';
        link.target = '_blank'; // Abre o link em uma nova aba

        movieInfo.appendChild(titulo);
        movieInfo.appendChild(descricao);
        movieInfo.appendChild(detalhes);
        movieInfo.appendChild(link);

        movieCard.appendChild(img);
        movieCard.appendChild(movieInfo);

        container.appendChild(movieCard);
    });
}