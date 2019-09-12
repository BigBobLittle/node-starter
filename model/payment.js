const mongoose = require('mongoose');
       // Schema = mongoose.Schema;

const paymentSchema = new mongoose.Schema({
    user: {type:mongoose.Schema.Types.ObjectId, ref:'User'},
    TransactionId: String,
    ClientReference: String,
    Amount: String,
   
    status: {type:String, default:"UNAPPROVED",  enum:["UNAPPROVED", "APPROVED"]},
    
},{
    timestamps:true
});


module.exports = mongoose.model('Payment', paymentSchema);