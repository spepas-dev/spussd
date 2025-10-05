const asynHandler = require("../../middleware/async");
const UtilityHelper = require("../../helper/utilfunc");
const { v4: uuidv4 } = require("uuid");
const {
  REGISTRATION_STATUS,
  RESPONSE_CODES,
  myVars,
} = require("../../helper/vars");
const ActivityModel = require("../../DBFunctions/ActivityDb");
const {
  validateActivity,
  cleanUpRequest,
  goToMainMenu,
  goBackMenu,
  validatePincode,
} = require("../../helper/autoRunner");
const { logger } = require("../../logs/winston");
const {
  SellerPendingBiddingItems,
  SetItemReadyForDelivery,
} = require("../../seller/helper/sellerBiddingRunner");

exports.SELLER_BID_INDEX = asynHandler(async (req, res, next) => {
  let data = req.body;
  const { activityLog, resp } = UtilityHelper.initialiaseRequest(data);

  var inputDic = UtilityHelper.formatInputDictionary(
    data.session.session_input
  );
  var activities = [];
  let spDetailsRes = await SellerPendingBiddingItems(
    data.session.token,
    data.session.external_user.Seller_ID
  );

  if (!spDetailsRes.status) {
    resp.requestType = myVars.CLEANUP;
    resp.menuContent = "Unable to connect to external service";
    data.session.date_ended = new Date();
    activityLog.date_ended = new Date();
    activityLog.display_text = "Unable to connect to external service";
    activityLog.is_value = 1;
    activityLog.input_value = value;
    activityLog.input_display = title;
    activityLog.extra_data = "";
    cleanUpRequest(data, activityLog);
    return UtilityHelper.sendResponse(res, 200, "Success", resp);
  }

  activities = spDetailsRes.data;
  inputDic.seller_active_biddings = activities;

  inputDic.seller_active_biddings_page_number = 1;

  const total_pages = UtilityHelper.getTotalPages(activities);

  if (total_pages > inputDic.seller_active_biddings_page_number) {
    activities = UtilityHelper.getPaginatedList(
      activities,
      inputDic.seller_active_biddings_page_number
    );
  }

  let displayText = UtilityHelper.generateDisplayText(
    activities,
    data.activity.description
  );

  if (total_pages > inputDic.seller_active_biddings_page_number) {
    displayText = `${displayText} \n# Next`;
  }

  inputDic.FirstPageDisplayText = displayText;
  let listTitle = `My bids`;
  inputDic.ListTitle = listTitle;
  inputDic.RepeatedID = `44973a07-e896-4f7e-94e0-82e3e78b589f`;

  data.session.session_input = inputDic;

  resp.requestType = myVars.EXISTING;
  resp.menuContent = displayText;
  data.session.date_ended = new Date();
  activityLog.date_ended = new Date();
  activityLog.display_text = displayText;
  activityLog.is_value = 0;
  activityLog.input_value = "";
  activityLog.extra_data = "";

  cleanUpRequest(data, activityLog);

  return UtilityHelper.sendResponse(res, 200, "Success", resp);
});

exports.SELLER_SELECTED_ITEM = asynHandler(async (req, res, next) => {
  let data = req.body;
  const { activityLog, resp } = UtilityHelper.initialiaseRequest(data);

  let value = data.req.userInput;
  let title = data.req.userInput;
  var inputDic = UtilityHelper.formatInputDictionary(
    data.session.session_input
  );

  let savedBiddingList = inputDic.seller_active_biddings;
  let currentPageNumber = inputDic.seller_active_biddings_page_number;

  let totalPages = UtilityHelper.getTotalPages(savedBiddingList);

  if (value == "0#") {
    await goToMainMenu(resp, data, activityLog, "SELLER");
    cleanUpRequest(data, activityLog);
    return UtilityHelper.sendResponse(res, 200, "Success", resp);
  } else if (value == "0") {
    await goToMainMenu(resp, data, activityLog, "SELLER");
    cleanUpRequest(data, activityLog);
    return UtilityHelper.sendResponse(res, 200, "Success", resp);
  } else if (value == "#") {
    if (totalPages > currentPageNumber) {
      //user can move to the next page
      currentPageNumber = currentPageNumber + 1;
      inputDic.seller_active_biddings_page_number = currentPageNumber;
      let activities = UtilityHelper.getPaginatedList(
        savedBiddingList,
        inputDic.seller_active_biddings_page_number
      );

      let displayText = UtilityHelper.generateDisplayText(
        activities,
        inputDic.ListTitle
      );

      console.log(
        `total pages: ${totalPages} current page: ${inputDic.seller_active_biddings_page_number}`
      );
      if (totalPages > inputDic.seller_active_biddings_page_number) {
        displayText = `${displayText} \n# Next`;
      }

      inputDic.PrevPageText = displayText;

      data.session.session_input = inputDic;

      resp.requestType = myVars.EXISTING;
      resp.menuContent = displayText;
      data.session.skip_to_id = inputDic.RepeatedID;
      data.session.date_ended = new Date();
      activityLog.date_ended = new Date();
      activityLog.display_text = displayText;
      activityLog.is_value = 0;
      activityLog.input_value = "";
      activityLog.extra_data = "";

      cleanUpRequest(data, activityLog);

      return UtilityHelper.sendResponse(res, 200, "Success", resp);
    } else {
      resp.requestType = myVars.CLEANUP;
      resp.menuContent = "Invalid input";
      data.session.date_ended = new Date();
      activityLog.date_ended = new Date();
      activityLog.display_text = "Invalid input";
      activityLog.is_value = 0;
      activityLog.input_value = value;
      activityLog.input_display = title;
      activityLog.extra_data = "";
      cleanUpRequest(data, activityLog);
      return UtilityHelper.sendResponse(res, 200, "Success", resp);
    }
  }

  //B8871 · 2023 Honda Civic radiator
  let selectedGroup = savedBiddingList.find((el) => el.display_number == value);

  console.log(selectedGroup);

  if (!selectedGroup) {
    resp.requestType = myVars.CLEANUP;
    resp.menuContent = "Invalid input";
    data.session.date_ended = new Date();
    activityLog.date_ended = new Date();
    activityLog.display_text = "Invalid input";
    activityLog.is_value = 1;
    activityLog.input_value = value;
    activityLog.input_display = title;
    activityLog.extra_data = "";
    cleanUpRequest(data, activityLog);
    return UtilityHelper.sendResponse(res, 200, "Success", resp);
  }

  let oneItem = selectedGroup.default_value;

  title = selectedGroup.title;
  value = selectedGroup.activity_type;
  inputDic.seller_bid_ID = value;
  inputDic.seller_title_title = title;
  inputDic.selectedBid = selectedGroup;

  let item = selectedGroup.default_value;
  let bidCode = `B${String(item.cart.bid.id).padStart(8, "0")}`;

  var itemName = `${bidCode} . ${item.cart.bid.orderRequest.sparePart.carModel.yearOfMake} ${item.cart.bid.orderRequest.sparePart.carModel.name} ${item.cart.bid.orderRequest.sparePart.name}`;

  let unitPrice = item.cart.bid.unitPrice;
  let quantity = item.cart.bid.orderRequest.quantity;
  let expecetedDelivery = item.cart?.bid?.expectedDeliveryDate?.slice(0, 10);

  let newActivities = [];

  let displayText = UtilityHelper.generateDisplayText(
    newActivities,
    data.activity.description
  );

  displayText = displayText
    .replace("{itemName}", itemName)
    .replace("{unitPrice}", unitPrice)
    .replace("{Quantity}", quantity)
    .replace("{ExpectedDeliveryDate}", expecetedDelivery);
  inputDic.selectedRequestDisplayText = displayText;

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
  cleanUpRequest(data, activityLog);
  return UtilityHelper.sendResponse(res, 200, "Success", resp);
});

exports.SELLER_SET_FOR_PICKUP = asynHandler(async (req, res, next) => {
  let data = req.body;
  const { activityLog, resp } = UtilityHelper.initialiaseRequest(data);

  let value = data.req.userInput;
  let title = data.req.userInput;
  var inputDic = UtilityHelper.formatInputDictionary(
    data.session.session_input
  );
  let selectedGroup = inputDic.selectedBid;

  if (value == "0#") {
    await goToMainMenu(resp, data, activityLog, "SELLER");
    cleanUpRequest(data, activityLog);
    return UtilityHelper.sendResponse(res, 200, "Success", resp);
  } else if (value == "0") {
    var displayText2 = inputDic.FirstPageDisplayText;

    await goBackMenu(resp, activityLog, data, displayText2);
    cleanUpRequest(data, activityLog);
    return UtilityHelper.sendResponse(res, 200, "Success", resp);
  }

  if (value != "1") {
    resp.requestType = myVars.CLEANUP;
    resp.menuContent = "Invalid input";
    data.session.date_ended = new Date();
    activityLog.date_ended = new Date();
    activityLog.display_text = "Invalid input";
    activityLog.is_value = 0;
    activityLog.input_value = value;
    activityLog.input_display = title;
    activityLog.extra_data = "";
    cleanUpRequest(data, activityLog);
    return UtilityHelper.sendResponse(res, 200, "Success", resp);
  }

  let orderRequest = selectedGroup.default_value;
  var itemName = `${String(orderRequest.id)}`;

  let newActivities = [];

  let displayText = UtilityHelper.generateDisplayText(
    newActivities,
    data.activity.description
  );

  displayText = displayText.replace("{ItemCode}", itemName);
  //inputDic.DateDisplayText = displayText;

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
  cleanUpRequest(data, activityLog);
  SetItemReadyForDelivery(inputDic, data);
  return UtilityHelper.sendResponse(res, 200, "Success", resp);
});
