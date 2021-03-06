var db = require("../models");
var passport = require("../config/passport");
var mentorsData = require('../data/mentors.js');
var friendsData = require('../data/friends.js');
var friendsArray = require('../data/search.js');
var path = require('path');

// API ROUTE to Sequelize Passport.js 
// *****************************************************************
module.exports = function (app) {
    // Using the passport.authenticate middleware with our local strategy.
    // If the user has valid login credentials, send them to the members page.
    // Otherwise the user will be sent an error
    app.post("/api/login", passport.authenticate("local"), function (req, res) {
        // Since we're doing a POST with javascript, we can't actually redirect that post into a GET request
        // So we're sending the user back the route to the members page because the redirect will happen on the front end
        // They won't get this or even be able to access this page if they aren't authed
        res.json("/members");
    });

    // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
    // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
    // otherwise send back an error
    app.post("/api/signup", function (req, res) {
        console.log(req.body);
        db.User.create({
            email: req.body.email,
            password: req.body.password
        }).then(function () {
            res.redirect(307, "/api/login");
        }).catch(function (err) {
            console.log(err);
            res.json(err);
            // res.status(422).json(err.errors[0].message);
        });
    });

    // Route for logging user out
    app.get("/logout", function (req, res) {
        req.logout();
        res.redirect("/");
    });

    // Route for getting some data about our user to be used client side
    app.get("/api/user_data", function (req, res) {
        if (!req.user) {
            // The user is not logged in, send back an empty object
            res.json({});
        }
        else {
            // Otherwise send back the user's email and id
            // Sending back a password, even a hashed password, isn't a good idea
            res.json({
                email: req.user.email,
                id: req.user.id
            });
        }
    });

    // Mentor Routes
    //=============================================================================
    // app.get('/api/mentors', function (req, res) {
    //     res.json(mentorsData);
    // });

    // app.post('/api/mentors', function (req, res) {
    //     var userInput = req.body;
    //     var newMentorPoints = userInput.scores;
    //     var sameName = '';
    //     // var sameEmail = '';
    //     var samePicture = '';
    //     var mentorGap = 5000;

    //     for (var i = 0; i < mentorsData.length; i++) {
    //         var gap = 0;
    //         for (var j = 0; j < newMentorPoints.length; j++) {
    //             gap += (Math.abs(parseInt(mentorsData[i].scores[j]) - parseInt(userInput.scores[j])));
    //         }

    //         // If difference in score is low, then a match is found
    //         if (gap < mentorGap) {
    //             console.log('Found your mentor = ' + gap);
    //             console.log('Mentor name = ' + mentorsData[i].name);
    //             // console.log('Mentor email = ' + mentorsData[i].email);
    //             console.log('Mentor image = ' + mentorsData[i].photo);

    //             // Create new mentor
    //             mentorGap = gap;
    //             sameName = mentorsData[i].name;
    //             // sameEmail = mentorsData[i].email;
    //             samePicture = mentorsData[i].photo;
    //         }
    //     }

    //     // Add new user
    //     mentorsData.push(userInput);
    //     // Sending object sameName and samePicture to backend
    //     // Sending response back to survey.html
    //     res.json({ sameName: sameName, samePicture: samePicture });
    // });

    // Dating API routes
    // *****************************************************************
    // display table data in json format
    app.get('/api/search', function (req, res) {
        res.json(friendsArray);

    });

    app.post('/api/search', function (req, res) {
        var userInput = req.body;
        console.log(userInput)
        var dateMatch = {
            singleName: req.body.singleName,
            singlePhoto: req.body.singlePhoto,
            singleEmail: req.body.singleEmail,
            singleScores: req.body.singleScores.join(""),
        }
        // var match;
        //===========================================================================

        db.Dates.findAll({})
            .then(data => {
                for (var i = 0; i < data.length; i++) {
                    console.log(`======================= date name: ${data[i].singleName}`)
                    console.log("userInput: " + userInput);
                    var match = data[i]
                    // do I need this?
                    var diff = Math.abs(userInput.singleScores - match.singleScores)
                    console.log("Diff: " + diff);
                    if (diff < dateMatch.singleScores) {
                        match.singleName = data[i].singleName;
                        match.singlePhoto = data[i].singlePhoto;
                        match.singleEmail = data[i].singleEmail;
                        match.singleScores = diff;
                    }
                }
                console.log("working");
                console.log(dateMatch);
                console.log(match);
                res.json(match)
                // loop over the data and compare the scores in data with the userInput score
            })
            .catch(err => {
                console.log(err)
            })

        //=============================================================================
        var scoresString = req.body.singleScores.join("");
        console.log("string: " + scoresString)
        db.Dates.create({
            singleName: req.body.singleName,
            singlePhoto: req.body.singlePhoto,
            singleEmail: req.body.singleEmail,
            singleScores: scoresString,

        })
            .then(function (dbPost) {
                console.log(dbPost);
                // res.json()
                // res.redirect("/search");
                //  res.json(dbPost); 
            })
            .catch(function (err) {

                console.log(err);
            })

        friendsArray.push(userInput);
    });

    app.post("/api/clear", function () {

        // Empty out the arrays of data
        friendsArray = [];

        console.log(friendsArray);
    });

    // POST route for saving a new post
    app.post("/api/rating", function (req, res) {
        console.log(req.body);
        db.Post.create({
            photo: req.body.photo,
            name: req.body.name,
            age: req.body.age,
            location: req.body.location,
            paid: req.body.paid,
            initiation: req.body.initiation,
            appearance: req.body.appearance,
            conversation: req.body.conversation,
            manners: req.body.manners,
            attraction: req.body.attraction,
            smoochable: req.body.smoochable,
            interaction: req.body.interaction,
            date: req.body.date,
            impression: req.body.impression,
        })
            .then(function (dbPost) {
                res.json(dbPost);
            });
    });
};