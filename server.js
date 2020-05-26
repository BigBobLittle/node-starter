const app = require('./app');

if(!module.parent){
    app.listen(process.env.PORT || 7000)
}
