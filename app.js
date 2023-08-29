import express from "express";
import requestIp from "request-ip";
import axios from "axios";
import { apiKey, weatherApiKey } from "./constants.js";
const app = express();
app.use(requestIp.mw()); // Use the request-ip middleware
const city="";

app.get("/", async (req, res) => {
  try {
    const clientIP = req.clientIp; // Access the client's IP address from the request object
    const cleanedIP = clientIP.split(",")[0].trim(); // Clean the IP address
    let city = req.query.city; // Get the city from the query parameter
    var geolocation={};

    // If city is not provided in the query parameter, get it from IPinfo API
    if (!city) {
      try {
        const response = await axios.get(`http://ipinfo.io/${cleanedIP}/json?token=${apiKey}`);
        geolocation = response.data;
        console.log('Geolocation innnn:', geolocation);
        city = geolocation.city; // Use the city from IPinfo API
      } catch (error) {
        console.error('Error:', error.message);
        res.send({
          ip: cleanedIP,
          headers: req.headers,
          geolocationError: error.message,
          
        });
        return;
      }
    }

    // Get weather information from OpenWeatherMap API based on the city
    try {
      console.log(city);
      const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}`);
      const weatherData = weatherResponse.data;
      console.log('Weather Information:', weatherData);

      res.send({
        ip: cleanedIP,
        headers: req.headers,
        city: city,
        geolocation:geolocation,
        weather: weatherData,
        
      });
    } catch (error) {
        console.error('Error:', error.message);
        res.send({
          ip: cleanedIP,
          headers: req.headers,
          weatherError: error.message,
        });
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
  