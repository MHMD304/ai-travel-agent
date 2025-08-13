require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/plan-trip', async (req, res) => {
  try {
    const { from, to, fromDate, toDate, travellers, budget } = req.body;

    // Calculate duration first
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    const prompt = `
Generate a REALISTIC travel plan for the specific route from ${from} to ${to}.

IMPORTANT: Use REALISTIC information for this specific route:
- If traveling within the Middle East, use Middle Eastern airlines (MEA, Royal Jordanian, Turkish Airlines, etc.)
- If traveling to Europe, use European airlines (Air France, Lufthansa, British Airways, etc.)
- If traveling to Asia, use Asian airlines (Emirates, Qatar Airways, Singapore Airlines, etc.)
- Use REALISTIC hotel names and prices for the destination city
- Provide ACCURATE weather information for the specific destination and dates

EXAMPLES of realistic data:
- Lebanon to Syria: MEA (Middle East Airlines), Damascus Hotel, realistic Middle East prices
- Lebanon to Europe: MEA or Turkish Airlines, realistic European hotel names and prices
- Lebanon to Asia: Emirates or Qatar Airways, realistic Asian hotel names and prices

Return ONLY this JSON structure with REALISTIC data:
{
  "trip": {
    "travellers": ${travellers},
    "from": "${from}",
    "to": "${to}",
    "from_date": "${fromDate}",
    "to_date": "${toDate}",
    "budget": "${budget}"
  },
  "weather": {
    "conditions": "Realistic weather for ${to} during ${fromDate} to ${toDate}"
  },
  "flight": {
    "departure": {
      "airline": "Realistic airline for ${from} to ${to} route",
      "flight_number": "Realistic flight number",
      "price": "Realistic price for this route"
    }
  },
  "hotel": {
    "name": "Realistic hotel name in ${to}",
    "total_cost": "Realistic total cost for ${duration} nights"
  }
}

CRITICAL: 
- Use REALISTIC airlines that actually fly this route
- Use REALISTIC hotel names that exist in ${to}
- Use REALISTIC prices for this specific route and destination
- Provide ACCURATE weather for ${to} during these dates
- Do NOT use generic "Air France" or "Hotel Le Meurice" for every route`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '{}';

    let trip;
    try { 
      // Since the AI is returning clean JSON, try to parse it directly first
      let jsonText = text;
      
      // Try direct parsing first (most common case)
      try {
        trip = JSON.parse(text);
      } catch (directError) {
        // Method 1: Look for JSON within markdown code blocks
        if (text.includes('```json')) {
          const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            jsonText = jsonMatch[1];
          }
        } 
        
        // Method 2: Look for JSON within any code blocks
        if (jsonText === text && text.includes('```')) {
          const jsonMatch = text.match(/```\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            jsonText = jsonMatch[1];
          }
        }
        
        // Method 3: Find the first complete JSON object in the text
        if (jsonText === text) {
          const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
          if (jsonObjectMatch && jsonObjectMatch[0]) {
            jsonText = jsonObjectMatch[0];
          }
        }
        
        // Clean up the extracted text
        jsonText = jsonText.trim();
        
        trip = JSON.parse(jsonText); 
      }
      
    } catch (e) { 
      // Fallback to generated data if AI fails
      trip = { 
        trip: { 
          travellers, 
          from, 
          to, 
          dates: { from: fromDate, to: toDate }, 
          budget 
        }, 
        weather: `Weather conditions for ${to} during ${fromDate} to ${toDate}`, 
        flight: {
          departure: {
            from: from,
            to: to,
            airline: "Sample Airline",
            flightNumber: "SA123",
            price: "450"
          }
        }, 
        hotel: {
          name: `Sample Hotel in ${to}`,
          totalHotelCost: "800"
        }
      }; 
    }
    
    res.json(trip);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT,'0.0.0.0', () => console.log(`Server running on http://192.168.1.12:${PORT}`));
app.get('/', (req, res) => {
  res.send('Server is working!');
});