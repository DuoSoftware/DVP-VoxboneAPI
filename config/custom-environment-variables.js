module.exports = {
 "DB": {
    "Type":"SYS_DATABASE_TYPE",
    "User":"SYS_DATABASE_POSTGRES_USER",
    "Password":"SYS_DATABASE_POSTGRES_PASSWORD",
    "Port":"SYS_SQL_PORT",
    "Host":"SYS_DATABASE_HOST",
    "Database":"SYS_DATABASE_POSTGRES_USER"
  },
    "Mongo":
    {
        "ip":"SYS_MONGO_HOST",
        "port":"SYS_MONGO_PORT",
        "dbname":"SYS_MONGO_DB",
        "password":"SYS_MONGO_PASSWORD",
        "user":"SYS_MONGO_USER"
    },
    "Host":
    {
        "domain": "HOST_NAME",
        "port": "HOST_VOXBONEAPI_PORT",
        "version": "HOST_VERSION",
        "hostpath":"HOST_PATH",
        "logfilepath": "LOG4JS_CONFIG"
    },
    "Services": {
        "authToken": "HOST_TOKEN",
        "apiKey": "VOX_APIKEY",
        "limitServiceHost": "SYS_LIMITHANDLER_HOST",
        "limitServicePort": "SYS_LIMITHANDLER_PORT",
        "limitServiceVersion": "SYS_LIMITHANDLER_VERSION",
        "trunkServiceHost": "SYS_PHONENUMBERSERVICE_HOST",
        "trunkServicePort": "SYS_PHONENUMBERSERVICE_PORT",
        "trunkServiceVersion": "SYS_PHONENUMBERSERVICE_VERSION",
        "ruleServiceHost": "SYS_RULESERVICE_HOST",
        "ruleServicePort": "SYS_RULESERVICE_PORT",
        "ruleServiceVersion": "SYS_RULESERVICE_VERSION",
        "billingserviceHost": "SYS_BILLINGSERVICE_HOST",
        "billingservicePort": "SYS_BILLINGSERVICE_PORT",
        "billingserviceVersion": "SYS_BILLINGSERVICE_VERSION",
        "walletserviceHost": "SYS_WALLETSERVICE_HOST",
        "walletservicePort": "SYS_WALLETSERVICE_PORT",
        "walletserviceVersion": "SYS_WALLETSERVICE_VERSION",
        "voxboneUrl":"VOXBONE_URL"
    },"Security":
    {
        "ip": "SYS_REDIS_HOST",
        "port": "SYS_REDIS_PORT",
        "user": "SYS_REDIS_USER",
        "password": "SYS_REDIS_PASSWORD"

    }

};

