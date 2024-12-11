//$Id$
package com.handlers;

import com.zc.cliq.enums.STATUS;
import com.zc.cliq.objects.InstallationResponse;
import com.zc.cliq.requests.InstallationRequest;

public class InstallationHandler implements com.zc.cliq.interfaces.InstallationHandler {
	@Override
	public InstallationResponse handleInstallation(InstallationRequest req) throws Exception {
		InstallationResponse resp = InstallationResponse.getInstance();
		/*
		 * // Logic for installation post handling {
		 * 
		 * }
		 */
		resp.setStatus(STATUS.SUCCESS);
		return resp;
	}
}
