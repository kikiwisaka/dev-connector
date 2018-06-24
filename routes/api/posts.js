const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const validatePostInput = require('../../validation/post');
const validateCommentInput = require('../../validation/comment');

// @route   GET api/posts
// @desc    Get all posts
// @access  Public
router.get('/', (req, res) => {
  const erros = {};
  Post.find()
    .populate('user', ['name', 'avatar'])
    .sort({
      date: -1
    })
    .then(posts => {
      if (!posts) {
        errors.nopost = 'There are no posts';
        res.status(404).json(errors);
      }
      res.json(posts);
    })
    .catch(err => res.status(404).json({
      posts: 'There are no posts'
    }));
});

// @route   GET api/posts
// @desc    Get post by ID
// @access  Public
router.get('/:id', (req, res) => {
  const erros = {};
  Post.findOne({
    _id: req.params.id
  })
    .populate('user', ['name', 'avatar'])
    .then(post => {
      if (!post) {
        errors.nopost = 'There is no post with that ID';
        res.status(404).json(errors);
      }
      res.json(post);
    })
    .catch(err => res.status(404).json({
      nopost: 'There is no post with that ID'
    }));
});

// @route   POST api/posts
// @desc    Posts route
// @access  Private
router.post('/', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  const {
    errors,
    isValid
  } = validatePostInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  const newPost = new Post({
    user: req.user.id,
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar
  });
  newPost.save().then(post => res.json(post));
});

// @route   DELETE api/posts/:id
// @desc    Remote delete
// @access  Private
router.delete('/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Profile.findOne({
    user: req.user.id
  })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (post.user.toString() !== req.user.id) {
            return res.status(401).json({
              noauthorized: 'User not authorized'
            });
          }
          post.remove().then(() => {
            res.json({
              success: true
            });
          })
        })
        .catch(err => res.status(404).json({
          postnotfound: 'There is no post'
        }));
    })
    .catch(err => res.status(404).json({
      profilenotfound: 'There is no profile'
    }));
});

// @route   POST api/like/:id
// @desc    Add like to post
// @access  Private
router.post('/like/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Profile.findOne({
    user: req.user.id
  })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({
              alreadyliked: 'User already liked this post'
            });
          }
          post.likes.unshift({
            user: req.user.id
          });
          post.save().then(post => res.json(post));
        });
    })
    .catch(err => res.status(404).json({
      profilenotfound: 'No post found'
    }));
});

// @route   POST api/unlike/:id
// @desc    Unlike to post
// @access  Private
router.post('/unlike/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Profile.findOne({
    user: req.user.id
  })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({
              notliked: 'You have not yet liked this post'
            });
          }
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          post.likes.splice(removeIndex, 1);
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({
          postnotfound: 'No post found'
        }));
    });
});

// @route   POST api/comment/:id //id: post_id
// @desc    Add comment to post
// @access  Private
router.post('/comment/:id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  const {
    errors,
    isValid
  } = validateCommentInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  Post.findById(req.params.id)
    .then(post => {
      const newComment = {
        user: req.user.id,
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar
      }
      post.comments.unshift(newComment);
      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({
      postnotfound: 'No post found'
    }));
});

// @route   DELETE api/comment/:id/:comment_id *id = post_id* * comment_id = comment_id
// @desc    Delete comment in post
// @access  Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      //check to see if comment exists
      if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
        return res.status(404).json({
          commentnotexist: 'Comment does not exist'
        });
      }
      const removeIndex = post.comments
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id);

      post.comments.splice(removeIndex, 1);
      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({
      postnotfound: 'Post not found'
    }));
});

module.exports = router;