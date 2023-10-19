require("dotenv").config();
const { request, response } = require("express");
const express = require("express");
const app = express();
const Person = require("./models/person");

const morgan = require("morgan");

app.use(express.json());
app.use(express.static("dist"));

//custom token which has its own name, which can be used when initalizing morgan format
morgan.token(`post-data`, (req, res) => {
  //if request is POST
  if (req.method === `POST`) {
    //converts json data format to javascript object
    return JSON.stringify(req.body);
  } else {
    return ``;
  }
});

app.use(
  morgan(
    //tokens to use; :<TOKEN> is replaced by token return value
    `:method :url :status :res[content-length] - :response-time ms :post-data`
  )
);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/info", (request, response) => {
  const amountOfPersons = persons.length;
  const requestTime = new Date().toString();

  response.send(
    `<p>Phonebook has info for ${amountOfPersons} people</p>
    <p>${requestTime}</p>`
  );
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);

  const person = persons.find((person) => {
    return person.id === id;
  });

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  Person.findByIdAndRemove(request.params.id).then((result) => {
    response.status(204).end();
  });
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (body.name === undefined) {
    return response.status(400).json({ error: "name missing" });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});
