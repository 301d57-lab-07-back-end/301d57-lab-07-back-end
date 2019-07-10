'use strict';

// First initialize ENV configs
require('dotenv').config();

// NPM Packages
const express = require('express');
const cors = require('cors');

// Global Variables
const PORT = process.env.PORT;

const app = express(); // Instantiate Express app
app.use(cors()); // Cross Origin support

// Server Express static files from public directory
app.use(express.static('public'));

// GET - user location input, display on map
// ---------------------------------------------
app.get('/location', (request, response) => {
  try {
    const loc = returnLocation(request.query.data);
    response.status(200).send(loc);
  } catch (err) {
    response.status(500).send('Sorry, something went wrong.');
  }
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

// Location - get Geo JSON, create object via constructor, return object
// -----------------------------------------------------------------------
const returnLocation = (locationName) => {
  const locationData = require('./data/geo.json');

  function Location(search_query, formatted_query, latitude, longitude) {
    this.search_query = search_query;
    this.formatted_query = formatted_query;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  const search_query = locationName;
  const formatted_query = locationData.results[0].formatted_address;
  const latitude = locationData.results[0].geometry.location.lat;
  const longitude = locationData.results[0].geometry.location.lng;

  return new Location(search_query, formatted_query, latitude, longitude);
};

// Weather - get Darksky JSON, create object via constructor, return object
// -------------------------------------------------------------------------
const returnWeather = (location) => {
  const weatherData = require('./data/darksky.json');
  let weatherArray = [];

  function Weather(forecast, time) {
    this.forecast = forecast;
    this.time = time;
  }

  for (let i = 0; i < weatherData.daily.data.length; i++) {
    let forecast = weatherData.daily.data[i].summary;
    let time = new Date(weatherData.daily.data[i].time * 1000);
    weatherArray.push(new Weather(forecast, time.toDateString()));
  }

  return weatherArray;
};

// Start the server!!!
// --------------------
app.listen(PORT, () => {
  console.log(`Listening on PORT:${PORT}`);
});

