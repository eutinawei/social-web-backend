const express = require("express")
const bodyParser = require('body-parser')
const db = require("./db.js")
const port = 7000
const app = express()

app.use(bodyParser.json());

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Pass to next layer of middleware
  next();
});

app.get("/health", (req, res) => res.send("Hello World!"));

app.get('/accounts', function(req, res) {
  let sql = "SELECT * FROM accounts";
  db.query(sql, function(err, data) {
    if (err) throw err;
    res.json({
      status: 200,
      data,
      message: "Accounts retrieved successfully"
    })
  })
});

app.post('/signIn', (req, res) => {
  let data = {
     username: req.body.username,
     password: req.body.password
  };
  let sql = 'SELECT * FROM accounts WHERE username = ? AND password = ?';
  db.query(sql, [data.username, data.password], function(err, data) {
    if (err || data == "") {
      return res.send({status: 400, message: "Username does not exist or password incorrect"});
    }
    return res.send({status: 200, data, message: "Successfully sign in"});
  });
});

app.post('/signUp', (req, res) => {
  let data = {
     username: req.body.username,
     password: req.body.password
  };
  let sql = "INSERT INTO accounts set ?";
  db.query(sql, data, function(err) {
    if (err) {
      return res.send({status: 400, message: "Username already exists"});
    }
    return res.send({status: 200, message: "Successfully sign up"});
  });
});

app.get('/songs', (req, res) => {
  let sql = "SELECT * FROM songs ORDER BY id DESC";
  db.query(sql, function(err, data) {
    if (err) throw err;
    return res.json({
      status: 200,
      data,
      message: "Accounts retrieved successfully"
    })
  })
})

app.post('/createSong', (req, res) => {
  let data = {
     artist: req.body.artist,
     title: req.body.title,
     url: req.body.url,
     comment: req.body.comment,
     username: req.body.username
  };
  let sql = "INSERT INTO songs set ?";
  db.query(sql, data, function(err, data) {
    if (err) {
      return res.send({status: 400, message: "Post failed"});
    }
    return res.send({status: 200, data, message: "Successfully created post"});
  });
});

app.post('/search', (req, res) => {
  let text = req.body.text
  let username = req.body.username
  let sql = "SELECT DISTINCT songs.id, artist, comment, title, url, songs.username, vote FROM songs ";
  sql += "LEFT JOIN (SELECT * FROM favorites WHERE username = ?) AS favorites ON songs.id = favorites.song_id ";
  sql += "RIGHT JOIN tags on songs.id = tags.song_id ";
  sql += "WHERE artist REGEXP ? OR title REGEXP ? OR songs.username REGEXP ? OR comment REGEXP ? OR word REGEXP ? ";
  sql += "ORDER BY favorites.id DESC, vote DESC, songs.id DESC";
  db.query(sql, [username, text, text, text, text, text], function(err, data) {
    if (err) {
      return res.send({status: 400, message: "Search failed"});
    }
    return res.json({
      status: 200,
      data,
      message: "Search results retrieved successfully"
    })
  })
})

app.post('/upVote', (req, res) => {
  let id = req.body.id
  let username = req.body.username
  let sql = "UPDATE songs SET vote = vote + 1 WHERE id = ?; UPDATE accounts SET vote = vote + 1 WHERE username = ?";
  db.query(sql, [id, username], function(err) {
    if (err) {
      return res.send({status: 400, message: err});
    }
    return res.json({
      status: 200,
      message: "Upvote successfully"
    })
  })
})

app.post('/love', (req, res) => {
  let username = req.body.username
  let sql = "SELECT * FROM favorites WHERE username = ?";
  db.query(sql, username, function(err, data) {
    if (err) {
      return res.send({status: 400, message: "Finding favorites failed"});
    }
    return res.json({
      status: 200,
      data,
      message: "Favorite list retrieved successfully"
    })
  })
})

app.post('/addLove', (req, res) => {
  let data = {
     id: req.body.id + "_" + req.body.username,
     song_id: req.body.id,
     username: req.body.username
  };
  let sql = "INSERT INTO favorites set ?";
  db.query(sql, data, function(err) {
    if (err) {
      return res.send({status: 400, message: "Favorites insertion failed"});
    }
    return res.send({status: 200, message: "Successfully added to favorites"});
  });
});

app.post('/removeLove', (req, res) => {
  let id = req.body.id + "_" + req.body.username
  let sql = "DELETE FROM favorites WHERE id = ?";
  db.query(sql, id, function(err) {
    if (err) {
      return res.send({status: 400, message: "Favorites deletion failed"});
    }
    return res.send({status: 200, message: "Successfully deleted to favorites"});
  });
});

app.post('/searchUserPost', (req, res) => {
  let username = req.body.username
  let sql = "SELECT * FROM songs WHERE username = ? ORDER BY id DESC";
  db.query(sql, username, function(err, data) {
    if (err) {
      return res.send({status: 400, message: "Search failed"});
    }
    return res.json({
      status: 200,
      data,
      message: "Search results retrieved successfully"
    })
  })
})

app.post('/searchUserLove', (req, res) => {
  let username = req.body.username
  let sql = "SELECT * FROM songs WHERE id IN (SELECT song_id FROM favorites WHERE username = ?) ORDER BY id DESC";
  db.query(sql, username, function(err, data) {
    if (err) {
      return res.send({status: 400, message: "Search failed"});
    }
    return res.json({
      status: 200,
      data,
      message: "Search results retrieved successfully"
    })
  })
})

app.get('/getTags', (req, res) => {
  let sql = "SELECT * FROM tags";
  db.query(sql, function(err, data) {
    if (err) throw err;
    return res.json({
      status: 200,
      data,
      message: "Accounts retrieved successfully"
    })
  })
})

app.post('/addTag', (req, res) => {
  let data = {
     id: req.body.song_id + "_" + req.body.word,
     song_id: req.body.song_id,
     word: req.body.word
  };
  let sql = "INSERT INTO tags set ?;SELECT * FROM tags";
  db.query(sql, data, function(err,data) {
    if (err) {
      return res.send({status: 400, message: "Tag creation failed"});
    }
    return res.send({status: 200, data, message: "Successfully added tag"});
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
