const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  submitted: {
    type: Boolean,
  },
  resetPasswordToken: {
    type: String,
},

resetPasswordExpires: {
    type: Date,
}
});

UserSchema.statics.findByCredentials = async (email, password) => {
  const findUser = await User.findOne({ email })
  if(!findUser) {
      throw new Error ("Unable to Login!")
  }
  const isMatch = await bcrypt.compare(password, findUser.password)

  if(!isMatch) {
      throw new Error("Unable to Login!")
  }
  return findUser

}

// return public profile whenever user info is returned ( hide password and token history)

UserSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar

  return userObject
}

//token generation and appending in model

UserSchema.methods.generateToken = async function () {
  const findUser = this
  const token = jwt.sign({ _id:findUser._id.toString() }, 'process.env.JWT_SECRET')
  
  findUser.tokens = findUser.tokens.concat({ token })
  // console.log("TOKEN ADDED:",findUser)
  await findUser.save()
  return token

}

//Password reset token generation
UserSchema.methods.generatePasswordReset =  function(){
  this.resetPasswordToken = jwt.sign({ _id:this._id.toString() }, 'process.env.JWT_SECRET')
  this.resetPasswordExpires = Date.now() + 3600000;
};



const User = mongoose.model('User', UserSchema);

module.exports = User;
