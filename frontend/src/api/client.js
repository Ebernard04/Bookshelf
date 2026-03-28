import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
});

export const books = {
  getAll: (params) => client.get('/books', { params }),
  getOne: (id) => client.get(`/books/${id}`),
  create: (data) => client.post('/books', data),
  update: (id, data) => client.put(`/books/${id}`, data),
  delete: (id) => client.delete(`/books/${id}`),
};

export const authors = {
  getAll: () => client.get('/authors'),
  getOne: (id) => client.get(`/authors/${id}`),
  create: (data) => client.post('/authors', data),
  update: (id, data) => client.put(`/authors/${id}`, data),
  delete: (id) => client.delete(`/authors/${id}`),
};

export const series = {
  getAll: () => client.get('/series'),
  getOne: (id) => client.get(`/series/${id}`),
  create: (data) => client.post('/series', data),
  update: (id, data) => client.put(`/series/${id}`, data),
  delete: (id) => client.delete(`/series/${id}`),
};

export const universes = {
  getAll: () => client.get('/universes'),
  getOne: (id) => client.get(`/universes/${id}`),
  create: (data) => client.post('/universes', data),
  update: (id, data) => client.put(`/universes/${id}`, data),
  delete: (id) => client.delete(`/universes/${id}`),
};

export const readingLog = {
  getAll: () => client.get('/reading-log'),
  create: (data) => client.post('/reading-log', data),
  delete: (id) => client.delete(`/reading-log/${id}`),
};