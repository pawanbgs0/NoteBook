const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter your name'],
            minLength: [4, 'Name must be more than 4 characters'],
            maxLength: [20, 'Name must be within 20 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please enter your email'],
            unique: true,
            validate: [validator.isEmail, 'Please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Please enter your password'],
            minLength: [8, 'Password must be atleast 8 characters'],
            select: false,
        },
        avatar: {
            public_id: {
                type: String,
                required: false,
            },
            url: {
                type: String,
                required: false,
            },
        },
        posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],

        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    { timestamps: true }
);


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};


userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;