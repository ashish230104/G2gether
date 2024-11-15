
// This is new
const mapboxToken = 'pk.eyJ1Ijoiam1jbGF1Y2hsYW4iLCJhIjoiY20zNmRueWVmMDRwMDJpcHRydml6bTl4ZCJ9.SfIaFBVJwd-a-jOfE6bfrQ';
mapboxgl.accessToken = mapboxToken;

// Initialize Mapbox map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', // Simple, built-in style
    center: [-98.5795, 39.8283],
    zoom: 3
});

const emissionFactors = {
    electricVehicle: 0.02,
    bus: 0.1,
    train: 0.05,
    subway: 0.06,
    regularCar: 0.2,
    walking: 0.0
};

const everydayItems = [
    { name: 'plastic bottle', footprint: 0.08 },
    { name: 'burger', footprint: 2.5 },
    { name: 'hour of air conditioning', footprint: 1 },
    { name: 'driving 1 km in a gas car', footprint: 0.2 },
    { name: 'pair of jeans', footprint: 33 },
    { name: 'one-way flight from NYC to LA per passenger', footprint: 900 }
];

const greenOptionEmissionFactor = emissionFactors.walking;

// Function to add a new commute leg section
function addCommuteLeg() {
    const commuteLegs = document.getElementById('commuteLegs');
    const newLeg = document.createElement('div');
    newLeg.classList.add('commute-leg', 'card', 'mb-3', 'p-3');
    newLeg.innerHTML = `

<div class="row gy-5 gx-4">
            <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.2s">
                <div class="position-relative shadow rounded border-top border-5 border-primary">
                    <div class="d-flex align-items-center justify-content-center position-absolute top-0 start-50 translate-middle bg-primary rounded-circle" style="width: 45px; height: 45px; margin-top: -3px;">
                        <i class="fa fa-share-alt text-white"></i>
                    </div>
                    <div class="text-center border-bottom p-4 pt-5">
                        <h4 class="fw-bold">Start Location</h4>
                        <p class="mb-0">Begin your journey from a place that feels like home.</p>
                    </div>
                    <div class="text-center border-bottom p-4">
                        <mapbox-address-autofill access-token="${mapboxToken}">
                            <input type="text" class="form-control start location-input" placeholder="Enter start location" autocomplete="shipping address-line1">
                        </mapbox-address-autofill>
                        <br>
                    </div>
                </div>
            </div>
            <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.4s">
                <div class="position-relative shadow rounded border-top border-5 border-secondary">
                    <div class="d-flex align-items-center justify-content-center position-absolute top-0 start-50 translate-middle bg-secondary rounded-circle" style="width: 45px; height: 45px; margin-top: -3px;">
                        <i class="fa fa-server text-white"></i>
                    </div>
                    <div class="text-center border-bottom p-4 pt-5">
                        <h4 class="fw-bold">End Location</h4>
                        <p class="mb-0">Your journey's destination is just as important as its beginning.</p>
                    </div>
                    <div class="text-center border-bottom p-4">
                        <mapbox-address-autofill access-token="${mapboxToken}">
                            <input type="text" class="form-control end location-input" placeholder="Enter end location" autocomplete="shipping address-line1">
                        </mapbox-address-autofill>
                        <br>
                    </div>
                </div>
            </div>
            <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.6s">
                <div class="position-relative shadow rounded border-top border-5 border-primary">
                    <div class="d-flex align-items-center justify-content-center position-absolute top-0 start-50 translate-middle bg-primary rounded-circle" style="width: 45px; height: 45px; margin-top: -3px;">
                        <i class="fa fa-cog text-white"></i>
                    </div>
                    <div class="text-center border-bottom p-4 pt-5">
                        <h4 class="fw-bold">Mode of Transportation</h4>
                        <p class="mb-0">Choose your preferred mode of transportation for your journey.</p>
                    </div>
                    <div class="text-center border-bottom p-4">
                        <select class="form-select mode" onchange="toggleTransitType(this)">
                            <option value="electricVehicle">Electric Vehicle (Scooter/Bike/Car)</option>
                            <option value="publicTransport">Public Transportation (Bus/Train/Subway)</option>
                            <option value="walking">Walking</option>
                            <option value="regularCar">Regular Automobile</option>
                        </select>
                        <br>
                    </div>
                    <div class="col-md-4 transit-type mt-3" style="display: none;">
                <label for="transitType" class="form-label">Transit Type:</label>
                <select class="form-select transitType">
                    <option value="bus">Bus</option>
                    <option value="train">Train</option>
                    <option value="subway">Subway</option>
                </select>
            </div>
                </div>
            </div>
        </div>
            `;
    commuteLegs.appendChild(newLeg);

    // Add event listener to autofill input fields on address selection
    newLeg.querySelectorAll('mapbox-address-autofill').forEach((autofill) => {
        autofill.addEventListener('retrieve', (event) => {
            const input = event.target.querySelector('input');
            input.value = event.detail.features[0].place_name;
        });
    });
}

// Function to remove a specific commute leg
function removeCommuteLeg(button) {
    const commuteLeg = button.closest('.commute-leg');
    commuteLeg.remove();
}

// Reset form, map, and results
function resetForm() {
    if (confirm("Are you sure you want to reset the form? This will clear all entered data.")) {
        document.getElementById('commuteLegs').innerHTML = '';
        document.getElementById('results').innerHTML = '';
        removeAllMapLayers();
        addCommuteLeg(); // Add initial commute leg
    }
}

// Remove all layers from the map
function removeAllMapLayers() {
    const layers = map.getStyle().layers;
    if (layers) {
        layers.forEach(layer => {
            if (layer.id.startsWith('route-')) {
                map.removeLayer(layer.id);
                map.removeSource(layer.id);
            }
        });
    }
}

// Toggle visibility of transit type selection based on mode
function toggleTransitType(select) {
    const transitTypeDiv = select.closest('.commute-leg').querySelector('.transit-type');
    transitTypeDiv.style.display = select.value === 'publicTransport' ? 'block' : 'none';
}

// Get coordinates from Mapbox Geocoding API
async function getCoordinates(location) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxToken}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.features && data.features.length > 0) {
        return data.features[0].geometry.coordinates;
    } else {
        console.error(`No coordinates found for location: ${location}`);
        return null;
    }
}

// Get route distance and plot on the map
async function getRouteDistanceAndPlot(startCoords, endCoords, mode, legColor) {
    const mapboxMode = mode === 'electricVehicle' ? 'cycling' :
                       mode === 'publicTransport' ? 'driving' :
                       mode === 'regularCar' ? 'driving' : 'walking';

    const url = `https://api.mapbox.com/directions/v5/mapbox/${mapboxMode}/${startCoords.join(',')};${endCoords.join(',')}?access_token=${mapboxToken}&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();
    const distance = data.routes[0].distance / 1000;

    const route = data.routes[0].geometry;
    map.addLayer({
        id: `route-${Math.random()}`,
        type: 'line',
        source: {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: route
            }
        },
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': legColor,
            'line-width': 5
        }
    });

    new mapboxgl.Marker().setLngLat(startCoords).addTo(map);
    new mapboxgl.Marker().setLngLat(endCoords).addTo(map);

    return distance;
}

// Calculate cumulative savings over time
function calculateSavingsOverTime(currentEmissions, greenEmissions) {
    const savingsPerTrip = currentEmissions - greenEmissions;
    return {
        weekly: savingsPerTrip * 5,
        monthly: savingsPerTrip * 20,
        yearly: savingsPerTrip * 240,
        fiveYears: savingsPerTrip * 1200
    };
}

// Find the closest comparison item
function findClosestComparison(totalEmissions) {
    let closestItem = everydayItems[0];
    let smallestDifference = Math.abs(totalEmissions - closestItem.footprint);

    for (const item of everydayItems) {
        const difference = Math.abs(totalEmissions - item.footprint);
        if (difference < smallestDifference) {
            smallestDifference = difference;
            closestItem = item;
        }
    }
    return closestItem;
}

// Main function to calculate total emissions and display results
async function calculateImpact() {
    const commuteLegElements = document.querySelectorAll('.commute-leg');
    let totalEmissions = 0;
    let greenEmissions = 0;
    const allCoordinates = [];

    for (const leg of commuteLegElements) {
        const startLocation = leg.querySelector('.start').value;
        const endLocation = leg.querySelector('.end').value;
        const mode = leg.querySelector('.mode').value;
        const transitType = leg.querySelector('.transitType') ? leg.querySelector('.transitType').value : null;

        let emissionFactor = mode === 'publicTransport' ? emissionFactors[transitType] : emissionFactors[mode];
        emissionFactor = emissionFactor !== undefined ? emissionFactor : 0.0;

        const startCoords = await getCoordinates(startLocation);
        if (!startCoords) continue;

        const endCoords = await getCoordinates(endLocation);
        if (!endCoords) continue;

        allCoordinates.push(startCoords, endCoords);
        const legColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        const distance = await getRouteDistanceAndPlot(startCoords, endCoords, mode, legColor);

        totalEmissions += distance * emissionFactor;
        greenEmissions += distance * greenOptionEmissionFactor;
    }

    if (allCoordinates.length > 0) {
        const bounds = allCoordinates.reduce((bounds, coord) => bounds.extend(coord), new mapboxgl.LngLatBounds(allCoordinates[0], allCoordinates[0]));
        map.fitBounds(bounds, { padding: 50 });
    }

    const closestItem = findClosestComparison(totalEmissions);
    const savings = calculateSavingsOverTime(totalEmissions, greenEmissions);

document.getElementById('results').innerHTML = `
    <div class="card p-3">
        <h5>Total Emissions:</h5>
        <p class="display-6">${totalEmissions.toFixed(2)} kg CO₂</p>
        
        <h5>Equivalent to:</h5>
        <p class="badge bg-info text-dark">${closestItem.footprint} kg CO₂ for a ${closestItem.name}</p>
        
        <h5>Potential Savings (if you continue this option):</h5>
        <ul class="list-group list-group-flush">
            <li class="list-group-item">Weekly: <span class="badge bg-success">${savings.weekly.toFixed(2)} kg CO₂</span></li>
            <li class="list-group-item">Monthly: <span class="badge bg-success">${savings.monthly.toFixed(2)} kg CO₂</span></li>
            <li class="list-group-item">Yearly: <span class="badge bg-success">${savings.yearly.toFixed(2)} kg CO₂</span></li>
            <li class="list-group-item">Five Years: <span class="badge bg-success">${savings.fiveYears.toFixed(2)} kg CO₂</span></li>
        </ul>
        
        <p class="text-muted mt-3">By choosing greener commute options, you reduce your carbon footprint and contribute to a healthier planet, slowing the progression of global warming.</p>
    </div>
`;
}

// Initial call to add a single commute leg on load
document.addEventListener('DOMContentLoaded', () => {
    addCommuteLeg();
});
