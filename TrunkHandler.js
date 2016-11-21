/**
 * Created by Rajinda on 8/24/2015.
 */

var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var request = require('request');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;

var format = require('string-format');
var config = require('config');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

var limitUrl = format('http://{0}:{1}/DVP/API/{2}/', config.Services.limitServiceHost, config.Services.limitServicePort, config.Services.limitServiceVersion);
var trunkUrl = format("http://{0}/DVP/API/{1}", 'phonenumbertrunkservice.app.veery.cloud', '1.0.0.0');


function TrunkSetup(tenant, company, phoneNumber, callback) {// if no outbound set to null
    //var jsonString;
    var data = '{ "PhoneNumber":"' + phoneNumber + '","ClientCompany":' + company+',"ClientTenant":' + tenant+'}';
    var options = {
        method: 'POST',
        uri: trunkUrl + '/PhoneNumberTrunkApi/Operator/VOXBONE/TrunkNumber',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': config.Services.authToken,
            'companyinfo': '1:3'
        },
        body: data
    };
    request(options, function (error, response, body) {
        if (error) {
            //jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.CreateTrunk] - [%s] - [%s] - Error.', response, body, error);
            //callBack.end(error, body);
        } else {

            logger.info('[DVP-Voxbone.CreateTrunk-SetLoadBalancer] - [%s]', response);
            //jsonResp = JSON.parse(body);
            //if (!jsonResp.IsSuccess) {
                //jsonString = messageFormatter.FormatMessage(new error(jsonResp), "EXCEPTION", false, response);
                //callBack.end(jsonString);
                //return;
            //}
            //var trunkInfo = jsonResp.Result;
        }
        callback(error, response, JSON.parse(body));
    });
}

function SetLimitToNumber(company, tenant, phoneNumber, limit, callback) {

    var data = '{"PhoneNumber":"' + phoneNumber + '","Limit":' + limit+'}';
    var options = {
        method: 'POST',
        uri: trunkUrl + '/PhoneNumberTrunkApi/Operator/VOXBONE/AssignNumberLimit',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': config.Services.authToken,
            'companyinfo': tenant+':'+company
        },
        body: data
    };
    request(options, function (error, response, body) {
        if (error) {
            //var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.SetLimitToNumber] - [%s] - [%s] - Error.', response, body, error);
            //.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.SetLimitToNumber] - [%s] - - [%s]', response, body);
            //var jsonResp = JSON.parse(body);
            //if (!jsonResp.IsSuccess) {
                //var jsonString = messageFormatter.FormatMessage(new error(jsonResp), "EXCEPTION", false, response);
                //callBack.end(jsonString);return;
            //}
            //var limitId = jsonResp.Result;
        }
        callback(error, response, JSON.parse(body));
    });
}


module.exports.TrunkSetup = TrunkSetup;
module.exports.SetLimitToNumber = SetLimitToNumber;
