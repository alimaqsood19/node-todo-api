const {SHA256} = require('crypto-js');

var message = 'I am user number 3';
var hash = SHA256(message).toString();

console.log(`Message: ${message}, Hash: ${hash}`);

var data = {
    id: 4
};


var token = {
    data: data,
    hash: SHA256(JSON.stringify(data) + 'somesecret').toString() //converts js obj to json string format 
}

// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();


var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();

if(resultHash === token.hash) {
    console.log('Data was not changed');
}else {
    console.log('Data was changed');
}



const jwt = require('jsonwebtoken');

var data = {
    id: 10
};


var jwtToken = jwt.sign(data, '123abc'); //returns a token, the value that we send back to the user
//when they either sign in or log in
console.log(jwtToken);

var decoded = jwt.verify(jwtToken, '123abc');
console.log('decoded', decoded);