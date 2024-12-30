const express = require("express");
const { assignColisToGoodDelivery, getAllColisWithGoodDeliveryApi, getColisGoodDeliveryCtrl, deleteAllGoodDeliveryColis } = require("../Controllers/goodDeliveryController");
const router = express.Router();


//api/goodDelivery /assign-colis
router.route("/assign-colis")
        .post(assignColisToGoodDelivery)

router.route('/Colis').get(getAllColisWithGoodDeliveryApi)
router.route('/GD-Colis').get(getColisGoodDeliveryCtrl)
router.route('/getColisGD').get(getColisGoodDeliveryCtrl)
router.route('/delete').delete(deleteAllGoodDeliveryColis)
/* router.route('/send')
        .get(colisController.getColisAmeexCtrl)
        .put(syncColisStatusWithAmeex) */

module.exports= router;