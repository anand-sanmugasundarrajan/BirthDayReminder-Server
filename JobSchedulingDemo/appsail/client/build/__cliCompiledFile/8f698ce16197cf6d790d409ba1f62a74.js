import { _LC } from "@slyte/component";
class Sanitizer {
    constructor(config){
        this._sanitzer = _LC.Security.createSanitizer(config);
    }
    clean(config){
        config.instance = this._sanitzer;
        return _LC.Security.sanitizeHTML(config);
    }
}

export {Sanitizer}