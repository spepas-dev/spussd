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



    UserCarts: async (session_token) => {
        let message = "success";
        let token = process.env.SERVICETOKEN;
        let key =  process.env.SERVICEKEY;



        let headers = {
            ...(token && { token }), // Add apiKey if provided
            ...(key && { key }), // Add apiToken if provided
            ...(session_token && {session_token})
          };

          var loginUrl = process.env.ORDER_SERVICE_BASE_URL +"cart/user-carts"
          


        let newUserUpdate = await UtilityHelper.makeHttpRequest("GET",loginUrl, null, headers);
         
        if(!newUserUpdate)
            {
                return ({status: false, message: "Unable to connect to authentication services"});
            }

        if(newUserUpdate.status != 1 )
          {

            return ({status: false, message: newUserUpdate.message});
          }



          let items = newUserUpdate.data;

          /*
          let activities = requests.slice(0, 7).map((item, index) => ({
            title: `${item.quantity} ${item.sparePart.name} -> ${item.bidings.length} bidding(s)`,
            activity_type: item.request_ID,
            display_number: index + 1,
            default_value: item

        }));
        */

      
       let generatedText =  items.map((item, index) => `${item.bid.orderRequest.quantity}. ${item.bid.orderRequest.sparePart.name}(s) -> GHS ${item.bid.totalPrice}`).join("\n");
       const totalSum = items.reduce((sum, item) => sum + (item.bid.totalPrice || 0), 0);
       let finalText = `${generatedText}\nTotal Price: ${totalSum}`



        return ({status: true, message: message, data: finalText});
    },








    CheckoutCart: async (inputDic, data) => {
        /*
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

  */



      let reqObj = {
        msisdn: data.req.msisdn,
        session_id: data.session.session_id,
        user_id: data.session.user_id,
        request_type: "CHECKOUT",
        status: 1
      }

     

      /*
        if(!newUserUpdate)
            {
                reqObj.status = 10;
            }

        if(newUserUpdate.status != 1 )
          {

            reqObj.status = 10;
          }
          */

          await userequestModel.add(reqObj)
        

        return ({status: true, message: "success"});
    },









    UserCartsItems: async (session_token) => {
      let message = "success";
      let token = process.env.SERVICETOKEN;
      let key =  process.env.SERVICEKEY;



      let headers = {
          ...(token && { token }), // Add apiKey if provided
          ...(key && { key }), // Add apiToken if provided
          ...(session_token && {session_token})
        };

        var loginUrl = process.env.ORDER_SERVICE_BASE_URL +"cart/user-carts"
        


      let newUserUpdate = await UtilityHelper.makeHttpRequest("GET",loginUrl, null, headers);
       
      if(!newUserUpdate)
          {
              return ({status: false, message: "Unable to connect to authentication services"});
          }

      if(newUserUpdate.status != 1 )
        {

          return ({status: false, message: newUserUpdate.message});
        }



        let items = newUserUpdate.data;

   
        let activities = items.slice(0, 7).map((item, index) => ({
          title: `${item.bid.orderRequest.quantity} ${item.bid.orderRequest.sparePart.name}(s) -> GHS ${item.bid.totalPrice}`,
          activity_type: item.cart_ID,
          display_number: index + 1,
          default_value: item

      }));
  

      return ({status: true, message: message, data: activities});
  },



  RemoveItemFromCart: async (inputDic, data) => {
    let message = "success";
    let token = process.env.SERVICETOKEN;
    let key =  process.env.SERVICEKEY;
    let session_token = data.session.token;



let reqBody = {
  cart_ID : inputDic.cart_ID
}

    let headers = {
        ...(token && { token }), // Add apiKey if provided
        ...(key && { key }), // Add apiToken if provided
        ...(session_token && {session_token})
      };

      var loginUrl = process.env.ORDER_SERVICE_BASE_URL +"cart/remove-bid"
      


    let newUserUpdate = await UtilityHelper.makeHttpRequest("POST",loginUrl, reqBody, headers);






  let reqObj = {
    msisdn: data.req.msisdn,
    response: newUserUpdate,
    session_id: data.session.session_id,
    user_id: data.session.user_id,
    request_type: "REMOVE_BID_FROM_CART",
    request_details: reqBody
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



}