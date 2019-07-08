<?php
require '../vendor/autoload.php';

// @NOTE: The credientials file holds just 3 variables needed for the API to return data.
// Copy/paste the variables below into a PHP file named "credentials.php" in the same directory as
// ajax.php and edit to include your own info.

// $dark_sky_api_key = '68aef0fda19b6c9c8ebc9ae8ee43343c'; // Your Dark Sky API key.
// $forecast_latitude = 40.730610; // Decimal notation of forecast point latitude.
// $forecast_longitude = -73.935242; // Decimal notation of forecast point longitude.

require 'credentials.php';

if( isset( $_GET['action'] ) && $_GET['action'] !== '' ){
	$ajax_action = $_GET['action'];
}else{
	$ajax_action = ( !empty( $_POST['action'] ) && $_POST['action'] !='') ? $_POST['action'] : '';
}

if(!empty( $_SERVER['HTTP_X_REQUESTED_WITH'] ) && strtolower( $_SERVER['HTTP_X_REQUESTED_WITH'] ) == 'xmlhttprequest'){
	// Always serve up some JSON.
	header('Content-type: application/json');

	if( $ajax_action !='' ){
		if( $ajax_action == 'get_current_forecast' ){

			$headers = array('Accept' => 'application/json');
			$response = Unirest\Request::get('https://api.darksky.net/forecast/'.$dark_sky_api_key.'/'.$forecast_latitude.','.$forecast_longitude, $headers);

			if( $response->headers[0] == 'HTTP/1.1 200 OK' ){
				exit('{"status":"success","weather":'.json_encode($response->body,true).'}');
			}else{
				exit('{"status":"error", "message":"The Dark Sky weather service respnded with an HTTP status other than 200."}');
			}
		}
	}

}else{
	// Not an AJAX request? --Redirect back where they came from or at least the homepage.
	$referrer = (isset($_SERVER['HTTP_REFERER']) && $_SERVER['HTTP_REFERER']!='') ? $_SERVER['HTTP_REFERER'] : 'https://'.$_SERVER["HTTP_HOST"];
	header("Location: $referrer");
}