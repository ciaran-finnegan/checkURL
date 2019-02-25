# checkUrl

Author:  Ciaran Finnegan
Version: 0.0.1

## description
Node.js Lambda function that tests the availability of a web URL. Targets are specified in a json object passed to the event handler, urlChecker.checkUrl

In AWS Lambda console set handler to urlChecker.checkUrl and configure a Cloudwatch event trigger 
to supply a json object specifying the URLs to be checked on a schedule e.g. 

{
  "My google test URL": "http://google.com",
  "My glimps test URL": "http://glimps.in",
  "My test URL that will fail" : "http://google.com/xyz"
}

* Pass if a 2xx code is returned by a url (http or https).
* Fail on any other error (e.g. URL not found or other http error code)*/

## Implementation Notes

* You will aslo need to configure a role with required access to write to cloudwatch, see this URL <https://docs.aws.amazon.com/lambda/latest/dg/monitoring-functions.html>
* If you wish to test hosts inside a VPC there are further configuration steps, see this URL <https://docs.aws.amazon.com/lambda/latest/dg/vpc.html>
* The Lambda function will need to access Cloudwatch endpoints for your region to push logs and metrics, see this URL <https://docs.aws.amazon.com/general/latest/gr/rande.html> (if direct connectivity is not available a web proxy can be passed, see #32 in urlChecker.js, this functionality has not been tested)


### Sample Error Codes

* SUCCESS :: Received HTTP Response from http://aws.amazon.com/ with Status Code :: 200
* FAIL :: Received HTTP Response from http://aws.amazon.com/nnn with Status Code :: 404
* FAIL :: Error trying to connect to http://aws.amazon.comnnn, Error Code is :: ENOTFOUND




#### Installation

* Create a new Security Group
* * Name, urlChecker-out, Description urlChecker
* * Inbound rules none
* * Outbound rules, Protocol: TCP Ports: 0 - 65535 Destination: 0.0.0.0/0, Protocol DNS: Port: 53 Destination 0.0.0.0/0 (adjust as required)
* Create IAM Role
* * Name, Lambda-urlChecker
* Create a new lambda function called urlChecker
* * Description 'Checks URLs and logs to Cloudwatch'
* * Code entry type, zip file
* * Runtime, Node.js 8.10
* * Configure test events, checkURL
, example below, replace with accessible test URL
{
  "proxy-reports": "http://10.180.64.254/squid-reports/",
  "SOP": "http://oilssolapp01.sydapp.net:8000/sap/public/ping?sap-client=001"
}

* * Handler, urlChecker.checkURL
* * Memory 128MB
* * Timeout, 2 minutes (adjust as required)
* * Execution Role, Lambda-urlChecker
* * Network, choose applicable VPC
* * Subnets, choose applicable subnets
* * Security Groups,  (urlChecker) | urlChecker-out
* * Concurrency, use unreserved amount
* Create Cloudwatch Rule
* * Fixed rate of 5 minutes
* * Add Target, Lambda function, urlCheck
* * Configure input, Constant (JSON text)
 e.g. {   "kanyini": "http://kanyini.io",   "glimps": "http://glimps.in", "bedandbarns": "http://www.bedandbarns.com"}
* * Configure Dashboard
* * * to be completed
* * Configure Alarms
* * * e.g. UrlNotResponding >= 1 for 2 datapoints within 10 minutes
* * * to be completed

## Enhancements

### Update to pass configuration parameters for each URL e.g. 
{
    "url": "http://aws.amazon.com,
    "method": "GET",
    "timeout": 2000,
    "followRedirect": true,
    "maxRedirects": 5
}

### Pass proxy configuration as a parameter
Also, test that this works

### Automate creation of dashboards & alerts
