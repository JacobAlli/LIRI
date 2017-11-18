
var keys = require('./keys.js');

var request = require('request');



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



var liriCmd = process.argv[2];

var songName = process.argv.splice(3).join('+');


function myTweets(){
	var params = {screen_name: 'ZeeRealJacob'};

	client.get('statuses/user_timeline', params, function(error, tweets, response) {
	  	if (!error) {
	  		console.log('Successfully loaded Tweets');

	    	for(i=0; i<20; i++){
	    		console.log('#'+ (i+1) +':  '+ tweets[i].text +'  ||  '+ tweets[i].created_at);
	    	};
	  	}
	  	else{
	  		console.log(error);
	  	}
	});
};

function spotifyThisSong(songName){

	spotify
  	.request('https://api.spotify.com/v1/search?q=*'+songName+'*&type=track')
  	.then(function(data) {
    	
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

// myTweets();


spotifyThisSong(songName);

