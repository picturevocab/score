let team1 = { name: "", runs: 0, wickets: 0, overs: 0 };
let team2 = { name: "", runs: 0, wickets: 0, overs: 0 };
let matchOvers = 0;
let currentInnings = 1;
let history = [];
const googleScriptUrl = "https://script.google.com/macros/s/AKfycbz1s9pT_efBd5zCDayekfMktdvD7CMznCJfSFkfA-2sLxXPMS6O_cQ2bP3HZzRvf6ZhXQ/exec"; // Your Google Apps Script URL

function startScoring() {
  team1.name = document.getElementById("team1").value;
  team2.name = document.getElementById("team2").value;
  matchOvers = parseFloat(document.getElementById("matchOvers").value);

  document.getElementById("create-match-screen").style.display = "none";
  document.getElementById("scoring-screen").style.display = "block";
  document.getElementById("matchTitle").innerText = `${team1.name} vs ${team2.name}`;
  document.getElementById("matchOversDisplay").innerText = `Match Overs: ${matchOvers}`;
  updateScore();
}

function addRun(runs, teamNumber) {
  trackHistory();
  const team = teamNumber === 1 ? team1 : team2;
  team.runs += runs;
  updateOvers(team);
  updateScore();
}

function addWicket(teamNumber) {
  trackHistory();
  const team = teamNumber === 1 ? team1 : team2;
  team.wickets += 1;
  updateScore();
}

function addExtra(runs, teamNumber) {
  trackHistory();
  const team = teamNumber === 1 ? team1 : team2;
  team.runs += runs;
  updateScore();
}

function updateOvers(team) {
  team.overs += 0.1;
  if (team.overs % 1 === 0.6) {
    team.overs = Math.round(team.overs);
  }
}

function updateScore() {
  document.getElementById("team1Details").innerText = `${team1.name} ${team1.runs}/${team1.wickets} (${team1.overs.toFixed(1)})`;
  document.getElementById("team2Details").innerText = `${team2.name} ${team2.runs}/${team2.wickets} (${team2.overs.toFixed(1)})`;
  checkInningsEnd();
  updateGoogleSheet();
}

function undo(teamNumber) {
  if (history.length > 0) {
    const lastState = history.pop();
    if (teamNumber === 1) {
      team1 = lastState.team1;
    } else if (teamNumber === 2) {
      team2 = lastState.team2;
    }
    updateScore();
  }
}

function trackHistory() {
  history.push({
    team1: { ...team1 },
    team2: { ...team2 }
  });
  if (history.length > 6) {
    history.shift(); // Keep only the last 6 states
  }
}

function checkInningsEnd() {
  if ((currentInnings === 1 && (team1.overs >= matchOvers || team1.wickets >= 10))) {
    console.log("End of 1st Innings");
  }
}

function updateGoogleSheet() {
  const params = new URLSearchParams({
    team1Name: team1.name,
    team2Name: team2.name,
    matchOvers: matchOvers,
    cors: "true" // Add this parameter to handle CORS
  });

  const url = `${googleScriptUrl}?${params.toString()}`;
  console.log("Sending request to:", url); // Log the URL

  fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(data => console.log("Score updated successfully!"))
    .catch(error => console.error("Error updating Google Sheet:", error));
}
