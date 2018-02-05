var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');

var app = express();

const spotifyBaseUrl = 'https://api.spotify.com/v1/';

app.use(express.static(__dirname + '/'));

app.get('/user', function(req, res) {

  let token = req.query.token;

  let requestURL = spotifyBaseUrl + 'me';

  let options = {
    url: requestURL,
    headers: { 'Authorization': 'Bearer ' + token },
    json: true
  };

  request.get(options, function(error, response, body) {
    res.json(body);
  });
});

app.get('/devices', function(req, res) {

  let token = req.query.token;

  let requestURL = spotifyBaseUrl + 'me/player/devices';

  let options = {
    url: requestURL,
    headers: { 'Authorization': 'Bearer ' + token },
    json: true
  };

  request.get(options, function(error, response, body) {
    res.send(body.devices);
  });
});

app.post('/transfer', function(req, res) { 

  let device_id = req.query.device_id;
  let token = req.query.token;

  let requestURL = spotifyBaseUrl + 'me/player';
  
  let options = {
    url: requestURL,
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    json: true,
    dataType: 'json',
    body: { "device_ids": [device_id] }
  };
  
  request.put(options, function(error, response, body) {
    res.sendStatus(200);
  });
});

app.get('/genres', function(req, res) {

  let token = req.query.token;

  let requestURL = spotifyBaseUrl + 'recommendations/available-genre-seeds';

  let options = {
    url: requestURL,
    headers: { 'Authorization': 'Bearer ' + token },
    json: true
  };

  request.get(options, function(error, response, body) {
    res.json(body.genres);
  });
});

app.get('/recommendations', function(req, res) {
  
  // Get token and remove from query object
  let token = req.query.token;
  delete req.query.token;

  let requestURL = spotifyBaseUrl + 'recommendations?' + 
  querystring.stringify({
    limit: 20,
    market: 'from_token'
  }) + '&' +
  querystring.stringify(req.query);

  let options = {
    url: requestURL,
    headers: { 'Authorization': 'Bearer ' + token },
    json: true
  };

  request.get(options, function(error, response, body) {
    res.json(body);
  });
});

app.get('/tracks', function(req, res) {

  let ids = req.query.ids;
  let token = req.query.token;

  let requestURL = spotifyBaseUrl + 'tracks?' + 
  querystring.stringify({
    ids: ids,
    market: 'from_token'
  });

  let options = {
    url: requestURL,
    headers: { 'Authorization': 'Bearer ' + token },
    json: true
  };

  request.get(options, function(error, response, body) {
    res.json(body.tracks);
  });
});

app.post('/playlist', function(req, res) {

  let tracks = req.query.tracks;
  let genres = req.query.genres;
  let token = req.query.token;
  let features = req.query.features;
  let userId, playlistUrl;

  // 1. Get user ID
  let requestURL = spotifyBaseUrl + 'me';

  let options = {
    url: requestURL,
    headers: { 'Authorization': 'Bearer ' + token },
    json: true
  };

  request.get(options, function(error, response, body) {
    userId = body.id;
    
    // 2. Create playlist
    requestURL = spotifyBaseUrl + 'users/' + userId + '/playlists';

    options = {
      url: requestURL,
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      json: true,
      dataType: 'json',
      body: { "name": "Nelson Recommended Tracks", "description": "Recommended tracks based on " + genres + " with " + features }
    };

    request.post(options, function(error, response, body) {
      playlistUrl = body.tracks.href;
      
      // 3. Add tracks to playlist
      requestURL = playlistUrl + '/?' +
      querystring.stringify({
        uris: tracks
      });

      options = {
        url: requestURL,
        headers: { 'Authorization': 'Bearer ' + token },
        json: true
      };

      request.post(options, function(error, response, body) {
        res.sendStatus(200);
      });
    });
  });
});

app.post('/play', function(req, res) {
  let tracks = req.query.tracks;
  let device_id = req.query.device_id;
  let token = req.query.token;

  let requestURL = spotifyBaseUrl + 'me/player/play?' +
  querystring.stringify({
    device_id: device_id
  });

  let options = {
    url: requestURL,
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    json: true,
    dataType: 'json',
    body: { "uris": tracks.split(',') }
  };

  request.put(options, function(error, response, body) {
    res.sendStatus(200);
  });
});

app.post('/pause', function(req, res) {
  let token = req.query.token;

  let requestURL = spotifyBaseUrl + 'me/player/pause';

  let options = {
    url: requestURL,
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    json: true,
    dataType: 'json',
  };

  request.put(options, function(error, response, body) {
    res.sendStatus(200);
  });
});

console.log('Listening on 8888');
app.listen(8888);
