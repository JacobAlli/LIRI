//set up node package requirements

var keys = require('./keys.js');

var request = require('request');

var omdb = require('omdb');

var twitter = require('twitter');

var client = new twitter({
	consumer_key: keys.twitter_consumer_key,
  	consumer_secret: keys.twitter_consumer_secret,
  	access_token_key: keys.twitter_access_token_key,
  	access_token_secret: keys.twitter_access_token_secret
});

var Spotify = require('node-spotify-api');

var spotify = new Spotify({
  	id: keys.spotify_client_ID,
  	secret: keys.spotify_client_secret
});

var fs = require('fs');

// set up command variables

//liri commands such as: my-tweets, spotify-this-song, movie-this
var liriCmd = process.argv[2];

//name of the spotify song or movie title depending on liriCmd...
var name = process.argv.splice(3).join('+');


//display tweets function
function myTweets(){
	//parameter for twitter handle
    var params = {screen_name: 'ZeeRealJacob'};

    //grab the statuses from the users timeline
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
	  	//error handler
        if (!error) {
	  		console.log('Successfully loaded Tweets');

            //go through the most recent 20 tweets and log to the console the text and the date created
	    	for(i=0; i<20; i++){
	    		console.log('#'+ (i+1) +':  '+ tweets[i].text +'  ||  '+ tweets[i].created_at);
	    	};
	  	}
	  	else{
	  		console.log(error);
	  	}
	});
};

//spotify song search function passing in the name of the song as an argument
function spotifyThisSong(songName){

    //request the song information from the spotify api
	spotify
  	.request('https://api.spotify.com/v1/search?q=*'+songName+'*&type=track')
  	.then(function(data) {

        //if the search yields no results run the noTrackResults function...
    	if(data.tracks.items.length === 0){
    		noTrackResults();
    	}
    	else{
    		console.log('Here is the number one song result from spotify based on your search criteria');
    		console.log('-');
    		console.log(data.tracks.items[0].name +'  ||  '+ data.tracks.items[0].artists[0].name+ '  ||  ' + data.tracks.items[0].preview_url + '  ||  Album: ' + data.tracks.items[0].album.name);
    		console.log('-');
    		console.log("Not what you're looking for? Here are some additional results containing your search criteria...");
    		console.log('-');
	    	for(i=1; i<data.tracks.items.length -1;i++){
	    		if(data.tracks.items[i].name.toLowerCase().includes(songName.toLowerCase().replace('+',' '))){
	    			console.log(data.tracks.items[i].name +'  ||  '+ data.tracks.items[i].artists[0].name+ '  ||  ' + data.tracks.items[i].preview_url + '  ||  Album: ' + data.tracks.items[i].album.name);
    			}
    		};
    	}
  	})
  	.catch(function(err) {
	    console.error('Error occurred: ' + err);
  	});
};

function movieResults(movieName){
    if(!movieName){
    	movieName = 'Mr+Nobody';
    }

    request('http://www.omdbapi.com/?apikey=trilogy&t='+movieName+'&plot=full', function(err, data, body){
        if(err){
            console.log(err);
        }
        else{
	    	var movieData = JSON.parse(data.body);
	        console.log(' ');
	        console.log('Here\'s some info on your movie:');
	        console.log(' ');
	        console.log('Movie Title: '+movieData.Title);
	        console.log('Released: '+movieData.Released);

	        checkForRatings('Internet Movie Database', movieData);
	        checkForRatings('Rotten Tomatoes', movieData);

	        console.log('Country: '+movieData.Country);
	        console.log('Language: '+movieData.Language);
	        console.log('Plot: '+movieData.Plot);
	        console.log('Cast: '+movieData.Actors);
	        console.log(' ');
    	}
    })
};

function doWhatItSays(){
	fs.readFile('random.txt', 'utf8', function(err, data){
		if(err){
			console.log(err);
		}
		liriCmd = data.split(',')[0];
		console.log(liriCmd);
		name = data.split(',')[1];
		console.log(name);
	})
}

function checkForRatings(vendor, movieData){
    do{
        var found = false;
        for(i=0; i<movieData.Ratings.length; i++){
            if(movieData.Ratings[i].Source === vendor){
                console.log(vendor+ ': '+movieData.Ratings[i].Value);
                return found = true;
            }
        }
        break;
    }while(!found);

    console.log(vendor+ ': no ratings found for '+vendor);
};

function noTrackResults(){
	console.log('No tracks match your search criteria, try the following track instead:');

	spotify
	.request('https://api.spotify.com/v1/tracks/0hrBpAOgrt8RXigk83LLNE')
	.then(function(data){
		console.log(data.name +'  ||  '+ data.artists[0].name + '  ||  ' + data.preview_url + '  ||  Album: ' + data.album.name);
	})
	.catch(function(err){
		console.error('Error occured: ' + err);
	});
};

switch(liriCmd){
	case 'do-what-it-says':
		fs.readFile('random.txt' ,'utf8', function(err, data){
			switch(data.split(',')[0]){
				case 'spotify-this-song':
					spotifyThisSong(data.split(',')[1]);
					break;
				case 'my-tweets':
					myTweets();
					break;
				case 'movie-this':
					movieResults(data.split(',')[1]);
					break;
				default:
					console.log('invalid data in your .txt file');
			};
		});
		break;
    case 'my-tweets':
        myTweets();
        break;
    case 'spotify-this-song':
        spotifyThisSong(name);
        break;
    case 'movie-this':
        movieResults(name);
        break;
    default:
        console.log("command is not valid, try again!");
};




