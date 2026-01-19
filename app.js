const STORAGE_KEY = 'liquor-marble-6x6-perimeter-v1';
const TEAM_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B'];
const BOARD_SIDE = 6;
const gridMapping = (() => {
  const coords = [];
  for (let col = 1; col <= BOARD_SIDE; col += 1) coords.push([1, col]);
  for (let row = 2; row <= BOARD_SIDE - 1; row += 1) coords.push([row, BOARD_SIDE]);
  for (let col = BOARD_SIDE; col >= 1; col -= 1) coords.push([BOARD_SIDE, col]);
  for (let row = BOARD_SIDE - 1; row >= 2; row -= 1) coords.push([row, 1]);
  return coords;
})();
const BOARD_SIZE = gridMapping.length;
const BONUS_COLOR = '#fde047';

const tileData = [
  {
    name: '출발지',
    color: '#fca5a5',
    isBonus: false,
    content: '쉬어가세용'
  },
  {
    name: '면제권',
    color: BONUS_COLOR,
    isBonus: true
  },
  {
    name: '의리게임!',
    color: '#fcd34d',
    isBonus: false,
    content: '팀끼리 나눠 마셔보아요~'
  },
  {
    name: '너 마셔!',
    color: '#86efac',
    isBonus: false,
    content: '지목대상 마시기'
  },
  {
    name: '모두다 마셔!',
    color: '#93c5fd',
    isBonus: false,
    content: '다같이 한잔해~'
  },
  {
    name: '뒤로 1칸이동',
    color: '#c4b5fd',
    isBonus: false,
    content: 'Move back 1 tile',
    effect: { type: 'MOVE', steps: -1 }
  },
  {
    name: '면제권',
    color: BONUS_COLOR,
    isBonus: true
  },
  {
    name: '남자끼리 마셔',
    color: '#fdba74',
    isBonus: false
  },
  {
    name: '양옆 마셔',
    color: '#fcd34d',
    isBonus: false,
    content: '너 너 마셔!'
  },
  {
    name: '술 적립하기',
    color: '#86efac',
    isBonus: false,
    content: '술 하나 적립이요~'
  },
  {
    name: '뒤로 2칸이동',
    color: '#93c5fd',
    isBonus: false,
    content: 'Move back 2 tiles',
    effect: { type: 'MOVE', steps: -2 }
  },
  {
    name: '대신술 권',
    color: BONUS_COLOR,
    isBonus: true,
    content: '술 마실때 자신의 술 남에게 먹이기'
  },
  {
    name: '눈치게임',
    color: '#fca5a5',
    isBonus: false,
    content: '눈치게임 시작!'
  },
  {
    name: '한글날',
    color: '#fdba74',
    isBonus: false,
    content: '다음차례까지 한국어만'
  },
  {
    name: '물 한잔해',
    color: '#fcd34d',
    isBonus: false,
    content: '물 한잔해~'
  },
  {
    name: '야 막내야!',
    color: '#86efac',
    isBonus: false,
    content: '다음 차례까지 막내입니다~'
  },
  {
    name: '면제권',
    color: BONUS_COLOR,
    isBonus: true
  },
  {
    name: '여자끼리 마셔',
    color: '#c4b5fd',
    isBonus: false
  },
  {
    name: '안주먹기',
    color: '#fca5a5',
    isBonus: false,
    content: '안주 한입해'
  },
  {
    name: '적립 술 마시기',
    color: '#fdba74',
    isBonus: false,
    content: '적립된 술을 마셔보아요'
  }
];


const tileImages = [
  '', // 01
  '', // 02
  '', // 03
  '', // 04
  '', // 05
  '', // 06
  '', // 07
  '', // 08
  '', // 09
  '', // 10
  '', // 11
  '', // 12
  '', // 13
  '', // 14
  '', // 15
  '', // 16
  '', // 17
  '', // 18
  '', // 19
  '', // 20
];

const tileDataWithImages = tileData.map((tile, i) => ({
  ...tile,
  image: tileImages[i] || ''
}));

let state = {
  phase: 'SETUP',
  teams: [],
  teamPositions: [],
  currentTeamIndex: 0,
  lastDice: null,
  board: tileDataWithImages.map((tile, i) => ({ ...tile, id: i }))
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return false;
  const parsed = JSON.parse(saved);
  const parsedTeams = Array.isArray(parsed.teams) ? parsed.teams : [];
  const teams = parsedTeams.map((team, idx) => ({
    ...team,
    id: typeof team.id === 'number' ? team.id : idx,
    shields: Number.isFinite(team.shields) ? team.shields : 0
  }));
  const teamCount = teams.length;
  state = {
    ...state,
    ...parsed,
    teams,
    board: tileDataWithImages.map((tile, i) => ({ ...tile, id: i })),
    teamPositions: (parsed.teamPositions || []).map(pos => pos % BOARD_SIZE),
    currentTeamIndex: teamCount > 0 ? parsed.currentTeamIndex % teamCount : 0
  };
  return Array.isArray(state.teams) && state.teams.length > 0;
}

function resetGame() {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

function initGame(pCount, tCount) {
  const newTeams = Array.from({ length: tCount }, (_, i) => ({
    id: i,
    name: `Team ${i + 1}`,
    color: TEAM_COLORS[i],
    members: [],
    shields: 0
  }));
  state = {
    ...state,
    phase: 'TURN_START',
    teams: newTeams,
    teamPositions: new Array(tCount).fill(0),
    currentTeamIndex: 0,
    lastDice: null
  };
  saveState();
  render();
}

function rollDice() {
  if (state.phase !== 'TURN_START') return;
  state.phase = 'ROLLING';
  state.lastDice = null;
  saveState();
  render();

  const diceEl = document.getElementById('dice');
  if (!diceEl) return;

  const rollDuration = 900;
  const tick = 80;
  let result = 1;

  diceEl.classList.add('rolling');
  const interval = setInterval(() => {
    result = Math.floor(Math.random() * 6) + 1;
    diceEl.textContent = result;
  }, tick);

  setTimeout(() => {
    clearInterval(interval);
    diceEl.classList.remove('rolling');
    state.lastDice = result;
    state.phase = 'MOVING';
    saveState();
    render();
    processMovement(result);
  }, rollDuration);
}

function processMovement(steps) {
  let moved = 0;
  const moveInterval = setInterval(() => {
    moved += 1;
    state.teamPositions[state.currentTeamIndex] =
      (state.teamPositions[state.currentTeamIndex] + 1) % BOARD_SIZE;
    renderTokens();
    if (moved >= steps) {
      clearInterval(moveInterval);
      setTimeout(() => {
        const landedIndex = state.teamPositions[state.currentTeamIndex];
        const landedTile = state.board[landedIndex];
        if (landedTile && landedTile.isBonus) {
          state.teams[state.currentTeamIndex].shields += 1;
        }
        state.phase = 'LANDED';
        saveState();
        render();
      }, 400);
    }
  }, 220);
}

function endTurn() {
  state.currentTeamIndex = (state.currentTeamIndex + 1) % state.teams.length;
  state.phase = 'TURN_START';
  state.lastDice = null;
  saveState();
  render();
}

function applyTileEffect(tile) {
  if (!tile || !tile.effect) return;
  if (tile.effect.type === 'MOVE' && Number.isFinite(tile.effect.steps)) {
    const currentPos = state.teamPositions[state.currentTeamIndex];
    state.teamPositions[state.currentTeamIndex] =
      (currentPos + tile.effect.steps + BOARD_SIZE) % BOARD_SIZE;
  }
}

function handleLandingConfirm() {
  if (state.phase !== 'LANDED') return;
  const landedTile = state.board[state.teamPositions[state.currentTeamIndex]];
  applyTileEffect(landedTile);
  endTurn();
}

function useShield(teamId) {
  if (state.phase === 'ROLLING' || state.phase === 'MOVING') return;
  const team = state.teams.find(t => t.id === teamId);
  if (!team || team.shields <= 0) return;
  team.shields -= 1;
  saveState();
  render();
}

const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const boardContainer = document.getElementById('board-container');
const modalOverlay = document.getElementById('modal-overlay');

function renderBoard() {
  boardContainer.innerHTML = '';
  state.board.forEach((tile, i) => {
    const mapping = gridMapping[i];
    if (!mapping) return;
    const [row, col] = mapping;
    const el = document.createElement('div');
    el.className = 'tile';
    el.style.gridRowStart = row;
    el.style.gridColumnStart = col;
    el.innerHTML =
      `<div class="tile-header" style="background-color:${tile.color}"></div>` +
      `<div class="tile-body">${tile.name}</div>` +
      `<span class="absolute top-0.5 left-0.5 text-[8px] text-gray-500">${tile.id}</span>`;
    el.id = `tile-${tile.id}`;
    boardContainer.appendChild(el);
  });
}

function renderTokens() {
  document.querySelectorAll('.token').forEach(token => token.remove());

  state.teams.forEach((team, idx) => {
    const pos = state.teamPositions[idx];
    const tileEl = document.getElementById(`tile-${pos}`);
    if (!tileEl) return;

    const token = document.createElement('div');
    token.className = 'token';
    token.style.backgroundColor = team.color;

    const rect = tileEl.getBoundingClientRect();
    const parentRect = boardContainer.getBoundingClientRect();

    const offsetX = (idx % 2 === 0 ? -1 : 1) * (idx < 2 ? 4 : 8);
    const offsetY = (idx < 2 ? -1 : 1) * 4;

    token.style.left = `${rect.left - parentRect.left + rect.width / 2 - 8 + offsetX}px`;
    token.style.top = `${rect.top - parentRect.top + rect.height / 2 - 8 + offsetY}px`;

    boardContainer.appendChild(token);
  });
}

function render() {
  if (state.phase === 'SETUP') {
    setupScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
    document.getElementById('setup-resume-area').classList.toggle(
      'hidden',
      !localStorage.getItem(STORAGE_KEY)
    );
    return;
  }

  setupScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');

  renderBoard();
  renderTokens();

  const currentTeam = state.teams[state.currentTeamIndex];
  const turnBanner = document.getElementById('turn-banner');
  turnBanner.style.borderLeftColor = currentTeam.color;
  document.getElementById('current-team-name').innerText = currentTeam.name;

  const diceArea = document.getElementById('dice-area');
  const diceValue = state.lastDice || '?';
  if (state.phase === 'TURN_START' || state.phase === 'ROLLING') {
    const rollingClass = state.phase === 'ROLLING' ? ' rolling' : '';
    diceArea.innerHTML =
      `<div class="dice-wrap">` +
      `<div id="dice" class="dice${rollingClass}">${diceValue}</div>` +
      `<button id="btn-roll" class="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow font-bold">Roll</button>` +
      `</div>`;

    const rollButton = document.getElementById('btn-roll');
    if (state.phase === 'TURN_START') {
      rollButton.onclick = rollDice;
    } else {
      rollButton.disabled = true;
      rollButton.textContent = 'Rolling...';
      rollButton.classList.add('opacity-60', 'cursor-not-allowed');
    }
  } else {
    diceArea.innerHTML = `<div class="dice">${diceValue}</div>`;
  }

  const teamStatusBar = document.getElementById('team-status-bar');
  teamStatusBar.innerHTML = '';
  state.teams.forEach((team, idx) => {
    const isActive = idx === state.currentTeamIndex;
    const canUse = isActive && team.shields > 0;
    const useClasses = canUse
      ? 'bg-emerald-600 hover:bg-emerald-700'
      : 'bg-gray-300 text-gray-500 cursor-not-allowed';
    teamStatusBar.innerHTML +=
      `<div class="p-2 rounded border ${isActive ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200' : 'bg-gray-50 border-gray-200 opacity-60'}">` +
      `<div class="w-3 h-3 rounded-full mx-auto mb-1" style="background-color:${team.color}"></div>` +
      `<div class="font-bold truncate">${team.name}</div>` +
      `<div class="mt-1 text-xs text-gray-500">Shields: ${team.shields}</div>` +
      `<button data-use-shield="${team.id}" class="mt-1 w-full text-xs py-1 rounded text-white ${useClasses}" ${canUse ? '' : 'disabled'}>Use</button>` +
      `</div>`;
  });

  teamStatusBar.querySelectorAll('[data-use-shield]').forEach(button => {
    button.onclick = () => {
      const teamId = parseInt(button.getAttribute('data-use-shield'), 10);
      useShield(teamId);
    };
  });

  if (state.phase === 'LANDED') {
    const landedTile = state.board[state.teamPositions[state.currentTeamIndex]];
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalSubtext = document.getElementById('modal-subtext');
    const modalPenalty = document.getElementById('modal-penalty');
    const modalImage = document.getElementById('modal-image');
    const modalImagePlaceholder = document.getElementById('modal-image-placeholder');
    const content = landedTile.content || (landedTile.isBonus ? 'Shield +1' : landedTile.name);
    let subtext = '';
    if (landedTile.effect && landedTile.effect.type === 'MOVE') {
      const steps = Math.abs(landedTile.effect.steps || 0);
      subtext = `Move back ${steps} ${steps === 1 ? 'tile' : 'tiles'}`;
    }
    const penaltyText = landedTile.penalty || '';
    const imageSrc = landedTile.image || '';
    if (modalTitle) modalTitle.innerText = landedTile.name;
    if (modalContent) modalContent.innerText = content;
    if (modalSubtext) modalSubtext.innerText = subtext;
    if (modalPenalty) {
      modalPenalty.innerText = penaltyText;
      modalPenalty.classList.toggle('hidden', penaltyText === '');
    }
    if (modalImage) {
      if (imageSrc) {
        modalImage.src = imageSrc;
        modalImage.alt = landedTile.name;
        modalImage.classList.remove('hidden');
      } else {
        modalImage.removeAttribute('src');
        modalImage.alt = '';
        modalImage.classList.add('hidden');
      }
    }
    if (modalImagePlaceholder) {
      modalImagePlaceholder.classList.toggle('hidden', imageSrc !== '');
    }
    modalOverlay.classList.remove('hidden');
  } else {
    modalOverlay.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-new-game').onclick = () =>
    initGame(
      parseInt(document.getElementById('input-player-count').value, 10),
      parseInt(document.getElementById('select-team-count').value, 10)
    );

  document.getElementById('btn-resume').onclick = () => {
    if (loadState()) render();
  };

  document.getElementById('btn-reset').onclick = () => {
    if (confirm('Reset the current game?')) resetGame();
  };

  document.getElementById('btn-modal-confirm').onclick = handleLandingConfirm;

  if (localStorage.getItem(STORAGE_KEY) && loadState()) {
    render();
  } else {
    render();
  }
});

