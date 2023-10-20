require("dotenv").config();
const { request, response } = require("express");
const express = require("express");
const app = express();
const Person = require("./models/person");

const morgan = require("morgan");

app.use(express.static("dist"));
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

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

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
  const requestTime = new Date().toString();

  Person.countDocuments({}).then((count) => {
    response.send(
      `<p>Phonebook has info for ${count} people</p>
       <p>${requestTime}</p>`
    );
  });

  // const amountOfPersons = Person.countDocuments({});
  // const requestTime = new Date().toString();

  // response.send(
  //   `<p>Phonebook has info for ${amountOfPersons} people</p>
  //   <p>${requestTime}</p>`
  // );
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { runValidators: true, context: "query" }
  )
    .then((updatePerson) => {
      response.json(updatePerson);
    })
    .catch((error) => next(error));
});

app.use(errorHandler);
