/**
 * Created by Rajinda on 8/24/2015.
 */

var restify = require('restify');

var config = require('config');
var port = config.Host.port || 3000;
var version = config.Host.version;

var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var trunkHandler = require('./TrunkHandler');
var voxboneHandler = require('./VoxboneHandler');

//-------------------------  Restify Server ------------------------- \\
var RestServer = restify.createServer({
    name: "VoxboneApi",
    version: '1.0.0'
}, function (req, res) {

});
restify.CORS.ALLOW_HEADERS.push('api_key');
restify.CORS.ALLOW_HEADERS.push('Authorization');

RestServer.use(restify.CORS());
RestServer.use(restify.fullResponse());
//Enable request body parsing(access)
RestServer.use(restify.bodyParser());
RestServer.use(restify.acceptParser(RestServer.acceptable));
RestServer.use(restify.queryParser());

// ---------------- Security -------------------------- \\
var jwt = require('restify-jwt');
var secret = require('dvp-common/Authentication/Secret.js');
var authorization = require('dvp-common/Authentication/Authorization.js');
RestServer.use(jwt({secret: secret.Secret}));
// ---------------- Security -------------------------- \\


//Server listen
RestServer.listen(port, function () {
    console.log('%s listening at %s', RestServer.name, RestServer.url);
});


RestServer.post('/DVP/API/' + version + '/voxbone/trunk/trunksetup', authorization({
    resource: "voxbone",
    action: "write"
}), function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.TrunkSetup] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.body));

        var apiKey = req.header('authorization');//req.headers.authorization

        var cmp = req.body;
        trunkHandler.TrunkSetup(apiKey, res, true, cmp.FaxType, cmp.IpUrl, cmp.TrunkCode, cmp.TrunkName, cmp.LbId, cmp.OperatorCode, cmp.OperatorName);

    }
    catch (ex) {
        logger.error('[DVP-voxbone.TrunkSetup] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

RestServer.post('/DVP/API/' + version + '/voxbone/trunk/:trunkid/limitnumber', authorization({
    resource: "voxbone",
    action: "write"
}), function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.TrunkSetup] - [HTTP]  - Request received -  Data - %s -%s', JSON.stringify(req.body), JSON.stringify(req.params));

        /* var uname;
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
         */
        var apiKey = req.header('authorization');
        var cmp = req.body;
        trunkHandler.SetLimitToNumber(apiKey, cmp.limitDescription, cmp.maxCount, cmp.phoneNumber, req.params.trunkid, res);

    }
    catch (ex) {
        logger.error('[DVP-voxbone.SetLimitToNumber] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/voxbone/inventory/listcountries/:pageNumber/:pageSize', authorization({
    resource: "voxbone",
    action: "read"
}), function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.ListCountries] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var apiKey = req.header('api_key');
        var vox = req.params;
        voxboneHandler.ListCountries(apiKey, res, vox.pageNumber, vox.pageSize);

    }
    catch (ex) {

        logger.error('[DVP-voxbone.ListCountries] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/voxbone/inventory/listdidgroup/:countryCodeA3/:pageNumber/:pageSize', authorization({
    resource: "voxbone",
    action: "read"
}), function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.ListDIDGroup] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var vox = req.params;
        var apiKey = req.header('api_key');

        voxboneHandler.ListDIDGroup(apiKey, res, vox.countryCodeA3, vox.pageNumber, vox.pageSize);
    }
    catch (ex) {
        logger.error('[DVP-voxbone.ListDIDGroup] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

RestServer.get('/DVP/API/' + version + '/voxbone/inventory/listdidgroup/type/:didType/:countryCodeA3/:pageNumber/:pageSize', authorization({
    resource: "voxbone",
    action: "read"
}), function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.ListDIDGroupByDidType] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.params));

        var apiKey = req.header('api_key');
        var vox = req.params;
        voxboneHandler.ListDIDGroupByDidType(apiKey, res, vox.countryCodeA3, vox.didType, vox.pageNumber, vox.pageSize);

    }
    catch (ex) {

        logger.error('[DVP-voxbone.ListDIDGroupByDidType] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

RestServer.post('/DVP/API/' + version + '/voxbone/order/OrderDids', authorization({
    resource: "voxbone",
    action: "write"
}), function (req, res, next) {
    try {
        logger.info('[DVP-voxbone.OrderDids] - [HTTP]  - Request received -  Data - %s ', JSON.stringify(req.body));

        var apiKey = req.header('api_key');
        var vox = req.params;
        voxboneHandler.OrderDids(apiKey, res, vox.customerReference, vox.description, vox.didGroupId, vox.quantity, vox.countryCodeA3);

    }
    catch (ex) {

        logger.error('[DVP-voxbone.OrderDids] - [HTTP]  - Exception occurred -  Data - %s ', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});
