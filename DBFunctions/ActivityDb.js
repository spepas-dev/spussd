
require('dotenv').config({ path: './.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logger } = require("../logs/winston");
const { ProcessStatus } = require("../helper/vars");
const UtilityHelper = require("../helper/utilfunc");

let ussd = {};



ussd.add = async (activity) => {
    try {
        const newContinent = await prisma.activity.create({
            data: activity
          });
          
        return newContinent;
    } catch (error) {
        console.error("Error saving activity details:", error);
        if (typeof logger !== 'undefined') {
            logger.error(error);
        }
        throw error;
    } finally {
        await prisma.$disconnect();
    }
};





ussd.byBaseIDanddisplayNumber = async (baseID,displayNumber) => {
    try {
        const user = await prisma.activity.findFirst({
            where: {
                base_id: baseID,
                display_number: Number(displayNumber),
                status: 1
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



  ussd.mainDisplayNumberDetails = async (displayNumber,nonCustomer) => {
    try {
        console.log("XXXXXXXXXXXXXXXXX:   ")
        console.log(displayNumber)
        const user = await prisma.activity.findFirst({
            where: {
                display_number: Number(displayNumber),
                non_customer: nonCustomer,
                is_main: 1
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






ussd.byBaseD = async (baseID) => {
    try {
        const schools = await prisma.activity.findMany({
           
            where: {
                base_id: baseID,
                status: 1
            },
            orderBy: {
                display_number: 'asc', // Ensure your field is correct (createdAt or date_added)
            }
         
        });
  
            return schools;
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





  ussd.byID = async (id) => {
    try {
        const user = await prisma.activity.findFirst({
            where: {
                activity_id: id,
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






  ussd.main = async (custStatus) => {
    try {
        const schools = await prisma.activity.findMany({
           
            where: {
                is_main: 1,
                status: 1,
                non_customer: custStatus
            },
            orderBy: {
                display_number: 'asc', // Ensure your field is correct (createdAt or date_added)
            },
         
        });
  
            return schools;
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













