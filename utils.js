const extractAll = (string, regex) => {
  const matches = [...string.matchAll(regex)];
  return matches.map(match => match[1]);
};

const extractOne = (string, regex) => {
  const match = string.match(regex);
  return match[1];
};

module.exports = {
  extractAll,
  extractOne,
};
