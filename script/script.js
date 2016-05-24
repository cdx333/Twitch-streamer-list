$(document).ready(function () {
    init();
});

var ul = $("ul");

// To track when all callbacks have been completed
var callbackCount; 

// Keeps a list of all streamers and stream/channel details
var entries = {}; 

// List of streamers
var streams = ["freecodecamp", "storbeck",
                   "terakilobyte", "habathcx",
                   "RobotCaleb", "brunofin", "thomasballinger",
                   "noobs2ninjas", "beohoff",
                   "fairlight_excalibur", "dexteritybonus", "dansgaming"];


// Gather all streamers channel data from twitch
function init() {
    callbackCount=0;
    
    for (var i = 0; i<streams.length; i++) {
        getChannelData(streams[i]);
    }
}

function getChannelData(streamer) {
    // Hold channels data for insertion in to entries{} list
    var tempChannelData = {};
    
    var twitchStreamAPI = "https://api.twitch.tv/kraken/streams/";

    $.getJSON(twitchStreamAPI + streamer + "?callback=?", function (data) {
        /* Set channel values depending on whether a stream object of error 
         * value is returned. If a stream object is not returned, query twitch
         * again for the channel data. When finished, check if all callbacks
         * have been finished before moving on with html construction
         */
        if(data.stream){
            tempChannelData =  setChannelData(tempChannelData, data.stream, true);            
            addEntry();
            printHTML(++callbackCount);
        }
        else if(data.error){
            tempChannelData = setErrorChannelData(tempChannelData, data, streamer);             
            addEntry();
            printHTML(++callbackCount);
        }
        else{
            $.getJSON(data._links.channel, function(data){
                tempChannelData = setChannelData(tempChannelData, data, false);                
                addEntry();
                printHTML(++callbackCount);
            })
        } 
        
        function printHTML(callbackCount){
            if(callbackCount === streams.length){
                /* Cycle through streams array using values as keys for the
                 * entries{} collection, contructing html based on the entry
                 * values 
                 */ 
                for(var i=0; i<streams.length; i++){
                    var currentEntry = entries[streams[i]]
                    var liHTML = constructHtml(currentEntry);
                    console.log(liHTML);
                    if(currentEntry.online){
                        ul.prepend(liHTML);
                    }else{
                        ul.append(liHTML);
                    }
                }
            }
        }

        // Add channel data to entry list using streamer name as key
        function addEntry(){
            entries[streamer] = tempChannelData;
        }
    });
}

    // Gather necessary values for tempChannelData
    function setChannelData(channelData, data, online) {
        
        channelData.online = online;
        channelData.game = data.game;
        data = online ? data.channel : data;
        channelData.logo = getLogo(data.logo);
        channelData.streamUrl = data.url;
        channelData.displayName = data.display_name;
        channelData.status = data.status;
        return channelData;
    }

    function setErrorChannelData(channelData, data, streamer) {
        channelData.error = true;
        channelData.status = data.message;
        channelData.errorCode = data.status;
        channelData.displayName = streamer;
        channelData.streamUrl = "#";
        channelData.logo = "./assets/img/error.png";
        return channelData;
    }

    function getLogo(logoURL){
        if(logoURL){
            return logoURL;
        } else{
            // Sourced from 
            // http://www.androidpolice.com/wp-content/uploads/2015/05/nexus2cee_unnamed-72.png
            return "./assets/img/twitch-icon.png";
        }
    }

    // Constructs the html for the <li> entries using the gathered data
    function constructHtml(channelData) {
        var name = channelData.displayName;

        var onlineStatus = channelData.online ? "online" : "offline";
        var id = " id='" + name + "'";
        var liClassId = getLiClass(onlineStatus, channelData.error) + id;
        var liEle = "<li " + liClassId + ">";

        var url = channelData.streamUrl;
        var urlEle = "<a href='" + url + "'>";
        var imgEle = "<div class='col-xs-3'><img class='logo' src='" + channelData.logo + "'/></div>";
        var nameDiv =  imgEle + "<div class='col-xs-9'><div class='col-sm-3'>" + urlEle + name + "</a></div>";

        var activityStatus = channelData.status ? channelData.status : "";
        var game = channelData.game ? channelData.game + ": " : "";
        var activityDiv = "<div class='col-sm-7 status'>" + game + activityStatus + "</div>";

        var onlineStatusText = "<h3>" + onlineStatus + "</h3>";
        var onlineStatusDiv = "<div class='col-sm-2'>" + onlineStatusText + "</div>";
        return liEle + "<div class='row'>" + nameDiv + activityDiv + onlineStatusDiv + "</div></div></li>";

    }

    function getLiClass(onlineStatus, error) {
        var liClass = "class='" + onlineStatus;
        liClass += error ? " error'" : "'";
        return liClass;
    }

    



    $('#on').on('click', function () {
        $(".offline").hide();
        $(".online").show();
    });

    $('#off').on('click', function () {
        $(".online").hide();
        $(".offline").show();
    });

    $('#all').on('click', function () {
        $(".offline").show();
        $(".online").show();
    });
