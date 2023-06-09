const postsCollection = require('../db').db().collection('posts')
const ObjectId = require('mongodb').ObjectId
const User = require('./User')

let Post = function (data, userid) {
  this.data = data
  this.errors = []
  this.userid = userid
}

Post.prototype.cleanUp = function() {
  if(typeof(this.data.title) != "string") this.data.title = ""
  if(typeof(this.data.body) != "string") this.data.body = ""
  
  //get rid of any bogus properties
  this.data = {
    title : this.data.title.trim(),
    body : this.data.body.trim(),
    createdDate: new Date(),
    author: ObjectId(this.userid)
  }
}

Post.prototype.validate = function() {
  if(this.data.title == "") this.errors.push("you must provide a title")
  if(this.data.body == "") this.errors.push("you must provide a post content")
}

Post.prototype.create = function() {
  return new Promise((resolve, reject) => {
    this.cleanUp()
    this.validate()
    if(!this.errors.length) {
      // save post into database
      postsCollection.insertOne(this.data).then(() => {
        resolve()
      }).catch(() => {
        this.errors.push("Please try again later")
        reject(this.errors)
      })
      resolve()
    } else {
      reject(this.errors)
    }
  })
}

// find the post that corresponds to the ID from the url, localhost:0000/post/thisistheidabcd
Post.findSinglePostById = function(id) {
  return new Promise(async function(resolve, reject) {
    if(typeof(id) != "string" || !ObjectId.isValid(id)) {
      reject()
      return 
    }
    let posts = await postsCollection.aggregate([
      {$match: {_id: new ObjectId(id)}},
      {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
      {$project: {
        title: 1,
        body: 1,
        createdDate: 1,
        author: {$arrayElemAt: ["$authorDocument", 0]}
       }}
    ]).toArray()

    // clean up withor property in each post Object
    posts = posts.map(function(post) {
      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar
      }  
      return post
    })    
    
    if(posts.length) {
      console.log(posts[0])
      resolve(posts[0])
    } else {
      reject()
    }
  })
}

Post.reusablePostQuery = function(uniqueOperations) {
  return new Promise(async function(resolve, reject) {
    let aggOperations = uniqueOperations.concat([
      {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
      {$project: {
        title: 1,
        body: 1,
        createdDate: 1,
        author: {$arrayElemAt: ["$authorDocument", 0]}
       }}
    ])

    let posts = await postsCollection.aggregate(aggOperations).toArray()

    // clean up withor property in each post Object
    posts = posts.map(function(post) {
      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar
      }  
      return post
    })    
    
    resolve(posts)
   
  })
}

Post.findSinglePostById = function(id) {
  return new Promise(async function(resolve, reject) {
    if(typeof(id) != "string" || !ObjectId.isValid(id)) {
      reject()
      return 
    }
    
    let posts = await Post.reusablePostQuery([
      {$match: {_id: new ObjectId(id)}}
    ])
    
    if(posts.length) {
    //  console.log(posts[0])
      resolve(posts[0])
    } else {
      reject()
    }
  })
}

Post.findByAuthorId = function(authorId) {
  return Post.reusablePostQuery([
    {$match: {author: authorId}},
    {$sort: {createdDate: -1}}
  ])
}

/* another solution by me for retrieving posts by AuthorID */
/*
Post.findByAuthorId = function(authorId) {
  return new Promise(async function(resolve, reject) {
    let posts = await postsCollection.find({author: new ObjectId(authorId)}).toArray()
  //  console.log(typeof(authorId)) // object
  //  console.log(authorId) //new ObjectId("6478540a630ae20559d312a0")
    if(posts.length) {
    //  console.log(posts)
      resolve(posts)
    } else {
      reject()
    }
  })
}
*/


module.exports = Post

