/**
 * Created by Rajinda on 8/25/2015.
 */

var messageFormatter = require('DVP-Common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var request = require('request');
var logger = require('DVP-Common/LogHandler/CommonLogHandler.js').logger;
var inventoryHandler = require('./voxbone/InventoryHandler');
var config = require('config');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

var voxboneUrl = config.Services.voxboneUrl;

function ListCountries(uname, pword, callBack, pageNumber, pageSize) {
    inventoryHandler.ListCountries(voxboneUrl, uname, pword, callBack, pageNumber, pageSize)
}

function ListDIDGroup(uname, pword, callBack, countryCodeA3, pageNumber, pageSize) {
    inventoryHandler.ListDIDGroup(voxboneUrl, uname, pword, callBack, countryCodeA3, pageNumber, pageSize);
}

function ListDIDGroupByDidType(uname, pword, callBack, countryCodeA3, didType, pageNumber, pageSize) {
    inventoryHandler.ListDIDGroupBydidType(voxboneUrl, uname, pword, callBack, countryCodeA3, didType, pageNumber, pageSize);
}

function OrderDids(uname, pword, callBack, customerReference, description, didGroupId, quantity, countryCodeA3) {

    var jsonString = "";
    var jsonResp="";
    var options = {
        method: 'PUT',
        uri: voxboneUrl + '/ordering/cart',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Basic ' + new Buffer(uname + ':' + pword).toString('base64')
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
                    'Authorization': 'Basic ' + new Buffer(uname + ':' + pword).toString('base64')
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
                            'Authorization': 'Basic ' + new Buffer(uname + ':' + pword).toString('base64')
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

                            var options = {
                                method: 'GET',
                                uri: voxboneUrl + '/inventory/did?needAddressLink=false&countryCodeA3=' + countryCodeA3 + '&pageNumber=0&pageSize=100', //Query string data
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                    'Authorization': 'Basic ' + new Buffer(uname + ':' + pword).toString('base64')
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
                                    jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, body);
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


module.exports.OrderDids = OrderDids;
module.exports.ListCountries = ListCountries;
module.exports.ListDIDGroup = ListDIDGroup;
module.exports.ListDIDGroupByDidType = ListDIDGroupByDidType;