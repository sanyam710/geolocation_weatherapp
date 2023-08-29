import express from "express";
import requestIp from "request-ip";
import axios from "axios";
import { apiKey, weatherApiKey, tableHtmlWithStyles } from "./constants.js";
const app = express();
app.use(requestIp.mw()); // Use the request-ip middleware
const city = "";

app.get("/", async (req, res) => {
  try {
    const clientIP = req.clientIp; // Access the client's IP address from the request object
    const cleanedIP = clientIP.split(",")[0].trim(); // Clean the IP address
    let city = req.query.city; // Get the city from the query parameter
    var geolocation = {};

    // If city is not provided in the query parameter, get it from IPinfo API
    if (!city) {
      try {
        const response = await axios.get(
          `http://ipinfo.io/${cleanedIP}/json?token=${apiKey}`
        );
        geolocation = response.data;
        city = geolocation.city; // Use the city from IPinfo API
      } catch (error) {
        res.send({
          ip: cleanedIP,
          headers: req.headers,
          geolocationError: error.message,
        });
        return;
      }
    }
    try {
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}`
      );
      const weatherData = weatherResponse.data;
      var data = {
        headers: req.headers,
        geolocation: geolocation,
        weather: weatherData,
      };
      const headersArray = Object.entries(data.headers);
      const tableRows = headersArray.map(([key, value]) => {
        return `<tr><td><strong>${key}</strong></td><td>${value}</td></tr>`;
      });
      const geolocationarray = Object.entries(data.geolocation);
      const geolocationRows = geolocationarray.map(([key, value]) => {
        if (key == "ip") {
          value = value.replace("::ffff:", "");
        }
        return `<tr><td><strong>${key}</strong></td><td>${value}</td></tr>`;
      });
      const weatherarray = Object.entries(data.weather);
      const weatherRows = weatherarray.map(([key, value]) => {
        return `<tr><td>${key}</td><td>${JSON.stringify(value)}</td></tr>`;
      });
      const weatherTableRows = weatherarray.map(([key, value]) => {
        // Handle multiline formatting for all values
        let formattedValue = "";

        if (Array.isArray(value)) {
          formattedValue = value
            .map((item) => {
              return Object.entries(item)
                .map(([subKey, subValue]) => `${subKey}: ${subValue}`)
                .join("<br>");
            })
            .join("<br>");
        } else if (typeof value === "object") {
          formattedValue = Object.entries(value)
            .map(([subKey, subValue]) => `${subKey}: ${subValue}`)
            .join("<br>");
        } else {
          formattedValue = value;
        }
        return `<tr><td><strong>${key}</strong></td><td>${formattedValue}</td></tr>`;
      });
      const reqTable = `${tableHtmlWithStyles}
      <h1> Headers<\h1>
<table>
  <tr><th>Header</th><th>Value</th></tr>
  ${tableRows.join("")}
</table>
<h1> Geolocation<\h1>
<table>
  <tr><th>Parameter</th><th>Value</th></tr>
  ${geolocationRows.join("")}
</table>
<h1> Weather Details<\h1>
<table>
  <tr><th>Parameter</th><th>Value</th></tr>
  ${weatherTableRows.join("")}
</table>
`;
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(reqTable);
    } catch (error) {
      console.error("Error:", error.message);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
