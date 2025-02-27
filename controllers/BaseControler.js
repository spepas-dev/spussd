const asynHandler = require("../middleware/async");
const UtilityHelper = require("../helper/utilfunc");
const { v4: uuidv4 } = require('uuid');
const {myVars, REGISTRATION_STATUS, RESPONSE_CODES, staticString,ProcessStatus,ActivityType} = require("../helper/vars");
const ActivityModel = require("../DBFunctions/ActivityDb");
const sessionModel = require("../DBFunctions/SessionDb");
const userModel = require("../DBFunctions/UserDb");
const { registerUser, postInternalRequest, LoginUser } = require("../helper/autoRunner");
const { logger } = require("../logs/winston");


exports.BaseRouter = asynHandler(async (req, res, next) => {
    let { requestType, msisdn, sessionId, currentMenu, operator, userInput, shortCode } = req.body


    // res.send("hello Gyanima" )
 
    if (requestType == myVars.INITIATION) {

        let objData = {
            external_session_id: sessionId,
            msisdn: msisdn,
            status: 1,
            hope: 0,
            request_details: req.body,
            input: userInput
        }

        let results = await sessionModel.add(objData);
        
        if (results) {

            /*
            let successObj = {
                msisdn : msisdn,
                menuContent: myVars.UNKOWN_ERROR,
                requestType: myVars.CLEANUP,
                sessionId: sessionId,
                currentMenu: currentMenu
            }

            */
             var  userSession =  results;

         
           let user = await registerUser(req.body,userSession);
           console.log("-------------- user here: ");
           console.log(user);
           if (!user)
           {
            let erroObj = {
                msisdn : msisdn,
                menuContent: myVars.UNKOWN_ERROR,
                requestType: myVars.CLEANUP,
                sessionId: sessionId,
                currentMenu: currentMenu
            }
            return UtilityHelper.sendResponse(res, 200, "Unable to save session", erroObj)
           }

           console.log("------- userID here::::: ");
           console.log(user.user_id);
           userSession.user_id =  user.user_id;



           console.log("------- userID here::::: " + user.user_id)

           if(user.status == ProcessStatus.DEACTIVATE){
            let erroObj = {
                msisdn : msisdn,
                menuContent: myVars.UNABLETOPROCESSREQUEST,
                requestType: myVars.CLEANUP,
                sessionId: sessionId,
                currentMenu: currentMenu
            }
            return UtilityHelper.sendResponse(res, 200, "Unable to save session", erroObj)
           }


           //login user
           //get save user against session
           //save token against user

           //for now if user does not exist log out the user

           let externalUser = await LoginUser(msisdn)

           if(!externalUser.status){
            let erroObj = {
                msisdn : msisdn,
                menuContent: myVars.UNABLETOPROCESSREQUEST,
                requestType: myVars.CLEANUP,
                sessionId: sessionId,
                currentMenu: currentMenu
            }
            return UtilityHelper.sendResponse(res, 200, "Unregistered user", erroObj)
           }
         


           console.log("XXXXX externalUser:::: ")
           
           console.log(externalUser)

           userSession.external_user = externalUser.data.data.user;
           userSession.refresh_token = externalUser.data.data.refresh_token;
           userSession.token = externalUser.data.data.token;



           await sessionModel.update(userSession);




           //Check pinstatus after this flow
           //Check activated user after this flow

           let nonCust = 0;

           // var mainActs = _activityRepository.main(nonCust);

           let mainActs = await ActivityModel.main(nonCust);

           if (!mainActs)
           {
            let erroObj = {
                msisdn : msisdn,
                menuContent: myVars.UNABLETOPROCESSREQUEST,
                requestType: myVars.CLEANUP,
                sessionId: sessionId,
                currentMenu: currentMenu
            }
            return UtilityHelper.sendResponse(res, 200, "Unable to save session", erroObj)
           }




           //staticString
           let displayText = UtilityHelper.generateDisplayText(mainActs, staticString.TITLE);

           let sucObj = {
            msisdn : msisdn,
            menuContent: displayText,
            requestType: myVars.EXISTING,
            sessionId: sessionId,
            currentMenu: currentMenu
        }
        return UtilityHelper.sendResponse(res, 200, "Success", sucObj)
        } else {
            let erroObj = {
                msisdn : msisdn,
                menuContent: myVars.UNKOWN_ERROR,
                requestType: myVars.CLEANUP,
                sessionId: sessionId,
                currentMenu: currentMenu
            }
            return UtilityHelper.sendResponse(res, 200, "Unable to save session", erroObj)

        }

    } else if (requestType == myVars.EXISTING)  {
      
        //Existing request code here
        let results = await sessionModel.byExternalID(sessionId,msisdn);
   
        console.log("")
        if(!results)
        {
            //failed to retrieve session return with failed response
            let erroObj = {
                msisdn : msisdn,
                menuContent: myVars.UNABLETOPROCESSREQUEST,
                requestType: myVars.CLEANUP,
                sessionId: sessionId,
                currentMenu: currentMenu
            }

            let errorMessage = `Unable to retrieve session at Base route:  ${sessionId} `;
            logger.error(errorMessage);
            return UtilityHelper.sendResponse(res, 200, "Unable to save session", erroObj)
        }

        console.log("after external search:.....")

        //  User sessionUser = _userRespository.byID((Guid)session.userID);
        //var  userSession =  results.rows[0];

        var  userSession =  results;
        let userResults = await userModel.byID(userSession.user_id)
        
        //await GlobalModel.Find("user_id",userSession.user_id,"user_tbl");

        console.log("Find user details:.....")

        if(!userResults)
        {
            let erroObj = {
                msisdn : msisdn,
                menuContent: myVars.UNABLETOPROCESSREQUEST,
                requestType: myVars.CLEANUP,
                sessionId: sessionId,
                currentMenu: currentMenu
            }

            let errorMessage = `Unable to retrieve session user at Base route:  ${userSession.user_id} `;
            logger.error(errorMessage);
            return UtilityHelper.sendResponse(res, 200, errorMessage, erroObj)
        }

        let user = userResults;

        var activity = {};
        var nonCust = 0;

        /*

        //use this to handle customers and non customers flow
                    if(sessionUser.activated == 0)
                    {
                        nonCust = 1;
                    }
        */
                    if (userSession.hope == 0)
                    {
                        //search from base
                        console.log("?????????????????? coming to make the call:  ")
                        let ActDetResult = await ActivityModel.mainDisplayNumberDetails(userInput,nonCust);

                        if(!ActDetResult)
                        {
                            let erroObj = {
                                msisdn : msisdn,
                                menuContent: myVars.UNABLETOPROCESSREQUEST,
                                requestType: myVars.CLEANUP,
                                sessionId: sessionId,
                                currentMenu: currentMenu
                            }
                
                            let errorMessage = `Unable to retrieve activity details at Base route:  ${userInput} `;
                            logger.error(errorMessage);
                            return UtilityHelper.sendResponse(res, 200, errorMessage, erroObj)
                        }

                        activity = ActDetResult;

                        userSession.root_activity_id = activity.activity_id;

                    }else{
                        //
                        if(!userSession.skip_to_id)
                        {
                            console.log("Begin activity search:.....")
                            //there is no skip to, maintain the normal flow
                            // var prevActivity = _activityRepository.byID((Guid)session.lastActivityID);
                            let prevActityResult = await ActivityModel.byID(userSession.last_activity_id);
                           let prevActivity = prevActityResult;

                           console.log("Search for last axctivity:.....")

                           if(prevActivity.activity_type == ActivityType.STATIC)
                           {
                            //static activity type
                            let activityResult = await ActivityModel.byBaseIDanddisplayNumber(prevActivity.activity_id,userInput)

                            if(!activityResult)
                            {
                                let erroObj = {
                                    msisdn : msisdn,
                                    menuContent: myVars.UNABLETOPROCESSREQUEST,
                                    requestType: myVars.CLEANUP,
                                    sessionId: sessionId,
                                    currentMenu: currentMenu
                                }
                    
                                let errorMessage = `Invalid input at base route route:  ${userInput} `;
                                logger.error(errorMessage);
                                return UtilityHelper.sendResponse(res, 200, errorMessage, erroObj) 
                            }

                            activity = activityResult;


                           }else{
                            //dynamic activity type
                            console.log("in dynamic activity")

                             let activityResult = await ActivityModel.byBaseD(userSession.last_activity_id);
                             
                             //await GlobalModel.Find("base_id",userSession.last_activity_id,"activity")
                             if(!activityResult)
                             {
                                 let erroObj = {
                                     msisdn : msisdn,
                                     menuContent: myVars.UNABLETOPROCESSREQUEST,
                                     requestType: myVars.CLEANUP,
                                     sessionId: sessionId,
                                     currentMenu: currentMenu
                                 }
                     
                                 let errorMessage = `Invalid session last activity ID base id at route:  ${userSession.last_activity_id} `;
                                 logger.error(errorMessage);
                                 return UtilityHelper.sendResponse(res, 200, errorMessage, erroObj) 
                             }

                             console.log(activityResult)
                             activity = activityResult[0];
                           }


                        }else{
                            //there is a skip to flow, use skip to activity
                            console.log("Skip to here.......")

                            let activityResult = await ActivityModel.byID(userSession.skip_to_id);

                            if(!activityResult)
                            {
                                let erroObj = {
                                    msisdn : msisdn,
                                    menuContent: myVars.UNABLETOPROCESSREQUEST,
                                    requestType: myVars.CLEANUP,
                                    sessionId: sessionId,
                                    currentMenu: currentMenu
                                }
                    
                                let errorMessage = `Invalidskip_to_id  at base route:  ${userSession.skip_to_id} `;
                                logger.error(errorMessage);
                                return UtilityHelper.sendResponse(res, 200, errorMessage, erroObj) 
                            }


                            activity = activityResult;

                        }



                    }

                    /*

                    InternalRoutObj intReqObj = new InternalRoutObj
                    {
                        req = data,
                        session = session,
                        activity = activity
                    };
                    */

                    let intReqObj = {
                        req : req.body,
                        session: userSession,
                        activity: activity

                    };
                  

                    let resp = await postInternalRequest(intReqObj)
                    return UtilityHelper.sendResponse(res, 200, "Success", resp)
    }else if (requestType == myVars.CLEANUP) {
        let erroObj = {
            msisdn : msisdn,
            menuContent: myVars.REQUESTDONE,
            requestType: myVars.CLEANUP,
            sessionId: sessionId,
            currentMenu: currentMenu
        }

        let errorMessage = `Request done `;
        logger.error(errorMessage);
        return UtilityHelper.sendResponse(res, 200, errorMessage, erroObj) 

    }else{
        let erroObj = {
            msisdn : msisdn,
            menuContent: myVars.INVALID,
            requestType: myVars.CLEANUP,
            sessionId: sessionId,
            currentMenu: currentMenu
        }

        let errorMessage = `Invalid request `;
        logger.error(errorMessage);
        return UtilityHelper.sendResponse(res, 200, errorMessage, erroObj) 
    }

})