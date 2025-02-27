
require('dotenv').config({ path: './.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logger } = require("../logs/winston");
const { ProcessStatus } = require("../helper/vars");
const UtilityHelper = require("../helper/utilfunc");

let ussd = {};







ussd.add = async (session) => {
    try {
        const newContinent = await prisma.session.create({
            data: session
          });
          
        return newContinent;
    } catch (error) {
        console.error("Error saving session details:", error);
        if (typeof logger !== 'undefined') {
            logger.error(error);
        }
        throw error;
    } finally {
        await prisma.$disconnect();
    }
};




ussd.update = async (session) => {
    try {
        
        console.log("XXXXXXXXXXXXXXXXX:: session update")
        console.log(session);
        const updatedContinent = await prisma.session.update({
            where:{
                session_id: session.session_id
            },
            data: session
          });
          
          console.log("XXXXXXXXXXXXXXXXX:: session update completed")
        return updatedContinent;
    } catch (error) {
        console.error("XXXXXXXXXXXXXXXXX:: Error updating session details:", error);
        if (typeof logger !== 'undefined') {
            logger.error(error);
        }
        throw error;
    } finally {
        await prisma.$disconnect();
    }
};





ussd.byID = async (id) => {
    try {
        const user = await prisma.session.findFirst({
            where: {
                session_id: id,
            },
          });
  
        return user;
    } catch (error) {
        console.error("Error retrieving record:", error);
        if (typeof logger !== 'undefined') {
            logger.error(error);
        }
        throw error;
    } finally {
        await prisma.$disconnect();
    }
  };





ussd.byExternalID = async (externalID,msisdn) => {
    try {
        const user = await prisma.session.findFirst({
            where: {
                external_session_id: externalID,
                msisdn: msisdn
            },
          });
  
        return user;
    } catch (error) {
        console.error("Error retrieving record:", error);
        if (typeof logger !== 'undefined') {
            logger.error(error);
        }
        throw error;
    } finally {
        await prisma.$disconnect();
    }
  };
  






module.exports = ussd