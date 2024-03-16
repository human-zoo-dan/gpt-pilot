function removeQuotes(string) {
  return string.trim().replace(/^"|"$/g, '');
}

module.exports = removeQuotes;