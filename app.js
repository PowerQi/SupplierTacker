
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , download = require('./routes/download')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , ejs = require("ejs")
  , partials = require('express-partials');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//html
// app.engine('.html', ejs.__express);
// app.set('view engine', 'html');// app.set('view engine', 'ejs');

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.login);
app.get('/i', routes.index);
app.get('/users', user.list);
app.get('/session', user.session);
app.get('/code', user.code);
app.get('/login', user.login);
app.get('/download/order/:id', download.order);
app.get('/download/return/:id', download.return);
app.get('/download/:id', download.download);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
