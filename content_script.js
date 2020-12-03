const months = {"January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6, "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12};

// Listens for extension's message
chrome.runtime.onMessage.addListener(
  // Send response upon message recieved
  function(request, sender, sendResponse) {

    // Test to see if calendar is in week-view or in day/month-view
    var calStatus = document.getElementsByClassName("fc-agendaWeek-view")[0];
    if (calStatus) {
      sendResponse({response: "success"});
      downloadICS(parseEvents(discoverEvents())); // main function call
    }
    else {
      sendResponse({response: "failure"});
    }
  }
);

// Collect all events in array from webpage
function discoverEvents() {
  var events = document.getElementsByClassName("fc-time-grid-event");
  var eventText = [];
  for (var i = 0; i < events.length; i++) {
    eventText.push(events[i].getAttribute("aria-label"));
  }
  return eventText;
}

// Take in raw event array and return array of parsed information for adding to ICS file
function parseEvents(eventList) {
  var parsedEvents = [];
  var date = [];
  for (var i = 0; i < eventList.length; i++) { // Loop through raw array
      if (eventList[i][0] != 'A' && eventList[i][0] != 'O' && eventList[i][0] != null) {
        // You're Working! for the shift titled Call Center / Call Center - Overflow in the position Call Center on November 30th 2020, 10 am to 2 pm. Select for more details.
        title = eventList[i].slice((eventList[i].indexOf(" in the position ") + 17), eventList[i].indexOf(" on ")) 
        // "Call Center"
        unformattedDate = eventList[i].slice( eventList[i].indexOf(" on ") + 4, eventList[i].indexOf(",") ).split(" ");
        // ["November", "30th", "2020"]
        unformattedTime = eventList[i].slice( eventList[i].indexOf(", ") + 2, eventList[i].indexOf(".") ).split(" ");
        // ["10", "am", "to", "2", "pm"]
        if (unformattedDate[1] != null) { // Test ["November", "30th", "2020"] for contents (ensures empty events don't return error)
          // Look up month name in table to get numerical value
          date[0] = months[unformattedDate[0]] + "/" + unformattedDate[1].slice(0, unformattedDate[1].length-2) + "/" + unformattedDate[2];
          // ["11/30/2020", ""]
        }
        // Test elements to see if they are HH or HH:MM
        if (unformattedTime[0].length <= 2) { 
          unformattedTime[0] = unformattedTime[0] + ":00" // If HH, add ":00"
        }
        if (unformattedTime[3].length <= 2) {
          unformattedTime[3] = unformattedTime[3] + ":00"
        }

        time = [unformattedTime[0] + " " + unformattedTime[1], unformattedTime[3] + " " + unformattedTime[4]];
        // ["10:00 am", "2:00 pm"]

        if (time[1].indexOf("12:00 am") != -1) { // If event ends at 12:00 am, we need to increment the date to the next day for proper .ics formatting
          splitDate = date[0].split("/");
          // HANDLE ADDING DAYS FOR END OF MONTH
          d = new Date(splitDate[2], parseInt(splitDate[0])-1, parseInt(splitDate[1])+1);
          date[1] = d.getMonth()+1 + "/" + d.getDate() + "/" + d.getFullYear();
          time[1][(time[1].length)-2] = 'a';
        }
        else {
          date[1] = date[0];
        }
        // ["11/30/2020", "11/30/2020"]

        parsedEvents.push({ 
          "title": title, // "Call Center"
          "starttime": date[0] + " " + time[0], // "11/30/2020 10:00 am"
          "endtime": date[1] + " " + time[1] // "11/30/2020 2:00 pm"
        });
      }
  }
  return parsedEvents;
}

function createUUID() { // Create random UUID so that calendar events don't overwrite each other
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
     var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
     return v.toString(16).toUpperCase();
  });
}

function downloadICS(parsedEvents) {
  // Definitions for .ics
  var saveAs=saveAs||function(e){"use strict";if(typeof e==="undefined"||typeof navigator!=="undefined"&&/MSIE [1-9]\./.test(navigator.userAgent)){return}var t=e.document,n=function(){return e.URL||e.webkitURL||e},r=t.createElementNS("http://www.w3.org/1999/xhtml","a"),o="download"in r,a=function(e){var t=new MouseEvent("click");e.dispatchEvent(t)},i=/constructor/i.test(e.HTMLElement)||e.safari,f=/CriOS\/[\d]+/.test(navigator.userAgent),u=function(t){(e.setImmediate||e.setTimeout)(function(){throw t},0)},s="application/octet-stream",d=1e3*40,c=function(e){var t=function(){if(typeof e==="string"){n().revokeObjectURL(e)}else{e.remove()}};setTimeout(t,d)},l=function(e,t,n){t=[].concat(t);var r=t.length;while(r--){var o=e["on"+t[r]];if(typeof o==="function"){try{o.call(e,n||e)}catch(a){u(a)}}}},p=function(e){if(/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)){return new Blob([String.fromCharCode(65279),e],{type:e.type})}return e},v=function(t,u,d){if(!d){t=p(t)}var v=this,w=t.type,m=w===s,y,h=function(){l(v,"writestart progress write writeend".split(" "))},S=function(){if((f||m&&i)&&e.FileReader){var r=new FileReader;r.onloadend=function(){var t=f?r.result:r.result.replace(/^data:[^;]*;/,"data:attachment/file;");var n=e.open(t,"_blank");if(!n)e.location.href=t;t=undefined;v.readyState=v.DONE;h()};r.readAsDataURL(t);v.readyState=v.INIT;return}if(!y){y=n().createObjectURL(t)}if(m){e.location.href=y}else{var o=e.open(y,"_blank");if(!o){e.location.href=y}}v.readyState=v.DONE;h();c(y)};v.readyState=v.INIT;if(o){y=n().createObjectURL(t);setTimeout(function(){r.href=y;r.download=u;a(r);h();c(y);v.readyState=v.DONE});return}S()},w=v.prototype,m=function(e,t,n){return new v(e,t||e.name||"download",n)};if(typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob){return function(e,t,n){t=t||e.name||"download";if(!n){e=p(e)}return navigator.msSaveOrOpenBlob(e,t)}}w.abort=function(){};w.readyState=w.INIT=0;w.WRITING=1;w.DONE=2;w.error=w.onwritestart=w.onprogress=w.onwrite=w.onabort=w.onerror=w.onwriteend=null;return m}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content);if(typeof module!=="undefined"&&module.exports){module.exports.saveAs=saveAs}else if(typeof define!=="undefined"&&define!==null&&define.amd!==null){define("FileSaver.js",function(){return saveAs})}
  var ics=function(e,t){"use strict";{if(!(navigator.userAgent.indexOf("MSIE")>-1&&-1==navigator.userAgent.indexOf("MSIE 10"))){void 0===e&&(e="default"),void 0===t&&(t="Calendar");var r=-1!==navigator.appVersion.indexOf("Win")?"\r\n":"\n",n=[],i=["BEGIN:VCALENDAR","PRODID:"+t,"VERSION:2.0"].join(r),o=r+"END:VCALENDAR",a=["SU","MO","TU","WE","TH","FR","SA"];return{events:function(){return n},calendar:function(){return i+r+n.join(r)+o},addEvent:function(t,i,o,l,u,s){if(void 0===t||void 0===i||void 0===o||void 0===l||void 0===u)return!1;if(s&&!s.rrule){if("YEARLY"!==s.freq&&"MONTHLY"!==s.freq&&"WEEKLY"!==s.freq&&"DAILY"!==s.freq)throw"Recurrence rrule frequency must be provided and be one of the following: 'YEARLY', 'MONTHLY', 'WEEKLY', or 'DAILY'";if(s.until&&isNaN(Date.parse(s.until)))throw"Recurrence rrule 'until' must be a valid date string";if(s.interval&&isNaN(parseInt(s.interval)))throw"Recurrence rrule 'interval' must be an integer";if(s.count&&isNaN(parseInt(s.count)))throw"Recurrence rrule 'count' must be an integer";if(void 0!==s.byday){if("[object Array]"!==Object.prototype.toString.call(s.byday))throw"Recurrence rrule 'byday' must be an array";if(s.byday.length>7)throw"Recurrence rrule 'byday' array must not be longer than the 7 days in a week";s.byday=s.byday.filter(function(e,t){return s.byday.indexOf(e)==t});for(var c in s.byday)if(a.indexOf(s.byday[c])<0)throw"Recurrence rrule 'byday' values must include only the following: 'SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'"}}var g=new Date(l),d=new Date(u),f=new Date,S=("0000"+g.getFullYear().toString()).slice(-4),E=("00"+(g.getMonth()+1).toString()).slice(-2),v=("00"+g.getDate().toString()).slice(-2),y=("00"+g.getHours().toString()).slice(-2),A=("00"+g.getMinutes().toString()).slice(-2),T=("00"+g.getSeconds().toString()).slice(-2),b=("0000"+d.getFullYear().toString()).slice(-4),D=("00"+(d.getMonth()+1).toString()).slice(-2),N=("00"+d.getDate().toString()).slice(-2),h=("00"+d.getHours().toString()).slice(-2),I=("00"+d.getMinutes().toString()).slice(-2),R=("00"+d.getMinutes().toString()).slice(-2),M=("0000"+f.getFullYear().toString()).slice(-4),w=("00"+(f.getMonth()+1).toString()).slice(-2),L=("00"+f.getDate().toString()).slice(-2),O=("00"+f.getHours().toString()).slice(-2),p=("00"+f.getMinutes().toString()).slice(-2),Y=("00"+f.getMinutes().toString()).slice(-2),U="",V="";y+A+T+h+I+R!=0&&(U="T"+y+A+T,V="T"+h+I+R);var B,C=S+E+v+U,j=b+D+N+V,m=M+w+L+("T"+O+p+Y);if(s)if(s.rrule)B=s.rrule;else{if(B="rrule:FREQ="+s.freq,s.until){var x=new Date(Date.parse(s.until)).toISOString();B+=";UNTIL="+x.substring(0,x.length-13).replace(/[-]/g,"")+"000000Z"}s.interval&&(B+=";INTERVAL="+s.interval),s.count&&(B+=";COUNT="+s.count),s.byday&&s.byday.length>0&&(B+=";BYDAY="+s.byday.join(","))}(new Date).toISOString();var H=["BEGIN:VEVENT","UID:"+n.length+"@"+e,"CLASS:PUBLIC","DESCRIPTION:"+i,"DTSTAMP;VALUE=DATE-TIME:"+m,"DTSTART;VALUE=DATE-TIME:"+C,"DTEND;VALUE=DATE-TIME:"+j,"LOCATION:"+o,"SUMMARY;LANGUAGE=en-us:"+t,"TRANSP:TRANSPARENT","END:VEVENT"];return B&&H.splice(4,0,B),H=H.join(r),n.push(H),H},download:function(e,t){if(n.length<1)return!1;t=void 0!==t?t:".ics",e=void 0!==e?e:"calendar";var a,l=i+r+n.join(r)+o;if(-1===navigator.userAgent.indexOf("MSIE 10"))a=new Blob([l]);else{var u=new BlobBuilder;u.append(l),a=u.getBlob("text/x-vCalendar;charset="+document.characterSet)}return saveAs(a,e+t),l},build:function(){return!(n.length<1)&&i+r+n.join(r)+o}}}console.log("Unsupported Browser")}};
  cal = ics(createUUID());
  
  for (var i = 0; i < parsedEvents.length; i++) {
    cal.addEvent(parsedEvents[i]["title"], "Work Shift", "", parsedEvents[i]["starttime"], parsedEvents[i]["endtime"]);
  }

  javascript:cal.download('Workshifts');
}
