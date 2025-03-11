// Match Setup
const matchSetup = document.getElementById('match-setup');
const liveScoring = document.getElementById('live-scoring');
const matchComplete = document.getElementById('match-complete');
const startMatchBtn = document.getElementById('start-match');
const restartBtn = document.getElementById('restart');

let team1, team2, totalOvers, tossWinner;
let currentInnings = 1;
let score = { runs: 0, wickets: 0, overs: 0, balls: 0, extras: 0 };
let target = 0;
let history = [];

startMatchBtn.addEventListener('click', () => {
  team1 = document.getElementById('team1').value;
  team2 = document.getElementById('team2').value;
  totalOvers = parseInt(document.getElementById('overs').value);
  tossWinner = document.getElementById('toss').value;

  if (!team1 || !team2 || !totalOvers || totalOvers < 1 || totalOvers > 20) {
    alert('Please fill all fields correctly. Overs must be between 1 and 20.');
    return;
  }

  matchSetup.classList.add('hidden');
  liveScoring.classList.remove('hidden');
  updateScoreTicker();
});

// Live Scoring
const runsButtons = document.querySelectorAll('.runs button');
const extraType = document.getElementById('extra-type');
const extraRuns = document.getElementById('extra-runs');
const confirmExtraBtn = document.getElementById('confirm-extra');
const outType = document.getElementById('out-type');
const confirmOutBtn = document.getElementById('confirm-out');
const undoBtn = document.getElementById('undo');

runsButtons.forEach(button => {
  button.addEventListener('click', () => {
    addRuns(parseInt(button.dataset.runs));
  });
});

confirmExtraBtn.addEventListener('click', () => {
  const type = extraType.value;
  const runs = parseInt(extraRuns.value);
  if (type === 'wide' || type === 'no-ball') {
    addRuns(1 + runs); // +1 for wide/no-ball + selected runs
  }
});

confirmOutBtn.addEventListener('click', () => {
  if (outType.value !== 'none') {
    addWicket();
  }
});

undoBtn.addEventListener('click', () => {
  if (history.length > 0) {
    const last = history.pop();
    score = { ...last };
    updateScoreTicker();
  }
});

function addRuns(runs) {
  history.push({ ...score });
  score.runs += runs;
  if (extraType.value !== 'wide') {
    score.balls++;
  }
  if (score.balls === 6) {
    score.overs++;
    score.balls = 0;
  }
  updateScoreTicker();
}

function addWicket() {
  history.push({ ...score });
  score.wickets++;
  if (score.wickets === 10) {
    endInnings();
  }
  updateScoreTicker();
}

function updateScoreTicker() {
  const tickerData = {
    team1: team1,
    team2: team2,
    innings: currentInnings === 1 ? '1st Innings' : '2nd Innings',
    score: `${score.runs}/${score.wickets}`,
    overs: `${score.overs}.${score.balls}`,
    totalOvers: totalOvers,
    crr: (score.runs / (score.overs + score.balls / 6)).toFixed(2),
    target: currentInnings === 2 ? target : null,
  };

  // Send data to the score ticker
  window.parent.postMessage(tickerData, '*');
}

function endInnings() {
  if (currentInnings === 1) {
    target = score.runs + 1;
    currentInnings = 2;
    score = { runs: 0, wickets: 0, overs: 0, balls: 0, extras: 0 };
    updateScoreTicker();
  } else {
    endMatch();
  }
}

function endMatch() {
  liveScoring.classList.add('hidden');
  matchComplete.classList.remove('hidden');
  const winner = score.runs >= target ? team2 : team1;
  document.getElementById('winner-text').innerText = `${winner} won the match!`;
}

restartBtn.addEventListener('click', () => {
  location.reload();
});
