from zcatalyst_cliq.installation_handler import (
    handle_installation,
    InstallationRequest,
    InstallationResponse
)


@handle_installation
def installation_handler(req: InstallationRequest, res: InstallationResponse, *args):
    '''Logic for installation post handling'''
    res.status = 200
    return res
