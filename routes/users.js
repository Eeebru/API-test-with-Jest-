process.env.NODE_ENV = "test";
const express = require("express");
const router = express.Router();
const db = require("../db/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const SECRET = process.env.SECRET;

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM users");
    return res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post("/auth", async (req, res, next) => {
  const becrypt = await bcrypt.hash(req.body.password, 2);
  const queryy = {
    text: "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
    values: [req.body.name, becrypt],
  };

  try {
    const result = await db.query(queryy);
    const token = jwt.sign({ userId: result.rows[0].id }, SECRET, {
      expiresIn: "30m",
    });
    
    return res.json({token});
  } catch (err) {
    next(err);
  }
});

router.post("/login/:id", async (req, res, next) => {
  const queryy = {
    text: "SELECT * FROM users WHERE id = $1 LIMIT 1",
    values: [req.params.id],
  };
  try {
    const foundUser = await db.query(queryy);
    if (foundUser.rows.length === 0) {
      res.json({ message: "Invalid Username" });
    }
    const comparePass = await bcrypt.compare(
      req.body.password,
      foundUser.rows[0].password
    );
    if (comparePass === false) {
      return res.json({ message: "Incorrect Password" });
    }

    const token = jwt.sign({ userId: foundUser.rows[0].id }, SECRET, {
      expiresIn: "30m",
    });

    return res.json({ token });
  } catch (err) {
    next(err);
  }
});

// helper Middleware
// const helperMiddleware = (req, res, next) => {
//   try {
//     const authHeaderValue = req.headers.authorization;
//     const token = jwt.verify(authHeaderValue.split(' ')[1], SECRET);
//     return next();
//   }catch(e) {
//     return res.status(401).json({message: 'Unauthorized'})
//   }
// }

// // the api

// router.post('/secure', helperMiddleware, async (req, res, next)=> {
//   try {
//     res.json({message: 'you made it!'})
//   } catch (err) {
//     res.json(err);
//   }
// })

//ensuring a correct user
const correctUserhelperMiddleware = (req, res, next) => {
  try {
    const authHeaderValue = req.headers.authorization;
    const token = jwt.verify(authHeaderValue.split(" ")[1], SECRET);
    if (token.id === req.params.id) {
      return next();
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

//the api
router.post( "/secure/:id", correctUserhelperMiddleware, async (req, res, next) => {
    try {
      res.status(200).json({ message: "you made it!" });
    } catch (err) {
      res.json(err);
    }
  }
);

module.exports = router;
