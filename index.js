// index.js
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store (replace with DB later)
let todos = [];
let nextId = 1;

// API routes
app.get('/api/todos', (req, res) => {
  // Get query params: /api/todos?page=2&limit=5
  const page = parseInt(req.query.page) || 1;   // default page = 1
  const limit = parseInt(req.query.limit) || 5; // default 5 per page

  const start = (page - 1) * limit;
  const end = start + limit;

  const pagedTodos = todos.slice(start, end);

  res.json({
    page,
    limit,
    total: todos.length,
    totalPages: Math.ceil(todos.length / limit),
    data: pagedTodos
  });
});


app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
  const todo = { id: nextId++, title: title.trim(), done: false, createdAt: new Date() };
  todos.push(todo);
  res.status(201).json(todo);
});

app.put('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  const todo = todos.find(t => t.id === id);
  if (!todo) return res.status(404).json({ error: 'Not found' });

  const { title, done } = req.body;
  if (title !== undefined) todo.title = String(title).trim();
  if (done !== undefined) todo.done = !!done;
  res.json(todo);
});

app.delete('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = todos.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = todos.splice(idx, 1)[0];
  res.json(removed);
});

// Fallback for SPA (optional)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Simple auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  // Expected: Authorization: Bearer mysecrettoken
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.split(' ')[1]; // take part after "Bearer"

  if (token === process.env.API_TOKEN) {
    next(); // allow request
  } else {
    return res.status(403).json({ error: 'Invalid token' });
  }
}


