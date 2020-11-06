var player;
var sourceEl;

function onYouTubeIframeAPIReady() {
  // sourceEl = 'live_and_recorded';
  sourceEl = 'live';
  videoId = 'ddFvjfvPnqk';

  player = new YT.Player(sourceEl, {
    videoId: videoId, // YouTube Video ID
    width: '100%',               // Player width (in px)
    height: '100%',              // Player height (in px)
    playerVars: {
      controls: 0,        // Show pause/play buttons in player
      showinfo: 0,        // Hide the video title
      modestbranding: 1,  // Hide the Youtube Logo
      loop: 1,            // Run the video in a loop
      fs: 0,              // Hide the full screen button
      cc_load_policy: 0, // Hide closed captions
      iv_load_policy: 3,  // Hide the Video Annotations
      autohide: 0         // Hide video controls when playing
    },
    events : {
     'onReady' : onPlayerReady
    }
  });
};

function onPlayerReady(event) {
  event.target.mute();
  event.target.playVideo();
}

$(document).ready(function () {
	//Determines if browser is unsupported
	testBrowsers();

	getPlaylist(5281179, true);

  //music controls
	$(".music-pause-play").on("click", function () {
		musicPauseAndPlay();
	})
	$(".music-next").on("click", function () {
		scNextStream();
	})

	//Toggles mute when the mute button is hit. Also adds the mute class to the button, which gets evaluated every time a new song loads
	$(".volume").on("click", function () {
		toggleMute();
	})

  //When the location toggle is turned off, stop displaying the location on top of the video
	$(".onoffswitch-label").on("click", function () {
    enabled = !$('#myonoffswitch').prop('checked');
    toggleRotateFeeds(enabled);
	})

	//When a nav button is clicked, animate the appropriate page down
	$(".nav-items li").on("click", function () {
		selectedNav($(this));
		activePage($(this));
		animatePageDown($(this));
	})
	//Sets the home page to already be displayed (skipping the animation)
	$(".active-page .content-animation").css("top", "0%");

	//When the location nav is clicked for the first time, add the Map to the UI
	// and then, with a callback function, update the location
	$(".location-nav").one("click", function () {
    position = {"lat": 0, "lon": 0};
		addMapToUI(position, function () {
			hasMapsBeenCalled = true;
			updatesLocationText(position);
			updatesLocationMap(position);
		});
    setISSLocation();
	})

	//When the HIT ME button is clicked, the music begins
	$(".hit-me").on("click", function () {
		$(".music-pause-play").css("pointer-events", "all");
		$(".music-next").css("pointer-events", "all");
		musicPauseAndPlay();
		$(".start").fadeOut(1000, function () {
			$(".social-share").fadeIn(1000);
		});
		$(".start").css("pointer-events", "none");
		$(".location-nav, .music-nav, .about-nav, .video-nav").css("color", "inherit");
		$(".location-nav, .music-nav, .about-nav, .video-nav").css("pointer-events", "all");
	});

	//When the "play without music?" link is clicked, only play the video
	$(".start p span").on("click", function () {
		$(".music-pause-play").css("pointer-events", "all");
		$(".music-next").css("pointer-events", "all");
		$(".start").fadeOut(1000, function () {
			$(".social-share").fadeIn(1000);
		});
		$(".start").css("pointer-events", "none");
		$(".location-nav, .music-nav, .about-nav, .video-nav").css("color", "inherit");
		$(".location-nav, .music-nav, .about-nav, .video-nav").css("pointer-events", "all");
	});

	//When the social share buttons are hovered over,
	//change the text of the CTA
	// $(".social-popup").on("mouseenter mouseleave", function () {
	// 	$(".social-share p").text("this is a test");
	// 	//console.log("hover enabled");
	// })

  $(".video-choices li").on("click", function () {
		var chosenVideo = $(this).attr("id");
		switchVideo(chosenVideo);
		$(".video-choices .selected").removeClass("selected");
		$(this).addClass("selected");
	})

	//Will get the playlist ID from the playlist that was clicked in the UI and begin
	//playing the new playlist
	$(".playlist-choices li").on("click", function () {
		var chosenPlaylist = $(this).attr("id");
		switchPlaylist(chosenPlaylist);
		$(".playlist-choices .selected").removeClass("selected");
		$(this).addClass("selected");
	})

	//When a share icon is clicked, open the appropriate share box
	$(".social-popup").on("click", function(e) {
	  	e.preventDefault();
		socialPopup($(this).attr("href"), 570, 612);
	})

	//Every 100ms, check to see if the songs and videos have finished loading so play can begin
	var intervalID = setInterval(function () {
		//if (videosLoaded & songsLoaded) {
    if (songsLoaded) {
			//console.log("songs loaded!");
			$(".music-text-bg").pause();
			clearInterval(intervalID);
			$(".spinner-container").fadeOut(500, function () {
				$(".start").fadeIn(500);
			})
		} else {
			//console.log("songs not loaded");
		}
	}, 100);

  // update iss location every 10 seconds
  setInterval(function() { setISSLocation(); }, 30000);
});

var feedTimer;

function toggleRotateFeeds(enabled) {
  if (!enabled) {
    clearInterval(feedTimer);
  } else {
    feedTimer = setInterval(function() {
      nextUp = $(".video-choices li.selected").next().attr('id')

      if (nextUp == undefined) {
        // we're at the end. Start at the top
        nextUp = $(".video-choices li").first().attr('id')
      }

      //console.log('will rotate feed to ' + nextUp);
  		switchVideo(nextUp);
  		$(".video-choices li.selected").removeClass("selected");
  		$(".video-choices li#" + nextUp).addClass("selected");
    }, 120000)
  }
}

var myBubble = [];
var myMap;
//This variable allows the updatesLocationMap function to run only
//after the map has been loaded.
var hasMapsBeenCalled = false;
function addMapToUI (i, callback) {
	myMap = new Datamap({
		element: document.getElementById('myMap'),
		height: null,
		fills: {
			defaultFill: "#999",
			"bubbleFill": "#03396c",
		},
		geographyConfig: {
			popupOnHover: false,
			highlightOnHover: false,
			borderColor: "#111",
		},
		data: {
			"bubbleFill": {fillKey: "bubbleFill"},
		},
		bubblesConfig: {
			borderWidth: 1,
        	borderColor: '#020F12',
        	popupOnHover: false,
        	fillOpacity: 0.75,
        	highlightOnHover: false,
        	highlightFillColor: '#020F12',
		}
	})
	callback();
}

//This function updates the map bubble and the location text
var geoPosition = "";
var lat;
var lng;
function updatesLocationText (position) {
	//$(".location-overlay").finish();
	//$(".location-overlay").css("opacity", "1");
	if (position.lat == undefined || position.lon == undefined) {
		geoPosition = null;
		$(".location-text").text("Mystery location!");
		//$(".location-overlay").empty();
	} else {
		lat = position.lat;
		lng = position.lon;
		geoPosition = lat + "," + lng;
		//console.log(geoPosition);
		reverseGeocode(geoPosition);
	}
}

function updatesLocationMap (position) {
	if (hasMapsBeenCalled) {
		if (geoPosition === null) {
			myBubble = [];
			myMap.bubbles(myBubble);
		} else {
			myBubble = [{
				radius: 10,
				latitude: position.lat,
				longitude: position.lon,
				fillKey: "bubbleFill",
				borderColor: "#000",
				borderWidth: 1,
			}];
			myMap.bubbles(myBubble);
		}
	}
}

function setISSLocation() {
  $.get('http://api.open-notify.org/iss-now.json', function(data) {
    var lat = data.iss_position.latitude;
    var lon = data.iss_position.longitude;

    position = {
      lat: lat,
      lon: lon
    }

    updatesLocationMap(position);
    updatesLocationText(position);
  });
}

//This function gets called when adding Metadata to the UI, and takes the longitude and latitude
// of the ISS and converts it to an address: locality, administrative_level_1, country
function reverseGeocode (position) {
  //console.log('reverseGeocode');
	//$(".location-text").empty();
	// /$(".location-overlay").empty();
  $(".location-text").html('Current ISS position:<br><br>' + position);
  return;
	loadGoogleResults(position, function (result) {
		//console.log(result);
    if (result.status === 'ZERO_RESULTS') {
      $(".location-text").html('Current ISS position:<br><br>' + position);
      return;
    }
		$(".location-text").html('Current ISS position:<br><br>' + getAddressString(result) + '(' + position + ')');
		//$(".location-overlay").append('<p class="location-overlay-text">' + getAddressString(result) + '</p>')
	});
}

function getAddressString (result) {
	var fullAddress = result.results[0].formatted_address;
	var addressParts = [];
	addressParts.push(getResultEntryOfType(result, "locality"));
	addressParts.push(getResultEntryOfType(result, "sublocality_level_1"));
	addressParts.push(getResultEntryOfType(result, "administrative_area_level_1"));
	addressParts.push(getResultEntryOfType(result, "country"));
	addressParts = _.compact(addressParts);
	var strippedAddress = addressParts.join(", ");
	return strippedAddress;
}

function loadGoogleResults (position, callback) {
	$.ajax({url: "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + position})
	 .done(callback)
	 .fail(function (error) {
		//console.log("error!");
		//console.log(error);
	});
}

function getResultEntryOfType (result, type) {
	var addressComponents = result.results[0].address_components;
	for (i = 0; i < addressComponents.length; i++) {
		if (addressComponents[i].types[0] == type) {
			return addressComponents[i].long_name;
		}
	}
}

//SOUNDCLOUD API
var soundcloudTracks = [];
var currentSound = "";
var songPosition = 0;
function getPlaylist (playlistID, onFirstMusicLoad) {
	$.ajax({
		url: "https://api.soundcloud.com/playlists/" + playlistID + ".json?client_id=0e790e28fcdf924f78f80375ad74fcb8",
		dataType: "json",
		type: "GET",
	})
	.done(function (result) {
		//console.log(result);
		soundcloudTracks = result.tracks;
		shuffle(soundcloudTracks);
		initializePlaylist(onFirstMusicLoad);
	})
	.fail(function (error) {
		//console.log("error: " + error);
	})
}

function shuffle (o) {
	for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

var songsLoaded = false;
function scStream (songPosition, onFirstMusicLoad) {
	SC.stream("/tracks/" + soundcloudTracks[songPosition].id, function (sound) {
		currentSound = sound;
		checkMute(); //checks to see if the music has already been muted
		currentSound.play({
			onfinish: function () {
				scNextStream();
			}
		});
		if (onFirstMusicLoad) {
			musicPauseAndPlay();
		}
		// sets songsLoaded to true once the song is ready to play
		songsLoaded = true;
	})
}

function scStopStream () {
	currentSound.stop();
}

function scTogglePause () {
  try {
	   currentSound.togglePause();
   } catch(err) {

   }
}

function musicPauseAndPlay () {
  try {
    if (currentSound.paused) {
      scTogglePause();
      toMusicPauseButton();
      //uses Pause JS library to resume the songProgress animation
      $(".music-text-bg").resume();
    } else {
      scTogglePause();
      toMusicPlayButton();
      //uses Pause JS library to pause the songProgress animation
      $(".music-text-bg").pause();
      // //console.log("THIS BAD BOY PAUSED THE PROGRESS BAR");
    }
  } catch(err) {

  }
}

function toMusicPauseButton () {
	$(".music-pause-play i").removeClass("fa-play").addClass("fa-pause");
}

function toMusicPlayButton () {
	$(".music-pause-play i").removeClass("fa-pause").addClass("fa-play");
}

function scNextStream () {
	if (songPosition < soundcloudTracks.length - 1) {
		scStopStream();
		songPosition++;
		scStream(songPosition);
		addSongMetadataToUI(songPosition);
		toMusicPauseButton();
	} else {
		scStopStream();
		songPosition = 0;
		scStream(songPosition);
		addSongMetadataToUI(songPosition);
		toMusicPauseButton();
	}
}

function initializePlaylist (onFirstMusicLoad) {
	SC.initialize({
	  client_id: '0e790e28fcdf924f78f80375ad74fcb8'
	});
	scStream(0, onFirstMusicLoad);
	addSongMetadataToUI(0);
}

function addSongMetadataToUI (i) {
	var songTitle = soundcloudTracks[i].title;
	$(".title").text(songTitle);

	var uploader = soundcloudTracks[i].user.username;
	$(".uploader").text("Uploaded by: " + uploader);

	var sourceLink = soundcloudTracks[i].permalink_url;
	$(".sc-logo").attr("href", sourceLink);


	// Resets the songProgress bar
	$(".music-text-bg").finish();
	$(".music-text-bg").css("background-position", "100% 0%");
	// Calls the songProgress method to start tracking progress
	songProgress(i);
}

function songProgress (i) {
	var songTime = soundcloudTracks[i].duration; //time in milliseconds
	$(".music-text-bg").animate({
		"background-position": "0%"
	}, songTime, "linear");
}

function toggleMute () {
	currentSound.toggleMute();
	$(".volume").toggleClass("muted");
	if ($(".volume i").hasClass("fa-volume-up")) {
		$(".volume i").removeClass("fa-volume-up").addClass("fa-volume-off");
	} else {
		$(".volume i").removeClass("fa-volume-off").addClass("fa-volume-up");
	}
	//console.log("toggleMute executed");
}

function checkMute () {
	var volumeButton = $(".volume")
	if (volumeButton.hasClass("muted")) {
		currentSound.mute();
	}
}

//This function will switch the playlist to the one selected in the UI
function switchPlaylist (playlistID) {
	scStopStream();
	getPlaylist(playlistID);
	toMusicPauseButton();
}

function switchVideo (videoID) {
  // console.log(videoID);
  $('.video-box').empty();
  player = null;

  if (videoID === 'live_and_recorded') {
    $('.video-box').html('<div id="live_and_recorded"></div>');
    sourceEl = 'live_and_recorded';
    onYouTubeIframeAPIReady();
  } else if (videoID === 'live') {
    $('.video-box').html('<iframe id="live" src="https://www.ustream.tv/embed/17074538?html5ui&amp;autoplay=true&amp;controls=false&amp;volume=0.0" frameborder="0" allowfullscreen="" webkitallowfullscreen="" scrolling="no" width="100%" height="100%"></iframe>');
  } else if (videoID === 'onboard') {
    $('.video-box').html('<iframe id="onboard" src="https://www.ustream.tv/embed/9408562?html5ui&amp;autoplay=true&amp;controls=false&amp;volume=0.0" frameborder="0" allowfullscreen="" webkitallowfullscreen="" scrolling="no" width="100%" height="100%"></iframe>');
  }
}

//A bunch of functions related to the UI

//This function adds a class "selected" to the nav tab that has been selected
function selectedNav (navClicked) {
	$(".nav-items .selected").removeClass("selected");
	$(navClicked).addClass("selected");
}

//This funtion returns the pageClass for a given nav element that was clicked
function navToPageClass (navClicked) {
	var pageClass = "";
	if (navClicked.hasClass("home-nav")) {
		pageClass = ".home-page";
		//console.log("home-nav was selected");
	} else if (navClicked.hasClass("location-nav")) {
		pageClass = ".location-page";
		//console.log("location-nav was selected");
	} else if (navClicked.hasClass("music-nav")) {
		pageClass = ".music-page";
		//console.log("music-nav was selected");
	} else if (navClicked.hasClass("video-nav")) {
		pageClass = ".video-page";
		//console.log("video-nav was selected");
	} else if (navClicked.hasClass("about-nav")) {
		pageClass = ".about-page";
		//console.log("about-nav was selected");
	}
	return pageClass;
}

//this function displays the correct page that was selected in the nav by toggling
//the active-page class

function activePage (navClicked) {
	var pageClass = navToPageClass(navClicked);
	// This resets the work done by the animatePageDown() function
	$(".active-page .content-animation").css("top", "-100%");

	$(".active-page").removeClass("active-page");
	$(pageClass).addClass("active-page");
}

//When called, slides the content from a tab into view. Within the activePage function,
//The slide gets reset to the top
function animatePageDown (navClicked) {
	var pageClass = navToPageClass(navClicked);
	$(pageClass + " .content-animation").animate({
		"top": "0%"
	}, 500, "easeOutCirc");
}

function testBrowsers () {
	if ((bowser.msie && bowser.version < 11) ||
		(bowser.chrome && bowser.version < 32) ||
		(bowser.firefox && bowser.version < 35) ||
		(bowser.mobile) ||
		(bowser.tablet)) {
	  //console.log("this is a non-supported device or browser");
	$(".overlay").toggle();
	} else {
		//console.log("this IS supported");
	}
}

function socialPopup (url, width, height) {
	var left = (screen.width / 2) - (width / 2),
		top = (screen.height / 2) - (height / 2);

	window.open(
	    url,
	    "",
    	"menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=" + width + ",height=" + height + ",top=" + top + ",left=" + left
  	);
}
