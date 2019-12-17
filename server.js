const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const https = require("https");
var url = require('url');
var path = require('path');
const Google_places_API_Key = "AIzaSyDM8V2Rq3id7XcSIdqmAt-sAArGUZf2W9I";
const Google_geocode_API_Key = "AIzaSyA-O7WAiAP5gflnhtZT9jsdTeQtqduNJ2w";
const Dark_sky_API_Key = "8c5d013fe826cdd6b058f2f665b1db3a";
const Google_search_API_Key = "AIzaSyDM8V2Rq3id7XcSIdqmAt-sAArGUZf2W9I";



const PORT = 8081;
const app = express();
var autoCompleteResult = [];
app.use(bodyParser.json());
app.use(cors())


app.use(express.static(path.join(__dirname, 'dist/frontend')));

// app.get('*', function(req, res) {
//     res.sendFile(path.join(__dirname, 'dist/frontend/index.html'));
// });

app.get('/', function (req, res) {
    res.send('Hello from server');
})

app.get('/weatherSearch', function (req, res) {
    var params = url.parse(req.url, true).query;
    var latAndLon = '';
    if (params.currentLocation == 'false') {
        var request = require("request");
        geocodeApiUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + params.street.replace(/\s+/g, "+") + ',+' + params.city.replace(/\s+/g, "+") + ',+' + params.state + '&key=' + Google_geocode_API_Key;
        // console.log(geocodeApiUrl);
        request(geocodeApiUrl, function (error, response, body) {
            if (error) throw new Error(error);
            body = JSON.parse(body);
            if (body.status == "ZERO_RESULTS") {
                // console.log("000000000");
                res.status(200).send({ "message": "ZERO_RESULTS" });
            } else {
                latAndLon = body.results[0].geometry.location.lat.toString() + ',' + body.results[0].geometry.location.lng.toString();
                //console.log(body.results[0]);
                // body.results.geometry.location
                // console.log(latAndLon);
                darkskyApiUrl = 'https://api.darksky.net/forecast/' + Dark_sky_API_Key + '/' + latAndLon;
                request(darkskyApiUrl, function (error1, response, body1) {
                    if (error1) throw new Error(error1);
                    body1 = JSON.parse(body1);
                    // console.log(body1);
                    res.status(200).send(body1);
                });
            }
        });
    } else {
        latAndLon = params.currentGeoInfo;
        // console.log(latAndLon);
        var request = require("request");
        darkskyApiUrl = 'https://api.darksky.net/forecast/' + Dark_sky_API_Key + '/' + latAndLon;
        request(darkskyApiUrl, function (error1, response, body1) {
            if (error1) throw new Error(error1);
            body1 = JSON.parse(body1);
            //console.log(body1);
            res.status(200).send(body1);
        });

    }


    // res.status(200).send({ "message": "Data received" });
})

app.get('/autoComplete', function (req, res) {
    var params = url.parse(req.url, true).query;
    //console.log(params.input);
    var request = require("request");
    autoCompleteApiUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + params.input + '&types=(cities)&language=en&key=' + Google_places_API_Key;
    request(autoCompleteApiUrl, function (error, response, body) {
        if (error) throw new Error(error);
        // console.log(body);
        body = JSON.parse(body);
        if (body.status == "ZERO_RESULTS" || params.input == "") {
            autoCompleteResult = [];
        } else if (body.status == "OK") {
            autoCompleteResult = [];
            for (var i in body.predictions) {
                if (i == 5) {
                    break;
                }
                autoCompleteResult.push(body.predictions[i].structured_formatting.main_text);
            }
        }
        //console.log('autoCompleteResult:', autoCompleteResult);
        res.status(200).send(autoCompleteResult);
    });
    // res.status(200).send('666');
})

app.get('/seal', function (req, res) {
    var params = url.parse(req.url, true).query;
    console.log(params.state);
    var request = require("request");
    googleSearchApiUrl = 'https://www.googleapis.com/customsearch/v1?q=' + params.state + '%20State%20Seal&cx=015831370511033409242:lqoqp8ydtjj&imgSize=huge&imgType=news&num=1&searchType=image&key=' + Google_search_API_Key;
    request(googleSearchApiUrl, function (error, response, body) {
        if (error) throw new Error(error);
        body = JSON.parse(body);
        res.status(200).send(body);
    });
})

app.get('/dailyWeather', function (req, res) {
    var params = url.parse(req.url, true).query;
    console.log(params.location);
    console.log(params.time);
    var request = require("request");
    darkskyDailyApiUrl = 'https://api.darksky.net/forecast/' + Dark_sky_API_Key + '/' + params.location + ',' + params.time;
    request(darkskyDailyApiUrl, function (error, response, body) {
        if (error) throw new Error(error);
        body = JSON.parse(body);
        res.status(200).send(body);
    });
})

// app.post('/autocompletepost', function (req, res) {
//     input = req.body.input;
//     console.log("input:", input);
//     getAutoComplete(input);

//     // app.get('/autocompleteget', function (req, res) {
//     //     res.send(autoCompleteResult);
//     // })

//     res.status(200).send({ "message": "Data received" });
// })

// app.get('/autocompleteget', function (req, res) {
//     res.send(autoCompleteResult);
// })

// function getAutoComplete(inputValue) {
//     var request = require("request");
//     autoCompleteApiUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + inputValue + '&types=(cities)&language=en&key=' + Google_API_Key;
//     request(autoCompleteApiUrl, function (error, response, body) {
//         if (error) throw new Error(error);
//         // console.log(body);
//         body = JSON.parse(body);
//         if (body.status == "ZERO_RESULTS" || inputValue == "") {
//             autoCompleteResult = [];
//         } else if (body.status == "OK") {
//             autoCompleteResult = [];
//             for (var i in body.predictions) {
//                 if (i == 5) {
//                     break;
//                 }
//                 autoCompleteResult.push(body.predictions[i].structured_formatting.main_text);
//             }
//         }
//         console.log('autoCompleteResult:', autoCompleteResult);
//     });
// }

app.listen(PORT, function () {
    console.log("Server running on localhost:" + PORT);
});