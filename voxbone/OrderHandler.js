/**
 * Created by Rajinda on 8/12/2015.
 */

var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var request = require('request');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

function AccountBalance(url, apiKey, callBack) {
    var options = {
        method: 'GET',
        uri: url + '/ordering/accountbalance',
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        }
    };
    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.AccountBalance] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.AccountBalance] - [%s] - - [%s]', response, body);
            if (response.statusCode != 200) {
                var jsonResp = JSON.parse(body);
                var jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, jsonResp.errors);
                callBack.end(jsonString);
            } else {
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, body);
                callBack.end(jsonString);
            }
        }
    });
}

function CreateCart(url, apiKey, callBack, customerReference, description) {
    var options = {
        method: 'PUT',
        uri: url + '/ordering/cart',
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        },
        body: '{"customerReference" : "' + customerReference + '","description" : "' + description + '"}'
    };

    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.CreateCart] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.CreateCart] - [%s] - - [%s]', response, body);
            if (response.statusCode != 200) {
                var jsonResp = JSON.parse(body);
                var jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, jsonResp.errors);
                callBack.end(jsonString);
            } else {
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, body);
                callBack.end(jsonString);
            }
        }
    });

}

function AddToCart(url, apiKey, callBack, cartIdentifier) {
    var options = {
        method: 'POST',
        uri: url + '/ordering/cart/' + cartIdentifier + '/product',
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        },
        body: '{"didCartItem" : {"didGroupId" : "8826", "quantity" : "1"}}'
    };

    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.AddToCart] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.AddToCart] - [%s] - - [%s]', response, body);
            if (response.statusCode != 200) {
                var jsonResp = JSON.parse(body);
                var jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, jsonResp.errors);
                callBack.end(jsonString);
            } else {
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, body);
                callBack.end(jsonString);
            }
        }
    });
}

function ListCartCartIdentifier(url, apiKey, callBack, pageNumber, pageSize, cartIdentifier) {
    var options = {
        method: 'GET',
        uri: url + '/ordering/cart?cartIdentifier' + cartIdentifier + 'pageNumber=' + pageNumber + '&pageSize=' + pageSize,
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        },

    };

    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.ListCartCartIdentifier] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.ListCartCartIdentifier] - [%s] - - [%s]', response, body);
            if (response.statusCode != 200) {
                var jsonResp = JSON.parse(body);
                var jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, jsonResp.errors);
                callBack.end(jsonString);
            } else {
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, body);
                callBack.end(jsonString);
            }
        }
    });
}

function ListAllCart(url, apiKey, callBack, pageNumber, pageSize) {
    var options = {
        method: 'GET',
        uri: url + '/ordering/cart?pageNumber=' + pageNumber + '&pageSize=' + pageSize,
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        },

    };

    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.ListAllCart] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.ListAllCart] - [%s] - - [%s]', response, body);
            if (response.statusCode != 200) {
                var jsonResp = JSON.parse(body);
                var jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, jsonResp.errors);
                callBack.end(jsonString);
            } else {
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, body);
                callBack.end(jsonString);
            }
        }
    });
}

function RemoveFromCart(url, apiKey, callBack, cartIdentifier, orderProductId, quantity) {
    var options = {
        method: 'POST',
        uri: url + '/ordering/cart/' + cartIdentifier + '/product/' + orderProductId,
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        },
        body: '{"cartIdentifier" : "' + cartIdentifier + '", "orderProductId" : "' + orderProductId + '", "quantity" : "' + quantity + '"}'
    };

    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.RemoveFromCart] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.RemoveFromCart] - [%s] - - [%s]', response, body);
            if (response.statusCode != 200) {
                var jsonResp = JSON.parse(body);
                var jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, jsonResp.errors);
                callBack.end(jsonString);
            } else {
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, body);
                callBack.end(jsonString);
            }
        }
    });
}

function DeleteCart(url, apiKey, callBack, cartIdentifier) {
    var options = {
        method: 'DELETE',
        uri: url + '/ordering/cart/' + cartIdentifier,
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        }
    };

    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.DeleteCart] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.DeleteCart] - [%s] - - [%s]', response, body);
            if (response.statusCode != 200) {
                var jsonResp = JSON.parse(body);
                var jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, jsonResp.errors);
                callBack.end(jsonString);
            } else {
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, body);
                callBack.end(jsonString);
            }
        }
    });
}

function CheckoutCart(url, apiKey, callBack, cartIdentifier) {
    var options = {
        method: 'GET',
        uri: url + '/ordering/cart/' + cartIdentifier + '/checkout?cartIdentifier='+cartIdentifier, //Query string data
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        }
    };

    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.CheckoutCart] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.CheckoutCart] - [%s] - - [%s]', response, body);
            if (response.statusCode != 200) {
                var jsonResp = JSON.parse(body);
                var jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, jsonResp.errors);
                callBack.end(jsonString);
            } else {
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, body);
                callBack.end(jsonString);
            }
        }
    });
}

function ListOrder(url, apiKey, callBack, pageNo, size) {
    var options = {
        method: 'GET',
        uri: url + '/ordering/order?pageNumber='+pageNo+'& pageSize='+ size, //Query string data
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        }
    };

    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.ListOrder] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.ListOrder] - [%s] - - [%s]', response, body);
            if (response.statusCode != 200) {
                var jsonResp = JSON.parse(body);
                var jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, jsonResp.errors);
                callBack.end(jsonString);
            } else {
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, body);
                callBack.end(jsonString);
            }
        }
    });
}

function CancelDIDs(url, apiKey, callBack, didIds) {
    var options = {
        method: 'POST',
        uri: url + '/ordering/cancel',
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        },
        body: '{"didIds" : ' + didIds + '}'
    };

    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.CancelDIDs] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.CancelDIDs] - [%s] - - [%s]', response, body);
            if (response.statusCode != 200) {
                var jsonResp = JSON.parse(body);
                var jsonString = messageFormatter.FormatMessage(new Error(response.statusCode), "EXCEPTION", false, jsonResp.errors);
                callBack.end(jsonString);
            } else {
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, body);
                callBack.end(jsonString);
            }
        }
    });
}

module.exports.AccountBalance = AccountBalance;
module.exports.CreateCart = CreateCart;
module.exports.AddToCart = AddToCart;
module.exports.ListAllCart = ListAllCart;
module.exports.ListCartCartIdentifier = ListCartCartIdentifier;
module.exports.RemoveFromCart = RemoveFromCart;
module.exports.DeleteCart = DeleteCart;
module.exports.CheckoutCart = CheckoutCart;
module.exports.ListOrder = ListOrder;
module.exports.ListOrder = CancelDIDs;