const { request, response } = require("express");
const express = require("express");
const app = express();

const morgan = require("morgan");

app.use(express.json());

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

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
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
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const generateID = () => {
  min = Math.ceil(5);
  max = Math.floor(2 ^ 10);

  return Math.floor(Math.random() * (max - min) + min);
};

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: "name missing",
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: "number missing",
    });
  }

  const personExists = persons.find((person) => {
    return person.name === body.name;
  });

  if (personExists) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    id: generateID(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);

  response.json(person);
});
