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
