document.addEventListener("DOMContentLoaded", () => {
    // Get trip data from localStorage
    let tripData = null;
    try {
        const storedData = localStorage.getItem("tripPlan");
        if (storedData) {
            tripData = JSON.parse(storedData);
        }
    } catch (e) {
        console.log("Error loading trip data");
    }
    
    if (tripData && tripData.trip) {
        document.getElementById("trip-content").style.display = "block";
        document.getElementById("no-trip-data").style.display = "none";

        // Extract trip information
        const fromDate = tripData.trip.from_date || "Not set";
        const toDate = tripData.trip.to_date || "Not set";
        const from = tripData.trip.from || "Not set";
        const to = tripData.trip.to || "Not set";

        // Display dates
        if (fromDate !== "Not set") {
            try {
                const date = new Date(fromDate);
                document.getElementById("from-date").innerText = date.toLocaleDateString('en-GB');
            } catch (e) {
                document.getElementById("from-date").innerText = fromDate;
            }
        } else {
            document.getElementById("from-date").innerText = fromDate;
        }

        if (toDate !== "Not set") {
            try {
                const date = new Date(toDate);
                document.getElementById("to-date").innerText = date.toLocaleDateString('en-GB');
            } catch (e) {
                document.getElementById("to-date").innerText = toDate;
            }
        } else {
            document.getElementById("to-date").innerText = toDate;
        }

        document.getElementById("from-to").innerText = `${from} → ${to}`;

        // Display weather
        if (tripData.weather && tripData.weather.conditions) {
            document.getElementById("weather-description").innerText = tripData.weather.conditions;
        } else {
            document.getElementById("weather-description").innerText = "Weather info unavailable";
        }

        // Display flight
        if (tripData.flight && tripData.flight.departure && tripData.flight.departure.airline) {
            const flight = tripData.flight.departure;
            document.getElementById("flight-description").innerText = 
                `${flight.airline} ${flight.flight_number || ''} - $${flight.price || 'Price not available'}`;
        } else {
            document.getElementById("flight-description").innerText = "No flight data available";
        }

        // Display hotel
        if (tripData.hotel && tripData.hotel.name) {
            const hotel = tripData.hotel;
            document.getElementById("hotel-description").innerText = 
                `${hotel.name} - $${hotel.total_cost || 'Price not available'}`;
        } else {
            document.getElementById("hotel-description").innerText = "No hotel data available";
        }

        // Display trip details
        const travellers = tripData.trip.travellers || 1;
        document.getElementById("traveller-count").innerText = travellers + (travellers === 1 ? " person" : " people");
        
        const budget = tripData.trip.budget || "Budget not specified";
        document.getElementById("budget-info").innerText = budget;

        // Calculate duration
        if (fromDate !== "Not set" && toDate !== "Not set") {
            try {
                const start = new Date(fromDate);
                const end = new Date(toDate);
                const duration = Math.ceil((end - start) / (1000*60*60*24));
                document.getElementById("trip-duration").innerText = duration + " days";
            } catch (e) {
                document.getElementById("trip-duration").innerText = "Calculate duration";
            }
        } else {
            document.getElementById("trip-duration").innerText = "Calculate duration";
        }

    } else {
        document.getElementById("trip-content").style.display = "none";
        document.getElementById("no-trip-data").style.display = "block";
    }
});

function goBack() { window.location.href = 'letsBegin.html'; }
function bookFlight() { alert('🛫 Flight booking feature coming soon!'); }
function bookHotel() { alert('🏨 Hotel booking feature coming soon!'); }