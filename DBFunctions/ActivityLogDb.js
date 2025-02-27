
require('dotenv').config({ path: './.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logger } = require("../logs/winston");
const { ProcessStatus } = require("../helper/vars");
const UtilityHelper = require("../helper/utilfunc");

let ussd = {};



ussd.add = async (activityLog) => {
    try {
        const newContinent = await prisma.activity_log.create({
            data: activityLog
          });
          
        return newContinent;
    } catch (error) {
        console.error("Error saving activity log details:", error);
        if (typeof logger !== 'undefined') {
            logger.error(error);
        }
        throw error;
    } finally {
        await prisma.$disconnect();
    }
};




ussd.update = async (activityLog) => {
    try {
        
        console.log(activityLog)
        const updatedContinent = await prisma.activity_log.update({
            where:{
                activity_log_id: activityLog.activity_log_id
            },
            data: activityLog
          });
          
        return updatedContinent;
    } catch (error) {
        console.error("Error updating activity log details:", error);
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
        const user = await prisma.activity_log.findFirst({
            where: {
                activity_log_id: id,
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



  ussd.recent = async (sessionID) => {
    try {
        const user = await prisma.activity_log.findFirst({
            where: {
                session_id: sessionID,
            },
            orderBy: {
                date_started: 'desc', // Ensures the most recent activity is retrieved
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