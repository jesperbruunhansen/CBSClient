(function () {

    var eventData = [];
    var getEvents = $.ajax({
        type: "GET",
        url: config.url + "/getAllEvents/" + $.sessionStorage.get("userid"),
        dataType: "JSON"
    });

    getEvents.done(function (response, textStatus, jqXHR) {
        if (response != null) {
            processEvents(response);
        }
    });

    getEvents.fail(function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR, textStatus, errorThrown);
    });

    var processEvents = function (events) {

        events.forEach(function (event) {
            var eventObj = {};
            eventObj["event_id"] = event.eventid;
            eventObj["start"] = new Date(event.start);
            eventObj["end"] = new Date(event.end);
            eventObj["title"] = event.title;
            eventObj["location"] = event.location;
            eventObj["notes"] = event.notes;
            eventObj["forecast"] = event.weatherdata;

            eventData.push(eventObj);
        });
        createCalendar();
    }


    var createCalendar = function () {
        $(document).ready(function () {
            function convertDate(inputFormat) {
                function pad(s) {
                    return (s < 10) ? '0' + s : s;
                }

                var d = new Date(inputFormat);
                return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
            }

            var days = {
                names: ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"],
                getName: function (i) {
                    return this.names[i]
                }
            };

            /****************************************************
             Static utility object, for events data manipulation
             ****************************************************/
            var EventUtility = {
                dateTimeasDigits: function (date) {
                    var date = new Date(date);
                    var hours = (date.getHours() < 10) ? "0" + date.getHours() : date.getHours();
                    var minutes = (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes();
                    return hours + ":" + minutes;
                    //return format: HH:mm
                },
                eventLocation: function (location) {
                    if (location.length > 25) {
                        return location.substr(0, 25) + " ...";
                    }
                    else {
                        return location;
                    }
                },
                notes: function (notesObj) {
                    var lihtml = "";
                    notesObj.forEach(function (note) {
                        lihtml += "<li>" + note.text + "</li>";
                    });
                    return (lihtml.length > 0) ? lihtml : "";
                },
                forecast: function (forecastData) {
                    if (forecastData != null) {
                        return "<tr>" +
                            "<td colspan=\"2\"><b>Vejret</b></td>" +
                            "</tr>" +
                            "<tr>" +
                            "<td>Desc:</td>" +
                            "<td>" + forecastData.desc + "</td>" +
                            "</tr>" +
                            "<tr>" +
                            "<td>Temp:</td>" +
                            "<td>" + forecastData.celsius + "</td>" +
                            "</tr>"
                    }
                    else {
                        return "";
                    }

                }

            };

            var ajaxGet = function (apiKey, userid) {

                return $.ajax({
                    type: "GET",
                    url: config.url +"/"+ apiKey + "/" + userid,
                    dataType: "JSON"
                });

            }



            $("#createEvent").click(function () {

                //Format ddmmyyyy HHmm
                var parseDate = function (date, datoSplit, tidSplit) {

                    var dato = date.substr(0, date.indexOf(" "));
                    var tid = date.substr(dato.length, date.length).trim();

                    var d = dato.split(datoSplit);
                    var t = tid.split(tidSplit);

                    return d[2] + "-" + d[1] + "-" + d[0] + " " + t[0] + ":" + t[1] + ":00";

                }


                var newEvent = {
                    title: $("#inputTitle").val(),
                    calendarid: $("#calendars").find(":selected").val(),
                    location: $("#inputLocation").val(),
                    start: parseDate($("#datetimepicker1").find("input").val(), "-", ":"),
                    end: parseDate($("#datetimepicker2").find("input").val(), "-", ":"),
                    userid: $.sessionStorage.get("userid")
                };

                var json = "id=addEvent&jsonData=" + JSON.stringify(newEvent);

                console.log(json);

                var createEvent = $.ajax({
                    url: config.url,
                    type: "POST",
                    data: json
                });
                createEvent.done(function (response) {
                    console.log(response);

                    (function(){
                        var newEventData = [];
                        var getEvents = $.ajax({
                            type: "GET",
                            url: config.url + "/getAllEvents/" + $.sessionStorage.get("userid"),
                            dataType: "JSON"
                        });

                        getEvents.done(function (response, textStatus, jqXHR) {
                            if (response != null) {
                                console.log("events are processing");
                                processEvents(response);
                            }
                        });

                        getEvents.fail(function (jqXHR, textStatus, errorThrown) {
                            console.log(jqXHR, textStatus, errorThrown);
                        });

                        var processEvents = function (events) {
                            console.log(this + " is running ")
                            events.forEach(function (event) {
                                var eventObj = {};
                                eventObj["event_id"] = event.eventid;
                                eventObj["start"] = new Date(event.start);
                                eventObj["end"] = new Date(event.end);
                                eventObj["title"] = event.title;
                                eventObj["location"] = event.location;
                                eventObj["notes"] = event.notes;
                                eventObj["forecast"] = event.weatherdata;
                                newEventData.push(eventObj);
                            });
                            $("#calendar").fullCalendar('removeEvents');
                            $("#calendar").fullCalendar('addEventSource', newEventData);
                            $("#createNewEvent").modal("hide");
                        }
                    }());

                });


            });



            /********************************************
             Creation of FullCalender
             ********************************************/
            $('#calendar').fullCalendar({
                header: {
                    left: "prev, next today",
                    center: "title",
                    right: "agendaDay agendaWeek month",
                },
                dayClick: function (date, jsEvent, view) {

                    var $this = $("#createNewEvent");
                    $this.modal("show");

                    var userid = $.sessionStorage.get("userid");
                    var calendar = $("#calendars");
                    ajaxGet("getAllCalendars", userid).done(function (response) {
                        $.each(response, function (val, text) {
                            calendar.append(
                                $("<option></option>").val(text.calendarId).html(text.calendarName)
                            );
                        });
                    });

                },
                eventClick: function (calEvent, jsEvent, view) {
                    $(this).popover({
                        html: true,
                        placement: "right",
                        title: function () {
                            return calEvent.title;
                        },
                        content: function () {
                            return "<table class\"table\" width=\"100%\">" +
                                "<tbody>" +
                                "<tr>" +
                                "<td><b> Tid: </b></td>" +
                                "<td class=\"text-right\"> " + EventUtility.dateTimeasDigits(calEvent.start) + " - " + EventUtility.dateTimeasDigits(calEvent.end) + "</td>" +
                                "</tr>" +
                                "<tr>" +
                                "<td><b> Lokale: </b></td>" +
                                "<td class=\"text-right\"> " + EventUtility.eventLocation(calEvent.location) + " </td>" +
                                "</tr>" +
                                "<tr>" +
                                "<td style=\"padding-top:10px;\" colspan=\"2\"><b> Noter</b></td>" +
                                "</tr>" +
                                "<tr>" +
                                "<td colspan=\"2\">" +
                                "<ul class=\"note-ul\">" +
                                EventUtility.notes(calEvent.notes) +
                                "<li><a href=\"#\" id=\"addNewNote" + calEvent._id + "\">Ny note</a></li>" +
                                "</ul>" +
                                "</td>" +
                                "</tr>" +
                                EventUtility.forecast(calEvent.forecast) +
                                "<tr>" +
                                    "<td class=\"text-right\" colspan=\"2\">" +
                                        "<a onclick=\"deleteEvent('" + calEvent.event_id + "')\" href=\"#\"><span class=\"glyphicon glyphicon-remove\" style=\"style:color:red;margin-right:5px\"></span>Slet event</a>" +
                                    "</td>" +
                                "</tr>"
                                "</tbody>" +
                                "</table>";
                        },
                        container: "body"
                    });
                    $(this).popover('toggle');


                    $.fn.editable.defaults.mode = 'inline';
                    $('#addNewNote' + calEvent._id).editable({
                        type: 'text'
                    }).on("save", function (e, params) {

                        var request = $.ajax({
                            url: config.url,
                            dataType: "json",
                            type: "POST",
                            data: "id=addNote&jsonData=" +
                            "{\"userid\":'" + $.sessionStorage.get("userid") + "',\"eventid\":'" + calEvent.event_id + "',\"text\":'" + encodeURI(params.submitValue) + "'}"
                        });

                        request.done(function (response, textStatus, jqXHR) {


                        });

                    });
                },
                firstDay: 1,
                editable: false,
                timeFormat: 'H(:mm)',
                eventLimit: true, // allow "more" link when too many events
                dayNames: ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"],
                dayNamesShort: ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"],
                events: eventData
            });


        });


    }


}());