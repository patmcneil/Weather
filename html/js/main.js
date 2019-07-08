jQuery.noConflict();

jQuery( document ).ready(function(){

	setInterval(function(){
		// Update the date and time every second
		setTimeAndDate();
	}, 1000);

	// Get the forecast on initial page load.
	getCurrentForecast();

	setInterval(function(){
		// Checks the forecast/current conditions every 5 minutes... 1000 request/day API limit
		// As per Darksky: "Next-hour minutely forecast data is updated every five minutes. Hourly and daily forecast data are updated every hour. Severe weather alerts are updated in real-time."
		getCurrentForecast();
	}, 5*60*1000);

	setTimeout(function(){
		// Not sure this is what I want.
		// Fires at midnight of the day that the page is loaded.
		// Set atmospheric pressure "past" marker for visual pressure reference 
		
		// setPressureGauge('past', window.pressure );

		// @TODO: Replace this with a simple up/down arrow to show if it's rising or falling in the last 24 hours.
		
		setInterval(function(){
			// Then continues to fire every midnight from then on.
			// setPressureGauge('past', window.pressure );
		}, 24*60*60*1000);
	}, msToMidnight());

});

function getCurrentForecast(){
	jQuery('#ajax-loader').removeClass('d-none');

	jQuery.ajax({
		url: 'ajax.php?action=get_current_forecast',
			method: 'POST',
			data: {
				"segment_url": jQuery('#segment-url').val()
			},
			success: function(data){
				if( data.status == 'success' ){
					if( data.weather.alerts ){
						jQuery('#alert-row').empty();
						var delayCount = 0;
						jQuery( data.weather.alerts ).each(function(key, value){
							$weatherAlert = jQuery('<div class="weather-alert '+data.weather.alerts[key].severity+'"></div>');
							jQuery($weatherAlert).append('<marquee scrolldelay="'+(60+delayCount*5)+'"><strong>'+data.weather.alerts[key].title+'</strong> '+data.weather.alerts[key].description+'</marquee>');
							jQuery('#alert-row').append($weatherAlert);
							delayCount++;
						});						
						jQuery('#alert-row').removeClass('d-none');
					}else{
						jQuery('#alert-row').addClass('d-none');
					}

					// Populate current conditions
					jQuery('#current-temp').text( Math.round(data.weather.currently.temperature) );
					jQuery('#current-humidity').text('Humidity '+Math.round(data.weather.currently.humidity*100)+'%');

					// Set the global pressure variable
					window.pressure = Math.round(data.weather.currently.pressure)
					// Set the current pressure indicator					
					//setPressureGauge('current', window.pressure );
					jQuery('#current-pressure .mb').text(window.pressure+' mb');


					jQuery('#current-wind').text('Wind '+Math.round(data.weather.currently.windGust)+' mph');
					// @NOTE: Wind bearing is reported as the direction the wind is blowing FROM (like a weather vane). I find this hard to visualize, so invert I it in the CSS rotation to have the arrow point WITH the wind instead of into it.
					jQuery('#current-wind').append('<div class="wind-dir" style="transform:rotate(-'+data.weather.currently.windBearing+'deg)"></div>');
					
					// Update current weather icon.
					jQuery('#current-weather-icon .icon').removeClass().addClass('icon '+data.weather.currently.icon);

					// 8-hour forecast
					jQuery('#secondary-row').empty();

					var forecastHours = 8;
					for (var i = 1; i <= forecastHours; i++) {
						var theHour = convertUnixTime( data.weather.hourly.data[i].time, 'hours');
						var $forecastBucket = jQuery('<div class="col h-100 hourly-forecast-bucket text-center"></div>');

						jQuery($forecastBucket).append('<div class="row"></div>');
						jQuery($forecastBucket).find('.row').append('<div class="col-12 mb-3"><span class="time">'+theHour+'</span></div>');
						jQuery($forecastBucket).find('.row').append('<div class="col-6"><div class="forecast-weather-icon '+data.weather.hourly.data[i].icon+'"></div>');
						jQuery($forecastBucket).find('.row').append('<div class="col-6"><div class="row h-100 align-content-center"><div class="col"><div class="temp">'+Math.round(data.weather.hourly.data[i].temperature)+'</div></div></div></div></div>');
						
						// Shows a rain % chance, not sure I want this hourly. Lots of useless data. The icon shows if rain is likely or not.
						//jQuery($forecastBucket).find('.row .col').append('<div class="precip-chance">'+Math.round(data.weather.hourly.data[i].precipProbability*100)+'%</div>');	

						if( data.weather.hourly.data[i].precipProbability <= 0.25 ){
							jQuery($forecastBucket).find('.precip-chance').addClass('low');
						}
						jQuery('#secondary-row').append($forecastBucket);
					}

					// Upcoming days forecast
					jQuery('#tertiary-row').empty();					

					// Loops for the number of days to give a summary for in the future, starting with today (0)
					var forecastDays = 3;
					for (var i = 0; i <= forecastDays; i++) {
						var forecastDay = convertUnixTime( data.weather.daily.data[i].time, 'day');
						var today = convertDayNumber( new Date(Date.now()).getDay() );
						forecastDay = (forecastDay == today)?'Today':forecastDay;

						var $forecastBucket = jQuery('<div class="col-3 daily-forecast-bucket"><div class="daily-wrap"></div></div>');
						jQuery($forecastBucket).find('.daily-wrap').append('<h3 class="text-center mb-4 pb-3">'+forecastDay+'</h3>');
						jQuery($forecastBucket).find('.daily-wrap').append('<div class="row"></div>');						
						jQuery($forecastBucket).find('.daily-wrap .row').append('<div class="col"><div class="forecast-weather-icon '+data.weather.daily.data[i].icon+'"></div></div>');

						var precipType = (data.weather.daily.data[1].precipType)?data.weather.daily.data[1].precipType:'Rain';
						precipType = precipType.charAt(0).toUpperCase() + precipType.slice(1);
						jQuery($forecastBucket).find('.daily-wrap .row').append('<div class="col text-left"><h4>High: <span class="high temp">'+Math.round(data.weather.daily.data[i].temperatureHigh)+'</span></h4><h4>Low: <span class="low temp">'+Math.round(data.weather.daily.data[i].temperatureLow)+'</span></h4><h4 class="precip-chance">'+precipType+': '+Math.round(data.weather.daily.data[i].precipProbability*100)+'%</h4></div>');
						jQuery($forecastBucket).find('.daily-wrap .row').append('<div class="col-12 text-center mt-3">'+data.weather.daily.data[i].summary+'</div>')

						if( data.weather.daily.data[i].precipProbability <= 0.25 ){
							jQuery($forecastBucket).find('.precip-chance').addClass('low');
						}
						jQuery('#tertiary-row').append($forecastBucket);
					}

					// Check to see if before or after today's sunset time and if so, apply the righttheme class
					// Come back to this, not sure if I want it right now. // The function is set to just return false
					setThemeColor(data.weather.daily.data[0].sunriseTime, data.weather.daily.data[0].sunsetTime);
				}else{
					console.warn('AJAX completed but there was a problem with the data.');
				}
			},
			error: function(data){
				console.warn('There was some AJAX error.');
			},
			complete: function(data){
				jQuery('#ajax-loader').addClass('d-none');
			}
	});
};

function setTimeAndDate(){
	// Based on system time, so make sure to set it correctly
	var date = new Date();
	jQuery('#current-time-date .day').text( convertDayNumber( date.getDay() )+' -' );
	jQuery('#current-time-date .date').text ((date.getMonth()+1)+" / "+date.getDate()+" / "+date.getFullYear() );
	jQuery('#current-time-date .time').text( date.toLocaleTimeString([], {hour12:true, hour:"numeric", minute:"numeric"}	));
}

function setThemeColor( sunriseTime, sunsetTime ){
	var currentUnixTime =  Math.round( new Date().getTime() / 1000 ) ;
	var unixMidnight = new Date();
	unixMidnight.setHours(0,0,0,0);
	unixMidnight = Math.round(unixMidnight.getTime() / 1000);	

	if( currentUnixTime < sunriseTime || currentUnixTime > sunsetTime ){
		return false;
		// We're between sunset and sunrise
		if( currentUnixTime > sunsetTime && currentUnixTime < unixMidnight - (2*60*60) ){
			// We're between sunset and 10pm (12pm - 2hrs)
			// @TODO: This isn't working so I falsed it out above
			jQuery('body').removeClass('light dark').addClass('warm');
		}else{
			jQuery('body').removeClass('light').addClass('dark');
		}		
	}else{
		jQuery('body').removeClass('dark').addClass('light');
	}
}

function convertUnixTime( unixTimestamp, request ){
	// Create a new JavaScript Date object based on the timestamp
	// multiplied by 1000 so that the argument is in milliseconds, not seconds.
	var date = new Date(unixTimestamp*1000);
	var day = date.getDay();
	// Hours part from the timestamp
	//var hours = date.getHours(); // this is default 24 hour time
	var hours = (date.getHours() + 24) % 12 || 12; // convert to 12 hour time
	// Minutes part from the timestamp
	var minutes = "0" + date.getMinutes();
	// Seconds part from the timestamp
	var seconds = "0" + date.getSeconds();
	// Will display time in 10:30:23 format
	var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);	

	// What to return?
	if( request == 'day' ){
		return convertDayNumber( day );
	}
	if( request == 'hours' ){
		if( date.getHours() <= 12 ){
			return hours + ' AM';
		}else{
			return hours + ' PM';
		}
	}	
}

function setPressureGauge ( whichPressure, currentPressure ){
	var minPressure = 940;
	var maxPressure = 1060;
	var pressureDiff = currentPressure - minPressure;

	if( whichPressure == 'past' ){
		jQuery('#current-pressure .gauge .previous').css('width', (pressureDiff/(maxPressure-minPressure))*100+'%');
		jQuery('#current-pressure .gauge .previous-max').css('left', (pressureDiff/(maxPressure-minPressure))*100+'%');
	}else if( whichPressure == 'current' ){
		jQuery('#current-pressure .gauge .current').css('width', (pressureDiff/(maxPressure-minPressure))*100+'%');
	}
}


function degreeToCompass( degree ){
	var bearing = 'R'; // If this shows, there was an error.

	if( degree >= 0.00 && degree <= 22.5 ){ bearing = 'N'; }
	if( degree > 22.5 && degree <= 67.5 ){ bearing = 'NE'; }
	if( degree > 67.5 && degree <= 112.5 ){ bearing = 'E'; }
	if( degree > 112.5 && degree <= 157.5 ){ bearing = 'SE'; }
	if( degree > 157.5 && degree <= 202.5 ){ bearing = 'S'; }
	if( degree > 202.5 && degree <= 247.5 ){ bearing = 'SW'; }
	if( degree > 247.5 && degree <= 292.5 ){ bearing = 'W'; }
	if( degree > 292.5 && degree <= 337.5 ){ bearing = 'NW'; }
	if( degree > 337.5 && degree <= 360.0 ){ bearing = 'N'; }

	return bearing;
}

function convertDayNumber( dayNumber ){
	switch (dayNumber){
		case 1: return 'Monday'; break;
		case 2: return 'Tuesday'; break;
		case 3: return 'Wednesday'; break;
		case 4: return 'Thursday'; break;
		case 5: return 'Friday'; break;
		case 6: return 'Saturday'; break;
		case 0: return 'Sunday'; break;
		default: return 'Day Error';
	}
}

function msToMidnight(){
	var midnight = new Date();
	var midnight = midnight.setHours(24,0,0,0);
	var timeNow = new Date().getTime();
	return (midnight - timeNow);
}