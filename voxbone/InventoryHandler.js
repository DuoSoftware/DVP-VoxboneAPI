/**
 * Created by Rajinda on 8/14/2015.
 */

var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var request = require('request');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var Enum = require('enum');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

var DidTypes = new Enum({
    'GEOGRAPHIC': 0,
    'TOLL_FREE': 1,
    'NATIONAL': 2,
    'MOBILE': 3,
    'INUM': 4,
    'SHARED_COST': 5,
    'SPECIAL': 6
});

function ListCountry(url, apiKey, callBack, countryCodeA3, pageNumber, pageSize) {
    var qs="?countryCodeA3="+countryCodeA3+"&pageNumber="+pageNumber+"&pageSize="+pageSize; //Query string data
    var options = {
        method: 'GET',
        uri: url + '/inventory/country'+qs,

        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        }
    };
    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.ListCountries] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.ListCountries] - [%s] - - [%s]', response, body);
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

function ListCountries(url, apiKey, callBack, pageNumber, pageSize) {

    var qs = "?pageNumber="+pageNumber+"&pageSize="+pageSize; //Query string data
    var options = {
        method: 'GET',
        uri: url + '/inventory/country'+qs,
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        }
    };
    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.ListCountries] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.ListCountries] - [%s] - [%s]', response, body);

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

function ListCountriesByDidType(url, apiKey, callBack, countryCodeA3, didType, pageNumber, pageSize) {

    var qs = "?pageNumber="+pageNumber+"&pageSize="+pageSize+"&countryCodeA3="+countryCodeA3+"DidType="+DidTypes.getValue(didType);
    var options = {
        method: 'GET',
        uri: url + '/inventory/country'+qs,
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        }
    };
    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.ListCountries] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.ListCountries] - [%s] - - [%s]', response, body);
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

function ListRestriction(url, apiKey, callBack, countryCodeA3) {

    var options = {
        method: 'GET',
        uri: url + '/inventory/country/' + countryCodeA3 + '/restriction',
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        }
    };
    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.ListRestriction] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.ListRestriction] - [%s] - - [%s]', response, body);
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

function ListState(url, apiKey, callBack, countryCodeA3) {

    var options = {
        method: 'GET',
        uri: url + '/inventory/country/' + countryCodeA3 + '/state',
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        }
    };
    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.ListState] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.ListState] - [%s] - - [%s]', response, body);
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

function ListCreditPackage(url, apiKey, callBack) {

    var options = {
        method: 'GET',
        uri: url + '/cdrs/inventory/creditpackage',
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        }
    };
    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.ListCreditPackage] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.ListCreditPackage] - [%s] - - [%s]', response, body);
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

function ListDID(url, apiKey, callBack, countryCodeA3, pageNumber, pageSize) {

    var options = {
        method: 'GET',
        uri: url + '/inventory/did?needAddressLink=false&countryCodeA3='+countryCodeA3+'&pageNumber='+pageNumber+'&pageSize='+pageSize, //Query string data
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        }
    };
    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.ListDID] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.ListDID] - [%s] - - [%s]', response, body);
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

function ListDIDGroup(url, apiKey, callBack, countryCodeA3, pageNumber, pageSize) {

    //
    var qs= "?pageNumber="+pageNumber+"&pageSize="+pageSize+"&countryCodeA3="+countryCodeA3;
    var options = {
        method: 'GET',
        uri: url + '/inventory/didgroup'+qs,
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        }
    };
    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.ListDIDGroup] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.ListDIDGroup] - [%s] - - [%s]', response, body);
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

function ListDIDGroupBydidType(url, apiKey, callBack, countryCodeA3, didType, pageNumber, pageSize) {

    var options = {
        method: 'GET',
        uri: url + '/inventory/didgroup?pageNumber='+pageNumber+'&pageSize='+pageSize+'&countryCodeA3='+countryCodeA3+'&didType='+DidTypes.getKey(didType),//Query string data
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        }
    };
    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.ListDIDGroup] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.ListDIDGroup] - [%s] - - [%s]', response, body);
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

function ListFeature(url, apiKey, callBack) {

    var options = {
        method: 'GET',
        uri: url + '/inventory/feature',
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        }
    };
    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.ListFeature] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.ListFeature] - [%s] - - [%s]', response, body);
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

function ListTrunk(url, apiKey, callBack) {

    var options = {
        method: 'GET',
        uri: url + '/inventory/trunk',
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        }
    };
    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.ListTrunk] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.ListTrunk] - [%s] - - [%s]', response, body);
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

function ListZone(url, apiKey, callBack) {

    var options = {
        method: 'GET',
        uri: url + '/inventory/zone',
        headers: {'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': apiKey
        }
    };
    request(options, function (error, response, body) {
        if (error) {
            var jsonString = messageFormatter.FormatMessage(error, "EXCEPTION", false, undefined);
            logger.error('[DVP-Voxbone.ListZone] - [%s] - [%s] - Error.', response, body, error);
            callBack.end(jsonString);
        } else {
            logger.info('[DVP-Voxbone.ListZone] - [%s] - - [%s]', response, body);
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

module.exports.ListCountry = ListCountry;
module.exports.ListCountries = ListCountries;
module.exports.ListCountriesByDidType = ListCountriesByDidType;
module.exports.ListRestriction = ListRestriction;
module.exports.ListState = ListState;
module.exports.ListCreditPackage = ListCreditPackage;
module.exports.ListDID = ListDID;
module.exports.ListDIDGroup = ListDIDGroup;
module.exports.ListDIDGroupBydidType = ListDIDGroupBydidType;
module.exports.ListFeature = ListFeature;
module.exports.ListTrunk = ListTrunk;
module.exports.ListZone = ListZone;