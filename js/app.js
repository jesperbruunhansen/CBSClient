(function() {

  $(document).ready(function() {

    function convertDate(inputFormat) {
      function pad(s) {
        return (s < 10) ? '0' + s : s;
      }

      var d = new Date(inputFormat);
      return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
    }

    var days = {
      names: ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"],
      getName: function(i) {
        return this.names[i]
      }
    };
    
    var eventUtility = {
        DateTimeasDigits : function(date){
            var date = new Date(date);
            var hours = (date.getHours() < 10) ? "0"+date.getHours() : date.getHours();
            var minutes = (date.getMinutes() < 10) ? "0"+date.getMinutes() : date.getMinutes();   
            return hours + ":" + minutes;
            //return format: HH:mm     
        },
        eventLocation : function(location){
            if(location.length > 25){
                return location.substr(0, 25) + " ...";
            }
            else {
                return location;
            }
        },
        notes : function(notesObj){
                var lihtml = "";
                notesObj.forEach(function(note) {
                    lihtml += "<li>" + note.text + "</li>"; 
                });
                return lihtml;
            }
    };
    
    
    var eventData = [];
    var events = $.sessionStorage.get("events");
    if (events != null) {
      events.forEach(function(event) {
        var eventObj = {};
        eventObj["id"] = event.id;
        eventObj["start"] = new Date(event.strDateStart);
        eventObj["end"] = new Date(event.strDateEnd);
        eventObj["title"] = event.title;
        eventObj["location"] = event.location;
        eventObj["notes"] = event.noter;
        eventObj["forecast"] = event.forecast;
        eventData.push(eventObj);
      });

      $('#calendar').fullCalendar({
        header: {
          left: "prev, next today",
          center: "title",
          right: "agendaDay agendaWeek month"
        },
        eventClick : function (calEvent, jsEvent, view){
              $(this).popover({
              html : true,
              placement : "right",
              title : function() {
                  return calEvent.title;
              },
              content : function() {
                  return "<table class\"table\" width=\"100%\">"+
                            "<tr>" + 
                                "<td><b> Tid: </b></td>" +
                                "<td class=\"text-right\"> " + eventUtility.DateTimeasDigits(calEvent.start) + " - " + eventUtility.DateTimeasDigits(calEvent.end) + "</td>" +
                            "</tr>" +
                            "<tr>" + 
                                "<td><b> Lokale: </b></td>" +
                                "<td class=\"text-right\"> " + eventUtility.eventLocation(calEvent.location)+ " </td>" +
                            "</tr>" +
                            "<tr>" + 
                                "<td style=\"padding-top:10px;\" colspan=\"2\"><b> Noter</b></td>" +
                            "</tr>" +
                            "<tr>" + 
                                "<td colspan=\"2\">"+
                                    "<ul class=\"note-ul\">" +
                                        eventUtility.notes(calEvent.notes);
                                    "</ul>"+
                                "</td>" +
                            "</tr>" +
                         "</table>";
              },
              container : "body"
          });  
          $(this).popover('toggle');
        },
        firstDay: 1,
        editable: false,
        timeFormat: 'H(:mm)',
        eventLimit: true, // allow "more" link when too many events
        dayNames: ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"],
        dayNamesShort: ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"],
        events: eventData
      });
    } else {
      console.error("No calendar events has been set");
    }



  });

}());