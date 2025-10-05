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
  SellerActiveBidding,
  SubmitBid,
  SellerActiveBiddingGroupedByBrand,
  SellerActiveBiddingGroupedByPart,
} = require("../helper/sellerBiddingRunner");

exports.SELLER_REQUEST_INDEX = asynHandler(async (req, res, next) => {
  let data = req.body;
  const { activityLog, resp } = await UtilityHelper.GenerateStaticMenu(data);

  cleanUpRequest(data, activityLog);

  console.log("XXXXXXXXXXXX All request check !!!!!!!!!!!!!!!!!!!");
  console.log(resp);
  return UtilityHelper.sendResponse(res, 200, "Success", resp);
});

//=============== Beginning of All Request ====================

exports.SELLER_REQUEST_ALL_INDEX = asynHandler(async (req, res, next) => {
  let data = req.body;
  const { activityLog, resp } = UtilityHelper.initialiaseRequest(data);

  var inputDic = UtilityHelper.formatInputDictionary(
    data.session.session_input
  );
  var activities = [];
  let spDetailsRes = await SellerActiveBidding(
    data.session.token,
    data.session.external_user.Seller_ID
  );

  if (!spDetailsRes.status) {
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
  let listTitle = `All requests`;
  inputDic.ListTitle = listTitle;
  inputDic.RepeatedID = `139246df-99e6-4542-8af5-64dd42c3ec9b`;

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

exports.SELLER_SELECTED_BID = asynHandler(async (req, res, next) => {
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
    // let activities2 = await getGroupList(inputDic.group_initials);
    //let displayText2 = UtilityHelper.generateDisplayText(activities2, "Select Group");\
    /*
     await goToMainMenu(resp,data,activityLog);
       cleanUpRequest(data,activityLog);
     return UtilityHelper.sendResponse(res, 200, "Success", resp);
     */
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

  let orderRequest = selectedGroup.default_value.orderRequest;
  var itemName = `${orderRequest.sparePart.carModel.yearOfMake} ${orderRequest.sparePart.carModel.name} ${orderRequest.sparePart.name}`;

  let newActivities = [];

  let displayText = UtilityHelper.generateDisplayText(
    newActivities,
    data.activity.description
  );

  displayText = displayText.replace("{BidDetails}", itemName);
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

exports.SELLER_UNIT_PRICE = asynHandler(async (req, res, next) => {
  let data = req.body;
  const { activityLog, resp } = UtilityHelper.initialiaseRequest(data);

  let value = data.req.userInput;
  let title = data.req.userInput;
  var inputDic = UtilityHelper.formatInputDictionary(
    data.session.session_input
  );
  let selectedGroup = inputDic.selectedBid;

  let orderRequest = selectedGroup.default_value.orderRequest;
  var itemName = `${orderRequest.sparePart.carModel.yearOfMake} ${orderRequest.sparePart.carModel.name} ${orderRequest.sparePart.name}`;

  console.log(
    `bidding ID here now::::::: ${selectedGroup.default_value.bidding_ID}`
  );

  if (value == "0#") {
    await goToMainMenu(resp, data, activityLog, "SELLER");
    cleanUpRequest(data, activityLog);
    return UtilityHelper.sendResponse(res, 200, "Success", resp);
  } else if (value == "0") {
    //  hope this works
    // var displayText2 = inputDic.selectedRequestDisplayText;
    inputDic.seller_active_biddings_page_number = 1;
    var displayText2 = inputDic.FirstPageDisplayText;

    await goBackMenu(resp, activityLog, data, displayText2);
    cleanUpRequest(data, activityLog);
    return UtilityHelper.sendResponse(res, 200, "Success", resp);
  }

  if (!UtilityHelper.isDecimal(value)) {
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

  inputDic.UNIT_PRICE = value;

  let newActivities = [];

  let displayText = UtilityHelper.generateDisplayText(
    newActivities,
    data.activity.description
  );

  displayText = displayText.replace("{BidDetails}", itemName);
  inputDic.DateDisplayText = displayText;

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

exports.SELLER_EXPECTED_DELIVERY_DATE = asynHandler(async (req, res, next) => {
  let data = req.body;
  const { activityLog, resp } = UtilityHelper.initialiaseRequest(data);

  let value = data.req.userInput;
  let title = data.req.userInput;
  var inputDic = UtilityHelper.formatInputDictionary(
    data.session.session_input
  );
  let selectedGroup = inputDic.selectedBid;

  let orderRequest = selectedGroup.default_value;
  var itemName = `B${String(orderRequest.id).padStart(8, "0")}`;

  if (value == "0#") {
    await goToMainMenu(resp, data, activityLog, "SELLER");
    cleanUpRequest(data, activityLog);
    return UtilityHelper.sendResponse(res, 200, "Success", resp);
  } else if (value == "0") {
    var displayText2 = inputDic.selectedRequestDisplayText;

    await goBackMenu(resp, activityLog, data, displayText2);
    cleanUpRequest(data, activityLog);
    return UtilityHelper.sendResponse(res, 200, "Success", resp);
  }

  if (!UtilityHelper.isValidDate(value)) {
    resp.requestType = myVars.CLEANUP;
    resp.menuContent = "Invalid date format";
    data.session.date_ended = new Date();
    activityLog.date_ended = new Date();
    activityLog.display_text = "Invalid date format";
    activityLog.is_value = 0;
    activityLog.input_value = value;
    activityLog.input_display = title;
    activityLog.extra_data = "";
    cleanUpRequest(data, activityLog);
    return UtilityHelper.sendResponse(res, 200, "Success", resp);
  }

  inputDic.EXPECTED_DATE = value;

  let newActivities = [];

  let displayText = UtilityHelper.generateDisplayText(
    newActivities,
    data.activity.description
  );

  displayText = displayText.replace("{BidCode}", itemName);
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
  SubmitBid(inputDic, data);
  return UtilityHelper.sendResponse(res, 200, "Success", resp);
});

//=========================== END OF ALL REQUEST =================================

//============================= BEGINNING OF BY BRAND =============================

exports.SELLER_REQUEST_BRAND_INDEX = asynHandler(async (req, res, next) => {
  console.log("bidding ID here now::::::: response:: in the brand page");

  let data = req.body;
  const { activityLog, resp } = UtilityHelper.initialiaseRequest(data);

  var inputDic = UtilityHelper.formatInputDictionary(
    data.session.session_input
  );
  var activities = [];
  let spDetailsRes = await SellerActiveBiddingGroupedByBrand(
    data.session.token,
    data.session.external_user.Seller_ID
  );

  if (!spDetailsRes.status) {
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

  //({status: true, message: message, originalData: requests, data: activities});

  activities = spDetailsRes.data;
  inputDic.seller_original_bidding = spDetailsRes.originalData;
  inputDic.seller_brand_list = activities;
  inputDic.seller_brand_page_number = 1;

  const total_pages = UtilityHelper.getTotalPages(activities);

  if (total_pages > inputDic.seller_brand_page_number) {
    activities = UtilityHelper.getPaginatedList(
      activities,
      inputDic.seller_brand_page_number
    );
  }

  let displayText = UtilityHelper.generateDisplayText(
    activities,
    data.activity.description
  );

  if (total_pages > inputDic.seller_brand_page_number) {
    displayText = `${displayText} \n# Next`;
  }

  inputDic.RepeatedID = `e4c96107-132f-4c17-967f-23212a52e44d`;
  inputDic.CategoryRepeat = `5535b15e-aa10-4138-9906-f07bd9523a80`;
  inputDic.RequestMode = `brand`;
  inputDic.FirstBrandPageDisplayText = displayText;

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

exports.SELLER_SELECTED_BRAND = asynHandler(async (req, res, next) => {
  let data = req.body;
  const { activityLog, resp } = UtilityHelper.initialiaseRequest(data);

  let value = data.req.userInput;
  let title = data.req.userInput;
  var inputDic = UtilityHelper.formatInputDictionary(
    data.session.session_input
  );

  let savedBrandList = inputDic.seller_brand_list;
  let currentBrandPageNumber = inputDic.seller_brand_page_number;

  let totalPages = UtilityHelper.getTotalPages(savedBrandList);

  if (value == "0#") {
    await goToMainMenu(resp, data, activityLog, "SELLER");
    cleanUpRequest(data, activityLog);
    return UtilityHelper.sendResponse(res, 200, "Success", resp);
  } else if (value == "0") {
    await goToMainMenu(resp, data, activityLog, "SELLER");
    cleanUpRequest(data, activityLog);
    return UtilityHelper.sendResponse(res, 200, "Success", resp);
  } else if (value == "#") {
    if (totalPages > currentBrandPageNumber) {
      //user can move to the next page
      currentBrandPageNumber = currentBrandPageNumber + 1;
      inputDic.seller_brand_page_number = currentBrandPageNumber;
      let activities = UtilityHelper.getPaginatedList(
        savedBrandList,
        inputDic.seller_brand_page_number
      );

      let displayText = UtilityHelper.generateDisplayText(
        activities,
        "Select brand"
      );

      console.log(
        `total pages: ${totalPages} current page: ${inputDic.seller_brand_page_number}`
      );
      if (totalPages > inputDic.seller_brand_page_number) {
        displayText = `${displayText} \n# Next`;
      }

      inputDic.PrevBrandPageText = displayText;

      data.session.session_input = inputDic;

      resp.requestType = myVars.EXISTING;
      resp.menuContent = displayText;
      data.session.skip_to_id = inputDic.CategoryRepeat;
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

  let selectedGroup = savedBrandList.find((el) => el.display_number == value);

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

  //let oneItem = selectedGroup.default_value;

  title = selectedGroup.title;
  value = selectedGroup.activity_type;
  inputDic.seller_brand = value;
  inputDic.seller_brand_title = title;
  inputDic.selectedBrand = selectedGroup;

  let reMode = inputDic.RequestMode;

  let requests = inputDic.seller_original_bidding;

  if (reMode == "part") {
    //filter by part
    requests = UtilityHelper.filterByPartName(requests, value);
  } else {
    //filter by brand
    requests = UtilityHelper.filterByCarBrand(requests, value);
  }

  let activities = requests.map((item, index) => ({
    // -> ${item.bidings.length} bid(s)
    title: `${item.orderRequest.sparePart.carModel.name} ${item.orderRequest.sparePart.name} (${item.orderRequest.quantity})`,
    activity_type: item.request_ID,
    display_number: index + 1,
    default_value: item,
  }));

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
  //inputDic.byBrand = true

  let listTitle = `${value} requests`;
  inputDic.ListTitle = listTitle;

  displayText = displayText.replace("{BrandName}", value);

  inputDic.FirstPageDisplayText = displayText;

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
//=============================== END OF BY BRAND ====================================

//=============================== BEGINNING OF BY PART ===============================

exports.SELLER_REQUEST_PART_INDEX = asynHandler(async (req, res, next) => {
  console.log("bidding ID here now::::::: response:: in the brand page");

  let data = req.body;
  const { activityLog, resp } = UtilityHelper.initialiaseRequest(data);

  var inputDic = UtilityHelper.formatInputDictionary(
    data.session.session_input
  );
  var activities = [];
  let spDetailsRes = await SellerActiveBiddingGroupedByPart(
    data.session.token,
    data.session.external_user.Seller_ID
  );

  if (!spDetailsRes.status) {
    resp.requestType = myVars.CLEANUP;
    resp.menuContent = "External service down";
    data.session.date_ended = new Date();
    activityLog.date_ended = new Date();
    activityLog.display_text = "External service down";
    activityLog.is_value = 1;
    activityLog.input_value = value;
    activityLog.input_display = title;
    activityLog.extra_data = "";
    cleanUpRequest(data, activityLog);
    return UtilityHelper.sendResponse(res, 200, "Success", resp);
  }

  //({status: true, message: message, originalData: requests, data: activities});

  activities = spDetailsRes.data;
  inputDic.seller_original_bidding = spDetailsRes.originalData;
  inputDic.seller_brand_list = activities;
  inputDic.seller_brand_page_number = 1;

  const total_pages = UtilityHelper.getTotalPages(activities);

  if (total_pages > inputDic.seller_brand_page_number) {
    activities = UtilityHelper.getPaginatedList(
      activities,
      inputDic.seller_brand_page_number
    );
  }

  let displayText = UtilityHelper.generateDisplayText(
    activities,
    data.activity.description
  );

  if (total_pages > inputDic.seller_brand_page_number) {
    displayText = `${displayText} \n# Next`;
  }

  inputDic.RepeatedID = `99cea8c7-4ad9-4a7e-89d8-a18c5c7e9ed3`;
  inputDic.CategoryRepeat = `7bd458a9-96fc-4836-9b94-489ebd222202`;
  inputDic.RequestMode = `part`;
  inputDic.FirstBrandPageDisplayText = displayText;

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
