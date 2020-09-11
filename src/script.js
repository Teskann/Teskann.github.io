// Circle points from a center and a radius ____________________________________

/**
 * Returns the geoJSON circle of center [lat0, lng0] with
 * radius r on a sphere (Earth)
 * 
 * @param {number} lat0 Latitude of the center of the circle in degrees
 * @param {number} lng0 Longitude of the center of the circle in degrees
 * @param {number} r Circle radius in meters
 * @param {integer} nbPoints Number of points that are calculated
 */
function latlngCircle(lat0, lng0, r, nbPoints)
{
    center = [lng0, lat0];

    // Conversion to radians
    lat0 *= 0.01745329251;
    lng0 *= 0.01745329251;

    Rt = 6371000;           // Earth radius (meters)

    // Limitation if the distance is greater than 1 quater of earth tour
    if(r > Rt*Math.PI/2)
    {
        r = Rt*Math.PI/2;
    }

    // GeoJSON string describing the circle
    var geojson = '{"type":"FeatureCollection","features":[';
    geojson += '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[['

    firstPoint = '';    // first geojson polygon point = last gj polygon point
    halfCircle1 = '';   // North => West => South half circle
    halfCircle2 = '';   // South => East => North half circle

    // For every point of the circle
    for(let alpha = 0; alpha < Math.PI; alpha += 2*Math.PI/nbPoints)
    {
        lat = lat0 - r/Rt * Math.cos(alpha);

        // If the north Pole is in the circle
        if (lat >= Math.PI/2)
        {
            lat -= (lat - Math.PI/2)
        }

        // Latitude => Longitude
        a = Math.pow(Math.sin(0.5*r/Rt), 2);
        b = Math.pow(Math.sin(0.5*(lat-lat0)), 2);
        c = Math.cos(lat)*Math.cos(lat0);
        s = Math.sqrt(Math.abs(a-b)/c);
        lng = 2*Math.asin(s)

        // Conversion to degrees
        lat *= 57.2957795131;
        lngDeg = lng * 57.2957795131;
        lng0Deg = lng0 * 57.2957795131;
        lng1 = lng0Deg - lngDeg;
        lng2 = lng0Deg + lngDeg;

        // Saving the first point because the last has to be the same
        if(alpha == 0)
        {
            firstPoint = '['+lng2+','+lat+']';
        }

        halfCircle1 = '['+lng1+','+lat+'],' + halfCircle1;
        halfCircle2 += '['+lng2+','+lat+'],'
    }

    // JSON formatting
    geojson += halfCircle2 + halfCircle1 + firstPoint + 
    ']]},"properties":{}},' + '{"type":"Feature","geometry":{"type":"Point",'+
    '"coordinates":[' + center[0] + ',' + center[1] + ']},"properties":{}}]}';

    return geojson;
}

// Horizon distance ____________________________________________________________

/**
 * Distance or the horizon in meters  (following the Earth curvature, not with a
 * straight line)
 * @param {number} z Elevation over the sea level in meters
 */
function horizonDistance(z)
{
    Rt = 6371000;       // Earth Radius in meters
    let gamma = Math.acos(Rt/(Rt+z))
    return gamma * Rt;
}

// Getting elevation from latitude and longitude _______________________________

/**
 * Getting  the  elevation  of  a  point from its GPS coordinates by calling the
 * open-elevation API.
 * @param {number} lat Latitude in degrees
 * @param {number} lng Longitude in degrees
 * @param {boolean} way True if the object is a way, false if it is a Node
 */
function getElevation(lat, lng, way)
{
    var request = new XMLHttpRequest();

    var elevation;

    request.open('GET', 'https://elevation.racemap.com/api?lat=' + lat +
    '&lng=' + lng, false);
    request.onload = function () {
        // Begin accessing JSON data here
        var data = JSON.parse(this.response);

        if (request.status >= 200 && request.status < 400) {
            elevation =  data;
        } else {
            elevation = -1;
        }
    };

    request.send();
    return elevation;
}

// Get the view from gps coordinates ___________________________________________

/**
 * Get the geoJson polygon of the panorama from the position
 * @param {number} lat Latitude in degrees
 * @param {number} lng Longitude in degrees
 */
function getViewFromLatLng(lat, lng)
{
    // API Call
    elevation = getElevation(lat, lng);
    console.log("Altitude = " + elevation + " m")

    // Horizon distance
    radius = horizonDistance(elevation);
    console.log("Horizon : " + radius/1000 + " km")

    return latlngCircle(lat, lng, radius, 360);
}

// Get the ISS view ____________________________________________________________

/**
 * Returns the geoJson circleview from the current position of the ISS.
 */
function issView()
{
    var request = new XMLHttpRequest();

    var circle;

    request.open('GET','https://api.wheretheiss.at/v1/satellites/25544', false);
    request.onload = function () {
        // Begin accessing JSON data here
        var data = JSON.parse(this.response);

        if (request.status >= 200 && request.status < 400) {
            lat =  data.latitude;
            lng = data.longitude;
            alt = data.altitude * 1000;
            console.log(alt);
            r = horizonDistance(alt);
            console.log(r);
            circle = latlngCircle(lat, lng, r, 360);
        }
    };

    request.send();
    return circle;
}