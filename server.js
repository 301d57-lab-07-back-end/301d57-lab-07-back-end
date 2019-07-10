'use strict';

// First initialize ENV configs
require('dotenv').config();

// NPM Packages
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

// Global Variables
const PORT = process.env.PORT;

const app = express(); // Instantiate Express app
app.use(cors()); // Cross Origin support

// Server Express static files from public directory
app.use(express.static('public'));

// GET - user location input, display on map
// ---------------------------------------------
app.get('/location', (request, response) => {
  returnLocation(request.query.data, response);
});

// GET - daily weather details from location
// ---------------------------------------------
app.get('/weather', (request, response) => {
  try {
    const weather = returnWeather(request.query.data);
    response.status(200).send(weather);
  } catch (err) {
    response.status(500).send('Sorry, something went wrong.');
  }
});

// 404 - catch all paths that are not defined
// ---------------------------------------------
app.use('*', (request, response) => {
  response.status(404).send('Sorry, page not found');
});

// Location Constructor
function Location(search_query, formatted_query, latitude, longitude) {
  this.search_query = search_query;
  this.formatted_query = formatted_query;
  this.latitude = latitude;
  this.longitude = longitude;
}

// Location - get Geo JSON, create object via constructor, return object
// -----------------------------------------------------------------------

const returnLocation = (locationName, response) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${locationName}&key=${process.env.GEOCODE_API_KEY}`
  superagent
    .get(url)
    .then(result => {
      console.log(result.body.results[0].geometry.location.lat);
      const lat = result.body.results[0].geometry.location.lat;
      const lng = result.body.results[0].geometry.location.lng;
      const formatted_query = result.body.results[0].formatted_address;
      const search_query = locationName;
    
      response.status(200).send(new Location(search_query, formatted_query, lat, lng));
    })
    .catch(err => {
      console.error(err);
      response.status(500).send('Sorry, something went wrong.')
    });

};

// Weather - get Darksky JSON, create object via constructor, return object
// -------------------------------------------------------------------------
const returnWeather = (location) => {
  const weatherData = require('./data/darksky.json');

  function Weather(forecast, time) {
    this.forecast = forecast;
    this.time = time;
  }

  return weatherData.daily.data.map(obj => {
    let forecast = obj.summary;
    let time = new Date(obj.time * 1000).toDateString();
    return new Weather(forecast, time);
  });
};

// Start the server!!!
// --------------------
app.listen(PORT, () => {
  console.log(`Listening on PORT:${PORT}`);
});

