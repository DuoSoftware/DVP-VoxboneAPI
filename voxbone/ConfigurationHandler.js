/**
 * Created by Rajinda on 8/14/2015.
 */

var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var request = require('request');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

function ApplyConfiguration(url,apiKey, data,callBack) {

    var options = {
        method: 'POST',
        uri: url +  '/configuration/configuration',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        },
        body: data
    };

    request(options, function (error, response, body) {
        if (error) {
            callBack(error,undefined);
        } else {
            callBack(undefined,response);

            /*logger.info('[DVP-Voxbone.ApplyConfiguration] - [%s] - - [%s]', response, body);
            if (response.statusCode != 200) {
                // Create an XMLDom Element:
                var doc = new dom().parseFromString(body);
                // Parse XML with XPath:
                var childNodes = xpath.select('//errors', doc);
                var jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, childNodes.toString());
                callBack.end(jsonString);
            } else {
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, body);
                callBack.end(jsonString);
            }*/
        }
    });
}

function ListCapacityGroup(url, apiKey, callBack, pageNo, size) {
    var options = {
        method: 'GET',
        uri: url + '/configuration/capacitygroup?pageNumber='+pageNo+'&pageSize='+ size, //Query string data
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        }
    };

    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.ListCapacityGroup] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.ListCapacityGroup] - [%s] - - [%s]', response, body);
            if (response.statusCode != 200) {
                // Create an XMLDom Element:
                var doc = new dom().parseFromString(body);
                // Parse XML with XPath:
                var childNodes = xpath.select('//errors', doc);
                var jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, childNodes.toString());
                callBack.end(jsonString);
            } else {
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, body);
                callBack.end(jsonString);
            }
        }
    });
}

function SaveCapacityGroup(url, apiKey, callBack, capacityGroupId, maximumCapacity, description) {
    var options = {
        method: 'PUT',
        uri: url + '/configuration/capacitygroup',
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        },
        body: '{"capacityGroup" : {"capacityGroupId" : "' + capacityGroupId + '","maximumCapacity" : "' + maximumCapacity + '","description" : "' + description + '"}}'
    };

    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.SaveCapacityGroup] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.SaveCapacityGroup] - [%s] - - [%s]', response, body);
            if (response.statusCode != 200) {
                // Create an XMLDom Element:
                var doc = new dom().parseFromString(body);
                // Parse XML with XPath:
                var childNodes = xpath.select('//errors', doc);
                var jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, childNodes.toString());
                callBack.end(jsonString);
            } else {
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, body);
                callBack.end(jsonString);
            }
        }
    });
}

module.exports.ApplyConfiguration = ApplyConfiguration;
module.exports.ListCapacityGroup = ListCapacityGroup;
module.exports.SaveCapacityGroup = SaveCapacityGroup;
