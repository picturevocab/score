
// Match Setup
const matchSetup = document.getElementById('match-setup');
const liveScoring = document.getElementById('live-scoring');
const matchComplete = document.getElementById('match-complete');
const startMatchBtn = document.getElementById('start-match');
const restartBtn = document.getElementById('restart');
const start2ndInningsBtn = document.getElementById('start-2nd-innings');

// Top Score Bar Elements
const topBattingTeam = document.getElementById('top-batting-team');
const topOvers = document.getElementById('top-overs');
const topCrr = document.getElementById('top-crr');
const topTarget = document.getElementById('top-target');
const topBowlingTeam = document.getElementById('top-bowling-team');

let team1, team2, totalOvers, tossWinner, tossChoice;
let currentInnings = 1;
let score = { runs: 0, wickets: 0, overs: 0, balls: 0, extras: 0 };
let target = 0;
let history = [];

startMatchBtn.addEventListener('click', () => {
  team1 = document.getElementById('team1').value;
  team2 = document.getElementById('team2').value;
  totalOvers = parseInt(document.getElementById('overs').value);
  tossWinner = document.getElementById('toss').value;
  tossChoice = document.getElementById('toss-choice').value;

  // Validate inputs
  if (!team1 || !team2 || !totalOvers || totalOvers < 1 || totalOvers > 20) {
    alert('Please fill all fields correctly. Overs must be between 1 and 20.');
    return;
  }

  // Set batting and bowling teams based on toss
  const battingTeam = tossChoice === 'bat' ? (tossWinner === 'team1' ? team1 : team2) : (tossWinner === 'team1' ? team2 : team1);
  const bowlingTeam = tossChoice === 'bat' ? (tossWinner === 'team1' ? team2 : team1) : (tossWinner === 'team1' ? team1 : team2);

  // Update score bar
  topBattingTeam.textContent = `${battingTeam}: 0/0`;
  topBowlingTeam.textContent = bowlingTeam;

  // Hide match setup screen and show live scoring screen
  matchSetup.classList.add('hidden');
  liveScoring.classList.remove('hidden');

  // Update the score ticker
  updateScoreTicker();
});

// Start 2nd Innings
start2ndInningsBtn.addEventListener('click', () => {
  currentInnings = 2;
  target = score.runs + 1;
  score = { runs: 0, wickets: 0, overs: 0, balls: 0, extras: 0 };
  start2ndInningsBtn.classList.add('hidden');
  updateScoreTicker();
});

// Live Scoring
const runsButtons = document.querySelectorAll('.runs button');
const extraType = document.getElementById('extra-type');
const extraRuns = document.getElementById('extra-runs');
const confirmExtraBtn = document.getElementById('confirm-extra');
const addWicketBtn = document.getElementById('add-wicket');
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

addWicketBtn.addEventListener('click', () => {
  addWicket();
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
  checkEndOfInnings();
}

function addWicket() {
  history.push({ ...score });
  score.wickets++;
  updateScoreTicker();
  checkEndOfInnings();
}

function checkEndOfInnings() {
  if (currentInnings === 1 && (score.overs >= totalOvers || score.wickets === 10)) {
    start2ndInningsBtn.classList.remove('hidden');
  }
}

function updateScoreTicker() {
  // Update Top Score Bar
  topBattingTeam.textContent = `${team1}: ${score.runs}/${score.wickets}`;
  topOvers.textContent = `- ${score.overs}.${score.balls} (${totalOvers}-Overs)`;
  topCrr.textContent = `CRR: ${(score.runs / (score.overs + score.balls / 6)).toFixed(2)}`;
  topTarget.textContent = currentInnings === 2 ? `[Target: ${target}]` : '';

  // Send data to Firebase
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
  database.ref('score').set(tickerData);
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
