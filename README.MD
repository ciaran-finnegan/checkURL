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

You will aslo need to configure a role with required access to write to cloudwatch, see this URL <https://docs.aws.amazon.com/lambda/latest/dg/monitoring-functions.html>
If you wish to test hosts inside a VPC there are further configuration steps, see this URL <https://docs.aws.amazon.com/lambda/latest/dg/vpc.html>

### Sample Error Codes

* SUCCESS :: Received HTTP Response from http://aws.amazon.com/ with Status Code :: 200
* FAIL :: Received HTTP Response from http://aws.amazon.com/nnn with Status Code :: 404
* FAIL :: Error trying to connect to http://aws.amazon.comnnn, Error Code is :: ENOTFOUND


#### Enhancements

Update to pass configuration parameters for each URL e.g. 
{
    "url": "http://aws.amazon.com,
    "method": "GET",
    "timeout": 2000,
    "followRedirect": true,
    "maxRedirects": 5
}