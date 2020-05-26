//  const chai = require('chai'), 
//       chaiHttp = require('chai-http'),
//       server = require('../app'),
//       should = chai.should(),
//       User = require('../model/user');
//      chai.use(chaiHttp);
process.env.NODE_ENV = 'test'
const config = require('../config/database');

const chai = require('chai');
 const     request = require('supertest');
 const     app = require('../app');
 const should = chai.should();
 // const    mongoose = require('mongoose');
  const  originalUrl = "'/starter/v1";





describe("*********/POST: USER REGISTRATION *********", () => {
    it('Should', async() => {
     request(app)
     .post(`${originalUrl}/auth/register`)
     .expect(400)
     .end((err, res) => {
         res.should.be.an('object');
     })
    })
})
  describe('/GET user profile', () => {
      it('it should get current users profile information', (done) => {
          chai.request(server)
          .get('/starter/v1/user/profile')
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              done();
          })
      })
  })

  describe('/POST to register new account', () => {
      it('it should create a new user account', (done) => {
          let newUser = {
           fullname: 'fullname',
           password: 'password',
          phonenumber: '0201145785',
          email: 'my@emaill.com'
          }
          chai.request(server)
          .post('/starter/v1/auth/register')
          .send(newUser)
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('object');
              res.body.should.have.property('success');
             // res.body.should.have.property('statusCode');
              res.body.should.have.property('response');
             // res.body.should.have.property('user');

              //res.body.should.have.error
              done();
          })
      })
  })