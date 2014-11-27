( function () {

    $(document).ready(function () {
        function convertDate(inputFormat) {
            function pad(s) {
                return ( s < 10 ) ? '0' + s : s;
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

        function buttonClick(){
            console.log("asdf");
        };

        var eventData = [];
        var events = $.sessionStorage.get("events");
        if(events != null) {
            events.forEach(function (event) {
                var eventObj = {};
                eventObj["id"] = event.id;
                eventObj["start"] = new Date(event.strDateStart);
                eventObj["end"] = new Date(event.strDateEnd);
                eventObj["title"] = event.title;
                eventData.push(eventObj);
            });

            $('#calendar').fullCalendar({
                header: {
                    left: "prev, next today",
                    center: "title",
                    right: "agendaDay agendaWeek month"
                },
                dayClick: function (date, jsEvent, view) {
                    $(this).popover({
                        html: true,
                        placement: 'right',
                        title: function () {
                            return "<b> " + days.getName(new Date(date).getDay() - 1) + " " + convertDate(new Date(date)) + "</b>";
                        },
                        content: function () {
                            return "<input type=\"text\" id=\"eventName\" name=\"eventName\"/><button id=\"createEvent\" onclick='buttonClick()'>Opret event</button>";
                        },
                        html: true,
                        container: 'body'
                    });
                    $(this).popover('toggle');
                },
                firstDay: 1,
                editable: false,
                eventLimit: true, // allow "more" link when too many events
                dayNames: ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"],
                dayNamesShort: ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"],
                events: eventData
            });
        }
        else {
            console.error("No calendar events has been set");
        }



    });

}() );