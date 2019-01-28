// Lambda script to check a URL response for an http 200 status code
// cfinnegan@dxc.com
// v0.0.1
/* In AWS Lambda console set handler to urlChecker.checkUrl and configure a Cloudwatch event trigger 
to supply a json object specifying the URLs to be checked on a schedule e.g. 
{
  "My google test URL": "http://google.com",
  "My glimps test URL": "http://glimps.in",
  "My test URL that will fail" : "http://google.com/xyz"
}
*/


"use strict";

// external dependencies
const AWS = require('aws-sdk');
const request = require('request');

// Configure default settings for all http requests
// todo, specifiy settings for each URL as json object passed to event handler (checkUrl)
const timeout = 3000; // ms to wait for response
const time = true; // retuns response time, response.elapsedTime
const method = 'GET'; // request method (GET/POST)
const followRedirect = true; // follow redirects, e.g. for http to https redirects
const maxRedirects = 5; // maximum redirects to follow

// get reference to cloudwatch 
const cloudwatch = new AWS.CloudWatch();


exports.checkUrl = (event, context, callback) => {

for (let [urlCheckName, url] of Object.entries(event)) {  
    
    // ignore invalid SSL certificate
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
   
    // call url and if response code is not 200 log an error
    request.get(url, 
        {
            timeout: timeout,
            time: time,
            method: method,
            followRedirect: followRedirect,
            maxRedirects: maxRedirects
        },
    (err, response, body) => {
        
        // default value for urlResponseTime metric
        let value = 0;
        
        // handle responseTime being undefined if we get a connection failure or timeout (set to 0)
        if(typeof response == 'undefined'){
        var responseTime = 0;
        } else {
        var responseTime = response.elapsedTime;
        }

        if (err) {
            console.log('ERROR   failed to connect to url : ' + url + ' Error: ' + err);
            value = 1;
        } 
        else if (response.statusCode !== 200) {
            console.log('ERROR   ' + url + ' responded with Status Code: ' + response.statusCode + ', Response Time : ' + responseTime + 'ms');
            value = 1;
        } 
        else console.log('SUCCESS ' + url + ' responded with Status Code: 200, Response Time : ' + responseTime + 'ms');

        let params = {
            MetricData: [
                {
                    MetricName: 'UrlNotResponding', 
                    Dimensions: [
                        {
                            Name: 'url', 
                            Value: url 
                        }
                    ],
                    Timestamp: new Date,
                    Unit: 'Count',
                    Value: value
                },
                {
                    MetricName: 'UrlResponseTime',
                    Dimensions: [
                        {
                            Name: 'url',
                            Value: url
                        }
                    ],
                    Timestamp: new Date,
                    Unit: 'Milliseconds',
                    Value: responseTime
                }
            ],
            Namespace: 'urlCheckResults' 
        };

        cloudwatch.putMetricData(params, (err, data) => {
            if (err) callback(err, 'KO');
            else callback(null, data);
        });

    });

}
};