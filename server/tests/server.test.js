const request = require('supertest');
const expect = require('expect');
const {ObjectID} = require('mongodb');

var {app} = require('./../server.js');
var {Todo} = require('./../models/todo.js');
const {User} = require('../models/user.js');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed.js');

beforeEach(populateUsers);
beforeEach(populateTodos);


//assumes we have 0 todos, which we will because of the above statement that empties the todo
describe('POST /todos', () => {
    it('Should create a new todo', (done) => {
        var text = 'Test todo text';

       
        request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.text) //ITS res.body.something or in this case res.body.todos.text 
                                    //because if you look in the server.js file we created a res.send Object 
                                    //This object is res.send({todos:todos})
            .toBe(text);
        })
        .end((err,res) => {
            if (err) {
              return done(err);
            }

            Todo.find({text: text}).then((todos) => {
                expect(todos.length).toBe(1);//added one todo item
                expect(todos[0].text).toBe(text);//the item added which is at index 0, has a text
                //property that equals to the text variable above
                done(); 
            }).catch((err) => { //if either of the assertions fails, then the catch call will display
                //error arguments 
                done(err);
            });
        });
    });
    
    it('should not create todo with invalid body data', (done) => {
        //test case to see what happens when we send in invalid data
        request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            Todo.find().then((todos) => {
                expect(todos.length).toBe(2); //since no doc should be created 
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
        .get('/todos')
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.length).toBe(2);
        })
        .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    });

    it('should return a 404 if todo not found', (done) => {
        var id = new ObjectID();
        id.toHexString();
        request(app)
        .get(`/todos/${id}`)
        .expect(404)
        .end(done)
    });

    it('should return a 404 if invalid id', (done) => {
        request(app)
        .get('/todos/123abc')
        .expect(404)
        .end(done)
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        var hexId = todos[1]._id.toHexString(); //toHexString() converts ObjectID to string
        request(app)
        .delete(`/todos/${hexId}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo._id).toBe(hexId);
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            Todo.findById({_id: hexId}).then((todo) => {
                expect(todo).toNotExist(); //expects that the result todo doesn't exist 
                done(); //wraps up test case 
            }).catch((err) => { //if any of the expectations fails then return the error 
                done(err);
            });
        });
    });

    it('should return 404 if todo not found', (done) => {
        var id = new ObjectID(); //creates a new ID that wont exist deliberatly in the DB
        id.toHexString();
        request(app)
        .delete(`/todos/${id}`)
        .expect(404)
        .end(done)
    });

    it('should return 404 if objectID invalid', (done) => {
        request(app)    //Enter an invalid ID to get back the proper response 
        .get('/todos/123abc')
        .expect(404)
        .end(done)
    });
});

describe('PATCH /todos:id', () => {
    it('should update the todo', (done) => {
        var hexId = todos[0]._id.toHexString();
        var text = 'This should be new text';

        request(app)
        .patch(`/todos/${hexId}`)
        .send({
            completed: true,
            text: text
        })
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(true);
            expect(res.body.todo.completedAt).toBeA('number');
        })
        .end(done);

    });

    it('should clear completedAt when todo not completed', (done) => {
        var hexId = todos[1]._id.toHexString();
        var text = 'This should be new text!!';

        request(app)
        .patch(`/todos/${hexId}`)
        .send({
            completed: false,
            text: text
        })
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(false);
            expect(res.body.todo.completedAt).toNotExist();
        })
        .end(done);
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token) //sets the header name 'x-auth' to its value 
        .expect(200)
        .expect((res) => {
            expect(res.body._id).toBe(users[0]._id.toHexString());
            expect(res.body.email).toBe(users[0].email);
            //when we provide a valid token we get back valid data 
        })
        .end(done);
    });

    it('should return a 401 if not authenticated', (done) => {
        request(app)
        .get('/users/me')
        .expect(401)
        .expect((res) => {
            expect(res.body).toEqual({});
        })
        .end(done)
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'example@example.com'
        var password = '123qwer';

        request(app)
        .post('/users')
        .send({email: email, password: password})
        .expect(200)
        .expect((res) => {
            expect(res.headers['x-auth']).toExist();
            expect(res.body._id).toExist();
            expect(res.body.email).toBe(email);
        })
        .end((err) => {
            if (err) {
                return done(err);
            }

            User.findOne({email: email}).then((user) => {
                expect(user).toExist();
                expect(user.password).toNotBe(password); //Making sure the new hashed password does not eqaul the password var above
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });

    it('should return validation errors if request invalid', (done) => {
        var email = 'abc4321'
        var password = '123456'

        request(app)
        .post('/users')
        .send({email: email, password: password})
        .expect(400)
        .end(done);
    });

    it('should not create user if email in use', (done) => {
        var email = 'alimaq@hotmail.com'
        var password = 'userOnePass'

        request(app)
        .post('/users')
        .send({email: users[0].email, password: password})
        .expect(400)
        .end(done);
    });
});

describe('POST /user/login', () => {
    it('should login user and return auth token', (done) => {
        request(app)
        .post('/users/login')
        .send({email: users[1].email, password: users[1].password})
        .expect(200)
        .expect((res) => {
            expect(res.headers['x-auth']).toExist();
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            }
            User.findById(users[1]._id).then((user) => {
                expect(user.tokens[0]).toInclude({
                    access: 'auth',
                    token: res.headers['x-auth']
                });
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });

    it('should reject invalid login', (done) => {
        request(app)
        .post('/users/login')
        .send({email: users[1].email, password: users[1].password + '1'})
        .expect(400)
        .expect((res) => {
            expect(res.headers['x-auth']).toNotExist()
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            }
            User.findById(users[1]._id).then((user) => {
                expect(user.tokens.length).toBe(0);
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });
});