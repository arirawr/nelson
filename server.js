/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');

var secrets = require('./secret.js');

var client_id = secrets.client_id; // Your client id
var client_secret = secrets.client_secret; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

var access_token;
var refresh_token;

var app = express();

app.use(express.static(__dirname + '/'))

app.get('/login', function(req, res) {

  var scopes = 'playlist-modify-public streaming';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scopes: scopes,
      redirect_uri: redirect_uri,
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens

  var code = req.query.code || null;

  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {

      access_token = body.access_token;
      refresh_token = body.refresh_token;

      var options = {
        url: 'https://api.spotify.com/v1/me/player/recently-played',
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
      };

      request.get(options, function(error, response, body) {
        console.log(body);
      });

      // pass the token to the browser to make requests from there
      res.redirect('/#' +
        querystring.stringify({
          access_token: access_token,
          refresh_token: refresh_token
        }));
    } 
    
    else {
      res.redirect('/#' +
        querystring.stringify({
          error: 'invalid_token'
        }));
    }
  });

});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.get('/recommendations', function(req, res) {

  var genres = req.query.genres;

  var requestURL = "https://api.spotify.com/v1/recommendations?" + 
  querystring.stringify({
    seed_genres: genres,
    scopes: scopes,
    redirect_uri: redirect_uri,
  });

  var options = {
    url: 'https://api.spotify.com/v1/recommendations',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };

  request.get(options, function(error, response, body) {
    console.log(body);
  });
});

console.log('Listening on 8888');
app.listen(8888);
