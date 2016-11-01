/**
 * Created by Rajinda on 8/25/2015.
 */

var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var request = require('request');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var inventoryHandler = require('./voxbone/InventoryHandler');
var orderHandler = require('./voxbone/OrderHandler');
var config = require('config');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

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

function OrderDids(req,apiKey, callBack, customerReference, description, didGroupId, quantity, countryCodeA3,channelCount) {

    var jsonString = "";
    var jsonResp="";

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
                            if(oderInfo.status === "SUCCESS"){
                                var options = {
                                    method: 'GET',
                                    uri: voxboneUrl + '/inventory/did?needAddressLink=false&orderId=' + cartIdentifier + '&countryCodeA3=' + countryCodeA3 + '&pageNumber=0&pageSize=100', //Query string data
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
/*

                                        var oderInfo = JSON.parse(body);
                                        if(oderInfo.status === "SUCCESS"){
                                            var channelData ={
                                                VoxOderId : cartIdentifier,
                                                ChannelCount : channelCount,
                                                Dids : channelData.Dids ,
                                                OtherJsonData: oderInfo
                                            };
                                            var companyData = {
                                                TenantId : req.user.tenant,
                                                CompanyId : req.user.company
                                            };
                                            SaveOder(channelData,companyData);
                                        }*/



                                        jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, body);
                                        callBack.end(jsonString);
                                    }
                                });
                            }
                            else{

                                var oderInfo = JSON.parse(body);
                                var channelData ={
                                    VoxOderId : cartIdentifier,
                                    ChannelCount : channelCount,
                                    OtherJsonData: oderInfo
                                };
                                var companyData = {
                                    TenantId : req.user.tenant,
                                    CompanyId : req.user.company
                                };
                                SaveOder(channelData,companyData);

                                jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "Please Contact System Administrator to Continue", false, body);
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

function SaveOder(channelData,companyData){
    orderHandler.CreateOder(channelData,companyData, function(err,data){
        if(err){
            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, data);
            logger.debug('CreateOder - Fail To Save Oder Data - [%s] . channelData - [%s] , companyData - [%s]',jsonString, JSON.stringify(channelData),JSON.stringify(companyData) );
        }
    });
}


module.exports.OrderDids = OrderDids;
module.exports.ListCountries = ListCountries;
module.exports.ListDIDGroup = ListDIDGroup;
module.exports.ListDIDGroupByDidType = ListDIDGroupByDidType;
