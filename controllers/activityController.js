const asynHandler = require("../middleware/async");
const UtilityHelper = require("../helper/utilfunc");
const { v4: uuidv4 } = require('uuid');
const { REGISTRATION_STATUS, RESPONSE_CODES } = require("../helper/vars");
const ActivityModel = require("../DBFunctions/ActivityDb");
const { validateActivity } = require("../helper/autoRunner");
const { logger } = require("../logs/winston");



exports.AddActivityController = asynHandler(async (req, res, next) => {

    const { reqStatus, message }  = await validateActivity(req.body);

    if(!reqStatus)
    {
        let respBody = {
            status : 0,
            message: message
        }

        return UtilityHelper.sendResponse(res, 200, message, respBody)
    }

    let { screenNumber, hope, activityType,title,description,nextDisplayText,displayNumber,isMain,baseID,endpoint,createdBy,createdByName,defaultValue,nonCustomer } = req.body

    let newActivity = {
        activity_type: activityType,
        title: title,
        description: description,
        next_display_text: nextDisplayText,
        display_number: displayNumber,
        base_id: baseID,
        is_main: isMain,
        status: 1,
        endpoint: endpoint,
        created_by: createdBy,
        created_by_name: createdByName,
        default_value:defaultValue,
        non_customer:nonCustomer
    }

    let activityRes = await ActivityModel.add(newActivity)

    if(!activityRes)
    {
        let respBody = {
            status : 0,
            message: 'Failed to save activity'
        }

        return UtilityHelper.sendResponse(res, 200, message, respBody)
    }
    let respBody = {
        status : 1,
        message: 'Actity saved',
        data : activityRes
    }

    return UtilityHelper.sendResponse(res, 200, message, respBody)

})

