const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const e = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "tsun812@gmail.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  //console.log(users);
  const currId = req.cookies.id;
  let currEmail = undefined;
  if(users[currId]){
    currEmail = users[currId].email
  }
  const templateVars = { email: currEmail, urls: urlDatabase };
  //console.log(templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const currId = req.cookies.id;
  let currEmail = undefined;
  if(users[currId]){
    currEmail = users[currId].email
  }
  const templateVars = { email: currEmail };
  res.render("urls_new", templateVars);
});

app.get("/urls/login", (req, res) => {
  res.render("urls_login")
})

app.get("/urls/:shortURL", (req, res) => {
  let currId = req.cookies["id"];
  const email = undefined;
  if(currId) {
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
  const short = req.params.shortURL
  res.redirect(urlDatabase[short])
});

app.get("/register", (req, res) => {
  res.render("urls_registeration")
})


app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect("/u/"+shortURL);         // Respond with 'Ok' (we will replace this)

});


app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const currId = findUserByEmail(email);
  if (!email || !password) {
    res.status(400).send("Invalid email or password, please try again!");
  }else if (currId) {
    res.status(400).send("User already exist!");
  } else{
  const id = generateRandomString();
  users[id] = {id: id, email: email, password: password}
  res.cookie("id", id);
  res.redirect("/urls");
  }
})

app.post("/urls/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userCurrent = findUserByEmail(email);
  if (!email || !password) {
    res.status(400).send("Email or password can't be blank.")
  }
  else if (!userCurrent) {
    res.status(403).send("User does not exist.")
  }
  else if(userCurrent.password !== password) {
    res.status(403).send("Wrong password, please enter again.")
  }
  else {
    res.status(400).send("User not exists, please register.")
  }
})

app.post("/urls/logout", (req, res) => {
  let id = req.cookies.id;
  res.clearCookie("id");
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

function findUserByEmail (email) {
  for(const userId in users) {
    const user = users[userId];
    if(user.email === email) {
      return user;
    }
  }
  return null;
}