// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express'); // call express
var bcrypt = require('bcrypt');
var session = require('express-session');

var app = express(); // define our app using express
var bodyParser = require('body-parser');
var request = require('request');

var _ = require('underscore')

var Bear = require('./app/models/bear');
var User = require('./app/models/user');
var Question = require('./app/models/question');
var Answer = require('./app/models/answer');
// var Answer = require('./app/models/answer');

app.use('/', express.static(__dirname));
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; // set our port


//use sessions for tracking logins
app.use(session({
    secret: 'work hard',
    resave: false,
    saveUninitialized: true
}));


// Connect to MongoDv
// =============================================================================
var mongoose = require('mongoose');

const db_options = {
    autoIndex: true, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    keepAlive: 120,
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
};

mongoose.connect('mongodb://MannaGrad:Mtrunks314@ds119070.mlab.com:19070/interview_questions', db_options);
var db = mongoose.connection;

db.once('open', function(db) {
    console.log("Connected to MongoDB:", db);
})
db.on('error', function(err) {
    console.log(err);
})
// ROUTES FOR OUR API
// =============================================================================

// get an instance of the express Router
var router_bear = express.Router();
var router_crypto = express.Router();
var router_questions = express.Router();

// middleware to use for all requests
router_bear.use(function(req, res, next) {
    if (!req.session.user) {
        return res.status(401).send();
    }
    console.log(req.session.user);
    next();
});

router_questions.route('/answers')
    .get(function(req, res) {
        Answer.find(function(err, answer) {
            if (err)
                res.send(err);
            // Modify response
            answer = _.map(answer, function(a) {
                return {
                    id: a._id,
                    answer: a.answer,
                    tips: a.tips,
                    question_id: a.question_id,
                    value: a.value
                };
            });
            res.json(answer);
        });
    });

router_questions.route('/questions')
    .post(function(req, res) {


        var question = new Question({
            _id: new mongoose.Types.ObjectId(),
            question: req.body.question
        });

        // save the bear and check for errors
        question.save(function(err) {
            if (err) {
                res.send(err);
            };
            req.body.answers.forEach(function(answer_item) {
                // body...
                var answer = new Answer({
                    answer: answer_item.answer,
                    tips: answer_item.tips,
                    question_id: question._id,
                    value: answer_item.value
                });

                answer.save(function(err) {
                    if (err) {
                        res.send(err);
                    };
                    // thats it!
                });
            });
            res.json({
                message: 'Question ' + req.body.question + ' created!'
            });
        });
    })
    .get(function(req, res) {
        Question.find(function(err, question) {
            if (err)
                res.send(err);
            // Modify response
            question = _.map(question, function(q) {
                return {
                    id: q._id,
                    question: q.question
                };
            });
            res.json(question);
        });
    });

router_bear.route('/bears')

    // create a bear (accessed at POST http://localhost:8080/api/bears)
    .post(function(req, res) {

        var bear = new Bear(); // create a new instance of the Bear model
        bear.name = req.body.name; // set the bears name (comes from the request)

        // console.log(req.body);

        // save the bear and check for errors
        bear.save(function(err) {
            if (err) {
                res.send(err);
            };

            res.json({
                message: 'Bear named ' + req.body.name + ' created!'
            });
        });
    })
    .get(function(req, res) {
        Bear.find(function(err, bears) {
            if (err)
                res.send(err);
            // Modify response
            bears = _.map(bears, function(bear) {
                return {
                    id: bear._id,
                    name: bear.name
                };
            });
            res.json(bears);
        });
    });

router_bear.route('/bears/:bear_id')
    // get the bear with that id (accessed at GET http://localhost:8080/api/bears/:bear_id)
    .get(function(req, res) {
        Bear.findById(req.params.bear_id, function(err, bear) {
            if (err)
                res.send(err);
            res.json(bear);
        });
    })
    .put(function(req, res) {

        // use our bear model to find the bear we want
        Bear.findById(req.params.bear_id, function(err, bear) {

            if (err)
                res.send(err);

            bear.name = req.body.name; // update the bears info

            // save the bear
            bear.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Bear updated!' });
            });

        });
    })
    .delete(function(req, res) {
        Bear.remove({
            _id: req.params.bear_id
        }, function(err, bear) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });


var router_user = express.Router();

router_user.route('/check')
    .get(function(req, res) {
        if (_.isEmpty(req.session.user)) {
            return res.send(false)

        } else {
            return res.status(200).send(req.session.user)
        }
    })

router_user.route('/register')
    .post(function(req, res) {

        if (req.body.email && req.body.username && req.body.password) {

            var user = new User(); // create a new instance of the Bear model

            user.username = req.body.username;
            user.email = req.body.email;
            user.password = req.body.password;

            // console.log(req.body);

            // save the bear and check for errors
            user.save(function(err) {
                if (err) {
                    res.send(err);
                };

                res.json({
                    message: 'User ' + req.body.username + ' created!'
                });
            })
        } else {
            var err = new Error('All fields required.');
            err.status = 400;
            return next(err);
        }
    })

router_user.route('/login')
    .post(function(req, res) {

        if (req.body.logcredential && req.body.logpassword) {


            var authField;
            if (req.body.logcredential.indexOf('@') + 1) {
                authField = 'email'
            } else {
                authField = 'username';
            };
            var authentication = {};
            authentication[authField] = req.body.logcredential;

            User.findOne(authentication, function(err, user) {
                if (err) {
                    console.log(err);
                    return res.status(500).send();
                }
                if (!user) {
                    return res.status(404).send();
                } else {
                    bcrypt.compare(req.body.logpassword, user.password, function(err, result) {
                        if (result === true) {
                            req.session.user = user;
                            res.json(user)
                        } else {
                            console.error("Wrong password!");
                            return res.status(401).send()
                        }
                    })
                }
            });

        } else {
            var err = new Error('All fields required.');
            err.status = 400;
            return next(err);
        };

    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
// app.use('/api', router_bear);
// app.use('/api', router_crypto);
app.use('/api', router_questions);
app.use('', router_user);

app.get('/', function(req, res) {
    // console.log("Auth:", req.user.authenticated);
    res.sendFile(__dirname + '/app/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

app.get('/profile', function(req, res) {
    if (!req.session.user) {
        return res.status(401).send();
    }

    return res.status(200).send("This worked")
});


// START THE SERVER
// =============================================================================
// app.setTimeout(15000, function (err) {
//  console.log("Request timeout out: ", err);
// });
const server = app.listen(port);
server.timeout = 15000;
console.log('Listening to port ' + port);