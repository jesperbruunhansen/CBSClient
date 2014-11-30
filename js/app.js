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
    
    /****************************************************
    Static utility object, for events data manipulation
    ****************************************************/
    var EventUtility = {
        dateTimeasDigits : function(date){
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
                return (lihtml.length > 0) ? lihtml : "";
            },
       forecast : function(forecastData){
           if(forecastData != null){
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
    
    function updateEvents(){
        $.sessionStorage.remove("events");
        
        
        
    }

    /****************************************************
    Map events from Sessions to Javascript Object List
    ****************************************************/
    var eventData = [];
    var events = $.sessionStorage.get("events");
    if (events != null) {
      events.forEach(function(event) {
        var eventObj = {};
        eventObj["id"] = event.id;
        eventObj["event_id"] = event.eventid;
        eventObj["start"] = new Date(event.strDateStart);
        eventObj["end"] = new Date(event.strDateEnd);
        eventObj["title"] = event.title;
        eventObj["location"] = event.location;
        eventObj["notes"] = event.noter;
        eventObj["forecast"] = event.forecast;
        eventData.push(eventObj);
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
        eventClick : function (calEvent, jsEvent, view){
              $(this).popover({
                  html : true,
                  placement : "right",
                  title : function() {
                      return calEvent.title;
                  },
                  content : function() {
                      return "<table class\"table\" width=\"100%\">"+
                                "<tbody>" + 
                                "<tr>" + 
                                    "<td><b> Tid: </b></td>" +
                                    "<td class=\"text-right\"> " + EventUtility.dateTimeasDigits(calEvent.start) + " - " + EventUtility.dateTimeasDigits(calEvent.end) + "</td>" +
                                "</tr>" +
                                "<tr>" + 
                                    "<td><b> Lokale: </b></td>" +
                                    "<td class=\"text-right\"> " + EventUtility.eventLocation(calEvent.location)+ " </td>" +
                                "</tr>" +
                                "<tr>" + 
                                    "<td style=\"padding-top:10px;\" colspan=\"2\"><b> Noter</b></td>" +
                                "</tr>" +
                                "<tr>" + 
                                    "<td colspan=\"2\">"+
                                        "<ul class=\"note-ul\">" +
                                            EventUtility.notes(calEvent.notes) +
                                            "<li><a href=\"#\" id=\"addNewNote" + calEvent._id + "\">Ny note</a></li>" + 
                                        "</ul>"+
                                    "</td>" +
                                "</tr>" +
                                 EventUtility.forecast(calEvent.forecast) +
                                "</tbody" +
                             "</table>";
                  },
                  container : "body"
              });  
          $(this).popover('toggle');
          
          $.fn.editable.defaults.mode = 'inline';
          $('#addNewNote' + calEvent._id).editable({
              type: 'text',
          }).on("save", function (e, params){
              
              var request = $.ajax({
                  url : 'http://127.0.0.1:52400/',
                  dataType : "json",
                  type : "POST",
                  data : "id=addNote&jsonData=" + 
                  "{\"userid\":'" + $.sessionStorage.get("userid") + "',\"eventid\":'" + calEvent.event_id + "',\"text\":'" + encodeURI(params.submitValue) + "'}"
              });
              
              request.done(function (response, textStatus, jqXHR){
                      
                      $.sessionStorage.remove("events");
                      $.sessionStorage.set("events", response.events);
                      
                      eventData = [];
                      var events = $.sessionStorage.get("events");
                        events.forEach(function(event) {
                          var eventObj = {};
                          eventObj["id"] = event.id;
                          eventObj["event_id"] = event.eventid;
                          eventObj["start"] = new Date(event.strDateStart);
                          eventObj["end"] = new Date(event.strDateEnd);
                          eventObj["title"] = event.title;
                          eventObj["location"] = event.location;
                          eventObj["notes"] = event.noter;
                          eventObj["forecast"] = event.forecast;
                          eventData.push(eventObj);
                        });

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
    } else {
      console.error("No calendar events has been set");
    }



  });

}());