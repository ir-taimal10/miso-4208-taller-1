$(function () {
    var template = _.template($('#page-template').html()),
        $content = $('#content'),
        options_template = _.template($('#options_template').html()),
        $options_wrapper = $('#options_wrapper');

    var stations = [];


    var getStationSchedules = function (stationSlug) {
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

                 var selectedStation = stations.filter(function (item) {
                    return item.slug === stationSlug;
                })[0];


                var trafficResponse = traffic[0].result,
                    scheduleResponse = schedules[0].result;

                var data = {
                    traffic: trafficResponse.message,
                    line: 'B',
                    type: 'rer',
                    horaires: scheduleResponse.schedules,
                    destination: 'Charles De Gaulle - Mitry Claye',
                    station: selectedStation.name,
                    current_time: current_time
                };
                console.log('schedules', schedules);
                console.log('traffic', traffic);

                $content.html(template(data));
            });
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
                $options_wrapper.html(options_template({
                    stations: stations
                }));
                addOptionsEvents();
            });
    };


    getStations();
    getStationSchedules('arcueil+cachan');
});
