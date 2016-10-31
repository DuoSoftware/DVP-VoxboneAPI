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
var trunkUrl = format("http://{0}:{1}/DVP/API/{2}/", config.Services.trunkServiceHost, config.Services.trunkServicePort, config.Services.trunkServiceVersion);


function TrunkSetup(apiKey, callBack, enable, faxType, ipUrl, trunkCode, trunkName, lbId, operatorCode, operatorName) {// if no outbound set to null

    var TrunkId = -1;
    var data = '{ "Enable":"' + enable + '","FaxType":"' + faxType + '","IpUrl":"' + ipUrl + '","ObjCategory":"Voxbone","ObjClass":"Voxbone","ObjType":"Voxbone","TrunkCode":"trunkCode","TrunkName":"trunkName"}';
    var options = {
        method: 'POST',
        uri: trunkUrl + '/PhoneNumberTrunkApi/Trunk',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        },
        body: data
    };
    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.CreateTrunk] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {

            logger.info('[DVP-Voxbone.CreateTrunk-SetLoadBalancer] - [%s]', response);
            var jsonResp = JSON.parse(body);
            if (!jsonResp.IsSuccess) {
                var jsonString = messageFormatter.FormatMessage(new error(jsonResp), "EXCEPTION", false, response);
                callBack.end(jsonString);
                return;
            }
            TrunkId = jsonResp.Result;
            var options = {
                method: 'POST',
                uri: trunkUrl + '/PhoneNumberTrunkApi/Trunk/' + TrunkId + '/SetCloud/' + lbId,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': apiKey
                },
            };
            request(options, function (error, response, body) {
                if (error) {
                    var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                    logger.error('[DVP-Voxbone.CreateTrunk-SetLoadBalancer] - [%s] - [%s] - Error.', response, body, error);
                    callBack.end(jsonString);
                } else {

                    logger.info('[DVP-Voxbone.CreateTrunk-SetLoadBalancer-Operator] - [%s] -', response);
                    jsonResp = JSON.parse(body);
                    if (!jsonResp.IsSuccess) {
                        var jsonString = messageFormatter.FormatMessage(new error(jsonResp), "EXCEPTION", false, response);
                        callBack.end(jsonString);
                        return;
                    }
                    var data = '{"OperatorCode":"' + operatorCode + '","OperatorName":"' + operatorName + '","ObjClass":"voxbone","ObjType":"voxbone","ObjCategory":"voxbone"}';
                    var options = {
                        method: 'POST',
                        uri: trunkUrl + '/PhoneNumberTrunkApi/Operator',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': apiKey
                        },
                        body: data
                    };
                    request(options, function (error, response, body) {
                        if (error) {
                            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                            logger.error('[DVP-Voxbone.CreateTrunk-SetLoadBalancer-Operator] - [%s] - [%s] - Error.', response, body, error);
                            callBack.end(jsonString);
                        } else {

                            logger.info('[DVP-Voxbone.CreateTrunk-SetLoadBalancer-Operator-SetOperator] - [%s]', response);

                            jsonResp = JSON.parse(body);
                            if (!jsonResp.IsSuccess) {
                                var jsonString = messageFormatter.FormatMessage(new error(jsonResp), "EXCEPTION", false, response);
                                callBack.end(jsonString);
                                return;
                            }
                            var opId = jsonResp.Result;

                            var options = {
                                method: 'POST',
                                uri: trunkUrl + '/PhoneNumberTrunkApi/Trunk/' + TrunkId + '/SetOperator/' + opId,
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                    'Authorization': apiKey
                                },

                            };
                            request(options, function (error, response, body) {
                                if (error) {
                                    var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                                    logger.error('[DVP-Voxbone.CreateTrunk-SetLoadBalancer-Operator-SetOperator] - [%s] - [%s] - Error.', response, body, error);
                                    callBack.end(jsonString);
                                } else {
                                    logger.info('[DVP-Voxbone.CreateTrunk-SetLoadBalancer-Operator-SetOperator] - [%s] - - [%s]', response, body);
                                    var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, TrunkId);
                                    callBack.end(jsonString);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

function SetLimitToNumber(apiKey, limitDescription, maxCount, phoneNumber, trunkId, callBack) {

    var data = '{"LimitDescription":"' + limitDescription + '","MaxCount":' + maxCount + ',"Enable":true}';
    var options = {
        method: 'POST',
        uri: limitUrl + '/LimitAPI/Limit',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        },
        body: data
    };
    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.SetLimitToNumber] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.SetLimitToNumber] - [%s] - - [%s]', response, body);
            var jsonResp = JSON.parse(body);
            if (!jsonResp.IsSuccess) {
                var jsonString = messageFormatter.FormatMessage(new error(jsonResp), "EXCEPTION", false, response);
                callBack.end(jsonString);return;
            }
            var limitId = jsonResp.Result;

            var data = '{"PhoneNumber":' + phoneNumber + ',"Enable":true,"ObjClass":"CALL","ObjCategory":"INBOUND","TrunkId":' + trunkId + '}';
            var options = {
                method: 'POST',
                uri: trunkUrl + '/PhoneNumberTrunkApi/TrunkNumber',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': apiKey
                },
                body: data
            };
            request(options, function (error, response, body) {
                if (error) {
                    var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                    logger.error('[DVP-Voxbone.SetLimitToNumber-TrunkNumber] - [%s] - [%s] - Error.', response, body, error);
                    callBack.end(jsonString);
                } else {
                    logger.info('[DVP-Voxbone.SetLimitToNumber-TrunkNumber] - [%s] - - [%s]', response, body);
                    var jsonResp = JSON.parse(body);
                    if (!jsonResp.IsSuccess) {
                        var jsonString = messageFormatter.FormatMessage(new error(jsonResp), "EXCEPTION", false, response);
                        callBack.end(jsonString);return;
                    }

                    var options = {
                        method: 'POST',
                        uri: trunkUrl + '/PhoneNumberTrunkApi/TrunkNumber/' + phoneNumber + '/SetInboundLimit/' + limitId,
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': apiKey
                        },

                    };
                    request(options, function (error, response, body) {
                        if (error) {
                            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                            logger.error('[DVP-Voxbone.SetLimitToNumber-TrunkNumber] - [%s] - [%s] - Error.', response, body, error);
                            callBack.end(jsonString);
                        } else {
                            logger.info('[DVP-Voxbone.SetLimitToNumber-TrunkNumber] - [%s] - - [%s]', response, body);
                            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, limitId);
                            callBack.end(jsonString);
                        }
                    });
                }
            });
        }
    });
}


module.exports.TrunkSetup = TrunkSetup;
module.exports.SetLimitToNumber = SetLimitToNumber;
