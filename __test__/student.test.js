process.env.NODE_ENV = 'test';
const db = require('../db');
const app = require("../app");
const request = require('supertest');

// describe('GET /', ()=> {
//   test('should return the array of students', async () => {
//     const response = await request(app).get('/');
//     expect(response.body).toEqual(["Me", "You", "We", "Us"]);
//     expect(response.statusCode).toBe(200);
//   })
// })

beforeAll( async () => {
  await db.query("CREATE TABLE students (id SERIAL PRIMARY KEY , name TEXT)");
});

beforeEach( async () => {
  await db.query("INSERT INTO students (name) VALUES ('Eebru'), ('Alao')");
});

afterEach( async () => {
  await db.query('DELETE FROM students');
});

afterAll( async () => {
  await db.query('DROP TABLE students');
  db.end();
});


describe('GET /students', ()=> {
  test('it should return the array of students', async () => {
    const response = await request(app).get('/students');
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('name');
    expect(response.statusCode).toBe(200);
  });
});


describe("POST /students", () => {
  test("it should return the array of students", async () => {
    //add a recorf to the db
    const response = await request(app).post("/students").send({name: 'New Student'});
    
    //chech if it was added
    expect(response.body.name).toBe("New Student");
    expect(response.body).toHaveProperty("id");
    expect(response.statusCode).toBe(200);

    //get the total students
    const res = await request(app).get("/students");
    expect(res.body.length).toBe(3);
  });
});

describe("PATCH /students/:id", () => {
  test("It should edit data", async () => {
    // make a request
    const req = await request(app).get("/students");

    // patch a record from the request made
    const res = await request(app).patch(`/students/${req.body[0].id}`).send({name: 'Ibrahim'});
    
    //check if the record's name has been changed
    expect(res.body.name).toBe('Ibrahim');
    expect(res.statusCode).toBe(200);
  });
});


describe("DELETE /students/:id", () => {
  test("It should delete a record", async () => {
    //make a request
    const req = await request(app).get("/students");

    //delete from the request
    const res = await request(app)
      .delete(`/students/${req.body[0].id}`)

      // make a request again
    const requ = await request(app).get("/students");

    // check if the request was deleted to remain 1 in the database
    expect(requ.body.length).toEqual(1);
    expect(res.statusCode).toBe(200);
  })
})
