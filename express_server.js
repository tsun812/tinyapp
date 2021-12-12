const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const {findShortURLSById, findUserByEmail} = require("./helpers");
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["fries", "burgers"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
const urlDatabase = {
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const currUrls = {};
  const currId = req.session.id;
  let currEmail = undefined;
  if (users[currId]) {
    currEmail = users[currId].email;
  } else {
    return res.send("Please log in first <a href = '/urls/login'>login</a>");
  }
  const shortURL = findShortURLSById(currId, urlDatabase);
  let longURL = "";
  if (shortURL) {
    for (url of shortURL) {
      console.log(urlDatabase);
      console.log(shortURL);
      longURL = urlDatabase[url].longURL;
      currUrls[url] = longURL;
    }
  }
  const templateVars = { email: currEmail, urls: currUrls};
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const currId = req.session.id;
  let currEmail = undefined;
  if (users[currId]) {
    currEmail = users[currId].email;
    const templateVars = { email: currEmail };
    res.render("urls_new", templateVars);
  } else {
    res.status(400).send("Must login first.");
  }
});

app.get("/urls/login", (req, res) => {
  res.render("urls_login");
});

app.get("/urls/:shortURL", (req, res) => {
  let currId = req.session.id;
  let email = undefined;
  if (currId) {
    email = users[currId].email;
  }
  const templateVars = { email: email, shortURL: req.params.shortURL, longURL: req.params.longURL };
  res.render("urls_show", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  const short = req.params.shortURL;
  res.redirect(urlDatabase[short].longURL);
});

app.get("/register", (req, res) => {
  res.render("urls_registeration");
});


app.post("/urls", (req, res) => {
  let currId = req.session.id;
  const long = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: long, userID: currId};
  res.redirect("/urls/" + shortURL);
});


app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const currId = findUserByEmail(email, users);
  if (!email || !password) {
    res.status(400).send("Invalid email or password, please try again!");
  } else if (currId) {
    res.status(400).send("User already exist!");
  } else {
    const id = generateRandomString();
    users[id] = {id: id, email: email, password: hashedPassword};
    req.session.id = id;
    res.redirect("/urls");
  }
});

app.post("/urls/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userCurrent = findUserByEmail(email, users);
  if (!email || !password) {
    res.status(400).send("Email or password can't be blank.");
  } else if (!userCurrent) {
    res.status(403).send("User does not exist.");
  } else if (!bcrypt.compareSync(password, userCurrent.password)) {
    res.status(403).send("Wrong password, please enter again.");
  } else {
    req.session.id = userCurrent.id;
    res.redirect("/urls");
  }
});

app.post("/urls/logout", (req, res) => {
  req.session.id = null;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const long = req.body.longURL;
  shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = long;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  //let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() *
 6));
  }
  return result;
}
