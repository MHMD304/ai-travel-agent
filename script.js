
document.addEventListener("DOMContentLoaded", () => {
  const minusBtn = document.getElementById("minusBtn");
  const plusBtn = document.getElementById("plusBtn");
  const travellersCount = document.getElementById("travellersCount");
  const planBtn = document.getElementById("planBtn");
  const outputDiv = document.getElementById("output");

  plusBtn.addEventListener("click", () => {
    travellersCount.innerText = parseInt(travellersCount.innerText) + 1;
  });

  minusBtn.addEventListener("click", () => {
    let count = parseInt(travellersCount.innerText);
    if (count > 1) travellersCount.innerText = count - 1;
  });

  planBtn.addEventListener("click", async () => {
    const travellers = travellersCount.innerText;
    const from = document.getElementById("flying-from").value.trim();
    const to = document.getElementById("flying-to").value.trim();
    const fromDate = document.getElementById("date-from").value;
    const toDate = document.getElementById("date-to").value;
    const budget = document.getElementById("budget").value.trim();

    if (!from || !to) {
      outputDiv.innerText = "❌ Please fill in departure and destination cities.";
      return;
    }
    if (!fromDate || !toDate) {
      outputDiv.innerText = "❌ Please enter travel dates.";
      return;
    }

    outputDiv.innerText = "Generating travel plan...";

    try {
      const response = await fetch("http://192.168.1.12:3000/plan-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, fromDate, toDate, travellers, budget })
      });

      const data = await response.json();
      
      // Store trip data and redirect
      localStorage.setItem("tripPlan", JSON.stringify(data));
      window.location.href = "trip.html";

    } catch (err) {
      console.error(err);
      outputDiv.innerText = "❌ Error: " + err.message;
    }
  });
});
