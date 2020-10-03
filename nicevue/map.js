var searchBar = document.getElementById("searchbar");

document.getElementById("toggle").checked = true;

// Make XHR HTTP Requests ______________________________________________________

function makeRequest(method, url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

// Search the place ____________________________________________________________

function searchPlace(inputText)
{
    // Do nothing if the search text is empty
    if(inputText.split(' ').join('') === '')
    {
        return;
    }

    // Getting rid of the whitespaces
    var q = inputText.split(' ').join('+');

    nominatim(q);
}

searchBar.addEventListener("keydown", (e) =>  {
    if(e.key === "Enter")
    {
        searchPlace(searchBar.value)
    }
})

// Map Settings ________________________________________________________________

var map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({               // Tiles layer 0
        source: new ol.source.OSM(),
        tileOptions: {crossOriginKeyword: 'null'}
      }),
      new ol.layer.Vector({             // Geometric view layer 1
          source : new ol.source.Vector()
      }),
      new ol.layer.Vector({             // ISS view layer 2
        source : new ol.source.Vector()
    }),
      new ol.layer.Vector({             // Weather view layer 3
        source : new ol.source.Vector()
      }),
      new ol.layer.Vector({            // Current Position wiew layer 4
          source : new ol.source.Vector()
      })
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([37.41, 8.82]),
      zoom: 4,
    })
});

map.on('postcompose',function(e){
    if(dark){
        document.querySelector('canvas').style.filter="invert()";
        document.querySelector('canvas').style.filter+="hue-rotate(180deg)"
    }
    else{
        document.querySelector('canvas').style.filter="";
    }
});

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
 */
async function getElevationFromPos(lat, lng)
{
    let resp = await makeRequest('GET', 
        'https://elevation.racemap.com/api?lat=' + lat +'&lng=' + lng);
    var elevation = JSON.parse(resp);
    return elevation;
}

// Get elevation data around a point ___________________________________________

function getElevationArea(lat, lng){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://elevation.racemap.com/api", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Origin', 'aaaaaaaaaaaa');
    //xhr.setRequestHeader('User-agent', 'tetete');
    xhr.onreadystatechange = function () {
        if (this.readyState != 4) return;
    
        if (this.status == 200) {
            var data = JSON.parse(this.responseText);
        }
    }
    xhr.send(JSON.stringify([[0, 1], [1, 0]]));
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
    elevation = getElevationFromPos(lat, lng);
    console.log("Altitude = " + elevation + " m")

    // Horizon distance
    radius = horizonDistance(elevation);
    console.log("Horizon : " + radius/1000 + " km")

    return latlngCircle(lat, lng, radius, 360);
}

// Async sleep _________________________________________________________________

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
  
async function demo() {
    await sleep(2000);
  
    // Sleep in loop
    for (let i = 0; i < 5; i++) {
        if (i === 3)
            await sleep(2000);
    }
}
  

// Get the ISS view ____________________________________________________________

/**
 * Displays the ISS View on the map and is updated every 5 seconds
 */
async function issView()
{
    setInterval(async function() {
        resp = await makeRequest('GET',
            'https://api.wheretheiss.at/v1/satellites/25544');
        var data = JSON.parse(resp);
        lat =  data.latitude;
        lng = data.longitude;
        alt = data.altitude * 1000;
        addViewToMap(lat, lng, alt, false, 2, "all");

    }, 1500);
}

// Add a view to the map _______________________________________________________

/**
 * Add a Vector Layer to the map containing the theorical view from the elvation
 * latitude and longitude
 * 
 * @param {Number} lat Latitude in degrees
 * @param {Number} lng Longitude in degrees
 * @param {Number} ele Elevation in meters
 * @param {Boolean} updateView True if the map view is updated
 * @param {Number} layerID Index of the layer in the map layers array
 * @param {string} replace "all" "" or "last" to replace the vector source
 */
function addViewToMap(lat, lng, ele, updateView, layerID, replace)
{
    let vectColors = ["rgba(0, 0, 0, 0)",
                     "rgba(0, 0, 255, 1)",
                     "rgba(255, 255, 255, 1)",
                     "rgba(255, 255, 255, 0)",
                     "rgba(255, 0, 0, 1)"];

    let vectColorsFill = [  "rgba(0, 0, 0, 0)",
                            "rgba(0, 0, 255, 0.1)",
                            "rgba(255, 255, 255, 0.1)",
                            "rgba(255, 255, 255, 0.3)",
                            "rgba(255, 0, 0, 0.075)"];

    var radius = horizonDistance(ele);
    console.log("Horizon : " + radius/1000 + " km", lat, lng)

    document.getElementById("horizon").innerHTML =
        Math.round((radius/1000 + Number.EPSILON) * 100) / 100 +
        ' km';

    var geojson =  JSON.parse(latlngCircle(lat, lng, radius, 360));

    var image = new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({color: vectColors[layerID]}),
      });

    var styles = {
        'Point': new ol.style.Style({
          image: image,
        }),
        'Polygon': new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: vectColors[layerID],
            width: 3,
          }),
          fill: new ol.style.Fill({
            color: vectColorsFill[layerID],
          }),
        })
      };
      
      var styleFunction = function (feature) {
        return styles[feature.getGeometry().getType()];
      };

    feature = new ol.format.GeoJSON({
        featureProjection: 'EPSG:3857',
        dataProjection:'EPSG:4326'
        }).readFeatures(geojson)

    source = map.getLayers().array_[layerID].getSource();

    if(replace === "all")
    {
        source.refresh();
    }
    else if(replace == "last")
    {
        var feat = source.getFeatures();
        for(let i = 1; i < 3; ++i)
        {
            var lastFeature = feat[feat.length - i];
            source.removeFeature(lastFeature);
        }
    }

    source.addFeatures(feature);
    source.changed();

    map.getLayers().array_[layerID].setStyle(styleFunction)

    map.getLayers().array_[layerID].changed();

    // Update View
    let zoom;
    if(radius < 2000){zoom = 13;} else
    if(radius < 10000){zoom = 12;} else
    if(radius < 20000){zoom = 11;} else
    if(radius < 66000){zoom = 10;} else
    if(radius < 100000){zoom = 9;} else
    if(radius < 500000){zoom = 8;}

    if(updateView)
    {
        view = new ol.View({
            center: ol.proj.fromLonLat([lng, lat]),
            zoom: zoom
        });
        map.setView(view);
    }
    map.render();
    map.renderSync();
    map.updateSize();
}

// Clear a Layer _______________________________________________________________

/**
 * Clears the layer
 * @param {*} layerID : ID of the map layer
 */
function clearLayer(layerID)
{
    source = map.getLayers().array_[layerID].getSource();
    source.refresh();
}

// Sending the request to nominatim OSM API ____________________________________

// Getting the elevation from OSM ID ___________________________________________

/**
 * Get the elevation from an OSM Node. This will check if there is an 'ele' tag
 * in the OSM node data. If so, we take its value as elevation reference. Else,
 * we get the elevation from the elevation API. We check is there is a 'height'
 * tag, and we will add the height to the elevation if there is one.
 * 
 * @param {Number / String} osmid OSM Node/Way ID of the object
 * @param {Number} lat Latitude of the Node / Way object
 * @param {Number} lng Longitude of the Node / Way object
 * @param {string} type "node", "way" or "relation"
 */
async function getElevation(osmid, lat, lng, type)
{
    var elevation;

    let resp = await makeRequest('GET',
        "https://www.openstreetmap.org/api/0.6/" + type + "/"+osmid+'.json');
    
    var data = JSON.parse(resp);
    if(data.elements.length > 0)
    {
        elements = data.elements[0];
        tags = elements.tags;

        // There is an elevation tag
        if('ele' in tags)
        {
            elevation = Number(tags.ele);
        }
        else
        {
            elevation = await getElevationFromPos(Number(lat),
                                            Number(lng));
        }

        document.getElementById("elevation").innerHTML =
            Math.round((elevation + Number.EPSILON) * 100) / 100 +
            ' m';

        // There is a height tag
        if('height' in tags)
        {
            console.log("height in tags !! "+tags.height)
            h = Number(tags.height);
            elevation += h;
            document.getElementById("height").innerHTML=
                Math.round((h + Number.EPSILON) * 100) / 100 +
                ' m';
            document.getElementById("altitude").innerHTML=
                Math.round((elevation + Number.EPSILON) * 100) / 100 +
                ' m';
        }
        else
        {
            document.getElementById("height").innerHTML="-";
            document.getElementById("altitude").innerHTML=
                Math.round((elevation + Number.EPSILON) * 100) / 100 +
                ' m';
        }
    }
    return elevation;
}

// Weather Circle ______________________________________________________________

/**
 * Adds the weather visibility circle to the map for the given coordinates
 * @param {Number} lat Latitude in degrees
 * @param {Number} lng Longitude in degrees
 */
async function weather(lat, lng, replace)
{
    // This is the app ID to call openweathermap. It is linked to a free
    // account, so please, do not use it in your own projects. This would
    // decrease the user experience of NiceView. You can get your own key
    // registering on their website with a free account.
    var olympus = "65c74efc785b7bdf014ebee6ed8bba69";

    var url = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat +
            "&lon=" + lng + "&appid=" + olympus;

    let resp = await makeRequest('GET', url);
    var data = JSON.parse(resp);
    radius = Number(data.visibility);
    console.log("Visibility : " + radius/1000 + " km")

    document.getElementById("visibility").innerHTML =
        Math.round((radius/1000 + Number.EPSILON) * 100) / 100 +
        ' km';

    if(radius >= 10)
    {
        return;
    }
    let clr = "rgba(255, 255, 255, 0.3)";
    var geojson =  JSON.parse(latlngCircle(lat, lng, radius, 360));

    var styles = {
        'Polygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: "rgba(0,0,0,0)",
            width: 1,
        }),
        fill: new ol.style.Fill({
            color: clr,
        }),
        })
    };
    
    var styleFunction = function (feature) {
        return styles[feature.getGeometry().getType()];
    };

    feature = new ol.format.GeoJSON({
        featureProjection: 'EPSG:3857',
        dataProjection:'EPSG:4326'
        }).readFeatures(geojson)

    source = map.getLayers().array_[3].getSource();

    if(replace === "all")
    {
        source.refresh();
    }
    else if(replace == "last")
    {
        var feat = source.getFeatures();
        for(let i = 1; i < 3; ++i)
        {
            var lastFeature = feat[feat.length - i];
            source.removeFeature(lastFeature);
        }
    }


    source.addFeatures(feature);
    source.changed();

    map.getLayers().array_[3].setStyle(styleFunction)

    map.getLayers().array_[3].changed();

    map.render();
    map.renderSync();
    map.updateSize();
}

// Searching ___________________________________________________________________

let searchResults = {};

/**
 * Get the places from the searched name and displays the first result on the
 * map.
 * 
 * @param {string} q name query. Must contain '+' instead of ' '
 */
async function nominatim(q)
{
    if(q==null)
    {
        return;
    }

    if(q.toLocaleLowerCase()==='iss')
    {
        if(!issDone)
        {
            issView();
            issDone = true;
        }
    }
    else
    {
        let resp = await makeRequest('GET',
            "https://nominatim.openstreetmap.org/search?format=json&q="+q);
        
        var data = JSON.parse(resp);

        if(data.length > 0)
        {
            // Displaying the first element on the map
            place = data[0];
            lat = Number(place.lat);
            lng = Number(place.lon);

            searchResults = data;

            // Updating HTML Page
            document.getElementById("placeName").innerHTML = 
                place.display_name;
            
            document.getElementById("latitude").innerHTML = 
                Math.round((lat + Number.EPSILON) * 100000) / 100000
                + ' °';
            document.getElementById("longitude").innerHTML =
                Math.round((lng + Number.EPSILON) * 100000) / 100000
                + ' °';

            ele = await getElevation(place.osm_id, lat, lng, 
                place.osm_type);
            
            ele += 1.6; // Average human eyes height
            weather(lat, lng, '');
            // debug
            addViewToMap(lat, lng, ele, true, 1, "");
        }
    }
}

// Display the search results popup ____________________________________________

/**
 * Changes the place if the search was not as expected
 * @param {int} index Index of the element in searchResults
 */
async function changePlace(index)
{
    place = searchResults[index];
    lat = Number(place.lat);
    lng = Number(place.lon);

    // Updating HTML Page
    document.getElementById("placeName").innerHTML = 
        place.display_name;
    
    document.getElementById("latitude").innerHTML = 
        Math.round((lat + Number.EPSILON) * 100000) / 100000
        + ' °';
    document.getElementById("longitude").innerHTML =
        Math.round((lng + Number.EPSILON) * 100000) / 100000
        + ' °';

    ele = await getElevation(place.osm_id, lat, lng, 
        place.osm_type);
    
    ele += 1.6; // Average human eyes height
    weather(lat, lng, "last");
    addViewToMap(lat, lng, ele, true, 1, "last");

    hideSearchPopup();
}

function displaySearchPopup(){
    document.getElementById("searchlist").innerHTML = "";

    for(result in searchResults)
    {
        document.getElementById("searchlist").innerHTML +=
            "<ul onclick=\"changePlace("+result+")\">" + 
            searchResults[result].display_name + " (" + 
            searchResults[result].type + ")</ul>"
    }

    document.getElementById("searchdiv").style.display = 'block';
}

// Hide Search popup ___________________________________________________________

function hideSearchPopup(){
    document.getElementById("searchdiv").style.display = 'none';
}

window.addEventListener("keydown", (e) => {
    if(e.key == "Escape"){
        if(document.getElementById("searchdiv").style.display === "block")
        {
            hideSearchPopup();
        }
        else
        {
            clickMap();
        }
    }
})

// Change theme ________________________________________________________________

/**
 * Toggle the theme (dark / light)
 */
function changeTheme()
{
    dark = !dark;
    map.render();
}

// Use current location ________________________________________________________

var useCurrentLocation = false;
var positionIntervalID

/**
 * Get the view from the user current location
 */
async function clickLocation()
{
    useCurrentLocation = !useCurrentLocation;
    if(useCurrentLocation)
    {
        document.getElementById("location").src = "locationEnabled.svg"
        if(navigator.geolocation)
        {
            navigator.geolocation.getCurrentPosition(async function(position) {
                // Getting elevation
                let lat = position.coords.latitude;
                let lon = position.coords.longitude;
                let ele;
                if(position.coords.altitude)
                {
                    ele = position.coords.altitude;
                }

                else
                {
                    ele = await getElevationFromPos(lat, lon);
                }
                ele += 1.6; // Average human eyes height
                document.getElementById("placeName").innerHTML = 
                    "Your Current Location"
                document.getElementById("elevation").innerHTML =
                    Math.round((ele + Number.EPSILON) * 100) / 100 +
                    ' m';
                
                document.getElementById("height").innerHTML="-";
                document.getElementById("altitude").innerHTML=
                Math.round((ele + Number.EPSILON) * 100) / 100 +
                    ' m';
                document.getElementById("latitude").innerHTML = 
                    Math.round((lat + Number.EPSILON) * 100000) / 100000
                    + ' °';
                document.getElementById("longitude").innerHTML =
                    Math.round((lon + Number.EPSILON) * 100000) / 100000
                    + ' °';
                weather(lat, lon, '');
                addViewToMap(lat, lon, ele, true, 4, "");
            })
        }
    }
    else
    {
        document.getElementById("location").src = "location.svg"
        clearLayer(4);
        clearLayer(3);
    }
}

// Click on map ________________________________________________________________

var mapClick = false;

function clickMap()
{
    mapClick = !mapClick;
    if (mapClick)
    {
        console.log("salur")
        document.getElementById("clickmap").src = "clickmapEnabled.svg"
        console.log(document.getElementById('map').style.cursor)
        document.getElementById('map').style.cursor = 
            "url('locationPointer.png'), pointer"
        console.log(document.getElementById('map').style.cursor)
    }
    else
    {
        document.getElementById("clickmap").src = "clickmap.svg";
        document.getElementById('map').style.cursor = "default"
    }
}

map.on('click', async function(e){
    if(!mapClick) return;
    coordinate = map.getCoordinateFromPixel(e.pixel)
    latlon = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
    var lat = latlon[1];
    var lon = latlon[0];

    var ele = await getElevationFromPos(lat, lon);

    document.getElementById("placeName").innerHTML = "Custom Location"
    document.getElementById("elevation").innerHTML =
        Math.round((ele + Number.EPSILON) * 100) / 100 +
        ' m';
    
    document.getElementById("height").innerHTML="-";
    document.getElementById("altitude").innerHTML=
    Math.round((ele + Number.EPSILON) * 100) / 100 +
        ' m';
    document.getElementById("latitude").innerHTML = 
        Math.round((lat + Number.EPSILON) * 100000) / 100000
        + ' °';
    document.getElementById("longitude").innerHTML =
        Math.round((lon + Number.EPSILON) * 100000) / 100000
        + ' °';
    weather(lat, lon, '');
    addViewToMap(lat, lon, ele, false, 1, "last");
})

// Getting parameters __________________________________________________________

const urlParams = new URLSearchParams(window.location.search);
const q = urlParams.get('q');
nominatim(q);
let issDone = false;
let dark = true;