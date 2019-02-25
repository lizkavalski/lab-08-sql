'use strict';

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');

// Load environment variables from .env file
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// API Routes
app.get('/location', (request, response) => {
  getLocation(request.query.data)
    .then(location => {
      console.log('27', location);
      response.send(location)
    })
    .catch(error => handleError(error, response));

})

// Do not comment in until you have locations in the DB
app.get('/weather', getWeather);

// Do not comment in until weather is working
app.get('/meetups', getMeetups);

//Yelp
// app.get('/yelp', getYelp);

// //Movies
//  app.get('/movie', getMoive);

// //hiking
app.get('/trails', getTrails);

// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// *********************
// MODELS
// *********************

function Location(query, res) {
  this.search_query = query;
  this.formatted_query = res.formatted_address;
  this.latitude = res.geometry.location.lat;
  this.longitude = res.geometry.location.lng;
}

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

function Meetup(meetup) {
//   this.tableName = 'meetups';
  this.link = meetup.link;
  this.name = meetup.group.name;
  this.creation_date = new Date(meetup.group.created).toString().slice(0, 15);
  this.host = meetup.group.who;
//   this.created_at = Date.now();
}
// //yelp
// function Yelp(yelp){
//   this.url=:
//   this.name=;
//   this.rating=;
//   this.price=;
//   this.image_url=;
// }
//movies data--pulled from the index.html
// function Movie(movies){
//   this.title=;
//   this.released_on=;
//   this.total_votes=;
//   this.avarage_votes=;
//   this.popularity=;
//   this.image_url=;
//   this.overview=;
// }


//hiking--infomation pulled from the index.html
function Trail(trials){
  this.trail_url =trails.url; 
  this.location=trails.location
  this.name= trails.name ;
  this.length=trails.length;
  this.condition_date=new Date(trails.conditionDate.split(' ')[0]);
  this.condition_time=new Date(trails.conditionDate.split(' ')[1]);
  this.condition=trails.condition.details;
  this.stars= trails.stars;
  this.star_votes=trials.starVoters;
  this.summary=trials.summary;
 }
// *********************
// HELPER FUNCTIONS
// *********************

function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}
/// -------------------------*HELPER-FUNCTION:LOCATION*----------------------------
function getLocation(query) {
  // CREATE the query string to check for the existence of the location
  console.log('something');
  const SQL = `SELECT * FROM locations WHERE search_query=$1;`;
  const values = [query];

  // Make the query of the database
  return client.query(SQL, values)
    .then(result => {
      // Check to see if the location was found and return the results
      if (result.rowCount > 0) {
        console.log('From SQL');
        return result.rows[0];

        // Otherwise get the location information from the Google API
      } else {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
// console.log(url);
        return superagent.get(url)
          .then(data => {
            console.log('FROM API line 90');
            // Throw an error if there is a problem with the API request
            if (!data.body.results.length) { throw 'no Data' }

            // Otherwise create an instance of Location
            else {
              let location = new Location(query, data.body.results[0]);
              console.log('98', location);

              // Create a query string to INSERT a new record with the location data
              let newSQL = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING id;`;
              console.log('102', newSQL)
              let newValues = Object.values(location);
              console.log('104', newValues)

              // Add the record to the database
              return client.query(newSQL, newValues)
                .then(result => {
                  console.log('108', result.rows);
                  // Attach the id of the newly created record to the instance of location.
                  // This will be used to connect the location to the other databases.
                  console.log('114', result.rows[0].id)
                  location.id = result.rows[0].id;
                  return location;
                })
                .catch(console.error);
            }
          })
          .catch(error => console.log('Error in SQL Call'));
      }
    });
}
// -------------------------*HELPER-FUNCTION:WEATHER*----------------------------
function getWeather(request, response) {
  const SQL = `SELECT * FROM weathers WHERE location_id=$1;`;
  const values =[request.query.data.id];

  return client.query (SQL, values)
    .then (result => {
      if(result.rowCount > 0){
        console.log('from SQL');
        response.send(result.rows);
      } else {  
        const url =`https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

        superagent.get(url)
          .then (result =>{
            const weatherSummaries =result.body.daily.data.map(day => {
              const summary = new Weather(day);
              return summary;
          });
        let newSQL =`INSERT INTO weathers(forecast,time,location_id) VALUES($1,$2,$3);`;
    
        weatherSummaries.forEach( summary =>{
            let newValues = Object.values(summary);
            newValues.push(request.query.data.id);
            return client.query(newSQL, newValues)
            .catch(console.error);
       })
       response.send(weatherSummaries);
    })
     .catch(error =>handleError(error,response));
  }
})
}


// -------------------------*HELPER-FUNCTION:MEETUPS*----------------------------
function getMeetups(request, response) {
 const SQL = `SELECT * FROM meetups WHERE location_id=$1;`;
 const values =[request.query.data.id];

 return client.query (SQL, values)
    .then (result => {
      if(result.rowCount > 0){
        console.log('from SQL');
        response.send(result.rows);
      } else{
         const url = `https://api.meetup.com/find/upcoming_events?&sign=true&photo-host=public&lon=${request.query.data.longitude}&page=20&lat=${request.query.data.latitude}&key=${process.env.MEETUP_API_KEY}`

      superagent.get(url)
        .then(result => {
          const meetupsSummaries = result.body.events.map(meetup => {
            const event = new Meetup(meetup);
            return event;
          });
        let newSQL =`INSERT INTO meetups(link, name, creation_date, host, location_id) VALUES($1,$2,$3,$4,$5);`;
          //console.log ('148', meetupsSummaries)//array of objects
          meetupsSummaries.forEach(summary =>{
            let newValues = Object.values(summary);
            newValues.push(request.query.data.id);
            return client.query(newSQL, newValues);
            //.catch(console.error);
        })
        response.send(meetupsSummaries);
      })
       .catch(error =>handleError(error,response));
  }
})
}
//--------------------------Hiking------------------------------
function getTrails(request, response) {
  const SQL = `SELECT * FROM trials WHERE location_id=$1;`;
  const values =[request.query.data.id];

  return client.query (SQL, values)
    .then (result => {
      if(result.rowCount > 0){
        console.log('from SQL');
        response.send(result.rows);
      } else {  
        const url =`https://www.hikingproject.com/data/get-trails?url&name&location&length&conditiondate&condition&stars&starVotes&summary&lat=${request.query.data.latitude}&lon=${request.query.data.longitude}0&maxDistance=10&key=${process.env.TRAILS_API_KEY}`
console.log(url);

        superagent.get(url)
          .then (result =>{
            const trailSummaries =result.body.trails.map(trial => {
              const hike = new Trail(trial);
              return hike;
          });
        let newSQL =`INSERT INTO trails (trail_url,name,location,length,condition_date,condition_time,condition,stars,star_votes,summary,location_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11);`;
        console.log ('148', trials)//array of objects
        trailSummaries.forEach( trail =>{
            let newValues = Object.values(trail);
            newValues.push(request.query.data.id);
            return client.query(newSQL, newValues)
            // .catch(console.error);
       })
       response.send(trailSummaries);
    })
     .catch(error =>handleError(error,response));
  }
})
}
// ---------------------------Movies----------------------
// function getMoive(request, response) {
//   const SQL = `SELECT * FROM meetups WHERE location_id=$1;`;
//   const values =[request.query.data.id];
 
//   return client.query (SQL, values)
//      .then (result => {
//        if(result.rowCount > 0){
//          console.log('from SQL');
//          response.send(result.rows);
//        } else{
//           const url = 
 
//        superagent.get(url)
//          .then(result => {
//            const movieSummaries = result.body.events.map(movies=> {
//              const movies = new Movie(movies);
//              return movies;
//            });
//          let newSQL =`INSERT INTO meetups(title, released_on, total_votes, avarage_votes, popularity, image_url, overview, location_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9);`;
//            //console.log ('148', meetupsSummaries)//array of objects
//            movieSummaries.forEach(summary =>{
//              let newValues = Object.values(summary);
//              newValues.push(request.query.data.id);
//              return client.query(newSQL, newValues);
//              //.catch(console.error);
//          })
//          response.send(movieSummaries);
//        })
//         .catch(error =>handleError(error,response));
//    }
//  })
//  }
//-------------------------------Yelp-------------------------------------------------
//function getYelp(request, response) {
  //   const SQL = `SELECT * FROM meetups WHERE location_id=$1;`;
  //   const values =[request.query.data.id];
   
  //   return client.query (SQL, values)
  //      .then (result => {
  //        if(result.rowCount > 0){
  //          console.log('from SQL');
  //          response.send(result.rows);
  //        } else{
  //           const url = 
   
  //        superagent.get(url)
  //          .then(result => {
  //            const yelpSummaries = result.body.events.map(movies=> {
  //              const review = new Yelp(yelp);
  //              return review;
  //            });
  //          let newSQL =`INSERT INTO meetups(url, name, rating, price, image_url, location_id) VALUES($1,$2,$3,$4,$5,$6,$7);`;
  //            //console.log ('148', meetupsSummaries)//array of objects
  //            movieSummaries.forEach(summary =>{
  //              let newValues = Object.values(summary);
  //              newValues.push(request.query.data.id);
  //              return client.query(newSQL, newValues);
  //              //.catch(console.error);
  //          })
  //          response.send(movieSummaries);
  //        })
  //         .catch(error =>handleError(error,response));
  //    }
  //  })
  //  }