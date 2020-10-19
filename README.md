# JMKRIDE Ambassador Site Backend

The backend service for our ambassador site.

Big ups to @makinhs for https://www.toptal.com/nodejs/secure-rest-api-in-nodejs

TODO:
 * Secure secret
 * Verify no request body poisoning
 * Users:
    * Referral Code 
      * Code uses
    * References to...
      * Challenge completions
      * Ambassadors Balance
 * Challenge:
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
  
