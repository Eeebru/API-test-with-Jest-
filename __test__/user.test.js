process.env.NODE_ENV = "test";
const db = require("../db");
const app = require("../app");
const request = require("supertest");
const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');

let auth = {};

beforeAll(async () => {
  await db.query("CREATE TABLE users (id SERIAL PRIMARY KEY , username TEXT, password TEXT)");
});

beforeEach(async () => {
  const hashedpasskey = await bcrypt.hash('password', 2);
  await db.query("INSERT INTO users (username, password) VALUES ($1, $2)", ['test', hashedpasskey]);
  
  const response = await request(app)
  .post('/users/auth')
  .send({ username: 'test', password: 'password'});
  auth.token = response.body.token;
  
  auth.current_user_id = jsonwebtoken.decode(auth.token).userId;
  console.log(auth);
});

afterEach(async () => {
  await db.query("DELETE FROM users");
});

afterAll(async () => {
  await db.query("DROP TABLE users");
  db.end();
});


describe('1 GET /users', ()=> {
  test('Returns a list of users', async ()=> {
    const res = await request(app)
      .get('/users')
      .set('authorization', auth.token);
    expect(res.body.length).toBe(2);
    expect(res.statusCode).toBe(200);
  })
})

describe("2 GET /users without auth", () => {
  test("Requires Login", async () => {
    const res = await request(app)
      .post(`/users/login/${auth.current_user_id}`)
    expect(res.body.message).toBe("Unauthorized");
    expect(res.statusCode).toBe(200);
  });
});


describe("3 GET /secure/:id", () => {
  test("only correct users", async () => {
    const res = await request(app)
      .post(`/users/secure/${100}`)
      .set('authorization', auth.token);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });
});

describe("4 GET /secure/:id", () => {
  test("only correct users", async () => {
    const res = await request(app)
      .post(`/users/secure/${auth.current_user_id}`)
      .set("authorization", auth.token);
      console.log(res);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("You made it");
  });
});