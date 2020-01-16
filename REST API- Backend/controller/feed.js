const fs = require('fs');
const path = require('path');
const {validationResult} = require('express-validator');

const Post = require('../models/post');
const User = require('../models/usr');

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  
  Post.find().countDocuments()
    .then(count => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then(posts => {
      res.status(200).json({
        message: 'Fetched Posts',
        posts: posts,
        totalItems: totalItems,
      });
    })
    .catch(err => {
      if(!err.statusCode){
        err.statusCode = 500;
      }
      next(err);
    });

};

exports.getSinglePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if(!post){
        const error = new Error('No Such Post');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Post Fetched Successfully', post: post });
    })
    .catch(err => {
      if(!err.statusCode){
        err.statusCode = 500;
      }
      next(err);
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    //has errors
    const error = new Error('Valdiation Failed, incorrect input');
    error.statusCode = 422;
    throw err;
  }

  if(!req.file) {
    const error = new Error('No Image Provided');
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path;
  let creator;
  //create post in db
  const post = new Post({
    title: title, 
    content: content, 
    imageUrl: imageUrl,
    creator: req.userId
  });
  post.save()
    .then(result => {
      //Add the post id in User Model
      return User.findById(req.userId);
    })
    .then(user => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Post Created Successfully",
        post: post,
        creator: { _id: creator._id, name: creator.name }
      });
    })
    .catch(err =>{
      if(!err.statusCode){
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;

  const errors = validationResult(req);
  if(!errors.isEmpty()){
    //has errors
    const error = new Error('Valdiation Failed, incorrect input');
    error.statusCode = 422;
    throw err;
  }

  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;//if image not changed
  if(req.file){
    //image changed
    imageUrl = req.file.path;
  }
  if(!imageUrl){
    const error = new Error('No File Attached');
    error.statusCode = 404;
    throw error;
  }

  Post.findById(postId)
    .then(post => {
      if(!post){
        const error = new Error('No Such Post');
        error.statusCode = 404;
        throw error;
      }
      if(post.imageUrl !== imageUrl){
        deleteImage(post.imageUrl);//delete old image
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then(result => {
      console.log("Post Updated Successfully");
      return res.status(200).json({message: 'Post Updated Successfully', post: result});
    })
    .catch(err => {
      if(!err.statusCode){
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if(!post){
        const error = new Error('No Such Post');
        error.statusCode = 404;
        throw error;
      }
      //Check Logged in user
      //delete image and post
      deleteImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then(result => {
      console.log(result);
      res.status(200).json({'message': 'Post deleted Successfully'});
    })
    .catch(err => {
      err.statusCode = 500;
      next(err);
    });
};

const deleteImage = (filepath) => {
  filepath = path.join(__dirname,'..', filepath);
  fs.unlink(filepath, err => console.log(err));
};