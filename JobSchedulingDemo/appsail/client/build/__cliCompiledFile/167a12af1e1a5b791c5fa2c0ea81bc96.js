import { _defineProperty } from "@slyte/core/src/lyte-utils";
var _ = {};

_defineProperty(_, {
    "LyteAddon": function() {
        return LyteAddon;
    },

    "LyteUiComponentComponentRegistry": function() {
        return LyteUiComponentComponentRegistry;
    },

    "lyteUiGetValue": function() {
        return lyteUiGetValue;
    },

    "lyteUiReturnValueBy": function() {
        return lyteUiReturnValueBy;
    },

    "lyteUiConcat": function() {
        return lyteUiConcat;
    },

    "lyteUiI18n": function() {
        return lyteUiI18n;
    },

    "lyteUiImageFile": function() {
        return lyteUiImageFile;
    },

    "lyteUiCapitalizeName": function() {
        return lyteUiCapitalizeName;
    },

    "lyteUiFileSize": function() {
        return lyteUiFileSize;
    },

    "lyteUiOptGroupCheck": function() {
        return lyteUiOptGroupCheck;
    },

    "lyteUiIsObject": function() {
        return lyteUiIsObject;
    },

    "lyteUiReturnOnlyKey": function() {
        return lyteUiReturnOnlyKey;
    },

    "lyteUiReturnOnlyValue": function() {
        return lyteUiReturnOnlyValue;
    }
});

import Turbo from "@slyte/component/src/directives/lyte-turbo";
import { LyteAddon }  from "/node_modules/@slyte/core/index.js";

import {LyteUiComponentComponentRegistry} from "/node_modules/@zoho/lyte-ui-component/components/component.js"
import { lyteUiGetValue, lyteUiReturnValueBy, lyteUiConcat, lyteUiI18n, lyteUiImageFile, lyteUiCapitalizeName, lyteUiFileSize, lyteUiOptGroupCheck, lyteUiIsObject, lyteUiReturnOnlyKey, lyteUiReturnOnlyValue } from "/node_modules/@zoho/lyte-ui-component/components/helpers/exportable-helpers.js";

import "/node_modules/@zoho/lyte-ui-component/components/helpers/helpers-dev.js";
import "/node_modules/@zoho/lyte-ui-component/components/helpers/utilityFn.js";
import "/node_modules/@zoho/lyte-ui-component/components/helpers/eventListeners.js";
import "/node_modules/@zoho/lyte-ui-component/components/helpers/tableNavigation.js";
import "/node_modules/@zoho/lyte-ui-component/components/helpers/lyte-copy2clip.js";



class LyteUiComponentAddon extends LyteAddon {
    lookups(){
        return [ {component : LyteUiComponentComponentRegistry} ];
    }

    static addHelpersToRegistry( registry ) {
        registry.registerHelper( 'lyteUiGetValue', lyteUiGetValue );
        registry.registerHelper( 'lyteUiReturnValueBy', lyteUiReturnValueBy );
        registry.registerHelper( 'lyteUiConcat', lyteUiConcat );
        registry.registerHelper( 'lyteUiI18n', lyteUiI18n );
        registry.registerHelper( 'lyteUiImageFile', lyteUiImageFile);
        registry.registerHelper( 'lyteUiCapitalizeName', lyteUiCapitalizeName);
        registry.registerHelper( 'lyteUiFileSize', lyteUiFileSize);
        registry.registerHelper( 'lyteUiOptGroupCheck', lyteUiOptGroupCheck);
        registry.registerHelper( 'lyteUiIsObject', lyteUiIsObject);
        registry.registerHelper( 'lyteUiReturnOnlyKey', lyteUiReturnOnlyKey);
        registry.registerHelper( 'lyteUiReturnOnlyValue', lyteUiReturnOnlyValue);
    }

    _() {
        _;
    }
}





LyteUiComponentAddon.singleTon = true;





export {LyteUiComponentAddon};

LyteUiComponentAddon.register({
    hash: "@zoho/lyte-ui-component_3"
});
