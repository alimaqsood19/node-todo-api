const request = require('supertest');
const expect = require('expect');
const {ObjectID} = require('mongodb');

var {app} = require('./../server.js');
var {Todo} = require('./../models/todo.js');

const todos = [{
    _id: new ObjectID(),
    text: 'Walk your dog'
}, {
    _id: new ObjectID(),
    text: 'Walk your alligator',
    completed: true,
    completedAt: 123
}];


beforeEach((done) => { //data base gets emptied before every request 
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => {
        done();
    });
});

//assumes we have 0 todos, which we will because of the above statement that empties the todo
describe('POST /todos', () => {
    it('Should create a new todo', (done) => {
        var text = 'Test todo text';

       
        request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.text)
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