// Google Apps Script URL
const scriptUrl = "https://script.google.com/macros/s/AKfycbz1s9pT_efBd5zCDayekfMktdvD7CMznCJfSFkfA-2sLxXPMS6O_cQ2bP3HZzRvf6ZhXQ/exec";

// Team Data Objects
let team1 = {
  name: '',
  score: 0,
  wickets: 0,
  overs: 0,
  history: [], // Store last 6 inputs for undo functionality
};

let team2 = {
  name: '',
  score: 0,
  wickets: 0,
  overs: 0,
  history: [], // Store last 6 inputs for undo functionality
};

let matchOvers = 0;
let isFirstInnings = true;

// Copy Score Ticker Overlay Link
function copyLink() {
  const link = 'https://picturevocab.github.io/googlescoreticker/';
  navigator.clipboard.writeText(link)
    .then(() => {
      alert('Link copied to clipboard!');
    })
    .catch(() => {
      alert('Failed to copy link. Please copy it manually.');
    });
}

// Handle Form Submission
document.getElementById('teamNamesForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent the form from submitting and refreshing the page

  // Get input values
  team1.name = document.getElementById('team1Name').value;
  team2.name = document.getElementById('team2Name').value;
  matchOvers = parseFloat(document.getElementById('matchOvers').value);

  // Validate inputs
  if (!team1.name || !team2.name || !matchOvers) {
    alert('Please fill in all fields.');
    return;
  }

  // Update the scoring screen with the input data
  document.getElementById('team1Display').textContent = team1.name;
  document.getElementById('team2Display').textContent = team2.name;
  document.getElementById('matchOversDisplay').textContent = `(${matchOvers} Overs Match)`;

  // Update the score display with team names
  document.getElementById('team1ScoreDisplay').textContent = `${team1.name}: ${team1.score}/${team1.wickets} (${team1.overs})`;
  document.getElementById('team2ScoreDisplay').textContent = `${team2.name}: ${team2.score}/${team2.wickets} (${team2.overs})`;

  // Switch to the scoring screen
  document.getElementById('teamNamesScreen').classList.add('hidden');
  document.getElementById('scoringScreen').classList.remove('hidden');
});

// Update team scores and overs
function updateScore(team, runs, wickets) {
  const currentTeam = team === 1 ? team1 : team2;

  // Add the current state to history (for undo functionality)
  currentTeam.history.push({
    score: currentTeam.score,
    wickets: currentTeam.wickets,
    overs: currentTeam.overs,
  });

  // Keep only the last 6 inputs
  if (currentTeam.history.length > 6) {
    currentTeam.history.shift();
  }

  // Update score, wickets, and overs
  currentTeam.score += runs;
  currentTeam.wickets += wickets;
  if (wickets === 0) currentTeam.overs += 0.1; // Increase overs by 0.1 for runs

  // Round overs to the nearest 0.5
  currentTeam.overs = Math.round(currentTeam.overs * 2) / 2;

  // Update the display
  document.getElementById('team1ScoreDisplay').textContent = `${team1.name}: ${team1.score}/${team1.wickets} (${team1.overs})`;
  document.getElementById('team2ScoreDisplay').textContent = `${team2.name}: ${team2.score}/${team2.wickets} (${team2.overs})`;

  // Send data to Google Sheet
  sendDataToSheet();
}

// Add runs to a team
function addScore(runs, team) {
  updateScore(team, runs, 0);
}

// Add wickets to a team
function addWicket(team) {
  updateScore(team, 0, 1);
}

// Add extras (does not increase overs)
function addExtra(runs, team) {
  const currentTeam = team === 1 ? team1 : team2;
  currentTeam.score += runs;

  // Update the display
  document.getElementById('team1ScoreDisplay').textContent = `${team1.name}: ${team1.score}/${team1.wickets} (${team1.overs})`;
  document.getElementById('team2ScoreDisplay').textContent = `${team2.name}: ${team2.score}/${team2.wickets} (${team2.overs})`;

  // Send data to Google Sheet
  sendDataToSheet();
}

// Undo last 6 inputs for a team
function undoLast(team) {
  const currentTeam = team === 1 ? team1 : team2;

  if (currentTeam.history.length === 0) {
    alert('No more actions to undo.');
    return;
  }

  // Get the last saved state
  const lastState = currentTeam.history.pop();

  // Restore the state
  currentTeam.score = lastState.score;
  currentTeam.wickets = lastState.wickets;
  currentTeam.overs = lastState.overs;

  // Update the display
  document.getElementById('team1ScoreDisplay').textContent = `${team1.name}: ${team1.score}/${team1.wickets} (${team1.overs})`;
  document.getElementById('team2ScoreDisplay').textContent = `${team2.name}: ${team2.score}/${team2.wickets} (${team2.overs})`;

  // Send data to Google Sheet
  sendDataToSheet();
}

// Send data to Google Sheet
function sendDataToSheet() {
  const data = {
    team1Name: team1.name,
    team1Score: team1.score,
    team1Wickets: team1.wickets,
    team1Overs: team1.overs,
    team2Name: team2.name,
    team2Score: team2.score,
    team2Wickets: team2.wickets,
    team2Overs: team2.overs,
  };

  fetch(scriptUrl, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => response.json())
    .then(result => {
      console.log('Response:', result);
      if (result.success) {
        console.log('Score updated successfully!');
      } else {
        console.error('Failed to update score.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to update score. Please check your connection and try again.');
    });
}

// Show End of 1st Innings Pop-up
function showEndOfFirstInningsPopup() {
  const endOfFirstInningsPopup = document.getElementById('endOfFirstInningsPopup');
  endOfFirstInningsPopup.style.display = 'flex';
}

// Hide End of 1st Innings Pop-up
function hideEndOfFirstInningsPopup() {
  const endOfFirstInningsPopup = document.getElementById('endOfFirstInningsPopup');
  endOfFirstInningsPopup.style.display = 'none';
}

// Show End of Match Pop-up
function showEndOfMatchPopup() {
  const endOfMatchPopup = document.getElementById('endOfMatchPopup');
  endOfMatchPopup.style.display = 'flex';
}

// Hide End of Match Pop-up
function hideEndOfMatchPopup() {
  const endOfMatchPopup = document.getElementById('endOfMatchPopup');
  endOfMatchPopup.style.display = 'none';
}

// Start 2nd Innings
function startSecondInnings() {
  hideEndOfFirstInningsPopup();
  isFirstInnings = false;
}

// Continue 1st Innings
function continueFirstInnings() {
  hideEndOfFirstInningsPopup();
}
