const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()
const Note = require('./models/note')
app.use(bodyParser.json())
app.use(express.static('build'))
app.use(cors())




morgan.token('js', function (req) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :js'))

const PORT = process.env.PORT //|| 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

app.delete('/api/persons/:id', (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name && !body.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const note = new Note({
    name: body.name,
    number: body.number,
    date: new Date(),
  })

  note
    .save()
    .then(savedNote => {
      response.json(savedNote)
    })
    .catch(error => {
      return response.status(409).json({ error })})
})

app.get('/info', (req, res) => {
  Note.find({}).then(count => res.send(`<h1>There are ${count.length} numbers in phonebook</h1>
  <div>Date is: ${new Date()}</div>`)).catch(count => console.log(count))
})

app.get('/api/persons', (req, res,next) => {
  Note.find({}).then(notes => {
    res.json(notes)
  })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response,next) => {
  console.log(request.params.id)
  Note.findById(request.params.id).then(note => {
    if (note)
      response.json(note)
    else {
      response.status(404).end()
    }
  }).catch(error => next(error))
})



app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const note = {
    name: body.name,
    number: body.number,
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updatedNote => {
      //response.json(updatedNote.toJSON())
      response.json(updatedNote)
    })
    //.catch(error => console.log('paska'))
    .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.log(error.message)
  if (error.name === 'CastError' && error.kind === 'ObjectID') {
    return res.status(404).send({ error: 'Malformatted ID' })
  }

  next(error)
}

app.use(errorHandler)