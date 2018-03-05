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
var validator = require('validator');
var util = require('util');
var restClientHandler = require('./RestClient');
var Org = require('dvp-mongomodels/model/Organisation');
var UserAccount = require('dvp-mongomodels/model/UserAccount');

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

function OrderDids(req, apiKey, callBack, customerReference, description, didGroupId, quantity, capacity, countryCodeA3, setupFee, monthlyFee) {

    var jsonString = "";
    var jsonResp = "";


    var tenant = parseInt(req.user.tenant);
    var company = parseInt(req.user.company);

    try {

        UserAccount.findOne({tenant: tenant, company: company, user: req.user.iss}).populate('userref' , '-password').exec(function (err, rUser) {
            if (err) {
                jsonString = messageFormatter.FormatMessage(err, "Error in User Search", false, undefined);
                res.end(jsonString);
            } else {
                if(rUser) {
                    rUser = rUser.userref;
                    Org.findOne({tenant: tenant, id: company}).populate('ownerRef', '-password').exec(function (err, org) {

                        if (err) {

                            jsonString = messageFormatter.FormatMessage(err, "Find Organisation Failed", false, undefined);
                            res.end(jsonString);

                        } else {

                            if (org) {

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

                                                    uri: voxboneUrl + '/inventory/didgroup?countryCodeA3=' + countryCodeA3 + '&didGroupIds=' + didGroupId + '&pageNumber=0&pageSize=10', //Query string data
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

                                                        var cartValue = (setup100 + monthly100) * quantity;


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

                                                                if (accBalance > cartValue) {


                                                                    CheckCredit(company, tenant, function (err, response) {
                                                                        if (err) {
                                                                            jsonString = messageFormatter.FormatMessage(err, "Error in Check User Credits", false, undefined);
                                                                            callBack.end(jsonString);
                                                                        } else {
                                                                            if (response) {
                                                                                if (response.IsSuccess) {

                                                                                    if (response.Result) {
                                                                                        var numberPrice = (setupFee + monthlyFee) * 100;
                                                                                        var availableCredit = parseFloat(response.Result.Credit);
                                                                                        if (availableCredit >= numberPrice) {

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

                                                                                                                var lastMessage;
                                                                                                                var lastStatus;

                                                                                                                if (dids[0].e164.indexOf('+') > -1) {
                                                                                                                    dids[0].e164 = dids[0].e164.replace('+', '');
                                                                                                                }

                                                                                                                var billingObj = {
                                                                                                                    userInfo: rUser,
                                                                                                                    companyInfo: org,
                                                                                                                    name: dids[0].e164,
                                                                                                                    type: "PHONE_NUMBER",
                                                                                                                    category: "DID",
                                                                                                                    setupFee: setupFee,
                                                                                                                    unitPrice: monthlyFee,
                                                                                                                    units: 1,
                                                                                                                    description: 'Number set-up fee and monthly fee',
                                                                                                                    date: Date.now(),
                                                                                                                    valid: true,
                                                                                                                    isTrial: false
                                                                                                                };

                                                                                                                var jsonString1;
                                                                                                                try {
                                                                                                                    RequestToBill(company, tenant, billingObj, function (err, response) {
                                                                                                                        if (err) {
                                                                                                                            jsonString1 = messageFormatter.FormatMessage(err, "Error in Billing request", false, undefined);
                                                                                                                            console.log(jsonString1);
                                                                                                                        } else {
                                                                                                                            if (response) {
                                                                                                                                if (response.IsSuccess) {
                                                                                                                                    jsonString1 = messageFormatter.FormatMessage(err, "Billing request success", false, undefined);
                                                                                                                                    console.log(jsonString1)

                                                                                                                                } else {
                                                                                                                                    jsonString1 = messageFormatter.FormatMessage(undefined, response.CustomMessage, false, undefined);
                                                                                                                                    console.log(jsonString1);
                                                                                                                                }
                                                                                                                            } else {
                                                                                                                                jsonString1 = messageFormatter.FormatMessage(err, "Error in Billing request", false, undefined);
                                                                                                                                console.log(jsonString1);
                                                                                                                            }
                                                                                                                        }
                                                                                                                    });
                                                                                                                }catch(ex){
                                                                                                                    jsonString1 = messageFormatter.FormatMessage(ex, "Error in Billing request", false, undefined);
                                                                                                                    console.log(jsonString1);
                                                                                                                }

                                                                                                                didReqHandler.AddVoxDidRequest(tenant, company, dids[0], capacity, setupFee * 100, monthlyFee * 100, function (err, isSuccess, msg) {
                                                                                                                    lastMessage = msg;
                                                                                                                    lastStatus = isSuccess;
                                                                                                                    if (err || !isSuccess) {
                                                                                                                        jsonString = messageFormatter.FormatMessage(undefined, lastMessage, lastStatus, undefined);
                                                                                                                        callBack.end(jsonString);
                                                                                                                    } else {
                                                                                                                        trunkHandler.TrunkSetup(tenant, company, dids[0].e164, dids[0].trunkId, function (err, response, body) {
                                                                                                                            if (err || response.statusCode !== 200 || !body.IsSuccess || !body.Result) {
                                                                                                                                jsonString = messageFormatter.FormatMessage(undefined, lastMessage, lastStatus, undefined);
                                                                                                                                callBack.end(jsonString);
                                                                                                                            } else {
                                                                                                                                didReqHandler.SetTrunk(tenant, company, dids[0], body.Result.TrunkCode, function (err, isSuccess, msg) {
                                                                                                                                    if (err || !isSuccess) {
                                                                                                                                        jsonString = messageFormatter.FormatMessage(undefined, lastMessage, lastStatus, undefined);
                                                                                                                                        callBack.end(jsonString);
                                                                                                                                    } else {
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

                                                                                        } else {
                                                                                            jsonString = messageFormatter.FormatMessage(undefined, "Insufficient Balance, Please add some funds", false, undefined);
                                                                                            callBack.end(jsonString);
                                                                                        }
                                                                                    } else {
                                                                                        jsonString = messageFormatter.FormatMessage(undefined, response.CustomMessage, false, undefined);
                                                                                        callBack.end(jsonString);
                                                                                    }

                                                                                } else {
                                                                                    jsonString = messageFormatter.FormatMessage(undefined, response.CustomMessage, false, undefined);
                                                                                    callBack.end(jsonString);
                                                                                }
                                                                            } else {
                                                                                jsonString = messageFormatter.FormatMessage(err, "Error in Check User Credits", false, undefined);
                                                                                callBack.end(jsonString);
                                                                            }
                                                                        }
                                                                    });


                                                                } else {
                                                                    jsonString = messageFormatter.FormatMessage(new Error("Insufficient Founds"), "EXCEPTION", false, body);
                                                                    callBack.end(jsonString);
                                                                }
                                                            }
                                                        });
                                                    }
                                                });


                                            }
                                        });
                                    }
                                });

                            } else {

                                jsonString = messageFormatter.FormatMessage(err, "No Organisation Found", false, undefined);
                                callBack.end(jsonString);

                            }

                        }

                    });
                }else{
                    jsonString = messageFormatter.FormatMessage(undefined, "No User Found.", false, undefined);
                    callBack.end(jsonString);
                }
            }
        });


    }catch(ex){
        jsonString = messageFormatter.FormatMessage(ex, "Error occurred.", false, undefined);
        callBack.end(jsonString);
    }
}

function RequestToBill(company, tenant, billInfo, callback){
    try {
        var billingUrl = util.format("http://%s/DVP/API/%s/Billing/BuyPackage", config.Services.billingserviceHost, config.Services.billingserviceVersion);
        if (validator.isIP(config.Services.billingserviceHost)) {
            billingUrl = util.format("http://%s:%s/DVP/API/%s/Billing/BuyPackage", config.Services.billingserviceHost, config.Services.billingservicePort, config.Services.billingserviceVersion);
        }
        var companyInfo = util.format("%d:%d", tenant, company);
        restClientHandler.DoPost(companyInfo, billingUrl, billInfo, function (err, res1, result) {
            if(err){
                callback(err, undefined);
            }else{
                if(res1.statusCode === 200) {
                    callback(undefined, JSON.parse(result));
                }else{
                    callback(new Error(result), undefined);
                }
            }
        });
    }catch(ex){
        callback(ex, undefined);
    }
}

function CheckCredit(company, tenant, callback){
    try {
        var walletUrl = util.format("http://%s/DVP/API/%s/PaymentManager/Wallet", config.Services.walletserviceHost, config.Services.billingserviceVersion);
        if (validator.isIP(config.Services.walletserviceHost)) {
            walletUrl = util.format("http://%s:%s/DVP/API/%s/PaymentManager/Wallet", config.Services.walletserviceHost, config.Services.walletservicePort, config.Services.walletserviceVersion);
        }
        var companyInfo = util.format("%d:%d", tenant, company);
        restClientHandler.DoGet(companyInfo, walletUrl, function (err, res1, result) {
            if(err){
                callback(err, undefined);
            }else{
                callback(undefined, JSON.parse(result));
            }
        });
    }catch(ex){
        callback(ex, undefined);
    }
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
    console.log('CALLING VOXBONE URL');
    request(options, function (error, response, body) {
        if (error) {
            console.log('CALLING VOXBONE URL - ERROR');
            jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
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
                console.log('CALLING VOXBONE CONFIGURATION URL');
                request(options, function (error, response, body) {
                    if (error) {
                        console.log('CALLING VOXBONE CONFIGURATION URL - ERROR');
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

                        console.log('CALLING GetDidRequest');


                        didReqHandler.GetDidRequest(didId, function(err, isSuccess, msg, didReq){
                            if(err || !isSuccess){
                                console.log('CALLING GetDidRequest - ERROR');
                                jsonString = messageFormatter.FormatMessage(err, msg, isSuccess, undefined);
                                callback.end(jsonString);
                            }else{
                                console.log('CALLING EnableCapacity');
                                didReqHandler.EnableCapacity(didReq.Tenant, didReq.Company, didId, activeCapacity, didEnabled, function(err, isSuccess, msg){
                                    if(err || !isSuccess){
                                        console.log('CALLING EnableCapacity - ERROR');
                                        jsonString = messageFormatter.FormatMessage(err, msg, isSuccess, undefined);
                                        callback.end(jsonString);
                                    }else{
                                        console.log('CALLING CreateDefaultRuleInbound');
                                        trunkHandler.CreateDefaultRuleInbound(didReq.Company, didReq.Tenant, phoneNumber);
                                        console.log('CALLING SetLimitToNumber');
                                        trunkHandler.SetLimitToNumber(didReq.Company, didReq.Tenant, phoneNumber, activeCapacity, function(err, response, body){
                                            if(err || response.statusCode !== 200 || !body.IsSuccess || !body.Result){
                                                console.log('CALLING SetLimitToNumber - ERROR');
                                                jsonString = messageFormatter.FormatMessage(undefined, "Set channel limit to number failed", false, undefined);
                                                callback.end(jsonString);
                                            }else{

                                                console.log('CALLING SetLimitToNumber - SUCCESS');

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

                                                console.log('CALLING VOXBONE configuration/configuration');

                                                request(options, function (error, response, body) {
                                                    if (error) {
                                                        console.log('CALLING VOXBONE configuration/configuration - ERROR');
                                                        jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                                                        logger.error('[DVP-Voxbone.Did.configuration] - [%s] - [%s] - Error.', response, body, error);
                                                        callback.end(jsonString);
                                                    } else {
                                                        console.log('CALLING VOXBONE configuration/configuration - SUCCESS');
                                                        logger.info('[DVP-Voxbone.Did.configuration] - [%s] - - [%s]', response, body);
                                                        jsonResp = JSON.parse(body);
                                                        if (response.statusCode != 200) {

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
                console.log('NO DID FOUND');
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
