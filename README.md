# darksky-influxdb

Docker image which logs weather information from [DarkSky.net](https://darksky.net) to InfluxDB.

# DarkSky key

A DarkSky api key can be requested here: [https://darksky.net/dev](https://darksky.net/dev/). This key needs to be provided to the docker image as an environment variable. 

You get 1000 requests per day for free. Enough to use for your personal weather logger.

# Usage

Run it once:

```
docker run -rm -it \
    -e DARKSKY_KEY=<your-darksky-key> \
    -e INFLUXDB_HOST=influxdb.myhost.io \
    -e INFLUXDB_DATABASE=weather \
    erwinsteffens/darksky-influxdb:lastest
```

Run it every 10 seconds:

```
docker run -rm -it \
    -e DARKSKY_KEY=<your-darksky-key> \
    -e CRON="*\10 * * * * *" \
    -e INFLUXDB_HOST=influxdb.myhost.io \
    -e INFLUXDB_DATABASE=weather \
    erwinsteffens/darksky-influxdb:lastest
```

Query the weather data from your InfluxDB instance. For example show average temperature for the last 7 days:

`SELECT MEAN("temperature") FROM weather WHERE time > now() - 7d GROUP BY time(1d)`

# Environment variables

### DEBUG

When set to any value, write request output to the command line.

### CRON

When set the data will be updated on the given interval.

Examples:
* `*\10 * * * * *`: update every 10 seconds.
* `* *\10 * * * *`: update every 10 minutes.
* `* 5 * * * *`: update every hour on the 5th minute.

### DARKSKY_KEY

Your DarkSky api key. Request it here: [https://darksky.net/dev](https://darksky.net/dev)

### DARKSKY_UNITS 

The metric units to use. Choose from: 
* `auto`: automatically select units based on geographic location
* `ca`: same as si, except that windSpeed is in kilometers per hour
* `uk2`: same as si, except that nearestStormDistance and visibility are in miles and windSpeed is in miles per hour
* `us`: Imperial units (the default)
* `si`: SI units

### DARKSKY_LATITUDE and DARKSKY_LONGITUDE

Your geo coordinates to get the weater data for. You can find them here: [http://mygeoposition.com/](http://mygeoposition.com/).

### INFLUXDB_HOST

Hostname of IP of your InfluxDB server.

### INFLUXDB_DATABASE

Database to write to for InfluxDB.

### INFLUXDB_USERNAME and INFLUXDB_PASSWORD

Credentials to use for InfluxDB.