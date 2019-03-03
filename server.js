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
//app.get('/yelp', getYelp);

// //Movies
app.get('/movie', getMovies);

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

  this.link = meetup.link;
  this.name = meetup.group.name;
  this.creation_date = new Date(meetup.group.created).toString().slice(0, 15);
  this.host = meetup.group.who;
}
// //yelp
// function Yelp(yelp){
//   this.url=yelp.url;
//   this.name=yelp.name;
//   this.rating=yelp.rating;
//   this.price=yelp.price;
//   this.image_url=yelp.image_url;
//}
//movies data--pulled from the index.html
function Movie(movie){
  this.title=movie.title;
  this.released_on=movie.release_date;
  this.total_votes=movie.vote_count;
  this.avarage_votes=movie.vote_average;
  this.popularity=movie.popularity;
  this.image_url=`https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
  this.overview=movie.overview;
}


//hiking--infomation pulled from the index.html
function Trail(trails){
  this.trail_url =trails.url; 
  this.location=trails.location;
  this.name= trails.name;
  this.length=trails.length;
  this.condition_date=new Date(trails.conditionDate.split(' ')[0]);
  this.condition_time=new Date(trails.conditionDate.split(' ')[1]);
  this.condition=trails.conditionDetails;
  this.stars= trails.stars;
  this.stars_votes=trails.starVoters;
  this.summary=trails.summary;
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
        return result.rows[0];

        // Otherwise get the location information from the Google API
      } else {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
// console.log(url);
        return superagent.get(url)
          .then(data => {
            if (!data.body.results.length) { throw 'no Data' }
            // Otherwise create an instance of Location
            else {
              let location = new Location(query, data.body.results[0]);
            

              // Create a query string to INSERT a new record with the location data
              let newSQL = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING id;`;
              let newValues = Object.values(location);

              // Add the record to the database
              return client.query(newSQL, newValues)
                .then(result => {
            
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
          
          meetupsSummaries.forEach(summary =>{
            let newValues = Object.values(summary);
            newValues.push(request.query.data.id);
            return client.query(newSQL, newValues);
           
        })
        response.send(meetupsSummaries);
      })
       .catch(error =>handleError(error,response));
  }
})
}
//--------------------------Hiking------------------------------
function getTrails(request, response) {
  const SQL = `SELECT * FROM trails WHERE location_id=$1;`;
  const values =[request.query.data.id];

  return client.query (SQL, values)
    .then (result => {
      if(result.rowCount > 0){
        response.send(result.rows);
      } else {  
        const url =`https://www.hikingproject.com/data/get-trails?url&name&location&length&conditiondate&condition&stars&starVotes&summary&lat=${request.query.data.latitude}&lon=${request.query.data.longitude}0&maxDistance=10&key=${process.env.TRAILS_API_KEY}`


        superagent.get(url)
          .then (result =>{
            const trailSummaries =result.body.trails.map(trails => {
              const hike = new Trail(trails);
              return hike;
          });
        let newSQL =`INSERT INTO trails (trail_url,name,location,length,condition_date,condition_time,condition,stars,stars_votes,summary,location_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11);`;
  
        trailSummaries.forEach( summary =>{
            let newValues = Object.values(summary);
            newValues.push(request.query.data.id);
            return client.query(newSQL, newValues)
          
       })
       response.send(trailSummaries);
    })
     .catch(error =>handleError(error,response));
  }
})
}
//---------------------------Movies----------------------
function getMovies(request, response) {
  const SQL = `SELECT * FROM movies WHERE location_id=$1`;
  const values = [request.query.data.id];
  console.log('213', values);
  //Query the database
  return client.query(SQL, values)
    .then(result => {
      if (result.rowCount > 0) {
        console.log('From SQL');
        response.send(result.rows);
      } else {
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&language=en-US&query=${request.query.data.search_query}&page=1&include_adult=false`
console.log(url)
        superagent.get(url)
          .then(data => {
            const movieSummaries = data.body.results.map(movie => {
              const event = new Movie(movie)
              // console.log(event);
              return event;
            })
            let newSQL = `INSERT INTO movies(title, overview, average_votes, total_votes, image_url, popularity, released_on, location_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;

            movieSummaries.forEach(summary => {
              let newValues = Object.values(summary);
              newValues.push(request.query.data.id);
              //add record to database
              return client.query(newSQL, newValues)
                .catch(console.error);
            })
            response.send(movieSummary);
          })
          .catch(error => handleError(error, response));
      }
    })
}

//-------------------------------Yelp-------------------------------------------------
// function getYelp(request, response) {
//   const SQL = `SELECT * FROM yelp WHERE location_id=$1`;
//   const values = [request.query.data.id];
//   console.log('305', values);
//   //Query the database
//   return client.query(SQL, values)
//     .then(result => {
//       if (result.rowCount > 0) {
//         console.log('From SQL');
//         response.send(result.rows);
//       } else {
//         // Call to yelp
//         const url = `https://api.yelp.com/v3/businesses/search?location=${request.query.data.search_query}`;

//         superagent.get(url)
//           .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
//           .then(result => {
//             const yelpSummaries = result.body.businesses.map(yelp => {
//               const event = new Yelp(yelp)
//               // console.log('323', event);
//               return event;
//             })
//             let newSQL = `INSERT INTO yelps(name, image_url, price, rating, url, location_id) VALUES ($1, $2, $3, $4, $5, $6)`;
//             yelpSummaries.forEach(summary => {
//               let newValues = Object.values(summary);
//               newValues.push(request.query.data.id);
//               //add record to database
//               return client.query(newSQL, newValues)
//                 .catch(console.error);
//             })
//             response.send(yelpSummary);
//           })
//           .catch(error => handleError(error, response));
//       }
//     })
// }