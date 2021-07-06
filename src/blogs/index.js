import express from 'express'; // needed for mongoose refactor
import createError from 'http-errors'; // needed for mongoose refactor
import BlogsModel from './schema.js'; // needed for mongoose refactor

import fs from 'fs';

import uniqid from 'uniqid';

import path, { dirname } from 'path';

import { fileURLToPath } from 'url';
import { parseFile } from '../utils/upload/index.js';

import {
  checkBlogPostSchema,
  checkCommentSchema,
  checkSearchSchema,
  checkValidationResult,
} from './validation.js';
import { generateBlogPDF } from '../utils/pdf/index.js';
import { sendEmail } from '../utils/email/index.js';

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const blogsFilePath = path.join(__dirname, 'blogs.json');

const router = express.Router(); // needed for mongoose refactor

//email

router.post('/email', async (req, res, next) => {
  try {
    await sendEmail('arturszm@aol.com');

    res.send('Email sent!');
  } catch (error) {
    console.log(error);
    next(error);
  }
});
// get all blogs
router.get('/', async (req, res, next) => {
  try {
    const blogs = await BlogsModel.find();
    res.send(blogs);
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

// test it
router.get('/:userId', async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const blogs = await BlogsModel.findById(userId);

    if (blogs) {
      res.send(blogs);
    } else {
      next(createError(404, `User with _id ${userId} not found!`));
    }
  } catch (error) {
    next(createError(500, 'An error occurred while getting user '));
  }
});

// router.get(
//   '/search',
//   checkSearchSchema,
//   checkValidationResult,
//   async (req, res, next) => {
//     try {
//       const { title } = req.query;
//       const fileAsBuffer = fs.readFileSync(blogsFilePath);
//       const fileAsString = fileAsBuffer.toString();
//       const array = JSON.parse(fileAsString);
//       const filtered = array.filter((blog) =>
//         blog.title.toLowerCase().includes(title.toLowerCase())
//       );
//       res.send(filtered);
//     } catch (error) {
//       res.send(500).send({ message: error.message });
//     }
//   }
// );

// create  blog
router.post('/', async (req, res, next) => {
  try {
    const newBlog = new BlogsModel(req.body);
    const { _id } = await newBlog.save();

    res.status(201).send({ _id });
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(createError(400, error));
    } else {
      console.log(error);
      next(createError(500, 'An error occurred while creating new user'));
    }
  }
});

// get single blogs
router.get('/:id/pdf', async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(blogsFilePath);

    const fileAsString = fileAsBuffer.toString();

    const fileAsJSONArray = JSON.parse(fileAsString);

    // HOW TO CONVERT THAT TO MONGOOSE?
    const blog = fileAsJSONArray.find((blog) => blog.id === req.params.id);
    if (!blog) {
      res
        .status(404)
        .send({ message: `blog with ${req.params.id} is not found!` });
    }
    const pdfStream = await generateBlogPDF(blog);
    res.setHeader('Content-Type', 'application/pdf');
    pdfStream.pipe(res);
    pdfStream.end();
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});
//WORKING ON MONGOOSE
// router.get('/:id', async (req, res, next) => {
//   try {
//     const fileAsBuffer = fs.readFileSync(blogsFilePath);

//     const fileAsString = fileAsBuffer.toString();

//     const fileAsJSONArray = JSON.parse(fileAsString);

//     const blog = fileAsJSONArray.find((blog) => blog.id === req.params.id);
//     if (!blog) {
//       res
//         .status(404)
//         .send({ message: `blog with ${req.params.id} is not found!` });
//     }
//     res.send(blog);
//   } catch (error) {
//     res.send(500).send({ message: error.message });
//   }
// });

router.get('/:id/comments', async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(blogsFilePath);

    const fileAsString = fileAsBuffer.toString();

    const fileAsJSONArray = JSON.parse(fileAsString);

    const blog = fileAsJSONArray.find((blog) => blog.id === req.params.id);
    if (!blog) {
      res
        .status(404)
        .send({ message: `blog with ${req.params.id} is not found!` });
    }

    blog.comments = blog.comments || [];
    res.send(blog.comments);
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

// delete  blog

// router.delete('/:id', async (req, res, next) => {
//   try {
//     const fileAsBuffer = fs.readFileSync(blogsFilePath);

//     const fileAsString = fileAsBuffer.toString();

//     let fileAsJSONArray = JSON.parse(fileAsString);

//     const blog = fileAsJSONArray.find((blog) => blog.id === req.params.id);
//     if (!blog) {
//       res
//         .status(404)
//         .send({ message: `blog with ${req.params.id} is not found!` });
//     }
//     fileAsJSONArray = fileAsJSONArray.filter(
//       (blog) => blog.id !== req.params.id
//     );
//     fs.writeFileSync(blogsFilePath, JSON.stringify(fileAsJSONArray));
//     res.status(204).send();
//   } catch (error) {
//     res.send(500).send({ message: error.message });
//   }
// });

//DELETE MONGOOSE VERSION

router.delete('/:userId', async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const deletedBlog = await BlogsModel.findByIdAndDelete(userId);

    if (deletedBlog) {
      res.status(200).send('blog deleted!');
    } else {
      next(createError(404, `User with _id ${userId} not found!`));
    }
  } catch (error) {
    next(
      createError(
        500,
        `An error occurred while deleting user ${req.params.userId}`
      )
    );
  }
});

//  update blog
// router.put('/:id', async (req, res, next) => {
//   try {
//     const fileAsBuffer = fs.readFileSync(blogsFilePath);

//     const fileAsString = fileAsBuffer.toString();

//     let fileAsJSONArray = JSON.parse(fileAsString);

//     const blogIndex = fileAsJSONArray.findIndex(
//       (blog) => blog.id === req.params.id
//     );
//     if (!blogIndex == -1) {
//       res
//         .status(404)
//         .send({ message: `blog with ${req.params.id} is not found!` });
//     }
//     const previousblogData = fileAsJSONArray[blogIndex];
//     const changedblog = {
//       ...previousblogData,
//       ...req.body,
//       updatedAt: new Date(),
//       id: req.params.id,
//     };
//     fileAsJSONArray[blogIndex] = changedblog;

//     fs.writeFileSync(blogsFilePath, JSON.stringify(fileAsJSONArray));
//     res.send(changedblog);
//   } catch (error) {
//     res.send(500).send({ message: error.message });
//   }
// });

//MONGOOSE VERSION

router.put('/:userId', async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const updatedBlog = await BlogsModel.findByIdAndUpdate(userId, req.body, {
      new: true,
      runValidators: true,
    });

    if (updatedBlog) {
      res.send(updatedBlog);
    } else {
      next(createError(404, `User with _id ${userId} not found!`));
    }
  } catch (error) {
    next(
      createError(
        500,
        `An error occurred while updating user ${req.params.userId}`
      )
    );
  }
});

router.put(
  '/:id/comment',
  checkCommentSchema,

  checkValidationResult,
  async (req, res, next) => {
    try {
      const { text, userName } = req.body;
      const comment = {
        id: uniqid(),
        text,
        userName,
        createdAt: new Date(),
      };
      const fileAsBuffer = fs.readFileSync(blogsFilePath);

      const fileAsString = fileAsBuffer.toString();

      let fileAsJSONArray = JSON.parse(fileAsString);

      const blogIndex = fileAsJSONArray.findIndex(
        (blog) => blog.id === req.params.id
      );
      if (!blogIndex == -1) {
        res
          .status(404)
          .send({ message: `blog with ${req.params.id} is not found!` });
      }
      const previousblogData = fileAsJSONArray[blogIndex];
      previousblogData.comments = previousblogData.comments || [];
      const changedblog = {
        ...previousblogData,
        ...req.body,
        comments: [...previousblogData.comments, comment],
        updatedAt: new Date(),
        id: req.params.id,
      };
      fileAsJSONArray[blogIndex] = changedblog;

      fs.writeFileSync(blogsFilePath, JSON.stringify(fileAsJSONArray));
      res.send(changedblog);
    } catch (error) {
      console.log(error);
      res.send(500).send({ message: error.message });
    }
  }
);

router.put('/:id/cover', parseFile.single('cover'), async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(blogsFilePath);

    const fileAsString = fileAsBuffer.toString();

    let fileAsJSONArray = JSON.parse(fileAsString);

    const blogIndex = fileAsJSONArray.findIndex(
      (blog) => blog.id === req.params.id
    );
    if (!blogIndex == -1) {
      res
        .status(404)
        .send({ message: `blog with ${req.params.id} is not found!` });
    }
    const previousblogData = fileAsJSONArray[blogIndex];
    const changedblog = {
      ...previousblogData,
      cover: req.file.path,
      updatedAt: new Date(),
      id: req.params.id,
    };
    fileAsJSONArray[blogIndex] = changedblog;

    fs.writeFileSync(blogsFilePath, JSON.stringify(fileAsJSONArray));
    res.send(changedblog);
  } catch (error) {
    console.log(error);
    res.send(500).send({ message: error.message });
  }
});

export default router;
