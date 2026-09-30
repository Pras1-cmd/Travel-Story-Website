const Feedback = require('../models/Feedback');

// @desc    Submit contact/feedback form
// @route   POST /api/contact
// @access  Public
exports.submitFeedback = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const feedback = await Feedback.create({
      name,
      email,
      subject,
      message,
      user: req.user ? req.user.id : null
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. We will get back to you soon!',
      data: { feedback }
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting feedback'
    });
  }
};
