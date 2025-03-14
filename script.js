// Send data to Google Sheet
function sendDataToSheet() {
  const queryParams = new URLSearchParams({
    team1Name: team1.name,
    team1Score: team1.score,
    team1Wickets: team1.wickets,
    team1Overs: team1.overs,
    team2Name: team2.name,
    team2Score: team2.score,
    team2Wickets: team2.wickets,
    team2Overs: team2.overs,
  });

  fetch(`${scriptUrl}?${queryParams}`, {
    method: 'GET',
  })
    .then(response => response.json())
    .then(result => {
      console.log('Response:', result);
      if (result.success) {
        alert('Score updated successfully!');
      } else {
        alert('Failed to update score.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to update score.');
    });
}
