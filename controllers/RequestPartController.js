
const asynHandler = require("../middleware/async");
const ActivityModel = require("../DBFunctions/ActivityDb")
const UtilityHelper = require("../helper/utilfunc");
const { myVars,ACTIVITYIDS } = require("../helper/vars");
const { cleanUpRequest, goToMainMenu, goBackMenu, validatePincode } = require("../helper/autoRunner");
const { logger } = require("../logs/winston");
const { SparpartDetails, MakeSparePartRequest } = require("../helper/requestRunner");




exports.RequestIndex = asynHandler(async (req, res, next) => {

    let data = req.body;
    const { activityLog, resp }  = UtilityHelper.initialiaseRequest(data);
    var activities = [];
    let displayText = UtilityHelper.generateDisplayText(activities, data.activity.description);

    resp.requestType = myVars.EXISTING;

    resp.menuContent = displayText;
    data.session.date_ended = new Date();
    activityLog.date_ended = new Date();
    activityLog.display_text = displayText;
    activityLog.is_value = 0;
    activityLog.input_value = "";
    activityLog.extra_data = "";


     cleanUpRequest(data,activityLog);

   return UtilityHelper.sendResponse(res, 200, "Success", resp);

})



exports.RequestSparePartCode = asynHandler(async (req, res, next) => {

    let data = req.body;
    const { activityLog, resp }  = UtilityHelper.initialiaseRequest(data);

   let value = data.req.userInput;
   let title = data.req.userInput;
   var inputDic  = UtilityHelper.formatInputDictionary(data.session.session_input);

   if (value == "0#")
   {
     await goToMainMenu(resp,data,activityLog);
       cleanUpRequest(data,activityLog);
     return UtilityHelper.sendResponse(res, 200, "Success", resp);
   } else if (value == "1#")
   {
    await goBackMenu(resp,data);
     cleanUpRequest(data,activityLog);
    return UtilityHelper.sendResponse(res, 200, "Success", resp);
   }

   let spDetailsRes = await SparpartDetails(value, data.session.token);

   if(!spDetailsRes.status){
    resp.requestType = myVars.CLEANUP;
    resp.menuContent = "Invalid input";
    data.session.date_ended = new Date();
    activityLog.date_ended = new Date();
    activityLog.display_text = "Invalid input";
    activityLog.is_value = 1;
    activityLog.input_value = value;
    activityLog.input_display = title;
    activityLog.extra_data = "";
     cleanUpRequest(data,activityLog);
   return UtilityHelper.sendResponse(res, 200, "Success", resp);
   }



   let activities = [];
   title = spDetailsRes.data.name;
   let displayText = UtilityHelper.generateDisplayText(activities, data.activity.description);


   var yearOfMake = spDetailsRes.data.carModel.yearOfMake;
   var carName = spDetailsRes.data.carModel.name;
  var detailsTile = `${yearOfMake} ${carName} ${title}`
  displayText = displayText.replace('{CarDetails}',detailsTile)

   inputDic.spare_part = spDetailsRes.data;
   inputDic.spare_part_code = value;
   inputDic.spare_part_name = detailsTile;
   data.session.session_input = inputDic;
   
    resp.requestType = myVars.EXISTING;
    resp.menuContent = displayText;
    data.session.date_ended = new Date();
    activityLog.date_ended = new Date();
    activityLog.display_text = displayText;
    activityLog.is_value = 1;
    activityLog.input_value = value;
    activityLog.input_display = title;
    activityLog.extra_data = "";
     cleanUpRequest(data,activityLog);
   return UtilityHelper.sendResponse(res, 200, "Success", resp);

})





exports.RequestQuantity = asynHandler(async (req, res, next) => {

    let data = req.body;
    const { activityLog, resp }  = UtilityHelper.initialiaseRequest(data);
  
   let value = data.req.userInput;
   let title = data.req.userInput;
   var inputDic  = UtilityHelper.formatInputDictionary(data.session.session_input);
  
   if (value == "0#")
   {
     await goToMainMenu(resp,data,activityLog);
       cleanUpRequest(data,activityLog);
     return UtilityHelper.sendResponse(res, 200, "Success", resp);
   } else if (value == "1#")
   {
  
    await goBackMenu(resp,activityLog,data);
     cleanUpRequest(data,activityLog);
    return UtilityHelper.sendResponse(res, 200, "Success", resp);
   }
  
   if(isNaN(parseInt(value)))
   {
    //invalid input
    resp.requestType = myVars.EXISTING;
    resp.menuContent = "Invalid input\nEnter Quantity";
    data.session.skip_to_id = data.activity.activity_id; //replace it with the ID ofAmount countroller 
    data.session.date_ended = new Date();
    activityLog.date_ended = new Date();
    activityLog.display_text = displayText;
    activityLog.is_value = 0;
    activityLog.input_value = value;
    activityLog.input_display = title;
    activityLog.extra_data = "";
     cleanUpRequest(data,activityLog);
   return UtilityHelper.sendResponse(res, 200, "Success", resp);
   }
  
  
  
  
  
   inputDic.quantity = parseInt(value);
  
   let activities = [];
   let displayText = UtilityHelper.generateDisplayText(activities, data.activity.description);

   displayText = displayText.replace('{spare_part_code}',inputDic.spare_part_code).replace('{spare_part_name}',inputDic.spare_part_name).replace('{quantity}',inputDic.quantity)

   data.session.session_input = inputDic;
  
   resp.requestType = myVars.EXISTING;
    resp.menuContent = displayText;
    data.session.date_ended = new Date();
    activityLog.date_ended = new Date();
    activityLog.display_text = displayText;
    activityLog.is_value = 1;
    activityLog.input_value = value;
    activityLog.input_display = title;
    activityLog.extra_data = "";
     cleanUpRequest(data,activityLog);
   return UtilityHelper.sendResponse(res, 200, "Success", resp);
  
  })








  exports.RequestComplete = asynHandler(async (req, res, next) => {

    let data = req.body;
    const { activityLog, resp }  = UtilityHelper.initialiaseRequest(data);
  
   let value = data.req.userInput;
   let title = data.req.userInput;
   data.req.userInput = "";
   var inputDic  = UtilityHelper.formatInputDictionary(data.session.session_input);
   
  
   if (value == "0#" || value == "0")
   {
     await goToMainMenu(resp,data,activityLog);
       cleanUpRequest(data,activityLog);
     return UtilityHelper.sendResponse(res, 200, "Success", resp);
   } else if (value == "1#")
   {
    await goBackMenu(resp,activityLog,data);
     cleanUpRequest(data,activityLog);
    return UtilityHelper.sendResponse(res, 200, "Success", resp);
   }
  
  
   const {status,message} = await validatePincode(value,data.req.msisdn);
  
  if(!status)
  {
    resp.requestType = myVars.CLEANUP;
   resp.menuContent = message;
   data.session.date_ended = new Date();
   activityLog.date_ended = new Date();
   activityLog.display_text = message;
   activityLog.is_value = 1;
   activityLog.input_value = value;
   activityLog.input_display = title;
   activityLog.extra_data = "";
    cleanUpRequest(data,activityLog);
  return UtilityHelper.sendResponse(res, 200, "Success", resp);
  }
  
  value = "";
  title = "";
  
  
   let activities = [];
   let displayText = UtilityHelper.generateDisplayText(activities, data.activity.description);
   data.session.session_input = inputDic;
   resp.requestType = myVars.CLEANUP;
    resp.menuContent = displayText;
    data.session.date_ended = new Date();
    activityLog.date_ended = new Date();
    activityLog.display_text = displayText;
    activityLog.is_value = 0;
    activityLog.input_value = value;
    activityLog.input_display = title;
    activityLog.extra_data = "";
     cleanUpRequest(data,activityLog);
     MakeSparePartRequest(inputDic,data);
   return UtilityHelper.sendResponse(res, 200, "Success", resp);
  
  })






