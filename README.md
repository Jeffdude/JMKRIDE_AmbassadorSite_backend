# JMKRIDE Ambassador Site Backend

The backend service for our ambassador site.

Big ups to @makinhs for https://www.toptal.com/nodejs/secure-rest-api-in-nodejs

TODO:
 * Secure secret
 * Prevent spam (/ maybe authenticate frontend)
 * Users:
    * References to...
      * Referral Code 
      * Challenge completions
      * Ambassadors Balance
 * Referral Code
    * Code uses
 * Challenge:
    * Challenge requirements
      * url to video/photo
      * text description
    * Description {long, short}
    * Award
    * Submission form structure
    * References to...
      * Ambassador's completed
      * All submissions
 * Finance Entry
    * Time
    * Date
    * Amount - Value (Credits, USD)
      * Source - (JMK, Ambassadors Balance, Ambassadors Bank)
      * Dest - (Ambassadors Balance, Ambassadors Bank)
    * User <-(if challenge, self)
 * Ambassadors Balance
    * Current value
    * References to...
      * All historical financial entries (in/out)

