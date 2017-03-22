const request = require('supertest');
const expect = require('expect');

var {app} = require('./../server.js');
var {Todo} = require('./../models/todo.js');


beforeEach((done) => { //data base gets emptied before every request 
    Todo.remove({}).then(() => {
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
            expect(res.body.text)
            .toBe(text);
        })
        .end((err,res) => {
            if (err) {
              return done(err);
            }

            Todo.find().then((todos) => {
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
                expect(todos.length).toBe(0); //since no doc should be created 
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });
    
});