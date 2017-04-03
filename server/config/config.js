var env = process.env.NODE_ENV || 'development';
console.log('env *****', env);

if (env === 'development' || env === 'test') {
    var config = require('./config.json'); //gives us a JS object from JSON string
    var envConfig = config[env]; //so if the env variable above in the conditional is dev or test it'll grab that
    //when you wanna use a variable to access a property you need to use bracket notation


   Object.keys(envConfig).forEach((key) => { //Object.keys takes all the keys in an object and puts it into an array
        process.env[key] = envConfig[key];
        //basically saying
        //process.env.PORT = 3000
        //process.env.MONGODB_URI = mongodb://localhost:27017/TodoApp
   });
}

// if (env === 'development') {
//     process.env.PORT = 3000;
//     process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
// }else if (env === 'test') {
//     process.env.PORT = 3000;
//     process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
// }

//depending on the env variable which is either process.env.NODE_ENV which is 'test' as set depending
//package.json, otherwise its development
//depending on the env it connects to a different MONGODB_URI using a different database