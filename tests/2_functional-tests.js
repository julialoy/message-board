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

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {

      test('Post new thread', function(done) {
        chai.request(server)
          .post('/api/threads/:board')
          .type('form')
          .send({board: 'general', text: 'I am a test text. Bing.', delete_password: 'password'})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            done();
          });
      });
      
    });
    
    suite('GET', function() {

      test('Get test', function(done) {
        chai.request(server)
          .get('/api/threads/:board')
          .query({board: 'general'})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body[0], 'replies');
            assert.isArray(res.body[0].replies);
            assert.property(res.body[0], '_id');
            assert.isString(res.body[0]._id);
            assert.property(res.body[0], 'text');
            assert.isString(res.body[0].text);
            assert.property(res.body[0], 'created_on');
            assert.equal(res.body[0].created_on.length, 24);
            assert.property(res.body[0], 'bumped_on');
            assert.equal(res.body[0].bumped_on.length, 24);
            assert.property(res.body[0], 'reported');
            assert.isBoolean(res.body[0].reported);
            assert.property(res.body[0], 'delete_password');
            assert.isString(res.body[0].delete_password);
            assert.isAtLeast(res.body[0].delete_password.length, 1);
            done();
          });
      });
      
    });
    
    suite('DELETE', function() {
      
    });
    
    suite('PUT', function() {
      
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      
    });
    
    suite('GET', function() {
      
    });
    
    suite('PUT', function() {
      
    });
    
    suite('DELETE', function() {
      
    });
    
  });

});
