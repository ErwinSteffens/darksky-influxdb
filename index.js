const Influx = require('influx'),
    config = require('config'),
    cron = require('node-cron'),
    DarkSky = require('darksky-node/lib/darksky-api')

const generalConfig = config.get('general'),
    influxConfig = config.get('influxdb'),
    darkskyConfig = config.get('darksky')

if (!darkskyConfig.key) {
    throw new Error('DarkSky key should be provided')
}

const influx = new Influx.InfluxDB({
    host: influxConfig.host,
    database: influxConfig.database,
    username: influxConfig.username,
    password: influxConfig.password,
    schema: [
        {
            measurement: 'weather',
            tags: ['source'],
            fields: {
                temperature: Influx.FieldType.FLOAT,
                apparent_temperature: Influx.FieldType.FLOAT,
                dew_point: Influx.FieldType.FLOAT,
                humidity: Influx.FieldType.FLOAT,
                wind_speed: Influx.FieldType.FLOAT,
                wind_bearing: Influx.FieldType.FLOAT,
                cloud_cover: Influx.FieldType.FLOAT,
                pressure: Influx.FieldType.FLOAT,
                ozone: Influx.FieldType.FLOAT
            }
        }
    ]
})

const darksky = new DarkSky(darkskyConfig.key);

var getForecast = function () {
    darksky.forecast(darkskyConfig.latitude, darkskyConfig.longitude, {
        exclude: ['minutely', 'hourly', 'daily', 'alerts', 'flags'],
        units: darkskyConfig.units
    }, function (err, responseBody) {
        if (err) {
            console.error('Error while requesting darksky forecast', err)
        }
        else {
            var forecast = JSON.parse(responseBody)

            if (generalConfig.debug) {
                console.dir(forecast)
            }

            var current = forecast.currently;
            const points = [
                {
                    measurement: 'weather',
                    fields: {
                        temperature: current.temperature,
                        apparent_temperature: current.apparentTemperature,
                        dew_point: current.dewPoint,
                        humidity: current.humidity,
                        wind_speed: current.windSpeed,
                        wind_bearing: current.windBearing,
                        cloud_cover: current.cloudCover,
                        pressure: current.pressure,
                        ozone: current.ozone,
                    },
                    tags: {
                        source: 'darksky'
                    }
                }
            ];

            influx.writePoints(points).catch(err => {
                console.error('Error writing to InfluxDB', err)
            })
        }
    })
}

if (generalConfig.cron) {
    cron.schedule(generalConfig.cron, function(){
        getForecast();
    });    

    console.log(`DarkSky data will be written to InfluxDB on cron interval '${generalConfig.cron}'`);
} else {
    getForecast();

    console.log('DarkSky data is written to InfluxDB');
}