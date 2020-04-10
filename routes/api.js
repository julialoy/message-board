/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';
//import { v4 as uuidv4 } from 'uuid';

//Not best practice but needed to allow FCC automated testing to succeed
process.env.DB='mongodb+srv://new-user_1:H9JNkTUxK0hu9CbB@cluster0-tccbk.mongodb.net/test?retryWrites=true&w=majority';

//const expect = require('chai').expect;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uuidv4 = require('uuid/v4');

const threadSchema = new Schema({
  _id: {type: String},
  board: {type: String, required: true},
  text: {type: String, required: true},
  created_on: {type: Date, required: true},
  bumped_on: {type: Date, required: true},
  reported: {type: Boolean, required: true},
  delete_password: {type: String, required: true},
  replies: {type: [Object]},
});

const MessageBoard = mongoose.model('MessageBoard', threadSchema);

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.DB)
  .then( () => console.log("Connection made") )
  .catch( err => console.error(err) );

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .post(function(req, res) {
      let threadTestId;
      const threadBoard = req.body.board;
      const threadText = req.body.text;
      const threadDeletePassword = req.body.delete_password;

      if (req.body._id) {
        threadTestId = req.body._id;
      } else {
        threadTestId = uuidv4();
      }

      const newThread = new MessageBoard({
        _id: threadTestId,
        board: threadBoard,
        text: threadText,
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        delete_password: threadDeletePassword,
        replies: []
      });
      newThread.save();
      return res.redirect(`/b/${threadBoard}`);
    })
    .get(function(req, res) {
      let queryBoard;
      if (req.query.board) {
        queryBoard = req.query.board;
      } else if (req.params.board) {
        queryBoard = req.params.board;
      } else {
        queryBoard = undefined;
      }

      const filters = {
        board: queryBoard
      };

      MessageBoard.find({...filters})
        .then(docs => {
          if (docs) {
            
            // Compare function to return most recent to least recent threads
            function myCompare(doc1, doc2) {
              if (doc1.bumped_on < doc2.bumped_on) {
                return 1;
              } else if (doc1.bumped_on > doc2.bumped_on) {
                return -1;
              } else {
                return 0;
              }
            }

            function myCompareReply(reply1, reply2) {
              if (reply1.created_on < reply2.created_on) {
                return 1;
              } else if (reply1.created_on > reply2.created_on) {
                return -1;
              } else {
                return 0;
              }
            }

            function formatReplies(replyArray) {
              let formattedArray = [];
              for (let x = 0; x < replyArray.length; x++) {
                let temp = {
                  _id: replyArray[x]._id,
                  text: replyArray[x].text,
                  created_on: replyArray[x].created_on
                };
                formattedArray.push(temp);
              }
              return formattedArray;
            }

            let results = docs.sort(myCompare);
            results = results.slice(0, 10);
            let finalResults = [];

            // Return array without report or delete_password fields
            // Ensure only three most recent replies shown
            for (let i = 0; i < results.length; i++) {
              const result = {
                _id: results[i]._id, 
                text: results[i].text, 
                created_on: results[i].created_on, 
                bumped_on: results[i].bumped_on,
                replies: results[i].replies.length > 0 ? formatReplies(results[i].replies.sort(myCompareReply).slice(0, 3)) : [],
                replycount: results[i].replies.length
              }
              finalResults.push(result);
            }

            return res.json(finalResults);
          } else {
            return res.json({error: "No threads found"});
          }
        })
        .catch( err => {
          console.error(err);
          res.json({error: "Something went wrong"});
        });
    })
    .delete(function(req, res) {
      let thread_id;
      const delete_password = req.body.delete_password;
      let board;

      if (req.body.thread_id) {
        thread_id = req.body.thread_id;
      } else if (req.params.thread_id) {
        thread_id = req.params.thread_id;
      }

      if (req.body.board) {
        board = req.body.board;
      } else if (req.params.board) {
        board = req.params.board;
      }

      const filters = {
        _id: thread_id,
        board: board,
        delete_password: delete_password
      };
      MessageBoard.deleteOne({...filters})
      .then( () => res.json("Success") )
      .catch( err => {
        console.error(err);
        res.json("Incorrect password") 
      });
    })
    .put(function(req, res) {
      let threadId;
      let board;

      if (req.body.thread_id) {
        threadId = req.body.thread_id;
      } else if (req.params.thread_id) {
        threadId = req.params.thread_id;
      }

      if (req.body.board) {
        board = req.body.board;
      } else if (req.params.board) {
        board = req.params.board;
      }
      
      if (threadId === undefined) {
        threadId = req.body.report_id;
      }

      const filters = {
        _id: threadId,
        board: board
      };

      MessageBoard.findOne({...filters})
      .then( doc => {
        if (doc) {
          doc.reported = true;
          doc.save((err, doc) => {
            if (err) {
              console.error(err);
              return res.json("Error. Could not save");
            }
            return res.json("Success");
          });
        } else {
          return res.json("Incorrect thread id");
        }
      })
      .catch( err => {
        console.error(err);
        return res.json("Error. Something went wrong");
      });
    });
    
  app.route('/api/replies/:board')
    .post(function(req, res) {
      let threadId;
      if (req.body.thread_id) {
        threadId = req.body.thread_id;
      } else if (req.params.thread_id) {
        threadId = req.params.thread_id;
      }

      const filters = {
        _id: threadId
      };

      const replyText = req.body.text;
      const replyDeletePassword = req.body.delete_password;
      let replyId;

      if (req.body.reply_id) {
        replyId = req.body.reply_id;
      } else if (req.params.reply_id) {
        replyId = req.params.reply_id;
      } else {
        replyId = uuidv4();
      }

      const newReply = {
        _id: replyId,
        text: replyText,
        created_on: new Date(),
        reported: false,
        delete_password: replyDeletePassword
      };

      MessageBoard.find({...filters})
      .then( doc => {
        if (doc) {
          const parentThread = doc[0];
          const threadBoard = parentThread.board;
          parentThread.replies.push(newReply);
          parentThread.bumped_on = new Date();
          parentThread.save();
          return res.redirect(`/b/${threadBoard}/${threadId}`);
        } else {
          console.log("Thread not found");
          return res.json({error: "Thread not found"});
        }
      })
      .catch( err => {
        console.error(err);
        return res.json({error: "Something went wrong"});
      });
    })
    .get(function(req, res) {
      let queryBoard;
      let queryThread;
      if (req.query.board) {
        queryBoard = req.query.board;
      } else {
        queryBoard = req.params.board;
      }

      if (req.query.thread_id) {
        queryThread = req.query.thread_id;
      } else {
        queryThread = req.params.thread_id;
      }

      const filters = {
        _id: queryThread,
        board: queryBoard
      };

      MessageBoard.find({...filters})
      .then(doc => {
        if (doc) {
          const selectedThread = doc[0];

          function formatReplies(replyArray) {
            let formattedArray = [];
            for (let x = 0; x < replyArray.length; x++) {
              let temp = {
                _id: replyArray[x]._id,
                text: replyArray[x].text,
                created_on: replyArray[x].created_on
              };
              formattedArray.push(temp);
            }
            return formattedArray;
          }

          let finalThread = {
            _id: selectedThread._id,
            text: selectedThread.text,
            created_on: selectedThread.created_on,
            bumped_on: selectedThread.bumped_on,
            replies: formatReplies(selectedThread.replies)
          };

          return res.json(finalThread);
        } else {
          return res.json({error: "No threads found"});
        }
      })
      .catch( err => {
        console.error(err);
        return res.json({error: "Something went wrong"});
      });

    })
    .delete(function(req, res) {
      const threadId = req.body.thread_id;
      const replyId = req.body.reply_id;
      const delete_password = req.body.delete_password;

      const filters = {
        _id: threadId
      };
      // Not the best solution
      // Issues with MongoDB not wanting to update property of object in array
      // Would prefer a SQL database
      MessageBoard.findOne({...filters})
      .then( doc => {
        if (doc) {
          let selectedThread = doc;
          let newReplies = selectedThread.replies.slice();
          let replyIsDeleted = false;

          for (let i = 0; i < newReplies.length; i++) {
            if (newReplies[i]._id === replyId && newReplies[i].delete_password === delete_password) {
              newReplies[i].text = '[deleted]';
              replyIsDeleted = true;
            }
          }

          if (!replyIsDeleted) {
            return res.json('Incorrect password');
          }

          selectedThread.replies = [];
          selectedThread.bumped_on = new Date();
          selectedThread.save((err, doc) => {
            if (err) {
              console.error(err);
              return res.json("Could not save");
            }
            doc.replies = newReplies;
            doc.save((err, doc) => {
              if (err) {
                console.error(err);
                return res.json("Could not save");
              }
              return res.json("Success");
            });
          });
        } else {
          return res.json("Thread not found");
        }
      })
      .catch( err => {
        console.error(err);
        return res.json({error: "Something went wrong"});
      });
    })
    .put(function(req, res) {
      let threadId;
      let replyId;
      let board;

      if (req.body.thread_id) {
        threadId = req.body.thread_id;
      } else if (req.params.thread_id) {
        threadId = req.params.thread_id;
      }

      if (req.body.reply_id) {
        replyId = req.body.reply_id;
      } else if (req.params.reply_id) {
        replyId = req.params.reply_id;
      }

      if (req.body.board) {
        board = req.body.board;
      } else if (req.params.board) {
        board = req.params.board;
      }

      const filters = {
        _id: threadId,
        board: board
      };

      MessageBoard.findOne({...filters})
      .then( doc => {
        if (doc) {
          let isReplyReported = false;
          let updatedReplies = doc.replies.slice();
          for (let i = 0; i < updatedReplies.length; i++) {
            if (updatedReplies[i]._id === replyId) {
              updatedReplies[i].reported = true;
              isReplyReported = true;
            }
          }
          
          if (!isReplyReported) {
            return res.json("Error. Incorrect reply_id");
          }

          doc.replies = [];
          doc.save((err, newDoc) => {
            if (err) {
              console.error(err);
              return res.json("Error. Could not save");
            }
            newDoc.replies = updatedReplies;
            newDoc.save((err, repReplyDoc) => {
              if (err) {
                console.error(err);
                return res.json("Error. Could not save");
              }
              return res.json("Success");
            });
          });
        } else {
          return res.json("Incorrect thread id");
        }
      })
      .catch( err => {
        console.error(err);
        return res.json("Error. Something went wrong");
      });
    });;
};
