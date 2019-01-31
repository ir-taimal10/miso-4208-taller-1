$(function () {
    var template = _.template($('#page-template').html()),
        $content = $('#content'),
        options_template = _.template($('#options_template').html()),
        $options_wrapper = $('#options_wrapper');

    var stations = [];
    var db = new PouchDB('stations');


    var getStationSchedules = function (stationSlug) {

        var selectedStation = stations.filter(function (item) {
            return item.slug === stationSlug;
        })[0];

        if (selectedStation.info) {
            $content.html(template(selectedStation.info));
        } else {
            var schedules_url = `https://api-ratp.pierre-grimaud.fr/v3/schedules/rers/b/${stationSlug}/A`;
            var traffic_url = 'https://api-ratp.pierre-grimaud.fr/v3/traffic/rers/b';
            $.when(
                $.getJSON(schedules_url),
                $.getJSON(traffic_url))
                .done(function (schedules, traffic) {
                    var date = new Date(),
                        hours = date.getHours(),
                        minutes = date.getMinutes(),
                        current_time = (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes);

                    var trafficResponse = traffic[0].result,
                        scheduleResponse = schedules[0].result;

                    var data = {
                        _id: selectedStation.slug,
                        traffic: trafficResponse.message,
                        line: 'B',
                        type: 'rer',
                        horaires: scheduleResponse.schedules,
                        destination: 'Charles De Gaulle - Mitry Claye',
                        station: selectedStation.name,
                        current_time: current_time
                    };

                    db.get(selectedStation.slug).then(function (doc) {
                        doc.info = data;
                        return db.put(doc);
                    }).then(function (response) {
                        // handle response
                    }).catch(function (err) {
                        console.log(err);
                    });

                    $content.html(template(data));
                });
        }
    };

    var addOptionsEvents = function () {
        document.getElementById('selectStationToAdd')
            .addEventListener("change", function () {
                getStationSchedules(this.value);
            });
    };

    var getStations = function () {
        var stations_url = 'https://api-ratp.pierre-grimaud.fr/v3/stations/rers/b';
        $.when(
            $.getJSON(stations_url))
            .done(function (response) {
                stations = response.result.stations;
                response.result.stations.forEach(station => {
                    station._id = station.slug;
                    db.put(station, function callback(err, result) {
                        if (!err) {
                            console.log('Successfully posted a todo!');
                        }
                    });
                });
                getStationSchedules(stations[16].slug);
                $options_wrapper.html(options_template({
                    stations: stations
                }));
                addOptionsEvents();
            });
    };


    db.allDocs({include_docs: true, descending: true}, function (err, doc) {
        if (doc.rows.length > 0) {
            stations = doc.rows.map(r => r.doc);
            getStationSchedules(stations[16].slug);
            $options_wrapper.html(options_template({
                stations: stations
            }));
            addOptionsEvents();
        } else {
            getStations();
        }
    });


    // TODO add service worker code here
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function () {
                console.log('Service Worker Registered');
            });
    }
});
