// We need these to grab the html file and then parse it
var request = require('request');
var cheerio = require('cheerio');
var slack_variables = require("./slack-variables.js");
// We want to check if the donor name has changed from last time we checked
var current_first_name = " ";
var current_last_name = " ";
var current_amount = " ";

// We check for a new donor every minute
function requestWeRGold(){
  request("https://impact.rpi.edu/project/9041/wall", function (error, response, html) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
      var donors = $("div.donor-tile");
      var first_name = donors.find("h4.top-row").first().text();
      var last_name = donors.find("h4.bottom-row").first().text();
      var amount = donors.find("h4.amount").first().text();

      // If these haven't been set yet it means the application has just been started.
      // We will call this the first donor.
      if(current_first_name === " " || current_last_name === " " || current_amount === " "){
        current_first_name = first_name;
        current_last_name = last_name;
        current_amount = amount;
      }

      // There's a new donation if any of these three don't match
      // Note this would fail if you donated the exact same amount twice, but I don't expect that
      if(first_name !== current_first_name && last_name !== current_last_name && amount !== current_amount){
        current_first_name = first_name;
        current_last_name = last_name;
        current_amount = amount;
        let message = first_name + " " +  last_name + " just donated " + amount + "!";
        console.log(message);
        request.post("https://slack.com/api/chat.postMessage", {form:{token:slack_variables.token, channel: slack_variables.channel, text: message}});
      }
    }else{
        console.log(error);
    }
  });
}

console.log("Application started!");
// Calls the request function every minute
setInterval(requestWeRGold, 60000);