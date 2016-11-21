/**
 * Created by Rajinda on 8/25/2015.
 */

var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var request = require('request');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var inventoryHandler = require('./voxbone/InventoryHandler');
var orderHandler = require('./voxbone/OrderHandler');
var configurationHandler = require('./voxbone/ConfigurationHandler');
var config = require('config');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;
var moment = require("moment");
var didReqHandler = require('./DidRequestHandler');
var trunkHandler = require('./TrunkHandler');

var voxboneUrl = config.Services.voxboneUrl;

function ListCountries(apiKey, callBack, pageNumber, pageSize) {
    inventoryHandler.ListCountries(voxboneUrl, apiKey, callBack, pageNumber, pageSize)
}

function ListDIDGroup(apiKey, callBack, countryCodeA3, pageNumber, pageSize) {
    inventoryHandler.ListDIDGroup(voxboneUrl, apiKey, callBack, countryCodeA3, pageNumber, pageSize);
}

function ListDIDGroupByDidType(apiKey, callBack, countryCodeA3, didType, pageNumber, pageSize) {
    inventoryHandler.ListDIDGroupBydidType(voxboneUrl, apiKey, callBack, countryCodeA3, didType, pageNumber, pageSize);
}

function OrderDids(req, apiKey, callBack, customerReference, description, didGroupId, quantity, capacity, countryCodeA3) {

    var jsonString = "";
    var jsonResp = "";

    var options = {
        method: 'PUT',
        uri: voxboneUrl + '/ordering/cart',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        },
        body: '{"customerReference" : "' + customerReference + '","description" : "' + description + '"}'
    };

    request(options, function (error, response, body) { // Create Cart

        if (error) {
            jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.CreateCart] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.CreateCart] - [%s] - - [%s]', response, body);
            jsonResp = JSON.parse(body);
            if (response.statusCode != 200) {

                jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, jsonResp.errors);
                callBack.end(jsonString);
                return;
            }

            var cartIdentifier = jsonResp.cart.cartIdentifier;
            var options = {
                method: 'POST',
                uri: voxboneUrl + '/ordering/cart/' + cartIdentifier + '/product',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': apiKey
                },
                body: '{"didCartItem" : {"didGroupId" : "' + didGroupId + '", "quantity" : "' + quantity + '"}}'
            };

            request(options, function (error, response, body) { //Add to Cart
                if (error) {
                    jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                    logger.error('[DVP-Voxbone.CreateCart.AddToCart] - [%s] - [%s] - Error.', response, body, error);
                    callBack.end(jsonString);
                    return;
                } else {
                    logger.info('[DVP-Voxbone.CreateCart.AddToCart] - [%s] - - [%s]', response, body);
                    jsonResp = JSON.parse(body);
                    if (response.statusCode != 200 || jsonResp.status != "SUCCESS") {

                        jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, jsonResp.errors);
                        callBack.end(jsonString);
                    }

                    //-------------------Check Account Funds------------------------------------------------------

                    var options = {
                        method: 'GET',

                        uri: voxboneUrl + '/inventory/didgroup?countryCodeA3='+countryCodeA3+'&didGroupIds='+didGroupId+'&pageNumber=0&pageSize=10', //Query string data
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': apiKey
                        }
                    };

                    request(options, function (error, response, body) { //Checkout cart
                        if (error) {
                            jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                            logger.error('[DVP-Voxbone.CreateCart.didgroup.getPrice] - [%s] - [%s] - Error.', response, body, error);
                            callBack.end(jsonString);
                        } else {
                            logger.info('[DVP-Voxbone.CreateCart.didgroup.getPrice] - [%s] - - [%s]', response, body);
                            jsonResp = JSON.parse(body);
                            if (response.statusCode != 200 || jsonResp.resultCount <= 0) {

                                jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, body);
                                callBack.end(jsonString);
                                return;
                            }

                            var didGroupInfo = jsonResp.didGroups[0];
                            var setup100 = parseInt(didGroupInfo.setup100);
                            var monthly100 = parseInt(didGroupInfo.monthly100);

                            var cartValue = (setup100+monthly100)*quantity;




                            var options = {
                                method: 'GET',

                                uri: voxboneUrl + '/ordering/accountbalance', //Query string data
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                    'Authorization': apiKey
                                }
                            };

                            request(options, function (error, response, body) { //Checkout cart
                                if (error) {
                                    jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                                    logger.error('[DVP-Voxbone.CreateCart.AddToCart.accountbalance] - [%s] - [%s] - Error.', response, body, error);
                                    callBack.end(jsonString);
                                } else {
                                    logger.info('[DVP-Voxbone.CreateCart.AddToCart.accountbalance] - [%s] - - [%s]', response, body);
                                    jsonResp = JSON.parse(body);
                                    if (response.statusCode != 200) {// || jsonResp.accountBalance.active === false

                                        jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, body);
                                        callBack.end(jsonString);
                                        return;
                                    }


                                    var accBalance = jsonResp.accountBalance.balance * 100;

                                    if(accBalance > cartValue){



                                        var options = {
                                            method: 'GET',

                                            uri: voxboneUrl + '/ordering/cart/' + cartIdentifier + '/checkout?cartIdentifier=' + cartIdentifier, //Query string data
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Accept': 'application/json',
                                                'Authorization': apiKey
                                            }
                                        };

                                        request(options, function (error, response, body) { //Checkout cart
                                            if (error) {
                                                jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                                                logger.error('[DVP-Voxbone.CreateCart.AddToCart.CheckoutCart] - [%s] - [%s] - Error.', response, body, error);
                                                callBack.end(jsonString);
                                            } else {
                                                logger.info('[DVP-Voxbone.CreateCart.AddToCart.CheckoutCart] - [%s] - - [%s]', response, body);
                                                jsonResp = JSON.parse(body);
                                                if (response.statusCode != 200 || jsonResp.status != "SUCCESS") {

                                                    jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, body);
                                                    callBack.end(jsonString);
                                                    return;
                                                }

                                                var oderInfo = JSON.parse(body);
                                                if (oderInfo.status === "SUCCESS") {

                                                    var date = moment().add(-1, 'hours').format("YYYY-MM-DD HH:MM:SS");
                                                    var options = {
                                                        method: 'GET',//'/ordering/order?pageNumber=0&pageSize=1&reference='+oderInfo.productCheckoutList[0].orderReference,
                                                        uri: voxboneUrl + '/inventory/did?orderReference=' + oderInfo.productCheckoutList[0].orderReference + '&dateFrom=' + date + '&status=' + "FULFILLED" + '&pageNumber=0&pageSize=100', //Query string data
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'Accept': 'application/json',
                                                            'Authorization': apiKey
                                                        }
                                                    };
                                                    request(options, function (error, response, body) {
                                                        if (error) {
                                                            jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                                                            logger.error('[DVP-Voxbone.CreateCart.AddToCart.CheckoutCart.ListDID] - [%s] - [%s] - Error.', response, body, error);
                                                            callBack.end(jsonString);
                                                        } else {
                                                            logger.info('[DVP-Voxbone.CreateCart.AddToCart.CheckoutCart.ListDID] - [%s] - - [%s]', response, body);
                                                            if (response.statusCode != 200) {
                                                                jsonResp = JSON.parse(body);
                                                                jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, jsonResp.errors);
                                                                callBack.end(jsonString);
                                                                return;
                                                            }

                                                            var dids = JSON.parse(body).dids;
                                                            var arrayFound = dids.filter(function (item) {
                                                                return item.orderReference === oderInfo.productCheckoutList[0].orderReference;
                                                            });

                                                            /*if (Array.isArray(arrayFound)) {
                                                                var channelData = {
                                                                    VoxOderId: '73929DS1404188',//oderInfo.productCheckoutList[0].orderReference,
                                                                    VoxStatus: 'SUCCESS',
                                                                    Dids: arrayFound.map(function (obj) {
                                                                        return obj.e164
                                                                    }),
                                                                    OtherJsonData: oderInfo
                                                                };
                                                                var companyData = {
                                                                    TenantId: req.user.tenant,
                                                                    CompanyId: req.user.company
                                                                };
                                                                //SaveOder(channelData, companyData);
                                                                //SaveOder(channelData, companyData);
                                                            }*/

                                                            var tenant = parseInt(req.user.tenant);
                                                            var company = parseInt(req.user.company);
                                                            var lastMessage;
                                                            var lastStatus;


                                                            if(dids[0].e164.indexOf('+') > -1){
                                                                dids[0].e164 = dids[0].e164.replace('+', '');
                                                            }


                                                            didReqHandler.AddVoxDidRequest(tenant, company, dids[0], capacity, setup100, monthly100, function(err, isSuccess, msg){
                                                                lastMessage = msg;
                                                                lastStatus = isSuccess;
                                                                if(err || !isSuccess){
                                                                    jsonString = messageFormatter.FormatMessage(undefined, lastMessage, lastStatus, undefined);
                                                                    callBack.end(jsonString);
                                                                }else{
                                                                    trunkHandler.TrunkSetup(tenant, company, dids[0].e164, function(err, response, body){
                                                                        if(err || response.statusCode !== 200 || !body.IsSuccess || !body.Result){
                                                                            jsonString = messageFormatter.FormatMessage(undefined, lastMessage, lastStatus, undefined);
                                                                            callBack.end(jsonString);
                                                                        }else{
                                                                            didReqHandler.SetTrunk(tenant, company, dids[0], body.Result.TrunkCode, function(err, isSuccess, msg){
                                                                                if(err || !isSuccess){
                                                                                    jsonString = messageFormatter.FormatMessage(undefined, lastMessage, lastStatus, undefined);
                                                                                    callBack.end(jsonString);
                                                                                }else{
                                                                                    jsonString = messageFormatter.FormatMessage(undefined, msg, isSuccess, undefined);
                                                                                    callBack.end(jsonString);
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            });

                                                            //AssignVeeryTrunk(apiKey,arrayFound);
                                                            //jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, body);
                                                            //callBack.end(jsonString);
                                                        }
                                                    });
                                                }
                                                else {

                                                    /*var oderInfo = JSON.parse(body);
                                                    var channelData = {
                                                        VoxOderId: cartIdentifier,
                                                        VoxStatus: oderInfo.status,
                                                        OtherJsonData: oderInfo
                                                    };
                                                    var companyData = {
                                                        TenantId: req.user.tenant,
                                                        CompanyId: req.user.company
                                                    };
                                                    //SaveOder(channelData, companyData);
                                                    //SaveOder(channelData, companyData);*/

                                                    jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "Please Contact System Administrator to Continue", false, body);
                                                    callBack.end(jsonString);
                                                }

                                            }
                                        });





                                    }else{
                                        jsonString = messageFormatter.FormatMessage(new Error("Insufficient Founds"), "EXCEPTION", false, body);
                                        callBack.end(jsonString);
                                        return;
                                    }
                                }
                            });
                        }
                    });


                }
            });
        }
    });
}

function ConfigureDid(apiKey, callback, didId, didEnabled, activeCapacity){
    var jsonString = "";
    var jsonResp = "";

    var options = {
        method: 'GET',
        uri: voxboneUrl + '/inventory/did?didIds=' + didId + '&pageNumber=0&pageSize=5',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        }
    };
    request(options, function (error, response, body) {
        if (error) {
            jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.ConfigureDid.ListDID] - [%s] - [%s] - Error.', response, body, error);
            callback.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.ConfigureDid.ListDID] - [%s] - - [%s]', response, body);
            if (response.statusCode != 200) {
                jsonResp = JSON.parse(body);
                jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, jsonResp.errors);
                callback.end(jsonString);
            }

            var dids = JSON.parse(body).dids;
            if(dids && dids.length >0){

                var didToConfig = dids[0];
                var phoneNumber = didToConfig.e164;
                if(didToConfig.e164.indexOf('+') > -1){
                    phoneNumber = phoneNumber.replace('+', '');
                }

                var options = {
                    method: 'GET',
                    uri: voxboneUrl + '/configuration/pop',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': apiKey
                    }
                };
                request(options, function (error, response, body) {
                    if (error) {
                        jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                        logger.error('[DVP-Voxbone.ConfigureDid.ListPOP] - [%s] - [%s] - Error.', response, body, error);
                        callback.end(jsonString);
                    } else {
                        logger.info('[DVP-Voxbone.ConfigureDid.ListPOP] - [%s] - - [%s]', response, body);
                        if (response.statusCode != 200) {
                            jsonResp = JSON.parse(body);
                            jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, jsonResp.errors);
                            callback.end(jsonString);
                        }

                        var pops = JSON.parse(body).pops;

                        var deliveryId = null;
                        if(pops && pops.length > 0) {
                            if (didToConfig.delivery) {
                                for (var i = 0; i < pops.length; i++) {
                                    if (pops[i].name === didToConfig.delivery) {
                                        deliveryId = pops[i].deliveryId;
                                        break;
                                    }
                                }
                            } else {
                                if (pops[0]) {
                                    deliveryId = pops[0].deliveryId;
                                }
                            }
                        }


                        didReqHandler.GetDidRequest(didId, function(err, isSuccess, msg, didReq){
                            if(err || !isSuccess){
                                jsonString = messageFormatter.FormatMessage(err, msg, isSuccess, undefined);
                                callback.end(jsonString);
                            }else{
                                didReqHandler.EnableCapacity(didReq.Tenant, didReq.Company, didId, activeCapacity, didEnabled, function(err, isSuccess, msg){
                                    if(err || !isSuccess){
                                        jsonString = messageFormatter.FormatMessage(err, msg, isSuccess, undefined);
                                        callback.end(jsonString);
                                    }else{
                                        trunkHandler.SetLimitToNumber(didReq.Company, didReq.Tenant, phoneNumber, activeCapacity, function(err, response, body){
                                            if(err || response.statusCode !== 200 || !body.IsSuccess || !body.Result){
                                                jsonString = messageFormatter.FormatMessage(undefined, "Set channel limit to number failed", false, undefined);
                                                callback.end(jsonString);
                                            }else{

                                                var didConfig = {
                                                    didIds : [didToConfig.didId],
                                                    voiceUriId : didToConfig.voiceUriId,
                                                    smsLinkGroupId : didToConfig.smsLinkGroupId?didToConfig.smsLinkGroupId.toString():null,
                                                    faxUriId : didToConfig.faxUriId,
                                                    capacityGroupId : didToConfig.capacityGroupId?didToConfig.capacityGroupId.toString():null,
                                                    trunkId : didReq.TrunkId?didReq.TrunkId.toString():didToConfig.trunkId,
                                                    deliveryId : deliveryId,
                                                    srvLookup : didToConfig.srvLookup,
                                                    callerId : didToConfig.callerId,
                                                    peer : didToConfig.otherOptions,
                                                    ringback : didToConfig.ringback,
                                                    dnisEnabled : didToConfig.dnisEnabled,
                                                    limitChannels : activeCapacity?activeCapacity.toString():"0"
                                                };

                                                var options = {
                                                    method: 'POST',
                                                    uri: voxboneUrl + '/configuration/configuration',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'Accept': 'application/json',
                                                        'Authorization': apiKey
                                                    },
                                                    body: JSON.stringify(didConfig)
                                                };

                                                request(options, function (error, response, body) {
                                                    if (error) {
                                                        jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                                                        logger.error('[DVP-Voxbone.Did.configuration] - [%s] - [%s] - Error.', response, body, error);
                                                        callback.end(jsonString);
                                                    } else {
                                                        logger.info('[DVP-Voxbone.Did.configuration] - [%s] - - [%s]', response, body);
                                                        jsonResp = JSON.parse(body);
                                                        if (response.statusCode != 200 || jsonResp.status != "SUCCESS") {

                                                            jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, jsonResp.errors);
                                                            callback.end(jsonString);
                                                        }else{
                                                            jsonString = messageFormatter.FormatMessage(undefined, "DID Configuration Done", true, undefined);
                                                            callback.end(jsonString);
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });



                    }
                });

            }else{
                jsonString = messageFormatter.FormatMessage(undefined, "No DID Found", false, undefined);
                callback.end(jsonString);
            }
        }
    });
}

function SaveOder(channelData, companyData) {
    orderHandler.CreateOder(channelData, companyData, function (err, data) {
        if (err) {
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, data);
            logger.debug('CreateOder - Fail To Save Oder Data - [%s] . channelData - [%s] , companyData - [%s]', jsonString, JSON.stringify(channelData), JSON.stringify(companyData));
        }
    });
}

function AssignVeeryTrunk(apiKey,orderData) {

    // call trunk service. trunk service returns trunkID and dids. after receive trunk id need to config voxbone side

    var data = {
        "didIds": orderData.map(function (obj) {
            return obj.didId
        }),
        "trunkId":121211,
        "limitChannels":"",
        "voiceUriId":orderData.voiceUriId
    };
    configurationHandler.ApplyConfiguration(voxboneUrl, apiKey, data, function (err, obj) {
        if (err) {
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, data);
            logger.error('AssignVeeryTrunk - Fail To Save Trunk Configurations - [%s] . orderData - [%s] ', jsonString, JSON.stringify(orderData));
        }
        else{
            var jsonString = messageFormatter.FormatMessage(undefined, "EXCEPTION", true, obj);
            logger.info('AssignVeeryTrunk - Successfully Configured - [%s] . orderData - [%s] ', jsonString, JSON.stringify(orderData));
        }
    })
}

function BuyCapacityToNumber(req,res) {
// send notification to support team

}

module.exports.OrderDids = OrderDids;
module.exports.ListCountries = ListCountries;
module.exports.ListDIDGroup = ListDIDGroup;
module.exports.ListDIDGroupByDidType = ListDIDGroupByDidType;
module.exports.ConfigureDid = ConfigureDid;
