const logger = require("./winston");
const crypto = require("crypto");
const express = require("express");
const pg = require("pg");

const alternaApi = express();

const Pool = pg.Pool;
const pool = new Pool({
  user: "alterna_user",
  password: "67890",
  host: "localhost",
  port: 5432,
  database: "alterna",
});

alternaApi.use(express.json());

database = {
  students: [
    {
      id: 1,
      firstname: "Octavio",
      lastname: "Kidd",
      age: 34,
    },
    {
      id: 2,
      firstname: "Adhonys",
      lastname: "Diaz",
      age: 23,
    },
    {
      id: 3,
      firstname: "Ean",
      lastname: "Jimenez12345",
      age: 25,
    },
    {
      id: 4,
      firstname: "Adhonys",
      lastname: "Hernandez",
      age: 23,
    },
  ],
  users: [
    {
      id: 1,
      username: "api-user",
      password: "12345",
      salt: "abcd",
    },
  ],
};

function getStudentIndexById(id) {
  id = +id;
  return database.students.indexOf(database.students.find((s) => s.id === id));
}

function studentNotFoundResponse(response) {
  response.status(404).send({
    status: 404,
    message: "Student not found.",
  });
}

function badRequestResponse(response, message) {
  response.status(400).send({
    status: 400,
    message: message,
  });
}

function getNextStudentId() {
  return (
    database.students.reduce(
      (previousValue, currentValue) =>
        previousValue > currentValue.id ? previousValue : currentValue.id,
      0
    ) + 1
  );
}

alternaApi.post("/api/register", (request, response) => {
  // TODO: validate that username and password exist
  // TODO: validate that username is unique

  const username = request.body.username;
  const password = request.body.password;

  const sha256 = crypto.createHash("sha256");
  const salt = "abcd"; // randomly generated salt
  const random = crypto.randomBytes(10).toString("hex");

  const saltedPassword = password + random;

  const hash = sha256.update(saltedPassword).digest("base64");
  const obj = { pass: hash, salt: random };

  response.json(obj);
});

alternaApi.post("/api/login", (request, response) => {
  const username = request.body.username;
  const password = request.body.password;

  if (!!username && !!password) {
    const user = database.users.find(
      (u) => u.username === username && u.password === password
    );
    if (!!user) {
      response.json("Login successful.");
      return;
    }
  }

  response.json("Invalid credentials.");
});

alternaApi.get("/api/students", (request, response) => {
  const id = request.query.id;

  if (!!id) {
    logger.debug(id);

    // var student;
    // id = '2 or id is not null'
    pool.query(
      "select * from students where id = $1",
      [id],
      (error, results) => {
        if (error) {
          logger.error("some sql error");
          throw error;
        }

        if (!results.rows || !results.rows[0]) {
          logger.error("Could not find student with id: " + id);
          studentNotFoundResponse(response);
          return;
        } else {
          response.json(results.rows);
        }
        // student = !!results.rows && !!results.rows[0] ? results.rows[0] : {};
        // response.json(!!results.rows && !!results.rows[0] ? results.rows[0] : {});
      }
    );
    // response.json(student);

    // const studentIndex = getStudentIndexById(id);
    // if (studentIndex >= 0) {
    // const student = database.students[getStudentIndexById(id)];
    // response.json(student);
    // } else {
    //   logger.error("Could not find student with id: " + id);
    //   studentNotFoundResponse(response);
    // }
  } else {
    // const students = database.students;
    pool.query("select * from students order by id asc", (error, results) => {
      if (error) {
        throw error;
      }
      response.json(results.rows);
    });
  }
});

alternaApi.post("/api/students", (request, response) => {
  const input = request.body;
  if (!input || !input.firstname || !input.lastname) {
    logger.warn("Invalid input object: " + JSON.stringify(input));
    badRequestResponse(response, "Expected student object in body.");
    return;
  }

  // const newId = getNextStudentId();

  // copy student fields
  // const newStudent = {
  //   id: newId,
  //   firstname: input.firstname,
  //   lastname: input.lastname,
  //   age: input.age,
  // };

  // database.students.push(newStudent);

  var newStudent = new Student(firstname, lastname, age);
  newStudent.save();

  pool.query(
    "insert into students (firstname, lastname, age) values ($1, $2, $3)",
    [input.firstname, input.lastname, input.age],
    (error, results) => {
      if (error) {
        throw error;
      }
      const studentId = results.insertId;
      response.status(201).json("Student created, id=" + studentId);
    }
  );

  // response.json(newStudent);
});

alternaApi.put("/api/students", (request, response) => {
  const updatedStudent = request.body;
  var index = null;

  const id = request.body.id;
  if (!!id) {
    // index = getStudentIndexById(id);
    // if (index >= 0) {
    //   database.students[index] = updatedStudent;
    // } else {
    //   studentNotFoundResponse(response);
    //   return;
    // }

    pool.query(
      "update students set firstname = $1, lastname = $2, age = $3 where id = $4",
      [
        updatedStudent.firstname,
        updatedStudent.lastname,
        updatedStudent.age,
        updatedStudent.id,
      ],
      (error, results) => {
        if (error) {
          throw error;
        }
        response.json("Student with id=" + id + " updated successfully.");
      }
    );
  } else {
    logger.warn("Invalid input object: " + JSON.stringify(input));
    badRequestResponse("Expected student id in body object.");
    return;
  }

  // response.json(database.students[index]);
});

alternaApi.delete("/api/students", (request, response) => {
  const id = request.query.id;

  if (!!id) {
    // const index = getStudentIndexById(id);
    // if (index >= 0) {
    //   database.students.splice(getStudentIndexById(id), 1);
    // }
    pool.query("delete from students where id = $1", [id], (error, results) => {
      if (error) {
        throw error;
      }
    });
  } else {
    logger.warn("Could not find user id " + id + " to delete");
  }

  response.status(204).send();
});

alternaApi.get("/api/books", (request, response) => {
  response.status(501).send();
});

alternaApi.get("/api", (request, response) => {
  response.send("This is the Alterna API");
});

alternaApi.get("/api/operation1", (request, response) => {
  response.send("This is the result of operation1");
});

alternaApi.get("/api/operation2/:name", (request, response) => {
  var age = request.query.age || 50;
  response.send("My name is " + request.params.name + " and my age is " + age);
});

alternaApi.listen(8080, () => logger.info("Alterna Api is running!"));
