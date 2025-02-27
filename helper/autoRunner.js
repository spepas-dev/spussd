const ActivityModel = require("..//DBFunctions/ActivityDb")
const userModel = require("..//DBFunctions/UserDb")
const sessionModel = require("..//DBFunctions/SessionDb")
const { logger } = require("../logs/winston");
const activityLogModel = require("..//DBFunctions/ActivityLogDb")
const { staticString, ProcessStatus, myVars } = require("./vars")
const { ApiCall } = require("./autoCalls");
const UtilityHelper = require("./utilfunc");


module.exports = {
    registerUser: async (req, session) => {
        let {msisdn,operator} = req
        console.log("-------------- auto run: "+msisdn);
        let userResult = await userModel.byMsisdn(msisdn);
        console.log("-------------- auto run: "+msisdn);
        var user = {};
        console.log(userResult);
        if(!userResult){
            // no user found create new user
            var newUser = {
                msisdn: msisdn,
                status: 1,
                network:  operator,
                activated: 0,
                pincode_status: 0
            };
            console.log("-------------- inserting here: ");
            let newUserResults = await userModel.add(newUser);

            console.log("-------------- inserted user: ");

            if(!newUserResults)
            {
                logger.error("Unable to save user");
                return null;
            }
            user = newUserResults;

        }else{
            user = userResult;
        }

        console.log(user);
        session.user_id = user.user_id;

        /*
        let sessionUpdateData = {
            user_id: user.user_id
        };*/

        await  sessionModel.update(session)

        //let sessionUpdate = await GlobalModel.Update(sessionUpdateData,'session','session_id',session.session_id);
          return user;
    },

    postInternalRequest: async (data) => {
        let {req,session, activity} = data;
        let { requestType, msisdn, sessionId, currentMenu, operator, userInput, shortCode } = req

        console.log("XXXXXX?????XXXXX?????????????????: ")
        console.log(activity.endpoint)
        let url = staticString.BASEURL + activity.endpoint;
        console.log("url here: "+ url);
        let checkapiresult = await ApiCall(url, 'POST', '', data)
        if(!checkapiresult)
        {
            let erroObj = {
                msisdn : msisdn,
                menuContent: myVars.UNABLETOPROCESSREQUEST,
                requestType: myVars.CLEANUP,
                sessionId: sessionId,
                currentMenu: currentMenu
            }
            return erroObj;

        }

        return checkapiresult;
    },
   
   

    validateActivity: async (data) => {
        let {isMain,nonCustomer,displayNumber,baseID} = data;
       
        if(isMain == 1)
        {
            //adding main activity, validate 
            let activityRes = await ActivityModel.mainDisplayNumberDetails(displayNumber,nonCustomer);
            console.log("XXXXXXXXXXXX:::::")
            console.log(activityRes)
            if(activityRes)
            {
                let errorMessage = "Activity with display number "+displayNumber +" already exist";
                return ({
                    reqStatus: false ,
                    message: errorMessage
                });
            }
            
        }else{
            let activityRes = await ActivityModel.byBaseIDanddisplayNumber(baseID,displayNumber);
            console.log("XXXXXXXXXXXX:::::")
            console.log(activityRes)
            if(activityRes)
            {
                let errorMessage = "Activity with display number "+displayNumber +" already exist";
                return ({
                    reqStatus: false ,
                    message: errorMessage
                });
            }
        }
  
        return  ({
            reqStatus: true ,
            message: "success"
        });;

    },
    cleanUpRequest: async (data, activityLog) => {
        //console.log("In clean up");
        let {session} = data;
        //let sessionID = session.session_id;
       // console.log(session)

       activityLog.status = ProcessStatus.COMPLETED;
       activityLog.date_ended = new Date();
       session.date_ended = new Date();

       //console.log(session)
       //console.log("Display activity content");
       ///console.log(activityLog)
       let activityRes = await activityLogModel.add(activityLog)
       //await GlobalModel.Create(activityLog,'activity_log', '')
       let updateRes = await sessionModel.update(session);

      // console.log("?????????????????: after update ")
     //  console.log("?????????????????: after update " + updateRes)

    },
    goToMainMenu: async (resp, data,activityLog) => {

        let mainActs = await ActivityModel.main(0);
        let displayText = UtilityHelper.generateDisplayText(mainActs, staticString.TITLE);
        resp.requestType = myVars.EXISTING;
        resp.menuContent = displayText;
        data.session.hope = 0;
        data.session.date_ended = new Date();
        activityLog.input_display = "";
        activityLog.input_value = "";
        activityLog.is_value = 0;
    },
    goBackMenu: async (resp,activityLog,data,description,activityID) => {

        let baseActityResult = await ActivityModel.byID(data.activity.base_id);
        let baseActivity = baseActityResult

        if(!description)
        {
            var titleActivityResult = await ActivityModel.byID(baseActivity.base_id);
            let titleActivity = titleActivityResult;
            resp.menuContent = titleActivity.description;
        }
        else
        {
            resp.menuContent = description;
        }

        console.log("printing out base ID");
        console.log(activityID);
        if(!activityID)
        {
            console.log("undefined");
            data.session.skip_to_id  = baseActivity.activity_id;
        }
        else
        {
            console.log("defined");
            data.session.skip_to_id = activityID;
        }


        resp.requestType = myVars.EXISTING;
        data.session.date_ended = new Date();

        activityLog.date_ended =  new Date();
        activityLog.display_text = resp.menuContent;
        activityLog.input_display = "";
        activityLog.input_value = "";
        activityLog.is_value = 0;
       
    },



    validatePincode: async (pin, msisdn) => {
        let message = "success";


        return ({status: true, message: message});
    },




    LoginUser: async (msisdn) => {
        let message = "success";
        let token = "";
        let key = "";
        let headers = {
            ...(token && { token }), // Add apiKey if provided
            ...(key && { key }), // Add apiToken if provided
          };

          var loginUrl = process.env.AUTH_SERVICE_BASE_URL +"user/login_by_phone"
          

          let loginBodyObj = {
            phoneNumber: msisdn
        };

        let newUserUpdate = await UtilityHelper.makeHttpRequest("POST",loginUrl, loginBodyObj, headers);
         
        if(!newUserUpdate)
            {
                return ({status: false, message: "Unable to connect to authentication services"});
            }

        if(newUserUpdate.status != 1 )
          {

            return ({status: false, message: newUserUpdate.message});
          }


        return ({status: true, message: message, data: newUserUpdate});
    },

}

