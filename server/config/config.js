var env = process.env.NODE_ENV || 'development';
console.log('env *****', env);

if (env === 'development') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
}else if (env === 'test') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}

//depending on the env variable which is either process.env.NODE_ENV which is 'test' as set depending
//package.json, otherwise its development
//depending on the env it connects to a different MONGODB_URI using a different database