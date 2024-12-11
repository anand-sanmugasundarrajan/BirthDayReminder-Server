'use strict';
import Cliq from 'zcatalyst-integ-cliq';
const installationHandler = Cliq.installationHandler();

installationHandler.handleInstallation(async (req, res) => {
    /* 
    // Logic for installation post handling
    *{
    *
    *}
    */

   res.status = 200;
   return res;
});
