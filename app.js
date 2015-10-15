/**
 * Created by Rajinda on 8/24/2015.
 */

var restify = require('restify');

var config = require('config');
var port = config.Host.port || 3000;
var version = config.Host.version;

var logger = require('DVP-Common/LogHandler/CommonLogHandler.js').logger;
var messageFormatter = require('DVP-Common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var trunkHandler = require('./TrunkHandler');
var voxboneHandler = require('./VoxboneHandler');

//-------------------------  Restify Server ------------------------- \\
var RestServer = restify.createServer({
    name: "VoxboneApi",
    version: '1.0.0'
}, function (req, res) {

});
restify.CORS.ALLOW_HEADERS.push('api_key');

RestServer.use(restify.CORS());
RestServer.use(restify.fullResponse());
//Enable request body parsing(access)
RestServer.use(restify.bodyParser());
RestServer.use(restify.acceptParser(RestServer.acceptable));
RestServer.use(restify.queryParser());

//Server listen
RestServer.listen(port, function () {
    console.log('%s listening at %s', RestServer.name, RestServer.url);
});


RestServer.post('/DVP/API/' + version + '/voxbone/trunk/trunksetup', function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.TrunkSetup] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.body));

        var uname;
        var pword;
        try {
            var b64string = req.header('Authorization');
            b64string = b64string.replace("Basic ", "");
            var auth = new Buffer(b64string, 'base64').toString('ascii');
            var authInfo = auth.split(":");
            uname = authInfo[0];
            pword = authInfo[1];
        } catch (ex) {
            logger.error('[DVP-voxbone.TrunkSetup] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
            var jsonString = messageFormatter.FormatMessage(new Error("Authorization"), "EXCEPTION", false, "Invalid authorization info");
            res.end(jsonString);
            return;
        }
        var cmp = req.body;
        trunkHandler.TrunkSetup(uname, pword, res, true, cmp.FaxType, cmp.IpUrl, cmp.TrunkCode, cmp.TrunkName, cmp.LbId, cmp.OperatorCode, cmp.OperatorName);

    }
    catch (ex) {
        logger.error('[DVP-voxbone.TrunkSetup] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

RestServer.post('/DVP/API/' + version + '/voxbone/trunk/:trunkid/limitnumber', function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.TrunkSetup] - [HTTP]  - Request received -  Data - %s -%s', JSON.stringify(req.body), JSON.stringify(req.params));

        var uname;
        var pword;
        try {
            var b64string = req.header('Authorization');
            b64string = b64string.replace("Basic ", "");
            var auth = new Buffer(b64string, 'base64').toString('ascii');
            var authInfo = auth.split(":");
            uname = authInfo[0];
            pword = authInfo[1];
        } catch (ex) {
            logger.error('[DVP-voxbone.SetLimitToNumber] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
            var jsonString = messageFormatter.FormatMessage(new Error("Authorization"), "EXCEPTION", false, "Invalid authorization info");
            res.end(jsonString);
            return;
        }

        var cmp = req.body;
        trunkHandler.SetLimitToNumber(uname, pword, cmp.limitDescription, cmp.maxCount, cmp.phoneNumber, req.params.trunkid, res);

    }
    catch (ex) {
        logger.error('[DVP-voxbone.SetLimitToNumber] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/voxbone/inventory/listcountries/:pageNumber/:pageSize', function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.ListCountries] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var uname;
        var pword;
        try {
            var b64string = req.header('Authorization');
            b64string = b64string.replace("Basic ", "");
            var auth = new Buffer(b64string, 'base64').toString('ascii');
            var authInfo = auth.split(":");
            uname = authInfo[0];
            pword = authInfo[1];
        } catch (ex) {
            logger.error('[DVP-voxbone.ListCountries] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
            var jsonString = messageFormatter.FormatMessage(new Error("Authorization"), "EXCEPTION", false, "Invalid authorization info");
            res.end(jsonString);
            return;
        }
        var vox = req.params;
        voxboneHandler.ListCountries(uname, pword, res, vox.pageNumber, vox.pageSize);

    }
    catch (ex) {

        logger.error('[DVP-voxbone.ListCountries] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/voxbone/inventory/listdidgroup/:countryCodeA3/:pageNumber/:pageSize', function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.ListDIDGroup] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var vox = req.params;
        var uname;
        var pword;
        try {
            var b64string = req.header('Authorization');
            b64string = b64string.replace("Basic ", "");
            var auth = new Buffer(b64string, 'base64').toString('ascii');
            var authInfo = auth.split(":");
            uname = authInfo[0];
            pword = authInfo[1];
        } catch (ex) {
            logger.error('[DVP-voxbone.ListDIDGroup] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
            var jsonString = messageFormatter.FormatMessage(new Error("Authorization"), "EXCEPTION", false, "Invalid authorization info");
            res.end(jsonString);
            return;
        }

        voxboneHandler.ListDIDGroup(uname, pword, res, vox.countryCodeA3, vox.pageNumber, vox.pageSize);
    }
    catch (ex) {
        logger.error('[DVP-voxbone.ListDIDGroup] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/voxbone/inventory/listdidgroup/type/:didType/:countryCodeA3/:pageNumber/:pageSize', function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.ListDIDGroupByDidType] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var uname;
        var pword;
        try {
            var b64string = req.header('Authorization');
            b64string = b64string.replace("Basic ", "");
            var auth = new Buffer(b64string, 'base64').toString('ascii');
            var authInfo = auth.split(":");
            uname = authInfo[0];
            pword = authInfo[1];
        } catch (ex) {
            logger.error('[DVP-voxbone.ListDIDGroupByDidType] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
            var jsonString = messageFormatter.FormatMessage(new Error("Authorization"), "EXCEPTION", false, "Invalid authorization info");
            res.end(jsonString);
            return;
        }
        var vox = req.params;
        voxboneHandler.ListDIDGroupByDidType(uname, pword, res, vox.countryCodeA3, vox.didType, vox.pageNumber, vox.pageSize);

    }
    catch (ex) {

        logger.error('[DVP-voxbone.ListDIDGroupByDidType] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

RestServer.post('/DVP/API/' + version + '/voxbone/order/OrderDids', function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.OrderDids] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.body));

        var uname;
        var pword;
        try {
            var b64string = req.header('Authorization');
            b64string = b64string.replace("Basic ", "");
            var auth = new Buffer(b64string, 'base64').toString('ascii');
            var authInfo = auth.split(":");
            uname = authInfo[0];
            pword = authInfo[1];
        } catch (ex) {
            logger.error('[DVP-voxbone.ListDIDGroupByDidType] - [HTTP]  - Exception occurred -  Data - %s ', "authorization", ex);
            var jsonString = messageFormatter.FormatMessage(new Error("Authorization"), "EXCEPTION", false, "Invalid authorization info");
            res.end(jsonString);
            return;
        }
        var vox = req.params;
        voxboneHandler.OrderDids(uname, pword, res, vox.customerReference, vox.description, vox.didGroupId, vox.quantity, vox.countryCodeA3);

    }
    catch (ex) {

        logger.error('[DVP-voxbone.OrderDids] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});
