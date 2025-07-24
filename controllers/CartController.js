
const asynHandler = require("../middleware/async");
const ActivityModel = require("../DBFunctions/ActivityDb")
const UtilityHelper = require("../helper/utilfunc");
const { myVars,ACTIVITYIDS } = require("../helper/vars");
const { cleanUpRequest, goToMainMenu, goBackMenu, validatePincode } = require("../helper/autoRunner");
const { logger } = require("../logs/winston");
const { UserCarts, CheckoutCart, UserCartsItems , RemoveItemFromCart,AggregationMode} = require("../helper/cartRunner");




exports.CartIndex = asynHandler(async (req, res, next) => {

    let data = req.body;
  
    const { activityLog, resp }  = await UtilityHelper.GenerateStaticMenu(data);
     cleanUpRequest(data,activityLog);
     console.log("????????? response: ")
     console.log(resp)
   return UtilityHelper.sendResponse(res, 200, "Success", resp);

})



exports.CartCheckoutIndex = asynHandler(async (req, res, next) => {

  let data = req.body;
  const { activityLog, resp }  = UtilityHelper.initialiaseRequest(data);

  var inputDic  = UtilityHelper.formatInputDictionary(data.session.session_input);
  var activities = [];
  let spDetailsRes = await UserCartsItems(data.session.token);

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
  inputDic.cartItems = activities;

  let displayText = activities
  .map(item => item.title)
  .join('\n');

  displayText = data.activity.description.replace('{CartList}',displayText) 
  
  //'\n\n1. Proceed\n1# Back'

  inputDic.BacListPreview = displayText;
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




exports.CartProceedCheckout = asynHandler(async (req, res, next) => {

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
    } else if (value == "1#" || value != "1")
    {
   
     // let activities2 = await getGroupList(inputDic.group_initials);
      //let displayText2 = UtilityHelper.generateDisplayText(activities2, "Select Group");
      /*
     await goBackMenu(resp,activityLog,data);
      cleanUpRequest(data,activityLog);
     return UtilityHelper.sendResponse(res, 200, "Success", resp);
     */
     await goToMainMenu(resp,data,activityLog);
     cleanUpRequest(data,activityLog);
   return UtilityHelper.sendResponse(res, 200, "Success", resp);
    }


    let activities = await AggregationMode();

    


    let displayText = UtilityHelper.generateDisplayText(activities, data.activity.description);
    inputDic.aggregationDisplay = displayText;
    inputDic.aggregationModes = activities;
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







exports.CartAggregationMode = asynHandler(async (req, res, next) => {

  console.log("XXXXXXXXXXXXXXXX::::: Cart mode called")
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
    
      var backDisplay = inputDic.BacListPreview;
     await goBackMenu(resp,activityLog,data, backDisplay);
      cleanUpRequest(data,activityLog);
     return UtilityHelper.sendResponse(res, 200, "Success", resp);
    
    }







  let aggregationMode = inputDic.aggregationModes;
  
  let selectedMode = aggregationMode.find(el => el.display_number == Number(value));
  

  
  if(!selectedMode)
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
  

  inputDic.aggregationModeValue = value;
  inputDic.aggregationModeTitle = title;
  inputDic.aggregationMode = selectedMode;
  data.session.session_input = inputDic;



  var activities = [];
  let spDetailsRes = await UserCarts(data.session.token);

  if(!spDetailsRes.status){
   resp.requestType = myVars.CLEANUP;
   resp.menuContent = "Request failed";
   data.session.date_ended = new Date();
   activityLog.date_ended = new Date();
   activityLog.display_text = "Request failed";
   activityLog.is_value = 1;
   activityLog.input_value = value;
   activityLog.input_display = title;
   activityLog.extra_data = "";
    cleanUpRequest(data,activityLog);
  return UtilityHelper.sendResponse(res, 200, "Success", resp);
  }


  inputDic.cart_summary = spDetailsRes.data;
  let displayText = UtilityHelper.generateDisplayText(activities, data.activity.description);
  displayText = displayText.replace('{cart-details}',inputDic.cart_summary)
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






exports.CartCheckoutComplete = asynHandler(async (req, res, next) => {

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
    var aggDisplay = inputDic.aggregationDisplay;
    await goBackMenu(resp,activityLog,data,aggDisplay);
     cleanUpRequest(data,activityLog);
    return UtilityHelper.sendResponse(res, 200, "Success", resp);
   }
  
  
  
  if(value != "1")
  {
    resp.requestType = myVars.CLEANUP;
   resp.menuContent = message;
   data.session.date_ended = new Date();
   activityLog.date_ended = new Date();
   activityLog.display_text = "Request cancelled";
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
     CheckoutCart(inputDic,data);
   return UtilityHelper.sendResponse(res, 200, "Success", resp);
  
  })









exports.CartRemoveItemIndex = asynHandler(async (req, res, next) => {

  let data = req.body;
  const { activityLog, resp }  = UtilityHelper.initialiaseRequest(data);

  var inputDic  = UtilityHelper.formatInputDictionary(data.session.session_input);
  var activities = [];
  let spDetailsRes = await UserCartsItems(data.session.token);

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
  inputDic.cartItems = activities;

  let displayText = UtilityHelper.generateDisplayText(activities, data.activity.description);

 
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






exports.CartRemoveItemSelected = asynHandler(async (req, res, next) => {

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
  await goBackMenu(resp,activityLog,data);
   cleanUpRequest(data,activityLog);
  return UtilityHelper.sendResponse(res, 200, "Success", resp);
 }

let groupList = inputDic.cartItems;

let selectedGroup = groupList.find(el => el.display_number == value);



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
inputDic.cart_ID = value;
inputDic.cart_title = title;
inputDic.selectedCartToRemove = oneItem;





 let activities = [];
 let displayText = UtilityHelper.generateDisplayText(activities, data.activity.description);


  
  displayText = displayText.replace('{item-selected}',title)


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




  
exports.COMPLETE_REMOVE_ITEM = asynHandler(async (req, res, next) => {

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


 
RemoveItemFromCart(inputDic,data);
await goToMainMenu(resp,data,activityLog);
cleanUpRequest(data,activityLog);
return UtilityHelper.sendResponse(res, 200, "Success", resp);


})
