var lon = 121.564558;
var lat = 25.03746;

function choice(item) {

    const choice = document.getElementById('choice-response');
    const choiceField = document.getElementById('choice-response-field');

    choice.style.zIndex = 999;
    choice.classList.remove('d-op');
    choiceField.innerHTML = '';

    const ul = document.createElement('ul');
    ul.classList.add('list');

    fetch('/data/prepromt.json')
        .then(data => {
            return data.json()
        }).then(result => {

            let ul_data = '';

            if (result[item] == undefined) {
                disableChoice();
                alert("Not Yet Implemented!");
                return;
            }

            result[item].forEach(e => {
                ul_data += `<li class="list-item" onclick="disableChoice();askQuestion('${e}');">${e}</li>`
            });

            ul_data = ul_data.replace(/(\blist-item\b)(?!.*[\r\n]*.*\1)/, "list-item border-none");

            ul.innerHTML = ul_data;
            console.log(ul);
            choiceField.appendChild(ul);
            choiceField.classList.remove('choice-drop');

        });

}

function disableChoice() {

    const choice = document.getElementById('choice-response');
    const choiceField = document.getElementById('choice-response-field');

    choice.style.zIndex = -999;
    choice.classList.add('d-op');
    choiceField.classList.add('choice-drop');

}

function sendMsg() {

    const typeField = document.getElementById('chat-prompt');
    askQuestion(typeField.value);

}

function askQuestion(question) {
    const main = document.querySelector('main');
    const inputField = document.getElementById('chat-prompt');
    const userField = document.createElement('div');
    const aiField = document.createElement('div');

    userField.classList.add("chat-item");
    userField.classList.add("chat-user");
    aiField.classList.add('chat-item');

    userField.innerHTML = `
        <div class="chat-body user">
            ${question}
        </div>
    `

    inputField.value = '';
    main.appendChild(userField);

    aiField.innerHTML = `
    <div class="img-container">
        <img class="need-icon" height="30px" width="45px" src="/img/need.png" alt="need-icon">
    </div>
    <div class="chat-body ai">
        ...
    </div>
    `
    main.appendChild(aiField);
    main.scrollTop = main.scrollHeight;

    fetch(`https://api-wn.tsmc.n0b.me/ask?question=${encodeURIComponent(question)}`)
        .then(result => { return result.json() })
        .then(data => {
            aiField.innerHTML = `
        <div class="img-container">
            <img class="need-icon" height="30px" width="45px" src="/img/need.png" alt="need-icon">
        </div>
        <div class="chat-body ai">
            ${data.data[1][0][1]}
        </div>
        `
            main.scrollTop = main.scrollHeight;
        });

}

function chatBack() {
    window.history.go(-1)
}

function nav(item) {

    
    document.querySelector("main").style.top = "20%";
    document.querySelector("main").style.height = "60%";

    const target = item.getAttribute('wn-data');
    const main = document.getElementById('main');
    navDeselectAll();

    if (target == "trand") {
        item.style.stroke = "#8C68AC";
    } else {
        item.style.fill = "#8C68AC";
    }

    fetch(`${target}.html`)
        .then(result => { return result.text() })
        .then(data => {

            main.innerHTML = data;

            if (target == 'map') {
                initMap();
            }
        });


}

function navDeselectAll() {
    const navTools = document.getElementsByClassName('nav-item');

    for (let i = 0; i < navTools.length; i++) {
        navTools[i].style.stroke = "#9A9A9B";
        navTools[i].style.fill = "none";
    }

}

function initMap() {

    document.querySelector("main").style.top = "0";
    document.querySelector("main").style.height = "100vh";
    const routeStart = document.getElementById('route-start');

    var dt = new Date();
    document.getElementById('date-time').innerHTML=dt.toLocaleTimeString();

    mapboxgl.accessToken = 'pk.eyJ1IjoibjBiYWxsIiwiYSI6ImNsbGFrNmhndzFnOHgzanNzZmYzbm15cHIifQ.0ruWVTpNp8fcVqT6vzCpqg';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lon, lat], // starting position
        zoom: 14
    });

    // Set marker options.
    const marker = new mapboxgl.Marker({
    color: "red",
    draggable: true
    }).setLngLat([lon, lat])
    .addTo(map);

    routeStart.value = `${lon}, ${lat}`;

    // set the bounds of the map
    const bounds = [
        [120, 23],
        [122, 26]
    ];
    map.setMaxBounds(bounds);

    // create a function to make a directions request
    async function getRoute(start, end) {
        // make a directions request using cycling profile
        // an arbitrary start will always be the same
        // only the end or destination will change
        const query = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
            { method: 'GET' }
        );
        const json = await query.json();
        const data = json.routes[0];
        const route = data.geometry.coordinates;
        const geojson = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: route
            }
        };
        // if the route already exists on the map, we'll reset it using setData
        if (map.getSource('route')) {
            map.getSource('route').setData(geojson);
        }
        // otherwise, we'll make a new request
        else {
            map.addLayer({
                id: 'route',
                type: 'line',
                source: {
                    type: 'geojson',
                    data: geojson
                },
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#3887be',
                    'line-width': 5,
                    'line-opacity': 0.75
                }
            });
        }
    }

    map.on('load', () => {
        // make an initial directions request that
        // starts and ends at the same location
        getRoute([121.195, 24.968], [121.509762, 25.0399991]);

        // Add starting point to the map
        map.addLayer({
            id: 'point',
            type: 'circle',
            source: {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Point',
                                coordinates: [121.195, 24.968]
                            }
                        }
                    ]
                }
            },
            paint: {
                'circle-radius': 10,
                'circle-color': '#3887be'
            }
        });
    });
}

function routeTo(){
    const routeField = document.getElementById("route-field");
    routeField.classList.toggle('route-drop');
}

function initGeolocation()
{
   if( navigator.geolocation )
   {
      // Call getCurrentPosition with success and failure callbacks
      navigator.geolocation.getCurrentPosition( success, fail );
   }
   else
   {
      alert("Sorry, your browser does not support geolocation services.");
   }
}

function success(position)
{
    lon = position.coords.longitude;
    lat = position.coords.latitude;
}

function fail(position){
    console.log(position);
    alert("無法取得位置，將有些功能無法使用");
}

navDeselectAll();
initGeolocation();