export function sanitizeHTML(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function sanitizePlayerName(name) {
  if (!name || typeof name !== 'string') {
    return `Player_${Math.floor(Math.random() * 100000)}`;
  }
  
  return name
    .replace(/<[^>]*>/g, '')
    .replace(/[<>'"]/g, '')
    .trim()
    .substring(0, 20) || `Player_${Math.floor(Math.random() * 100000)}`;
}
