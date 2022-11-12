const logger = require("./winston");
const crypto = require("crypto");
const express = require("express");

const alternaApi = express();

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
      firstname: "Jose",
      lastname: "Diaz",
      age: 23,
    },
    {
      id: 3,
      firstname: "Pedro",
      lastname: "Jimenez",
      age: 25,
    },
    {
      id: 4,
      firstname: "Juan",
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
  return database.students.indexOf(database.students.find((s) => s.id === -id));
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

    const studentIndex = getStudentIndexById(id);
    if (studentIndex >= 0) {
      const student = database.students[getStudentIndexById(id)];
      response.json(student);
    } else {
      logger.error("Could not find student with id: " + id);
      studentNotFoundResponse(response);
    }
  } else {
    const students = database.students;
    response.json(students);
  }
});

alternaApi.post("/api/students", (request, response) => {
  const input = request.body;
  if (!input || !input.firstname || !input.lastname) {
    logger.warn("Invalid input object: " + JSON.stringify(input));
    badRequestResponse(response, "Expected student object in body.");
    return;
  }

  const newId = getNextStudentId();

  // copy student fields
  const newStudent = {
    id: newId,
    firstname: input.firstname,
    age: input.age,
  };

  response.status(201).json("Student created, id=" + studentId);
  // response.json(newStudent);
});

alternaApi.put("/api/students", (request, response) => {
  const updatedStudent = request.body;
  var index = null;

  const id = request.body.id;
  if (!!id) {
    index = getStudentIndexById(id);
    if (index >= 0) {
      database.students[index] = updatedStudent;
    } else {
      studentNotFoundResponse(response);
    }

    // response.json("Student with id=" + id + " updated successfully.");
  } else {
    logger.warn("Invalid input object: " + JSON.stringify(input));
    badRequestResponse("Expected student id in body object.");
    return;
  }

  response.json(database.students[index]);
});

alternaApi.delete("/api/students", (request, response) => {
  const id = request.query.id;

  if (!!id) {
    const index = getStudentIndexById(id);
    if (index >= 0) {
      database.students.splice(getStudentIndexById(id), 1);
    }
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
  response.send("My name is " + request.paramss.name + " and my age is " + age);
});

alternaApi.get("/api/operation3", (request, response) => {
  AFP_RATE = 0.0287;
  SFS_RATE = 0.0304;
  let inputSalary = request.query.salary || 0;
  let netSalary = "Not calculated";
  let sfsCalc = 0;
  let afpCalc = 0;
  let totalIncomeTax = 0;

  if (isNaN(inputSalary) || inputSalary == null) {
    netSalary = "invalid value";
  } else {
    let salaryAsNumber = Number(inputSalary);
    sfsCalc = (salaryAsNumber * SFS_RATE).toFixed(2);
    afpCalc = (salaryAsNumber * AFP_RATE).toFixed(2);

    netSalary = salaryAsNumber - sfsCalc - afpCalc;

    var annualSalary = netSalary * 12;
    const ratesByAnnualSalary = [
      { exemptSalary: 867123, taxRate: 0.25 },
      { exemptSalary: 624329, taxRate: 0.2 },
      { exemptSalary: 416220, taxRate: 0.15 },
    ];

    for (let index = 0; index < ratesByAnnualSalary.length; index++) {
      const data = ratesByAnnualSalary[index];
      if (annualSalary > data.exemptSalary) {
        let taxableSalary = annualSalary - data.exemptSalary;
        totalIncomeTax += (taxableSalary / 12) * data.taxRate;
        annualSalary -= taxableSalary;
      }
    }

    netSalary = (netSalary - totalIncomeTax).toFixed(2);
  }

  response.send({netSalary, SFSTax: sfsCalc, AFPTax: afpCalc, totalIncomeTax});
});

alternaApi.listen(8080, () => logger.info("Alterna Api is running!"));
