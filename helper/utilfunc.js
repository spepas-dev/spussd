const { logger } = require("../logs/winston");
const otpGenerator = require('otp-generator');
const {RESPONSE_CODES } = require("../helper/vars");
const {createHash} = require('crypto');
const crypto = require('crypto');
const ldap = require('ldapjs');
const {myVars,ProcessStatus } = require("../helper/vars");
const axios = require('axios');
const https = require('https');
const ActivityModel = require("../DBFunctions/ActivityDb");

let ussd = {};


function groupByBrand(biddings) {
  const grouped = {};
  
  biddings.forEach(bidding => {
      const brandName = bidding.orderRequest?.sparePart?.carModel?.carBrand?.name;
      
      if (brandName) {
          if (!grouped[brandName]) {
              grouped[brandName] = [];
          }
          grouped[brandName].push(bidding);
      }
  });
  
  return grouped;
}


ussd.groupByBrandAsArray = (biddings) =>{
  const grouped = groupByBrand(biddings);
  
  return Object.keys(grouped).map(brandName => ({
      brandName: brandName,
      count: grouped[brandName].length,
      items: grouped[brandName]
  }));
}



ussd.filterByCarBrand = (biddings, carBrandName)=>{
  return biddings.filter(bidding => {
      const modelName = bidding.orderRequest?.sparePart?.carModel?.carBrand?.name;
      return modelName && modelName.toLowerCase() === carBrandName.toLowerCase();
  });
}



ussd.filterByPartName = (biddings, carPartName)=>{
  return biddings.filter(bidding => {
      const modelName = bidding.orderRequest?.sparePart?.name;
      return modelName && modelName.toLowerCase() === carPartName.toLowerCase();
  });
}



ussd.groupByPartAsArray = (biddings) =>{
  const grouped = groupByPart(biddings);
  
  return Object.keys(grouped).map(brandName => ({
      brandName: brandName,
      count: grouped[brandName].length,
      items: grouped[brandName]
  }));
}


function groupByPart(biddings) {
  const grouped = {};
  
  biddings.forEach(bidding => {
      const brandName = bidding.orderRequest?.sparePart?.name;
      
      if (brandName) {
          if (!grouped[brandName]) {
              grouped[brandName] = [];
          }
          grouped[brandName].push(bidding);
      }
  });
  
  return grouped;
}



ussd.getAllItemsFromInvoice = (invoices) =>{
  return invoices.flatMap(invoice => invoice.items || []);
}




ussd.isValidDate = (dateString) =>{
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return !isNaN(date) && date.toISOString().slice(0, 10) === dateString;
}

ussd.getPaginatedList = (list, page, pageSize = 4) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return list.slice(from, to + 1);
};

ussd.getTotalPages = (list, pageSize = 4) => {
  return Math.ceil(list.length / pageSize);
};




ussd.isDecimal = (value) => {
  const num = Number(value);
  return !isNaN(num) && isFinite(num) && num > 0;
};

    ussd.sha256Encrypt = (textPhrase) => {

      //console.log("raw text here: "+ textPhrase)
        const hash = createHash('sha256');
        for (let i = 0; i < textPhrase.length; i++) {
          const rawText = textPhrase[i].trim(); // remove leading/trailing whitespace
          if (rawText === '') continue; // skip empty lines
          hash.write(rawText); // write a single line to the buffer
        }
      
        return hash.digest('base64'); 
     };



     ussd.generateOTP = (length) => {
      const OTP = otpGenerator.generate(length);
      console.log('otp here: ' + OTP);



      if(length == 4)
      {
         return '1234'
      }else{
         return '123456'
      }

     // return OTP;
    };





     ussd.formatPhone = (phone) => {

      console.log("++++++++= phone: "+ phone)
      if(phone.startsWith('0') && phone.length == 10)
      {
        phone = phone.substring(1);
        phone =  "233" + phone;
      }else if(!phone.startsWith('0') && phone.length == 9)
      {
         phone = phone.substring(2);
         phone =  "233" + phone;
      }else if(phone.startsWith('+233'))
      {
         phone = phone.substring(1);
      }else  if(phone.startsWith('2330') && phone.length == 13)
      {
        phone = phone.substring(4);
        phone =  "233" + phone;
      }else  if(phone.startsWith('00233') && phone.length == 14)
      {
        phone = phone.substring(5);
        phone =  "233" + phone;
      }else  if(phone.startsWith('0233') && phone.length == 13)
      {
        phone = phone.substring(4);
        phone =  "233" + phone;
      }else if(phone.startsWith('+'))
      {
         phone = phone.substring(1);
      }
     
      phone = phone.replace(/ /g, '');
        return phone; 
     };





    ussd.formateUser = (userReg) => {

      delete userReg["id"];
      delete userReg["user_id"];
      delete userReg["password"];
      delete userReg["cloudinary_data"];
       
        return userReg; 
     };


     ussd.authenticate  = async (username, password) =>{
      

      /*
      return new Promise((resolve, reject) => {
        // LDAP server details
        const domain = process.env.LDAPDOMAIN;
        const ldapUrl = process.env.LDAPURL;

        // Create the LDAP client
        const client = ldap.createClient({
            url: ldapUrl,
            timeout: 5000,           // 5 seconds timeout for operations
            connectTimeout: 10000    // 10 seconds timeout for connecting
        });

        // Handle client connection errors and timeouts
        client.on('error', (err) => {
            console.error('LDAP client error:', err.message);
            reject('Failed to connect to LDAP server');
        });

        client.on('timeout', () => {
            console.error('LDAP client connection timed out');
            reject('LDAP server connection timed out');
        });

        // Construct the DN (Distinguished Name) for the user
        const domainAndUsername = `${domain}\\${username}`;
        
        // Perform a simple bind (authentication)
        client.bind(domainAndUsername, password, (err) => {
            if (err) {
                console.error('LDAP bind failed:', err.message);
                client.unbind(() => reject('Authentication failed')); // Ensure client unbinds on failure
                return;
            }

            // If bind is successful, search for the user
            const searchOptions = {
                filter: `(SAMAccountName=${username})`,
                scope: 'sub'
            };
            
            client.search('CN=Users,DC=championgh,DC=com', searchOptions, (searchErr, searchRes) => {
                if (searchErr) {
                    console.error('LDAP search failed:', searchErr.message);
                    client.unbind(() => reject('Search failed')); // Ensure client unbinds on failure
                    return;
                }

                searchRes.on('searchEntry', (entry) => {
                    if (entry) {
                        // If user found
                        console.log('User found:', entry.object);
                        client.unbind(() => resolve(true)); // Resolve with true if user is found
                    } else {
                        // If user not found
                        client.unbind(() => resolve(false)); // Resolve with false if user is not found
                    }
                });

                searchRes.on('error', (err) => {
                    console.error('Search error:', err.message);
                    client.unbind(() => reject('Search error')); // Ensure client unbinds on failure
                });

                searchRes.on('end', () => {
                    console.log('Search completed');
                });
            });
        });
    });
*/






      return new Promise((resolve, reject) => {
        // Create the LDAP client with a timeout configuration
        const client = ldap.createClient({
            url: process.env.LDAPURL, // Your LDAP server URL
            timeout: 5000,                // 5 seconds timeout for operations
            connectTimeout: 10000         // 10 seconds timeout for connecting
        });

        // Handle client connection errors and timeouts
        client.on('error', (err) => {
            console.error('LDAP client error:', err.message);
            reject('Failed to connect to LDAP server');
        });

        client.on('timeout', () => {
            console.error('LDAP client connection timed out');
            reject('LDAP server connection timed out');
        });

        // Define the DN (Distinguished Name) for the user
        //const dn = `cn=${username},dc=${process.env.LDAPDOMAIN}`; // Adjust this format as per your LDAP structure

        console.log("client here")
        console.log(dn);
        const dn = `CN=${username},CN=Users,DC=${process.env.LDAPDOMAIN},DC=com`
        // Perform a simple bind (authentication)
        client.bind(dn, password, (err) => {
            if (err) {
                console.error('LDAP bind failed:', err.message);
                reject('Authentication failed');
            } else {
                console.log('LDAP bind successful');
                resolve('Authentication successful');
            }

            // Unbind the client after authentication to free up resources
            client.unbind((unbindErr) => {
                if (unbindErr) {
                    console.error('Failed to unbind client:', unbindErr.message);
                }
            });
        });
    });

  
  }






  ussd.AESEncrypt = (privateString, userkey) => {

    const GCM_IV_LENGTH = 12; // 96-bit IV
  const GCM_TAG_LENGTH = 16; // 128-bit authentication tag

  // Use your 16-byte key (AES-128)
  const key = Buffer.from('KPr42187Bar22999', 'utf-8'); // 16-byte key (128 bits)
  const iv = crypto.randomBytes(GCM_IV_LENGTH); // Generate IV
  
  const cipher = crypto.createCipheriv('aes-128-gcm', key, iv, { authTagLength: GCM_TAG_LENGTH });
  
  let encrypted = cipher.update(privateString, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  const tag = cipher.getAuthTag(); // Get the authentication tag
  
  // Combine IV, encrypted message, and authentication tag into one buffer
  const result = Buffer.concat([iv, encrypted, tag]);

  // Convert to Base64 for readability
  return result.toString('base64');
   };





   ussd.generateDisplayText = (activities, header) => {

    var displayText   =  header.replace('\\n', '\n')
    if(displayText != "")
    {
        displayText = displayText + "\n";
    }

    for (let i = 0; i < activities.length; i++) {
     let oneRow = activities[i];
     if(displayText != "")
     {
         displayText = displayText + "\n";
     }
     displayText = displayText + oneRow.display_number + ". " + oneRow.title;

 }

   return displayText;
 };



 ussd.formatInputDictionary = (sessionInput) => {

    if(!sessionInput)
    {
        sessionInput = {};
    }
    

   return sessionInput;
 };


//

ussd.GenerateStaticMenu = async (data) => {

  const { activityLog, resp }  = ussd.initialiaseRequest(data);
  let activities =  await ActivityModel.byBaseD(data.activity.activity_id);
  
  let displayText = ussd.generateDisplayText(activities, data.activity.description);


  resp.requestType = myVars.EXISTING;
  resp.menuContent = displayText;
  data.session.date_ended = new Date();
  activityLog.date_ended = new Date();
  activityLog.display_text = displayText;
  activityLog.is_value = 0;
  activityLog.input_value = "";
  activityLog.extra_data = "";

  return ({ activityLog: activityLog, resp: resp });
 }


 
   

 ussd.initialiaseRequest = (data) => {
    data.session.hope = data.session.hope + 1;

    let   activityLog = 
    {
        input : data.req.userInput,
        activity_id : data.activity.activity_id,
        msisdn : data.req.msisdn,
        session_id : data.session.session_id,
        external_session_id : data.req.sessionId,
        request_details : data.req,
        status  : ProcessStatus.PENDING,
        prev_activity_id : data.session.last_activity_id,
        user_id : data.session.user_id,
        is_value : 0
    };

    
    let resp =  
    {
        currentMenu : data.activity.title,
        msisdn : data.req.msisdn,
        sessionId : data.req.sessionId
    };

    data.session.last_activity_id = data.activity.activity_id;
    data.session.skip_to_id = null;


    return ({ activityLog: activityLog, resp: resp });

};


ussd.sendResponse = (res, code,message, data) => {
    data?.requestType == myVars.CLEANUP ? logger.error(message) : logger.info(message)
    res.status(code).json(data)
};


    



ussd.makeHttpRequest = async (method, url, data = null, headers = {}) => {
    try {
      const agent = new https.Agent({ rejectUnauthorized: false });
     // console.log("XXXXXXXXXXXXXX url:")
     // console.log(data);
      const options = {
        method: method.toUpperCase(),
        url,
        ...(method.toUpperCase() === 'POST' && { data }),
        headers: {
          ...headers, // Include any custom headers passed to the function
        },
        httpsAgent: agent,
      };
  
      const response = await axios(options);
     // console.log(response)
      return response.data;
    } catch (error) {
      console.error(`Error in ${method} request to ${url}:`, error.message);
      throw error; // Propagate error for further handling
    }
  };




module.exports = ussd
