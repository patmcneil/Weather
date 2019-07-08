<!doctype html>
<html lang="en">
	<head>
	<!-- Required meta tags -->
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		<!-- Bootstrap CSS -->
		<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
		<link rel="stylesheet" href="css/style.css">
		<title>Weather Dashboard</title>
	</head>
	<body class="d-flex align-items-center">
		<div id="ajax-loader" class="d-none">
			<img src="/images/ajax-loader.gif"/>
		</div>
		<div id="alert-row" class="text-center d-none">
			<!-- alerts are added via JS -->
		</div>
		<div class="container-fluid">
			<div id="primary-row" class="row align-items-center">
				<div class="col-6" style="border-right:1px solid #333;">					
					<div class="row align-items-center justify-content-center">
						<div class="col-4 text-center">
							<div id="current-weather-icon">
								<div class="icon">
									<!-- The icon is a background image -->
								</div>
							</div>							
						</div>
						<div class="col-4 text-center">
							<div id="current-temp" class="temp lh-1"></div>							
						</div>
						<div class="col-4 text-center">
							<div id="current-humidity"></div>
							<div id="current-wind"></div>
							<div id="current-pressure">
								<span>Pressure </span> <span class="mb"></span>
								<!-- <div class="gauge">
									<div class="previous"></div>
									<div class="current"></div>
									<div class="previous-max"></div>
									<span class="mb"></span>
								</div> -->
							</div>							
						</div>
					</div>
				</div>
				<div class="col h-100 d-flex align-items-center justify-content-center">
					<div id="current-time-date" class="row lh-1 text-center">
						<div class="col-12">
							<h2><span class="day"></span> <span class="date"></span></h2>
						</div>
						<div class="col-12">
							<span class="time"></span>
						</div>						
					</div>
				</div>
			</div>
			<div id="secondary-row" class="row align-items-center">
				<!-- Forecast buckets are generated via JS -->
			</div>
			<div id="tertiary-row" class="row align-items-center justify-content-between">
				<!-- Forecast buckets are generated via JS -->
			</div>
		</div>
		<script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
		<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
		<script src="js/main.js"></script>
	</body>
</html>