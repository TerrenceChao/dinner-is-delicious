import axios from 'axios';
import { $ } from './bling';

const version = 'v1';
const mapOptions = {
    center: {lng: -79.8, lat: 43.2 },
    zoom: 10
}

function loadPlaces(map, lng = -79.8, lat = 43.2) {
    axios.get(`/api/${version}/stores/near?lng=${lng}&lat=${lat}`)
        .then(res => {
            if (!res.data.length) {
                alert('No places found!');
                return;
            }

            const places = res.data;
            const bounds = new google.maps.LatLngBounds();
            const infoWindow = new google.maps.InfoWindow();

            const markers = places.map(place => {
                const [placeLng, placeLat] = place.location.coordinates;
                const position = {lng: placeLng, lat: placeLat};
                bounds.extend(position);
                const marker = new google.maps.Marker({ map, position });
                marker.place = place;
                return marker;
            });

            // when someone clicks on a marker, show the details of that place
            markers.forEach(marker => marker.addListener('click', function()  {
                // infoWindow.setContent(this.place.name);
                const html = `
                    <div class="popup>
                        <a href="/store/${this.place.slug}">
                            <img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}"/>
                        </a>
                        <p>${this.place.name} - ${this.place.location.address}</p>
                    </div>
                `;
                infoWindow.setContent(html);
                infoWindow.open(map, this);
            })); 

            // then zoom the map to fit all the markers perfectly
            map.setCenter(bounds.getCenter());
            map.fitBounds(bounds);
        })
        .catch(err => console.error(err));
}

function makeMap(mapDiv) {
    if (!mapDiv) { return mapDiv; }
    // Make our map
    const map = new google.maps.Map(mapDiv, mapOptions);
    loadPlaces(map);

    const input = $('[name="geolocate"]');
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();
        console.log(place);
        const location = place.geometry.location;
        loadPlaces(map, location.lng(), location.lat());
    });
}

export default makeMap;