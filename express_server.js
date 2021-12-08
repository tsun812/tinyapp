const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  //console.log(users)
  const templateVars = { username: users.username, urls: urlDatabase };
  //console.log(templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: users.username, shortURL: req.params.shortURL, longURL: req.params.longURL };
  res.render("urls_show", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  const short = req.params.shortURL
  res.redirect(urlDatabase[short])
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect("/u/"+shortURL);         // Respond with 'Ok' (we will replace this)

});

app.post("/urls/login", (req, res) => {
  const username = req.body.username;
  users.username = username;
  res.cookie("username", username);
  res.redirect("/urls");
})

app.post("/urls/logout", (req, res) => {
  console.log(req.cookies)
  delete users.username;
  res.clearCookie("username");
  console.log(req.cookies)
  res.redirect("/urls");
})

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls")
})

app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL;
  shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  //let charactersLength = characters.length;
    for ( var i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 6));
   }
   return result;
}