const ActivityModel = require("..//DBFunctions/ActivityDb")
const userModel = require("..//DBFunctions/UserDb")
const sessionModel = require("..//DBFunctions/SessionDb")
const userequestModel = require("..//DBFunctions/UserRequestDb")
const { logger } = require("../logs/winston");
const activityLogModel = require("..//DBFunctions/ActivityLogDb")
const { staticString, ProcessStatus, myVars } = require("./vars")
const { ApiCall } = require("./autoCalls");
const UtilityHelper = require("./utilfunc");



module.exports = {

    ActiveRequests: async (session_token) => {
        let message = "success";
        let token = process.env.SERVICETOKEN;
        let key =  process.env.SERVICEKEY;



        let headers = {
            ...(token && { token }), // Add apiKey if provided
            ...(key && { key }), // Add apiToken if provided
            ...(session_token && {session_token})
          };

          var loginUrl = process.env.ORDER_SERVICE_BASE_URL +"request/user-active-requests"
          


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

          let activities = requests.slice(0, 7).map((item, index) => ({
            title: `${item.quantity} ${item.sparePart.name} -> ${item.bidings.length} bidding(s)`,
            activity_type: item.request_ID,
            display_number: index + 1,
            default_value: item

        }));







        return ({status: true, message: message, data: activities});
    },

    formatBidding: async (items) => {
        let message = "success";

        let activities = items.slice(0, 7).map((item, index) => ({
            title: `Price: GHS ${item.totalPrice}  Discount: GHS ${item.discount}`,
            activity_type: item.bidding_ID,
            display_number: index + 1,
            default_value: item

        }));


        return ({status: true, message: message, data: activities});
    },


    AddToCart: async (inputDic, data) => {
        let message = "success";
        let token = process.env.SERVICETOKEN;
        let key =  process.env.SERVICEKEY;
        let session_token = data.session.token;



let reqBody = {
    bidding_ID : inputDic.bidding_ID
}

        let headers = {
            ...(token && { token }), // Add apiKey if provided
            ...(key && { key }), // Add apiToken if provided
            ...(session_token && {session_token})
          };

          var loginUrl = process.env.ORDER_SERVICE_BASE_URL +"cart/add-bid"
          


        let newUserUpdate = await UtilityHelper.makeHttpRequest("POST",loginUrl, reqBody, headers);






      let reqObj = {
        msisdn: data.req.msisdn,
        response: newUserUpdate,
        session_id: data.session.session_id,
        user_id: data.session.user_id,
        request_type: "ADD_BID_TO_CART"
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
    }

}