// Team data
let team1 = { name: '', score: 0, wickets: 0, overs: 0 };
let team2 = { name: '', score: 0, wickets: 0, overs: 0 };
let matchOvers = 0;
let history = { team1: [], team2: [] }; // To store last 6 inputs for undo
let isFirstInnings = true;

// Google Apps Script URL
const scriptUrl = 'https://script.google.com/macros/s/AKfycbz4UhypsruR_B-RkP83_NIMjlbw9RzSD9w-z7Io_CYFiE3wgdNtaZDimH6My_i-LYDSQA/exec';

// Screen elements
const teamNamesScreen = document.getElementById('teamNamesScreen');
const scoringScreen = document.getElementById('scoringScreen');
const team1Display = document.getElementById('team1Display');
const team2Display = document.getElementById('team2Display');
const team1ScoreDisplay = document.getElementById('team1ScoreDisplay');
const team2ScoreDisplay = document.getElementById('team2ScoreDisplay');
const matchOversDisplay = document.getElementById('matchOversDisplay');
const endOfFirstInningsPopup = document.getElementById('endOfFirstInningsPopup');
const endOfMatchPopup = document.getElementById('endOfMatchPopup');

// Handle team names form submission
document.getElementById('teamNamesForm').addEventListener('submit', function (e) {
  e.preventDefault();
  team1.name = document.getElementById('team1Name').value;
  team2.name = document.getElementById('team2Name').value;
  matchOvers = document.getElementById('matchOvers').value;
  team1Display.textContent = team1.name;
  team2Display.textContent = team2.name;
  matchOversDisplay.textContent = `(${matchOvers} Overs Match)`;
  teamNamesScreen.classList.add('hidden');
  scoringScreen.classList.remove('hidden');
  updateScoreDisplay();
});

// Add runs to the score and overs
function addScore(runs, team) {
  const currentTeam = team === 1 ? team1 : team2;
  currentTeam.score += runs;
  currentTeam.overs += 0.1;
  if (currentTeam.overs % 1 > 0.5) currentTeam.overs = Math.round(currentTeam.overs); // Round overs
  updateHistory(currentTeam, { score: runs, overs: 0.1, wickets: 0 });
  updateScoreDisplay();
  checkInningsEnd();
  sendDataToSheet();
}

// Add extras to the score (no overs)
function addExtra(runs, team) {
  const currentTeam = team === 1 ? team1 : team2;
  currentTeam.score += runs;
  updateHistory(currentTeam, { score: runs, overs: 0, wickets: 0 });
  updateScoreDisplay();
  checkInningsEnd();
  sendDataToSheet();
}

// Add wicket
function addWicket(team) {
  const currentTeam = team === 1 ? team1 : team2;
  currentTeam.wickets += 1;
  updateHistory(currentTeam, { score: 0, overs: 0, wickets: 1 });
  updateScoreDisplay();
  checkInningsEnd();
  sendDataToSheet();
}

// Undo last input
function undoLast(team) {
  const currentTeam = team === 1 ? team1 : team2;
  const lastAction = history[`team${team}`].pop();
  if (lastAction) {
    currentTeam.score -= lastAction.score;
    currentTeam.overs -= lastAction.overs;
    currentTeam.wickets -= lastAction.wickets;
    updateScoreDisplay();
    sendDataToSheet();
  }
}

// Update history
function updateHistory(team, action) {
  const teamKey = team === team1 ? 'team1' : 'team2';
  history[teamKey].push(action);
  if (history[teamKey].length > 6) history[teamKey].shift(); // Keep only last 6 inputs
}

// Update the score display
function updateScoreDisplay() {
  team1ScoreDisplay.textContent = `${team1.name} ${team1.score}/${team1.wickets} (${team1.overs.toFixed(1)})`;
  team2ScoreDisplay.textContent = `${team2.name} ${team2.score}/${team2.wickets} (${team2.overs.toFixed(1)})`;
}

// Check if innings or match has ended
function checkInningsEnd() {
  if (isFirstInnings && team1.overs >= matchOvers) {
    endOfFirstInningsPopup.classList.remove('hidden');
  } else if (!isFirstInnings && (team2.overs >= matchOvers || team2.wickets >= 10 || team2.score > team1.score)) {
    endOfMatchPopup.classList.remove('hidden');
  }
}

// Start 2nd innings
function startSecondInnings() {
  isFirstInnings = false;
  endOfFirstInningsPopup.classList.add('hidden');
}

// Continue 1st innings
function continueFirstInnings() {
  endOfFirstInningsPopup.classList.add('hidden');
}

// Continue scoring after end of match
function continueScoring() {
  endOfMatchPopup.classList.add('hidden');
}

// Send data to Google Sheet
function sendDataToSheet() {
  const queryParams = `team1Name=${encodeURIComponent(team1.name)}&team1Score=${encodeURIComponent(team1.score)}&team1Wickets=${encodeURIComponent(team1.wickets)}&team1Overs=${encodeURIComponent(team1.overs)}&team2Name=${encodeURIComponent(team2.name)}&team2Score=${encodeURIComponent(team2.score)}&team2Wickets=${encodeURIComponent(team2.wickets)}&team2Overs=${encodeURIComponent(team2.overs)}`;

  fetch(`${scriptUrl}?${queryParams}`, {
    method: 'GET',
  })
    .then(response => response.json())
    .then(result => {
      console.log('Response:', result);
      if (result.success) {
        alert('Score updated successfully!');
      } else {
        alert('Failed to update score. Error: ' + (result.error || 'Unknown error'));
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to update score. Check console for details.');
    });
}
