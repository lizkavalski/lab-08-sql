##liz-301-lab8
Author: Elizabeth Kavalski
Version: 
  -1.0.0: Proof of life
  -1.0.1: Location to render on the page
  -1.0.1: Weather to render on the page
  -1.1.0: Stored past searches in a database(SQL) and retrived them.
  -1.1.1: Location information into the basebase.
  -1.1.2: Weather information into the basebase.
  -1.1.1: Meetups to render on the page.
  -1.1.2: Hiking trails to render on the page.
#Overview
  -To allow a user to search for a place and based on the search give the weather, restrunts, movies, Meetups, and hikes in the area. (This runs the backend of the appcation) 

#Getting Started
-At this point the steps that a user must take in order to build this app on their own machine and get it running is you will need to `git clone` this repo, then run a `npm i` to insteall the depenencies on to your local machine. You also need to clone `city-explorer-front-end` from codefellows/seattle-301d44 to run the front-end, as this apps is the back-end. Once the code is open on your machine open a new file name called `.env` as this file will store your port, and API infomation. 

For testing run the `city-explorer-front-end`on `live-server`. Then open in a terminal the nodemon, and pqsl. The nodemon should say which port it listening to. the nodemon should match the port number that is set in the code. When the page open up type in `localhost:` and whichever port number is supposed to be listening to. It should change it view and ask for a location at that point type in a city name. Then based on the city the infomation should related weather, meetup, trails, movies, and restrants. 

Architecture
The site will be using JS server, express,pg, core, dotenv and superagant.Then also a .gitgnore and a .eslintrc.json file. The use of nodemon for feedback on errors.

Change Log
02-20-2019 9:30am datbase added
02-20-2019 9:50am lacation
02-20-2019 6:00pm weather
02-20-2019 5:00pm Meetups
02-27-2019 6:00pm Deploment on Heruko
02-28-2019 5:30pm Trials

Credits and Collaborations
DarkSkys, Google maps, Meetups, Yelp, Hiking Project, Movie Database, and codefellow/seattle-301d44

LAB 8 FEATURES

Number and name of feature:_2)_Making_of_the_database_(SQL)_and_show_on_the_webpage

Estimate of time needed to complete: _10 mins____

Start time: __9:00am___

Finish time: _9:30am____

Actual time needed to complete: _30_mins__


Number and name of feature:_2)_location_connecting_to_database_(SQL)_and_show_on_the_webpage

Estimate of time needed to complete: _10 mins____

Start time: __9:35am___

Finish time: _9:50am____

Actual time needed to complete: _15_mins_(pre-done)__


Number and name of feature:_3)_Weather_connecting_to_database(SQL)._and_show_on_the_webpage

Estimate of time needed to complete: _ 20 mins____

Start time: __9:55am___

Finish time: __6:00pm___

Actual time needed to complete: __7 hrs_(nodmon was having issues)___


Number and name of feature:_3. Meetup to conncet to the database(SQL)_and_show_on_the_webpage

Estimate of time needed to complete: _ 1 hr____

Start time: __9:00am___

Finish time: __5:00pm___

Actual time needed to complete: __3 hrs___


Number and name of feature:_4.Deploymenet.__

Estimate of time needed to complete: _5 mins____

Start time: __5:30pm___

Finish time: __6:00pm___

Actual time needed to complete: __30min___


Number and name of feature:_5)Trails_connected_to_the_database(SQL)_and_show_on_the_webpage

Estimate of time needed to complete: _ 1hr____

Start time: __7:00pm_________

Finish time: __5:00pm___

Actual time needed to complete: __2_days___


Number and name of feature:_6)Movies_connceted_to_the_database(SQL)_and_show_on_the_webpage.

Estimate of time needed to complete: _ 1 hr____

Start time: __7:00pm___

Finish time: _____

Actual time needed to complete: _____


