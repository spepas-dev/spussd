const express = require("express");
const router = express.Router();

//TEST CONTROLLER
const { TestController } = require("../controllers/test");

const { AddActivityController } = require("../controllers/activityController");

const {
  BaseRouter,
  SellerBaseRouter,
} = require("../controllers/BaseControler");

const {
  RequestIndex,
  RequestSparePartCode,
  RequestQuantity,
  RequestComplete,
} = require("../controllers/RequestPartController");

const {
  BiddingIndex,
  SelectedRequest,
  SelectedBid,
  ADD_BID_TO_CART,
} = require("../controllers/BiddingController");

const {
  CartIndex,
  CartCheckoutIndex,
  CartAggregationMode,
  CartCheckoutComplete,
  CartRemoveItemIndex,
  CartRemoveItemSelected,
  COMPLETE_REMOVE_ITEM,
  CartProceedCheckout,
} = require("../controllers/CartController");

//seller requests definitions

const {
  SELLER_REQUEST_INDEX,
  SELLER_REQUEST_ALL_INDEX,
  SELLER_SELECTED_BID,
  SELLER_UNIT_PRICE,
  SELLER_EXPECTED_DELIVERY_DATE,
  SELLER_REQUEST_BRAND_INDEX,
  SELLER_SELECTED_BRAND,
  SELLER_REQUEST_PART_INDEX,
} = require("../Seller/Controller/RequestController");

// Seller bid definition
const {
  SELLER_BID_INDEX,
  SELLER_SELECTED_ITEM,
  SELLER_SET_FOR_PICKUP,
} = require("../Seller/Controller/SellerBidController");

//test routes link
router.route("/testapi").get(TestController);
router.route("/activity/add").post(AddActivityController);
router.route("/base/router").post(BaseRouter);
router.route("/base/seller").post(SellerBaseRouter);

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

//seller route definitions
router.route("/seller/request/index").post(SELLER_REQUEST_INDEX);
router.route("/seller/request/all-index").post(SELLER_REQUEST_ALL_INDEX);
router.route("/seller/request/all-selected-bid").post(SELLER_SELECTED_BID);
router.route("/seller/request/bid-unit-price").post(SELLER_UNIT_PRICE);
router
  .route("/seller/request/bid-delivery-date")
  .post(SELLER_EXPECTED_DELIVERY_DATE);
router.route("/seller/request/by-brand-index").post(SELLER_REQUEST_BRAND_INDEX);
router.route("/seller/request/select-brand").post(SELLER_SELECTED_BRAND);
router.route("/seller/request/by-part-index").post(SELLER_REQUEST_PART_INDEX);

//Seller bid difinition
router.route("/seller/bid/index").post(SELLER_BID_INDEX);
router.route("/seller/bid/selected-item").post(SELLER_SELECTED_ITEM);
router.route("/seller/bid/set-for-pickup").post(SELLER_SET_FOR_PICKUP);

module.exports = router;
