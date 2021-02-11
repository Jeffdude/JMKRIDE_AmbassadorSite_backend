const constantModel = require('../constants/model.js');

exports.getAmbassadorApplication = () => {
  return constantModel.getByName('ambassadorApplication');
};

exports.ambassadorApplicationData = {
  title: "Ambassador Application",
  shortDescription: "Apply to become an Ambassador for JMKRIDE",
  longDescription: (
    "Welcome! This is the application form to become a brand ambassador for JMKRIDE. " +
    "Please fill out all the information below, then click submit. " +
    "Reach out to us at jmkride.com/contact-us or via our social media inbox if you " +
    "have any questions or concerns. Thank you for being an awesome member of our community!"
  ),
  award: 50,
  structure: [
    {
      title: "When did you start freeskating?",
      fieldType: "YEAR",
      required: true,
    },
    {
      title: "Do you own JMKRIDE skates?",
      fieldType: "YES_NO",
      required: true,
    },
    {
      title: "What is your current freeskate setup?",
      fieldType: "TEXT_SHORT",
      required: true,
    },
    {
      title: "Do you own a spare set of freeskates that you'd be willing to let people try riding?",
      fieldType: "TEXT_SHORT",
      required: true,
    },
    {
      title: "How often do you go out and freeskate?",
      fieldType: "TEXT_SHORT",
      required: true,
    },
    {
      title: "What do you like about freeskating?",
      fieldType: "TEXT_MEDIUM",
      required: true,
    },
    {
      title: "What do you like about JMKRIDE?",
      fieldType: "TEXT_MEDIUM",
      required: true,
    },
    {
      title: (
        "Do you get asked about your skates while you are out? " +
        "Do you take the time to explain and maybe demonstrate for curious bystanders?"
      ),
      fieldType: "TEXT_SHORT",
      required: true,
    },
    {
      title: "Do you engage with the online freeskate community? If so, how?",
      fieldType: "TEXT_SHORT",
      required: true,
    },
    {
      title: "Please list your social media accounts if any.",
      fieldType: "TEXT_SHORT",
      required: true,
    },
    {
      title: "Do you skate with others in your area? How often?",
      fieldType: "TEXT_SHORT",
      required: true,
    },
    {
      title: "What would you like to be your discount code?",
      fieldType: "TEXT_SHORT",
      required: true,
    },
  ],
}
