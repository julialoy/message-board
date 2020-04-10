/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const uuidv4 = require('uuid/v4');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let testId1 = uuidv4();

  suite('API ROUTING FOR /api/threads/:board', function() {
    let testThreadId = uuidv4();

    suite('POST', function() {

      test('Post new thread', function(done) {
        chai.request(server)
          .post('/api/threads/:board')
          .type('form')
          .send({_id: testThreadId,  board: 'general', text: 'I am a test text. Bing.', delete_password: 'password'})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            done();
          });
      });

      test('Post another new thread', function(done) {
        chai.request(server)
          .post('/api/threads/:board')
          .type('form')
          .send({_id: testId1, board: 'general', text: 'I am a test text for testing replies.', delete_password: 'password'})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            done();
          });
      });
      
    });
    
    suite('GET', function() {
      test('Get array of 10 most recent bumped threads w/3 most recent replies per thread', function(done) {
        chai.request(server)
          .get('/api/threads/:board')
          .query({board: 'general'})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isAtMost(res.body.length, 10);
            assert.property(res.body[0], 'replies');
            assert.isArray(res.body[0].replies);
            assert.isAtMost(res.body[0].replies.length, 3);
            assert.notProperty(res.body[0].replies, 'reported');
            assert.notProperty(res.body[0].replies, 'delete_password');
            assert.property(res.body[0], '_id');
            assert.isString(res.body[0]._id);
            assert.property(res.body[0], 'text');
            assert.isString(res.body[0].text);
            assert.property(res.body[0], 'created_on');
            assert.equal(res.body[0].created_on.length, 24);
            assert.property(res.body[0], 'replycount');
            assert.property(res.body[0], 'bumped_on');
            assert.notProperty(res.body[0], 'reported', "thread object does not include reported property");
            assert.notProperty(res.body[0], 'delete_password', "thread object does not include delete_password property");
            done();
          });
      });
      
    });
    
    suite('DELETE', function() {
      test('Delete entire thread', function(done) {
        chai.request(server)
          .delete('/api/threads/:board')
          .send({board: 'general', thread_id: testThreadId, delete_password: 'password'})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'Success');
            done();
          });
      });
      
    });
    
    suite('PUT', function() {
      test('Report thread', function(done) {
        chai.request(server)
          .put('/api/threads/:board')
          .send({board: 'general', thread_id: testId1})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'Success');
            done();
          });
      });
      
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    let replyId1 = uuidv4();
    let replyId2 = uuidv4();
    let replyId3 = uuidv4();
    let replyId4 = uuidv4();
    
    suite('POST', function() {

      test('Post new reply to thread', function(done) {
        chai.request(server)
          .post('/api/replies/:board')
          .type('form')
          .send({thread_id: testId1,  reply_id: replyId1, board: 'general', text: 'I am a test reply. 1.', delete_password: 'password'})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            done();
          });
      });

      test('Post another new reply to thread', function(done) {
        chai.request(server)
          .post('/api/replies/:board')
          .type('form')
          .send({thread_id: testId1,  reply_id: replyId2, board: 'general', text: 'I am a test reply. 2.', delete_password: 'password'})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            done();
          });
      });

      test('Post yet another new reply to thread', function(done) {
        chai.request(server)
          .post('/api/replies/:board')
          .type('form')
          .send({thread_id: testId1,  reply_id: replyId3, board: 'general', text: 'I am a test reply. 3.', delete_password: 'password'})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            done();
          });
      });

      test('Post one more new reply to thread', function(done) {
        chai.request(server)
          .post('/api/replies/:board')
          .type('form')
          .send({thread_id: testId1,  reply_id: replyId4, board: 'general', text: 'I am a test reply. 4.', delete_password: 'password'})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            done();
          });
      });

    });
    
    suite('GET', function() {

      test('Get all replies for thread', function(done) {
        chai.request(server)
        .get('/api/replies/:board')
        .query({board: 'general', thread_id: testId1})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          assert.property(res.body, 'text');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'bumped_on');
          assert.property(res.body, 'replies');
          assert.isArray(res.body.replies);
          assert.notProperty(res.body, 'reported');
          assert.notProperty(res.body, 'delete_password');
          done();
        });
      });
      
    });
    
    suite('PUT', function() {
      test('Report thread', function(done) {
        chai.request(server)
          .put('/api/replies/:board')
          .send({board: 'general', thread_id: testId1, reply_id: replyId3})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'Success');
            done();
          });
      });
    });
    
    suite('DELETE', function() {

      test('Delete reply to thread', function(done) {
        chai.request(server)
          .delete('/api/replies/:board')
          .send({board: 'general', thread_id: testId1, delete_password: 'password', reply_id: replyId4})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'Success');
            done();
          });
      });
      
    });
    
  });

});
