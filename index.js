const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
app.use(express.static('build'))
app.use(cors())
app.use(express.json()) 

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

morgan.token('js', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :js'))

let persons = [
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id":1
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id":2
    },
    {
      "name": "A",
      "number": "123",
      "id":3
    }
  ]

  app.post('/api/persons', (request, response) => {
    const body = request.body
  
    if (!body.name && !body.number) {
      return response.status(400).json({ 
        error: 'content missing' 
      })
    }

    else if (persons.find(f => body.name === f.name)) {
        return  response.status(409).json({
            error:'duplicate name'
        })
    }
  
    const note = {
      name: body.name,
      number: body.number,
      id: Math.floor(Math.random(0,1) * 100000000)
    }
    persons = persons.concat(note)
    response.json(note)
  })

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res) => {
    res.send(`<h1>There are ${persons.length} numbers in phonebook</h1>
    <div>Date is: ${new Date()}</div>`)
  })

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = persons.find(note => note.id === id)
    if (note) {
    //response.json(note)
    response.send(`<div>Name: ${note.name}<br /> Number: ${note.number} <br /> ID: ${note.id}</div>`)
    } else {
        response.status(404).end()
    }
  })

  app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = persons.filter(note => note.id !== id)
    response.status(204).end()
  })

