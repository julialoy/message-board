/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

//Not best practice but needed to allow FCC automated testing to succeed
process.env.DB='mongodb+srv://new-user_1:H9JNkTUxK0hu9CbB@cluster0-tccbk.mongodb.net/test?retryWrites=true&w=majority';

const expect = require('chai').expect;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const threadSchema = new Schema({
  board: {type: String, required: true},
  text: {type: String, required: true},
  created_on: {type: Date, required: true},
  bumped_on: {type: Date, required: true},
  reported: {type: Boolean, required: true},
  delete_password: {type: String, required: true},
  replies: {type: [String]}
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
      console.log("POSTING SOMETHING");
      console.log(req.body);
      const threadBoard = req.body.board;
      const threadText = req.body.text;
      const threadDeletePassword = req.body.delete_password;
      const newThread = new MessageBoard({
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
      } else {
        queryBoard = req.params.board;
      }
      const query = MessageBoard.find({board: queryBoard});
      query.exec(function(err, docs) {
        if (err) return console.error(err);
        if (docs) {
          return res.json(docs);
        } else {
          return res.json({error: "Nothing found"});
        }
      });
    });
    
  app.route('/api/replies/:board');



};
