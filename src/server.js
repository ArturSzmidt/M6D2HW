import express from 'express';

import cors from 'cors';

import listEndpoints from 'express-list-endpoints';

import authorsRouter from './authors/index.js';

import blogsRouter from './blogs/index.js';

import {
  badRequestErrorHandler,
  notFoundErrorHandler,
  catchAllErrorHandler,
} from './errorHandlers.js';

import path, { dirname } from 'path';

import { fileURLToPath } from 'url';

import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const publicDirectory = path.join(__dirname, '../public');

//   REFACTORING TO MONGOOSE

const server = express();

const PORT = process.env.PORT || 3001;

const whiteList = [`${process.env.PORT}`]; // test if it's correct
const corsOptions = {
  origin: (origin, callback) => {
    if (whiteList.some((allowedUrl) => allowedUrl === origin)) {
      callback(null, true);
    } else {
      const error = new Error('Not allowed by cors!');
      error.status = 403;
      callback(error);
    }
  },
};

server.use(cors());

server.use(express.json());

server.use(express.static(publicDirectory));

server.use('/authors', authorsRouter);

server.use('/blogs', blogsRouter);

// ****************** ERROR HANDLERS ***********************

server.use(badRequestErrorHandler);
server.use(notFoundErrorHandler);
server.use(catchAllErrorHandler);

console.table(listEndpoints(server));

mongoose
  .connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() =>
    server.listen(PORT, () => {
      console.log('Server running on port ', `${PORT}`);
    })
  )
  .catch((err) => console.log(err));
