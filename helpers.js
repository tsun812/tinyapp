const findUserByEmail = function (email, users) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

const findShortURLSById = function(id, urlDatabase) {
  const urls  = [];
  for (const url in urlDatabase) {
    const shortURL = urlDatabase[url];
    if (shortURL.userID === id) {
      urls.push(url);
    }
  }
  return urls;
}
module.exports = {findUserByEmail, findShortURLSById};