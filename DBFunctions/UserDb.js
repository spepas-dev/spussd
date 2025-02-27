
require('dotenv').config({ path: './.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logger } = require("../logs/winston");
const { ProcessStatus } = require("../helper/vars");
const UtilityHelper = require("../helper/utilfunc");

let ussd = {};



ussd.add = async (user) => {
    try {
        const newContinent = await prisma.user_tbl.create({
            data: user
          });
          
        return newContinent;
    } catch (error) {
        console.error("Error saving user details:", error);
        if (typeof logger !== 'undefined') {
            logger.error(error);
        }
        throw error;
    } finally {
        await prisma.$disconnect();
    }
};




ussd.update = async (user) => {
    try {
        
        const updatedContinent = await prisma.session.update({
            where:{
                user_id: user.user_id
            },
            data: user
          });
          
        return updatedContinent;
    } catch (error) {
        console.error("Error updating user details:", error);
        if (typeof logger !== 'undefined') {
            logger.error(error);
        }
        throw error;
    } finally {
        await prisma.$disconnect();
    }
};





ussd.byMsisdn = async (msisdn) => {
    try {
        const user = await prisma.user_tbl.findFirst({
            where: {
                msisdn: msisdn,
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



  ussd.byID = async (id) => {
    try {
        const user = await prisma.user_tbl.findFirst({
            where: {
                user_id: id
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






  ussd.validatePin = async (userID,pin) => {
    try {
        const user = await prisma.user_tbl.findFirst({
            where: {
                user_id: userID,
                pincode: pin
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