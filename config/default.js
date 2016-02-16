module.exports = {
    "DB": {
        "Type": "postgres",
        "User": "duouser",
        "Password": "DuoS123",
        "Port": 5432,
        "Host": "localhost",
        "Database": "dvpdb"
    },
    "Redis": {
        "ip": "45.55.142.207",
        "port": 6379
    },
    "Security": {
        "ip": "45.55.142.207",
        "port": 6379
    },
    "Host": {
        "domain": "0.0.0.0",
        "port": 8832,
        "version": "1.0.0",
        "hostpath": "./config",
        "logfilepath": ""
    },

    "Services": {
        "limitServiceHost": "192.168.0.54",
        "limitServicePort": 8084,
        "limitServiceVersion": "6.0",
        "trunkServiceHost": "192.168.0.89",
        "trunkServicePort":9898 ,
        "trunkServiceVersion": "1.0.0.0",
        "voxboneUrl": "https://sandbox.voxbone.com/ws-voxbone/services/rest"

    }
};

