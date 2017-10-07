var fs = require("fs");
var request = require("request");               //omdb
var Spotify = require('node-spotify-api');    //spotify
var Twitter = require('twitter');                 //twitter
var keys = require("./keys.js");                // twitter keys
var validRequests = ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"];
var twitterConsumerKey = keys.consumer_key;
var twitterConsumerSecret = keys.consumer_secret;
var twitterAccessTokenKey = keys.access_token_key;
var twitterAccessTokenSecret = keys.access_token_secret;
var command = "";
var input = "";
var twitterID =  {user_id: '912479397604675584'};

function getTweets(){
  // create a new instance of a Twitter client
  var client = new Twitter({
    consumer_key: twitterConsumerKey,
    consumer_secret: twitterConsumerSecret,
    access_token_key: twitterAccessTokenKey,
    access_token_secret: twitterAccessTokenSecret
  });  // end new Twitter
  
  // request a list of tweets by twitter id
  client.get('statuses/user_timeline', twitterID, function(error, tweets, response){
    if (!error) {
      console.log(tweets);
      appendFile(tweets);
    } else {
      console.log(error);
    }  // end if error
  }); // end client.get
} // end function getTweets


function searchSpotify(){ 
// if no song was requested, set a default
   if (input.length === 0){
       input = "The Sign AND Ace of Base";
     }
  // create a new instance of Spotify client
    var spotify = new Spotify({
      id: "db0755177243460fb6001737f15b564f",
      secret: "41ebc86329ac4643a79925c863d2a523"
     });  // end new Spotify client
  
  // search for the song   
   spotify.search({ type: 'track', query: input ,limit:1}, function(err, data) {
   if (err) {
      return console.log('Error occurred: ' + err);
    }
   // put the data into variables
  var tracks = data.tracks.items;
  var artistsName = tracks[0].album.artists[0].name;
  var songName = tracks[0].name;
  var previewURL = tracks[0].preview_url;
  var albumName = tracks[0].album.name;
  // display the information on the command line
      var log = "Artist(s)" + artistsName;
      log += "\nSong Name: " + songName;
      log += "\nPreview URL: " + previewURL;
      log += "\nAlbum Name: " + albumName;
      console.log("Artist(s): " + artistsName + "\nSong Name: " + songName + "\nPreview URL: " + previewURL + "\nAlbum Name: " + albumName);
      appendFile(log);

  });  // end Spotify search request
}  // end function searchSpotify

function searchOMDB(){
console.log("in function searchomdb");
// if no movie was requested, use the default
  if (input.length === 0){
    input = "Mr.+Nobody";
  }
// Then run a request to the OMDB API with the movie specified
console.log("hit");
  request("http://www.omdbapi.com/?t=" + input+ "&y=&plot=short&apikey=40e9cece", function(error, response, body) {
  if (error){
   console.log(error);
  } else {
  // If the request is successful (i.e. if the response status code is 200), put the information into variables
  if (!error && response.statusCode === 200) {
    console.log("populating variables");
    var title = JSON.parse(body).Title;
    console.log("Title: " + title);
    var released = JSON.parse(body).Released;
    var imdbRating = JSON.parse(body).imdbRating;
    var rtRating = "Rating from Rotten Tomatoes is not available.";
    var producedIn = JSON.parse(body).Country;
    var language = JSON.parse(body).Language;
    var plot = JSON.parse(body).Plot;
    var actors = JSON.parse(body).Actors;
    var displayInfo = "Title: " + title + "\nReleased Date: " + released + "\nIMDB Rating: " + imdbRating + "\nRotten Tomatoes Rating: " + rtRating + "\nProduced in: " + producedIn + "\nLanguages spoken: " + language + "\nPlot: " + plot + "\nMajor Actors: " + actors;
// Rotten Tomatoes rating is the 2nd occurrence of Ratings
    if (JSON.parse(body).Ratings.length > 1){
       rtRating = JSON.parse(body).Ratings[1].Value;
      } 
// display the information on the command line
    console.log(displayInfo);
    console.log("calling appendFile");
    appendFile(displayInfo);

  } // end of if no error
}  // end of else
});  // end of OMDB search request
} // end of function searchOMDB


function readFile(){

fs.readFile("random.txt", "utf8", function(error, data) {
    if (error) {
       return console.log(error);
    }
  // Then split it by commas (to make it more readable)
    if (data.length > 0){
          var dataArr = data.split(",");
          command = dataArr[0];
          input = dataArr[1];

           getCommand();
    } // end of if there is data
}); // end of readFile
}  // end of function readFile


function getCommand(){

  switch(command) {
    case "my-tweets":
        getTweets();
        break;
    case "spotify-this-song":
        searchSpotify();
        break;
            case "movie-this":
            console.log("movie-this");
        searchOMDB();
        break;
    case "do-what-it-says":
         readFile();
        break;
    default:
        console.log("I don't understand. Please try again");
  }  //end of switch
}  //end of function getCommand


//   process starts here
var cmdLineText = process.argv;
command = cmdLineText[2];
// Capture all the words after the command line instructions (e.g. movie-this, spotify-this-song, etc.)
    for (var i = 3; i < cmdLineText.length; i++) {
// Build a string with the arguments.
        input = input + " " + cmdLineText[i];
}  // end of loop

// get the instruction
getCommand();


function appendFile(data){
  console.log("in appendfile: " + data);
  fs.appendFile("log.txt", data, function(err) {
    if (err) {
    console.log(err);
  }
  });
}

