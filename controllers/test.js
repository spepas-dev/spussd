const asynHandler = require("../middleware/async");
const UtilityHelper = require("../helper/utilfunc");
const { myVars, RESPONSE_CODES,REGISTRATION_STATUS } = require("../helper/vars");
const { v4: uuidv4 } = require('uuid');



exports.TestController = asynHandler(async (req, res, next) => {

        res.send("am here ooh");
    })
    