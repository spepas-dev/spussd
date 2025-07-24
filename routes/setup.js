const express = require("express");
const router = express.Router();

//TEST CONTROLLER
const {
    TestController
 } = require("../controllers/test");
 



 const {
    AddActivityController
 } = require("../controllers/activityController");
 

 const {
   BaseRouter
} = require("../controllers/BaseControler");


 

const {
   RequestIndex,
   RequestSparePartCode,
   RequestQuantity,
   RequestComplete
} = require("../controllers/RequestPartController");



const {
   BiddingIndex,
   SelectedRequest,
   SelectedBid,
   ADD_BID_TO_CART
} = require("../controllers/BiddingController");






const {
   CartIndex,
   CartCheckoutIndex,
   CartAggregationMode,
   CartCheckoutComplete,
   CartRemoveItemIndex,
   CartRemoveItemSelected,
   COMPLETE_REMOVE_ITEM,
   CartProceedCheckout
} = require("../controllers/CartController");








 

//test routes link
router.route("/testapi").get(TestController);
router.route("/activity/add").post(AddActivityController);
router.route("/base/router").post(BaseRouter);



//request routes
router.route("/request/index").post(RequestIndex);
router.route("/request/spare-part-code").post(RequestSparePartCode);
router.route("/request/quantity").post(RequestQuantity);
router.route("/request/complete").post(RequestComplete);



//bidding
router.route("/bidding/index").post(BiddingIndex);
router.route("/bidding/selected-request").post(SelectedRequest);
router.route("/bidding/selected-bid").post(SelectedBid);
router.route("/bidding/add-bid-to-cart").post(ADD_BID_TO_CART);


//Cart
router.route("/cart/index").post(CartIndex);
router.route("/cart/checkout-index").post(CartCheckoutIndex);
router.route("/cart/checkout-proceed").post(CartProceedCheckout);
router.route("/cart/checkout-aggregation-mode").post(CartAggregationMode);
router.route("/cart/complete-checkout").post(CartCheckoutComplete);


router.route("/cart/remove-item-index").post(CartRemoveItemIndex);
router.route("/cart/selected-item-to-remove").post(CartRemoveItemSelected);
router.route("/cart/complete-reomove-item").post(COMPLETE_REMOVE_ITEM);



//

module.exports = router;