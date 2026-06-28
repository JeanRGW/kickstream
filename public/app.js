const state = {
  games: [],
  championship: 'todos',
  status: 'todos',
};

const grid = document.querySelector('#games-grid');
const message = document.querySelector('#message');
const resultCount = document.querySelector('#result-count');
const championshipFilter = document.querySelector('#championship-filter');
const statusFilter = document.querySelector('#status-filter');

const statusClass = {
  'Ao Vivo': 'live',
  Disponivel: 'available',
  Disponível: 'available',
  'Em Breve': 'soon',
};

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function formatDate(value) {
  if (!value) return 'Data nao informada';

  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function getStatusBadge(status) {
  const className = statusClass[status] || 'soon';
  return `<span class="status-badge ${className}">${status || 'Indefinido'}</span>`;
}

function renderChampionshipOptions(games) {
  const championships = [...new Set(games.map((game) => game.campeonato).filter(Boolean))].sort();

  for (const championship of championships) {
    const option = document.createElement('option');
    option.value = championship;
    option.textContent = championship;
    championshipFilter.appendChild(option);
  }
}

function getFilteredGames() {
  return state.games.filter((game) => {
    const matchesChampionship =
      state.championship === 'todos' || game.campeonato === state.championship;
    const matchesStatus =
      state.status === 'todos' || normalizeText(game.status) === normalizeText(state.status);

    return matchesChampionship && matchesStatus;
  });
}

function renderGames() {
  const games = getFilteredGames();

  resultCount.textContent = `${games.length} jogo${games.length === 1 ? '' : 's'} encontrado${games.length === 1 ? '' : 's'}`;
  grid.innerHTML = '';

  if (games.length === 0) {
    message.textContent = 'Nenhum jogo encontrado com os filtros selecionados.';
    return;
  }

  message.textContent = '';

  for (const game of games) {
    const card = document.createElement('article');
    card.className = 'game-card';
    card.innerHTML = `
      <div class="thumb-wrap">
        <img src="${game.url_thumb || 'https://placehold.co/600x340?text=KickStream'}" alt="${game.titulo || 'Jogo KickStream'}" loading="lazy" />
        ${getStatusBadge(game.status)}
      </div>
      <div class="game-content">
        <p class="championship">${game.campeonato || 'Campeonato nao informado'}</p>
        <h3>${game.titulo || `${game.time_casa || 'Time A'} x ${game.time_visitante || 'Time B'}`}</h3>
        <dl class="game-meta">
          <div><dt>Data</dt><dd>${formatDate(game.data)} ${game.horario ? `as ${game.horario}` : ''}</dd></div>
          <div><dt>Placar</dt><dd>${game.placar || '-'}</dd></div>
          <div><dt>Avaliacao</dt><dd>${game.avaliacao || '-'}</dd></div>
          <div><dt>Duracao</dt><dd>${game.duracao_min ? `${game.duracao_min} min` : '-'}</dd></div>
        </dl>
        <p class="description">${game.descricao || 'Partida disponivel no catalogo KickStream.'}</p>
        <button class="watch-button" type="button" data-title="${game.titulo || 'Jogo'}">Assistir</button>
      </div>
    `;

    grid.appendChild(card);
  }
}

async function loadGames() {
  try {
    message.textContent = 'Carregando catalogo a partir do DynamoDB...';
    const response = await fetch('/api/jogos');

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const data = await response.json();
    state.games = Array.isArray(data.items) ? data.items : [];

    renderChampionshipOptions(state.games);
    renderGames();
  } catch (error) {
    console.error(error);
    resultCount.textContent = 'Catalogo indisponivel';
    message.textContent = 'Nao foi possivel carregar os jogos. Verifique a API, a IAM Role e a tabela DynamoDB.';
  }
}

championshipFilter.addEventListener('change', (event) => {
  state.championship = event.target.value;
  renderGames();
});

statusFilter.addEventListener('change', (event) => {
  state.status = event.target.value;
  renderGames();
});

grid.addEventListener('click', (event) => {
  const button = event.target.closest('.watch-button');
  if (!button) return;

  alert(`Player demonstrativo: ${button.dataset.title}`);
});

loadGames();
