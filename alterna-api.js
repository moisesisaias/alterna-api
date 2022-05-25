const logger = require('./winston');
const express = require('express');

const alternaApi = express();

alternaApi.use(express.json());

database = {
	"students": [
		{
			"id":1,
			"firstname": "Octavio",
			"lastname" : "Kidd",
			"age": 34
		},
		{
			"id":2,
			"firstname": "Adhonys",
			"lastname" : "Diaz",
			"age": 23
		},
		{
			"id":3,
			"firstname": "Ean",
			"lastname" : "Jimenez12345",
			"age": 25
		},
		{
			"id":4,
			"firstname": "Adhonys",
			"lastname" : "Hernandez",
			"age": 23
		},
	]
};

function getStudentIndexById(id) {
	id = +id;
	return database.students.indexOf(
		database.students.find(
			(s) => s.id === id
	));
}

function studentNotFoundResponse(response) {
	response.status(404).send({
		status: 404,
		message: 'Student not found.'
	});
}

function badRequestResponse(response, message) {
	response.status(400).send({
		status: 400,
		message: message,
	});
}

function getNextStudentId() {
	return database.students.reduce((previousValue, currentValue) =>
		previousValue > currentValue.id ? previousValue : currentValue.id,
	0) + 1;
}

alternaApi.get('/api/students', (request, response) => {
	const id = request.query.id;
	
	if (!!id) {
		logger.debug(id);
		const studentIndex = getStudentIndexById(id);
		if (studentIndex >= 0) {
			response.json(database.students[studentIndex]);
		} else {
			logger.error('Could not find student with id: ' + id);
			studentNotFoundResponse(response);
		}
	} else {
		response.json(database.students);
	}
});

alternaApi.post('/api/students', (request, response) => {
	const input = request.body;
	if (!input || !input.firstname || !input.lastname) {
		logger.warn('Invalid input object: ' + JSON.stringify(input));
		badRequestResponse(response, 'Expected student object in body.');
		return;
	}

	const newId = getNextStudentId();

	// copy student fields
	const newStudent = {
		id: newId,
		firstname: input.firstname,
		lastname: input.lastname,
		age: input.age
	};

	database.students.push(newStudent);

	response.json(newStudent);
});

alternaApi.put('/api/students', (request, response) => {
	const updatedStudent = request.body;
	var index = null;

	const id = request.body.id;
	if (!!id) {
		index = getStudentIndexById(id);
		if (index >= 0) {
			database.students[index] = updatedStudent;
		} else {
			studentNotFoundResponse(response);
			return;
		}
	} else {
		logger.warn('Invalid input object: ' + JSON.stringify(input));
		badRequestResponse('Expected student id in body object.');
		return;
	}

	response.json(database.students[index]);
});

alternaApi.delete('/api/students', (request, response) => {
	const id = request.query.id;

	if (!!id) {
		const index = getStudentIndexById(id);
		if (index >= 0) {
			database.students.splice(index, 1);
		}
	} else {
		logger.warn('Could not find user id ' + id + ' to delete');
	}

	response.status(204).send();
});



alternaApi.get('/api/books', (request, response) => {
	response.status(501).send();
});



alternaApi.get('/api', (request, response) => {
	response.send('This is the Alterna API');
});

alternaApi.get('/api/operation1', (request, response) => {
	response.send('This is the result of operation1');
});

alternaApi.get('/api/operation2/:name', (request, response) => {
	var age = request.query.age || 50;
	response.send('My name is ' + request.params.name + ' and my age is ' + age);
});


alternaApi.listen(8080, () => console.log('Alterna Api is running!'));