var lon = 121.564558;
var lat = 25.03746;
var map = undefined;
var iconMap = undefined;

async function init() {
    const query = await fetch('/data/weather-icon.json');
    const data = await query.json();

    iconMap = data;
}

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

    fetch(`https://api-wn.tsmc.n0b.me/ask/${getCookie('wn-city')}?question=${encodeURIComponent(question)}`)
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

    if (target == 'profile'){

        alert("此功能暫時不公開");

        return;
    }

    fetch(`${target}.html`)
        .then(result => { return result.text() })
        .then(data => {

            main.innerHTML = data;

            if (target == 'map') {
                initMap();
            } else if (target == 'home') {
                const selectField = document.getElementById('location-select');
                selectField.onchange = e => {
                    setCookie('wn-city', selectField.value, 1);
                };
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
    document.getElementById('date-time').innerHTML = dt.toLocaleTimeString();

    mapboxgl.accessToken = 'pk.eyJ1IjoibjBiYWxsIiwiYSI6ImNsbGFrNmhndzFnOHgzanNzZmYzbm15cHIifQ.0ruWVTpNp8fcVqT6vzCpqg';
    map = new mapboxgl.Map({
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
}

function routeTo() {
    const routeField = document.getElementById("route-field");
    routeField.classList.toggle('route-drop');
}

function initGeolocation() {
    if (navigator.geolocation) {
        // Call getCurrentPosition with success and failure callbacks
        navigator.geolocation.getCurrentPosition(success, fail);
    }
    else {
        alert("Sorry, your browser does not support geolocation services.");
    }
}

function success(position) {
    lon = position.coords.longitude;
    lat = position.coords.latitude;
}

function fail(position) {
    alert("無法取得位置，將有些功能無法使用");
}

// create a function to make a directions request
async function getRoute(method, start, end) {
    // make a directions request using cycling profile
    // an arbitrary start will always be the same
    // only the end or destination will change
    var json = undefined;

    if (start == "121.564558, 25.03746" && end == "121.4943, 24.5154") {
        const query = await fetch('/data/fake-route.json')
        json = await query.json();
    } else {
        const query = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/${method}/${start};${end}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
            { method: 'GET' }
        );
        json = await query.json();
    }

    let startLon = parseFloat(start.split(',')[0]);
    let startLat = parseFloat(start.split(',')[1]);
    let endLon = parseFloat(end.split(',')[0]);
    let endLat = parseFloat(end.split(',')[1]);

    const topLeft = [(startLon < endLon ? startLon : endLon) - 0.2, (startLat > endLat ? startLat : endLat) + 0.2];
    const bottomRight = [(startLon > endLon ? startLon : endLon) + 0.2, (startLat < endLat ? startLat : endLat) - 0.2];

    map.fitBounds([
        topLeft,
        bottomRight,
    ]);

    const data = json.routes[0];
    const route = data.geometry.coordinates;

    document.getElementById('estimate-route').classList.remove('choice-drop');
    drawIcon(map, route);
    calEst(data, method);

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

function navigate() {
    document.getElementById('route-field').classList.add('route-drop');
    getRoute(document.getElementById('route-method').value, document.getElementById('route-start').value, document.getElementById('route-end').value);
}

async function drawIcon(map, route) {

    step = Math.floor(route.length / 5);

    for (let i = 0; i < route.length; i += step) {

        const el = document.createElement('div');

        const query = await fetch(`https://api.open-meteo.com/v1/meteofrance?latitude=${lat}&longitude=${lon}&hourly=weathercode&timezone=Asia%2FSingapore`);
        const data = await query.json();
        const d = new Date();
        let hour = d.getHours();

        el.className = 'marker';
        el.style.backgroundImage = `url(${iconMap[data.hourly.weathercode[hour]].day.image})`;
        el.style.width = '50px';
        el.style.height = '50px';
        el.style.backgroundSize = '100%';

        new mapboxgl.Marker(el)
            .setLngLat(route[i])
            .addTo(map);

    }

}

const randomBytes = (count) => {
    const result = Array(count);
    for (let i = 0; i < count; ++i) {
        result[i] = Math.floor(256 * Math.random());
    }
    return result;
};

function calEst(data, method) {

    const estMin = document.getElementById('estimate-min');
    const estLen = document.getElementById('estimate-length');
    const estCar = document.getElementById('estimate-carbon');

    console.log(estMin);

    const carMap = {
        'driving': 147,
        'cycling': 15,
        'walking': 5,
    }

    estMin.innerHTML = Math.floor(data.duration / 60);
    estLen.innerHTML = Math.floor(data.distance / 1000);
    estCar.innerHTML = Math.floor(data.distance / 1000 * carMap[method]);
}

function startNav() {
    alert("此功能會過度消耗API，暫時暫停使用");
    document.getElementById('estimate-route').classList.add('choice-drop');

    map.fitBounds([
        [lon - 0.01, lat + 0.01],
        [lon + 0.01, lat - 0.01],
    ]);

}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

init();
navDeselectAll();
initGeolocation();