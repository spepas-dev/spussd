
const asynHandler = require("../middleware/async");
const ActivityModel = require("../DBFunctions/ActivityDb")
const UtilityHelper = require("../helper/utilfunc");
const { myVars,ACTIVITYIDS } = require("../helper/vars");
const { cleanUpRequest, goToMainMenu, goBackMenu, validatePincode } = require("../helper/autoRunner");
const { logger } = require("../logs/winston");
const { ActiveRequests,formatBidding,AddToCart } = require("../helper/biddingRunner");



exports.BiddingIndex = asynHandler(async (req, res, next) => {

    let data = req.body;
    const { activityLog, resp }  = UtilityHelper.initialiaseRequest(data);

    var inputDic  = UtilityHelper.formatInputDictionary(data.session.session_input);
    var activities = [];
    let spDetailsRes = await ActiveRequests(data.session.token);

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
 

    activities = spDetailsRes.data;
    inputDic.requests = activities;

    let displayText = UtilityHelper.generateDisplayText(activities, data.activity.description);

    inputDic.indexDisplayText = displayText;
   
    data.session.session_input = inputDic;

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





exports.SelectedRequest = asynHandler(async (req, res, next) => {

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
  
    // let activities2 = await getGroupList(inputDic.group_initials);
     //let displayText2 = UtilityHelper.generateDisplayText(activities2, "Select Group");\
     /*
     await goToMainMenu(resp,data,activityLog);
       cleanUpRequest(data,activityLog);
     return UtilityHelper.sendResponse(res, 200, "Success", resp);
     */
     await goToMainMenu(resp,data,activityLog);
       cleanUpRequest(data,activityLog);
     return UtilityHelper.sendResponse(res, 200, "Success", resp);
   }
  
  let groupList = inputDic.requests;
  
  let selectedGroup = groupList.find(el => el.display_number == value);
  
  console.log(selectedGroup);
  
  if(!selectedGroup)
  {
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
  
  let oneItem = selectedGroup.default_value;



  title = selectedGroup.title;
  value = selectedGroup.activity_type;
  inputDic.request_ID = value;
  inputDic.request_title = title;
  inputDic.request = selectedGroup;

var itemName  = `${selectedGroup.default_value.sparePart.carModel.name} ${selectedGroup.default_value.sparePart.name}`

  
  
   let activities = [];

   console.log("???????????? one bidding")
   console.log(oneItem.bidings)
   let spDetailsRes = await formatBidding(oneItem.bidings);

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

   activities = spDetailsRes.data;



   let displayText = UtilityHelper.generateDisplayText(activities, data.activity.description);

   displayText = displayText.replace('{BidName}',itemName)
   inputDic.selectedRequestDisplayText = displayText;
   inputDic.biddings = activities;
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
  
  






exports.SelectedBid = asynHandler(async (req, res, next) => {

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
  
    // let activities2 = await getGroupList(inputDic.group_initials);
     //let displayText2 = UtilityHelper.generateDisplayText(activities2, "Select Group");

     var displayText2 = inputDic.indexDisplayText;
    await goBackMenu(resp,activityLog,data,displayText2);
     cleanUpRequest(data,activityLog);
    return UtilityHelper.sendResponse(res, 200, "Success", resp);
   }
  
  let groupList = inputDic.biddings;
  
  let selectedGroup = groupList.find(el => el.display_number == value);
  
  console.log(selectedGroup);
  
  if(!selectedGroup)
  {
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
  
  let oneItem = selectedGroup.default_value;

  oneBid = selectedGroup.default_value;



  title = selectedGroup.title;
  value = selectedGroup.activity_type;
  inputDic.bidding_ID = value;
  inputDic.bidding_title = title;
  inputDic.bid = oneItem;



  
  
   let activities = [];
   let displayText = UtilityHelper.generateDisplayText(activities, data.activity.description);


    let userRequest =  inputDic.request.default_value;
    
  
    //let request_title = `${userRequest.quantity} ${userRequest.sparePart.name}`
    let request_title = `${userRequest.sparePart.carModel.yearOfMake} ${userRequest.sparePart.carModel.name} ${userRequest.sparePart.name}`
    displayText = displayText.replace('{request_title}',request_title).replace('{total_price}',oneBid.price).replace('{unit_price}',oneBid.unitPrice)


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
  
  



  
  exports.ADD_BID_TO_CART = asynHandler(async (req, res, next) => {

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
    var displayText2 = inputDic.selectedRequestDisplayText;
    await goBackMenu(resp,activityLog,data, displayText2);
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
  
  
   
  AddToCart(inputDic,data);
  await goToMainMenu(resp,data,activityLog);
  cleanUpRequest(data,activityLog);
return UtilityHelper.sendResponse(res, 200, "Success", resp);

  
  })




