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

    SparpartDetails: async (partCode, session_token) => {
        let message = "success";
        let token = process.env.SERVICETOKEN;
        let key =  process.env.SERVICEKEY;



        let headers = {
            ...(token && { token }), // Add apiKey if provided
            ...(key && { key }), // Add apiToken if provided
            ...(session_token && {session_token})
          };

          var loginUrl = process.env.PRODUCT_SERVICE_BASE_URL +"spare-part/details-by-code/"+partCode
          


        let newUserUpdate = await UtilityHelper.makeHttpRequest("GET",loginUrl, null, headers);
         
        if(!newUserUpdate)
            {
                return ({status: false, message: "Unable to connect to authentication services"});
            }

        if(newUserUpdate.status != 1 )
          {

            return ({status: false, message: newUserUpdate.message});
          }


        return ({status: true, message: message, data: newUserUpdate.data});
    },

    MakeSparePartRequest: async (inputDic, data) => {
        let message = "success";
        let token = process.env.SERVICETOKEN;
        let key =  process.env.SERVICEKEY;
        let session_token = data.session.token;
        console.log("complete final function called")



let reqBody = {
    SparePart_ID : inputDic.spare_part.SparePart_ID,
    require_image: 1,
    quantity: inputDic.quantity
}

        let headers = {
            ...(token && { token }), // Add apiKey if provided
            ...(key && { key }), // Add apiToken if provided
            ...(session_token && {session_token})
          };

          var loginUrl = process.env.ORDER_SERVICE_BASE_URL +"request/add"
          


        let newUserUpdate = await UtilityHelper.makeHttpRequest("POST",loginUrl, reqBody, headers);






      let reqObj = {
        msisdn: data.req.msisdn,
        response: newUserUpdate,
        session_id: data.session.session_id,
        user_id: data.session.user_id,
        request_type: "REQUEST"
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


