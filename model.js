const mongoose = require('mongoose');
let Schema = mongoose.Schema;

var userSchema = new Schema({
    userName: String,
    loc: {
        type: { type: String,
            default: "Point"
          },
        coordinates:{ 
           type: [Number]
        }
        }
});

userSchema.index({ loc: "2dsphere" });
let User = mongoose.model('User',userSchema);

module.exports=User;