require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI || 'YOUR_MONGODB_ATLAS_URI';
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB Atlas
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Schemas and Models
const WalkerSchema = new mongoose.Schema({ name: String });
const DogSchema = new mongoose.Schema({ name: String });
const AssignmentSchema = new mongoose.Schema({
  walker: { type: mongoose.Schema.Types.ObjectId, ref: 'Walker' },
  dog: { type: mongoose.Schema.Types.ObjectId, ref: 'Dog' }
});

const Walker = mongoose.model('Walker', WalkerSchema);
const Dog = mongoose.model('Dog', DogSchema);
const Assignment = mongoose.model('Assignment', AssignmentSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Home page
app.get('/', (req, res) => {
  res.send(`
    <h1>Pet Walker App</h1>
    <ul>
      <li><a href="/walkers">View/Add Dog Walkers</a></li>
      <li><a href="/dogs">View/Add Dogs</a></li>
      <li><a href="/assign">Assign Dog Walker to Dog</a></li>
      <li><a href="/assignments">View Assignments</a></li>
    </ul>
  `);
});

// View/Add Walkers
app.get('/walkers', async (req, res) => {
  const walkers = await Walker.find();
  res.send(`
    <h2>Dog Walkers</h2>
    <ul>
      ${walkers.map(w => `<li>${w.name}</li>`).join('')}
    </ul>
    <form method="POST" action="/walkers">
      <input name="name" placeholder="Walker Name" required>
      <button type="submit">Add Walker</button>
    </form>
    <a href="/">Back</a>
  `);
});

app.post('/walkers', async (req, res) => {
  await Walker.create({ name: req.body.name });
  res.redirect('/walkers');
});

// View/Add Dogs
app.get('/dogs', async (req, res) => {
  const dogs = await Dog.find();
  res.send(`
    <h2>Dogs</h2>
    <ul>
      ${dogs.map(d => `<li>${d.name}</li>`).join('')}
    </ul>
    <form method="POST" action="/dogs">
      <input name="name" placeholder="Dog Name" required>
      <button type="submit">Add Dog</button>
    </form>
    <a href="/">Back</a>
  `);
});

app.post('/dogs', async (req, res) => {
  await Dog.create({ name: req.body.name });
  res.redirect('/dogs');
});

// Assign Walker to Dog
app.get('/assign', async (req, res) => {
  const walkers = await Walker.find();
  const dogs = await Dog.find();
  res.send(`
    <h2>Assign Dog Walker to Dog</h2>
    <form method="POST" action="/assign">
      <label>Walker:
        <select name="walkerId" required>
          ${walkers.map(w => `<option value="${w._id}">${w.name}</option>`).join('')}
        </select>
      </label>
      <label>Dog:
        <select name="dogId" required>
          ${dogs.map(d => `<option value="${d._id}">${d.name}</option>`).join('')}
        </select>
      </label>
      <button type="submit">Assign</button>
    </form>
    <a href="/">Back</a>
  `);
});

app.post('/assign', async (req, res) => {
  await Assignment.create({ walker: req.body.walkerId, dog: req.body.dogId });
  res.redirect('/assignments');
});

// View Assignments
app.get('/assignments', async (req, res) => {
  const assignments = await Assignment.find().populate('walker').populate('dog');
  res.send(`
    <h2>Assignments</h2>
    <ul>
      ${assignments.map(a => `<li>${a.walker?.name || 'Unknown'} walks ${a.dog?.name || 'Unknown'}</li>`).join('')}
    </ul>
    <a href="/">Back</a>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
