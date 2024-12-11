//$Id$
package com.handlers;

import com.zc.cliq.enums.EXTENSION_TYPE;
import com.zc.cliq.enums.STATUS;
import com.zc.cliq.objects.InstallationResponse;
import com.zc.cliq.requests.InstallationRequest;

public class InstallationValidator implements com.zc.cliq.interfaces.InstallationValidator {
	@Override
	public InstallationResponse validateInstallation(InstallationRequest req) throws Exception {
		InstallationResponse resp = InstallationResponse.getInstance();
		if (req.getUser().getFirstName().equals("**INVALID_USER**") && req.getAppInfo().getType().equals(EXTENSION_TYPE.UPGRADE)) {
			resp.setStatus(STATUS.FAILURE);
			resp.setTitle("Update not allowed !");
			resp.setMessage("Sorry. Update not allowed for the current app. Please contact admin.");
		} else {
			resp.setStatus(STATUS.SUCCESS);
		}
		return resp;
	}
}
