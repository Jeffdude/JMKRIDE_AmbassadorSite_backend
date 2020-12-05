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
  award: 1,
  //creator: userConstants.getAdminId(),
  structure: [
    {
      title: "Full Name",
      fieldType: "TEXT_SHORT",
    },
    {
      title: "Email",
      fieldType: "TEXT_SHORT",
    },
    {
      title: "Do you own JMKRIDE skates?",
      fieldType: "YES_NO",
    }
  ],
}
