const postsCollection = require('../db').db().collection('posts')
const ObjectId = require('mongodb').ObjectId
const User = require('./User')

let Post = function (data, userid, requestedPostId) {
  this.data = data
  this.errors = []
  this.userid = userid
  this.requestedPostId = requestedPostId
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

Post.prototype.update = function() {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await Post.findSinglePostById(this.requestedPostId, this.userid)
      if(post.isVisitorOwner) {
        // actually update the Db
        let status = await this.actuallyUpdate()
        resolve(status)
      } else {
        reject()
      }

    } catch {
      reject()
    }
  })
}

Post.prototype.actuallyUpdate = function() {
  return new Promise(async (resolve, reject) => {
    this.cleanUp()
    this.validate()
    if(!this.errors.length) {
     await postsCollection.findOneAndUpdate({_id: new ObjectId(this.requestedPostId)}, {$set: {title: this.data.title, body: this.data.body}})
      resolve("success")
    } else {
      resolve("failure")
    }
  })
}

// find the post that corresponds to the ID from the url, localhost:0000/post/thisistheidabcd
/* // another function with same name containing reusablePostQuery is being used
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
*/

Post.reusablePostQuery = function(uniqueOperations, visitorId) {
  return new Promise(async function(resolve, reject) {
    let aggOperations = uniqueOperations.concat([
      {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
      {$project: {
        title: 1,
        body: 1,
        createdDate: 1,
        authorId: "$author",
        author: {$arrayElemAt: ["$authorDocument", 0]}
       }}
    ])

    let posts = await postsCollection.aggregate(aggOperations).toArray()

    // clean up withor property in each post Object
    posts = posts.map(function(post) {
      post.isVisitorOwner = post.authorId.equals(visitorId) // check if the current Visitor is the owner of the post

      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar
      }  
      return post
    })    
    
    resolve(posts)
   
  })
}

Post.findSinglePostById = function(id, visitorId) {
  return new Promise(async function(resolve, reject) {
    if(typeof(id) != "string" || !ObjectId.isValid(id)) {
      reject()
      return 
    }
    
    let posts = await Post.reusablePostQuery([
      {$match: {_id: new ObjectId(id)}}
    ], visitorId)
    
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


/* alternative solution by me for retrieving posts by AuthorID */
/*
Post.findByAuthorId = function(authorId) {
  return new Promise(async function(resolve, reject) {
    let posts = await postsCollection.aggregate([
      {$match: {author: authorId}},
      {$sort: {createdDate: -1}}
    ]).toArray()
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

