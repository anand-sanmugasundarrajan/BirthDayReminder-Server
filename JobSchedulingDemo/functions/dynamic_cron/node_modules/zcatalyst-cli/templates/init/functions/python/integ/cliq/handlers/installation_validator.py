from zcatalyst_cliq.installation_validator import (
    validate_installation,
    InstallationRequest,
    InstallationResponse
)


@validate_installation
def validate_installation(req: InstallationRequest, res: InstallationResponse, *args):
    if req.user.first_name == '**INVALID_USER**' and req.app_info.type == 'upgrade':
        res.status = 400
        res.title = 'Update not allowed !'
        res.message = 'Sorry. Update not allowed for the current app. Please contact admin.'
    else:
        res.status = 200
    return res
