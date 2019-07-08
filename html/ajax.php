<?php
require '../vendor/autoload.php';

// @NOTE: Edit "weather-config-sample.php" to include your own info and rename it to "weather-config.php" 

require 'weather-config.php';

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