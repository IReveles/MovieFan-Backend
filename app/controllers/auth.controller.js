// controllers/auth.controller.js
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const db = require("../models");
const User = db.User;

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        email,
        name,
        profilePicture: picture,
        googleId,
      });
    } else {
      // Update fields if necessary
      user.profilePicture = picture;
      user.googleId = googleId; // 👈 update Google ID if not stored yet
      await user.save();
    }

    const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        googleId: user.googleId, // optional to send to frontend
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid Google token' });
  }
};
