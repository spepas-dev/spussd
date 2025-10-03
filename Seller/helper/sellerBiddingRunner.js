const ActivityModel = require("../..//DBFunctions/ActivityDb")
const userModel = require("../..//DBFunctions/UserDb")
const sessionModel = require("../..//DBFunctions/SessionDb")
const userequestModel = require("../..//DBFunctions/UserRequestDb")
const { logger } = require("../../logs/winston");
const activityLogModel = require("../..//DBFunctions/ActivityLogDb")
const { staticString, ProcessStatus, myVars } = require("../../helper/vars")
const { ApiCall } = require("../../helper/autoCalls");
const UtilityHelper = require("../../helper/utilfunc");



module.exports = {

    SellerActiveBidding: async (session_token,seller_id) => {
        let message = "success";
        let token = process.env.SERVICETOKEN;
        let key =  process.env.SERVICEKEY;

          
          
        let headers = {
            ...(token && { token }), // Add apiKey if provided
            ...(key && { key }), // Add apiToken if provided
            ...(session_token && {session_token})
          };

          var loginUrl = process.env.ORDER_SERVICE_BASE_URL +"bidding/seller-active-biddings/"+seller_id
          


        let newUserUpdate = await UtilityHelper.makeHttpRequest("GET",loginUrl, null, headers);
         
        if(!newUserUpdate)
            {
                return ({status: false, message: "Unable to connect to authentication services"});
            }

        if(newUserUpdate.status != 1 )
          {

            return ({status: false, message: newUserUpdate.message});
          }

          let requests = newUserUpdate.data;

          let activities = requests.map((item, index) => ({
            // -> ${item.bidings.length} bid(s)
            title: `${item.orderRequest.sparePart.carModel.name} ${item.orderRequest.sparePart.name} (${item.orderRequest.quantity})`,
            activity_type: item.request_ID,
            display_number: index + 1,
            default_value: item

        }));







        return ({status: true, message: message, data: activities});
    },



    SubmitBid: async (inputDic, data) => {

        console.log(`bidding ID here now::::::: response:: function called`)


        let message = "success";
        let token = process.env.SERVICETOKEN;
        let key =  process.env.SERVICEKEY;
        let session_token = data.session.token;
        console.log("complete final function called")


        let selectedGroup = inputDic.selectedBid.default_value;

       

  let totalPrice = inputDic.UNIT_PRICE * selectedGroup.orderRequest.quantity

let reqBody = {
    bidding_ID : selectedGroup.bidding_ID,
    discount: 0,
    unitPrice: parseFloat(inputDic.UNIT_PRICE),
    expectedDeliveryDate: inputDic.EXPECTED_DATE,
    totalPrice:totalPrice,
    price: totalPrice
      }
   
        let headers = {
            ...(token && { token }), // Add apiKey if provided
            ...(key && { key }), // Add apiToken if provided
            ...(session_token && {session_token})
          };

          var loginUrl = process.env.ORDER_SERVICE_BASE_URL +"bidding/accept"
          


        let newUserUpdate = await UtilityHelper.makeHttpRequest("POST",loginUrl, reqBody, headers);


        console.log(`bidding ID here now::::::: response:: ${selectedGroup.bidding_ID}`)
        console.log(newUserUpdate)




      let reqObj = {
        msisdn: data.req.msisdn,
        response: newUserUpdate,
        session_id: data.session.session_id,
        user_id: data.session.user_id,
        request_type: "ACCEPT OFFER"
      }

     

        if(!newUserUpdate)
            {
                reqObj.status = 10;
            }

        if(newUserUpdate.status != 1 )
          {

            reqObj.status = 10;
          }

          await userequestModel.add(reqObj)

        return ({status: true, message: message});
    },


    SellerActiveBiddingGroupedByBrand: async (session_token,seller_id) => {
        let message = "success";
        let token = process.env.SERVICETOKEN;
        let key =  process.env.SERVICEKEY;

          
          
        let headers = {
            ...(token && { token }), // Add apiKey if provided
            ...(key && { key }), // Add apiToken if provided
            ...(session_token && {session_token})
          };

          var loginUrl = process.env.ORDER_SERVICE_BASE_URL +"bidding/seller-active-biddings/"+seller_id
          


        let newUserUpdate = await UtilityHelper.makeHttpRequest("GET",loginUrl, null, headers);
         
        if(!newUserUpdate)
            {
                return ({status: false, message: "Unable to connect to authentication services"});
            }

        if(newUserUpdate.status != 1 )
          {

            return ({status: false, message: newUserUpdate.message});
          }

          let requests = newUserUpdate.data;

          let groupedData = UtilityHelper.groupByBrandAsArray(requests)

          let activities = groupedData.map((item, index) => ({
            // -> ${item.bidings.length} bid(s)
            title: `${item.brandName} (${item.count})`,
            activity_type: item.brandName,
            display_number: index + 1,
            default_value: item

        }));







        return ({status: true, message: message, originalData: requests, data: activities});
    },



    SellerActiveBiddingGroupedByPart: async (session_token,seller_id) => {
        let message = "success";
        let token = process.env.SERVICETOKEN;
        let key =  process.env.SERVICEKEY;

          
          
        let headers = {
            ...(token && { token }), // Add apiKey if provided
            ...(key && { key }), // Add apiToken if provided
            ...(session_token && {session_token})
          };

          var loginUrl = process.env.ORDER_SERVICE_BASE_URL +"bidding/seller-active-biddings/"+seller_id
          


        let newUserUpdate = await UtilityHelper.makeHttpRequest("GET",loginUrl, null, headers);
         
        if(!newUserUpdate)
            {
                return ({status: false, message: "Unable to connect to authentication services"});
            }

        if(newUserUpdate.status != 1 )
          {

            return ({status: false, message: newUserUpdate.message});
          }

          let requests = newUserUpdate.data;

          let groupedData = UtilityHelper.groupByPartAsArray(requests)

          let activities = groupedData.map((item, index) => ({
            // -> ${item.bidings.length} bid(s)
            title: `${item.brandName} (${item.count})`,
            activity_type: item.brandName,
            display_number: index + 1,
            default_value: item

        }));







        return ({status: true, message: message, originalData: requests, data: activities});
    }

}