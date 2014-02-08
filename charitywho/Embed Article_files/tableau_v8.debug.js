//! tableau_v8.debug.js
//

(function() {


// (function() {

////////////////////////////////////////////////////////////////////////////////
// Utility methods (generated via Script.IsNull, etc.)
////////////////////////////////////////////////////////////////////////////////

var ss = {
  version: '0.7.4.0',

  isUndefined: function (o) {
    return (o === undefined);
  },

  isNull: function (o) {
    return (o === null);
  },

  isNullOrUndefined: function (o) {
    return (o === null) || (o === undefined);
  },

  isValue: function (o) {
    return (o !== null) && (o !== undefined);
  }
};


////////////////////////////////////////////////////////////////////////////////
// Type System Implementation
////////////////////////////////////////////////////////////////////////////////


var Type = Function;
var originalRegistrationFunctions = {
  registerNamespace: { isPrototype: false, func: Type.registerNamespace },
  registerInterface: { isPrototype: true, func: Type.prototype.registerInterface },
  registerClass: { isPrototype: true, func: Type.prototype.registerClass },
  registerEnum: { isPrototype: true, func: Type.prototype.registerEnum }
};

var tab = {};
var tabBootstrap = {};

Type.registerNamespace = function (name) {
  if (name === "tableauSoftware") {
    window.tableauSoftware = window.tableauSoftware || {};
  }
};

Type.prototype.registerInterface = function (name) {
};

Type.prototype.registerEnum = function (name, flags) {
  for (var field in this.prototype) {
    this[field] = this.prototype[field];
  }
};

Type.prototype.registerClass = function (name, baseType, interfaceType) {
  var that = this;
  this.prototype.constructor = this;
  this.__baseType = baseType || Object;
  if (baseType) {
    this.__basePrototypePending = true;
    this.__setupBase = function () {
      Type$setupBase(that);
    };
    this.initializeBase = function (instance, args) {
      Type$initializeBase(that, instance, args);
    };
    this.callBaseMethod = function (instance, name, args) {
      Type$callBaseMethod(that, instance, name, args);
    };
  }
};

function Type$setupBase(that) {
  if (that.__basePrototypePending) {
    var baseType = that.__baseType;
    if (baseType.__basePrototypePending) {
      baseType.__setupBase();
    }

    for (var memberName in baseType.prototype) {
      var memberValue = baseType.prototype[memberName];
      if (!that.prototype[memberName]) {
        that.prototype[memberName] = memberValue;
      }
    }

    delete that.__basePrototypePending;
    delete that.__setupBase;
  }
}

function Type$initializeBase(that, instance, args) {
  if (that.__basePrototypePending) {
    that.__setupBase();
  }

  if (!args) {
    that.__baseType.apply(instance);
  }
  else {
    that.__baseType.apply(instance, args);
  }
}

function Type$callBaseMethod(that, instance, name, args) {
  var baseMethod = that.__baseType.prototype[name];
  if (!args) {
    return baseMethod.apply(instance);
  }
  else {
    return baseMethod.apply(instance, args);
  }
}

// Restore the original functions on the Type (Function) object so that we
// don't pollute the global namespace.
function restoreTypeSystem() {
  for (var regFuncName in originalRegistrationFunctions) {
    if (!originalRegistrationFunctions.hasOwnProperty(regFuncName)) { continue; }

    var original = originalRegistrationFunctions[regFuncName];
    var typeOrPrototype = original.isPrototype ? Type.prototype : Type;
    if (original.func) {
      typeOrPrototype[regFuncName] = original.func;
    } else {
      delete typeOrPrototype[regFuncName];
    }
  }
}


////////////////////////////////////////////////////////////////////////////////
// Delegate
////////////////////////////////////////////////////////////////////////////////

ss.Delegate = function Delegate$() {
};

ss.Delegate.registerClass('Delegate');

ss.Delegate.empty = function() { };

ss.Delegate._contains = function Delegate$_contains(targets, object, method) {
  for (var i = 0; i < targets.length; i += 2) {
    if (targets[i] === object && targets[i + 1] === method) {
      return true;
    }
  }
  return false;
};

ss.Delegate._create = function Delegate$_create(targets) {
  var delegate = function() {
    if (targets.length == 2) {
      return targets[1].apply(targets[0], arguments);
    }
    else {
      var clone = targets.concat();
      for (var i = 0; i < clone.length; i += 2) {
        if (ss.Delegate._contains(targets, clone[i], clone[i + 1])) {
          clone[i + 1].apply(clone[i], arguments);
        }
      }
      return null;
    }
  };
  delegate._targets = targets;

  return delegate;
};

ss.Delegate.create = function Delegate$create(object, method) {
  if (!object) {
    return method;
  }
  return ss.Delegate._create([object, method]);
};

ss.Delegate.combine = function Delegate$combine(delegate1, delegate2) {
  if (!delegate1) {
    if (!delegate2._targets) {
      return ss.Delegate.create(null, delegate2);
    }
    return delegate2;
  }
  if (!delegate2) {
    if (!delegate1._targets) {
      return ss.Delegate.create(null, delegate1);
    }
    return delegate1;
  }

  var targets1 = delegate1._targets ? delegate1._targets : [null, delegate1];
  var targets2 = delegate2._targets ? delegate2._targets : [null, delegate2];

  return ss.Delegate._create(targets1.concat(targets2));
};

ss.Delegate.remove = function Delegate$remove(delegate1, delegate2) {
  if (!delegate1 || (delegate1 === delegate2)) {
    return null;
  }
  if (!delegate2) {
    return delegate1;
  }

  var targets = delegate1._targets;
  var object = null;
  var method;
  if (delegate2._targets) {
    object = delegate2._targets[0];
    method = delegate2._targets[1];
  }
  else {
    method = delegate2;
  }

  for (var i = 0; i < targets.length; i += 2) {
    if ((targets[i] === object) && (targets[i + 1] === method)) {
      if (targets.length == 2) {
        return null;
      }
      targets.splice(i, 2);
      return ss.Delegate._create(targets);
    }
  }

  return delegate1;
};


////////////////////////////////////////////////////////////////////////////////
// IEnumerator

ss.IEnumerator = function IEnumerator$() { };
ss.IEnumerator.prototype = {
  get_current: null,
  moveNext: null,
  reset: null
};

ss.IEnumerator.getEnumerator = function ss_IEnumerator$getEnumerator(enumerable) {
  if (enumerable) {
    return enumerable.getEnumerator ? enumerable.getEnumerator() : new ss.ArrayEnumerator(enumerable);
  }
  return null;
}

// ss.IEnumerator.registerInterface('IEnumerator');

////////////////////////////////////////////////////////////////////////////////
// IEnumerable

ss.IEnumerable = function IEnumerable$() { };
ss.IEnumerable.prototype = {
  getEnumerator: null
};
// ss.IEnumerable.registerInterface('IEnumerable');

////////////////////////////////////////////////////////////////////////////////
// ArrayEnumerator

ss.ArrayEnumerator = function ArrayEnumerator$(array) {
  this._array = array;
  this._index = -1;
  this.current = null;
}
ss.ArrayEnumerator.prototype = {
  moveNext: function ArrayEnumerator$moveNext() {
    this._index++;
    this.current = this._array[this._index];
    return (this._index < this._array.length);
  },
  reset: function ArrayEnumerator$reset() {
    this._index = -1;
    this.current = null;
  }
};

// ss.ArrayEnumerator.registerClass('ArrayEnumerator', null, ss.IEnumerator);

////////////////////////////////////////////////////////////////////////////////
// IDisposable

ss.IDisposable = function IDisposable$() { };
ss.IDisposable.prototype = {
  dispose: null
};
// ss.IDisposable.registerInterface('IDisposable');

////////////////////////////////////////////////////////////////////////////////
// StringBuilder

ss.StringBuilder = function StringBuilder$(s) {
  this._parts = !ss.isNullOrUndefined(s) ? [s] : [];
  this.isEmpty = this._parts.length == 0;
}
ss.StringBuilder.prototype = {
  append: function StringBuilder$append(s) {
    if (!ss.isNullOrUndefined(s)) {
      //this._parts.add(s);
      this._parts.push(s);
      this.isEmpty = false;
    }
    return this;
  },

  appendLine: function StringBuilder$appendLine(s) {
    this.append(s);
    this.append('\r\n');
    this.isEmpty = false;
    return this;
  },

  clear: function StringBuilder$clear() {
    this._parts = [];
    this.isEmpty = true;
  },

  toString: function StringBuilder$toString(s) {
    return this._parts.join(s || '');
  }
};

ss.StringBuilder.registerClass('StringBuilder');

////////////////////////////////////////////////////////////////////////////////
// EventArgs

ss.EventArgs = function EventArgs$() {
}
ss.EventArgs.registerClass('EventArgs');

ss.EventArgs.Empty = new ss.EventArgs();

////////////////////////////////////////////////////////////////////////////////
// CancelEventArgs

ss.CancelEventArgs = function CancelEventArgs$() {
    ss.CancelEventArgs.initializeBase(this);
    this.cancel = false;
}
ss.CancelEventArgs.registerClass('CancelEventArgs', ss.EventArgs);

////////////////////////////////////////////////////////////////////////////////
// Tuple

ss.Tuple = function (first, second, third) {
  this.first = first;
  this.second = second;
  if (arguments.length == 3) {
    this.third = third;
  }
}
ss.Tuple.registerClass('Tuple');


//})();

//! tabcoreslim.debug.js
//

// (function() {

Type.registerNamespace('tab');

////////////////////////////////////////////////////////////////////////////////
// tab.EscapingUtil

tab.EscapingUtil = function tab_EscapingUtil() {
}
tab.EscapingUtil.escapeHtml = function tab_EscapingUtil$escapeHtml(html) {
    var escaped = (html || '');
    escaped = escaped.replace(new RegExp('&', 'g'), '&amp;');
    escaped = escaped.replace(new RegExp('<', 'g'), '&lt;');
    escaped = escaped.replace(new RegExp('>', 'g'), '&gt;');
    escaped = escaped.replace(new RegExp('"', 'g'), '&quot;');
    escaped = escaped.replace(new RegExp("'", 'g'), '&#39;');
    escaped = escaped.replace(new RegExp('/', 'g'), '&#47;');
    return escaped;
}


////////////////////////////////////////////////////////////////////////////////
// tab.WindowHelper

tab.WindowHelper = function tab_WindowHelper(window) {
    this._window = window;
}
tab.WindowHelper.close = function tab_WindowHelper$close(window) {
    window.close();
}
tab.WindowHelper.getOpener = function tab_WindowHelper$getOpener(window) {
    return window.opener;
}
tab.WindowHelper.getLocation = function tab_WindowHelper$getLocation(window) {
    return window.location;
}
tab.WindowHelper.setLocationHref = function tab_WindowHelper$setLocationHref(window, href) {
    window.location.href = href;
}
tab.WindowHelper.locationReplace = function tab_WindowHelper$locationReplace(window, url) {
    window.location.replace(url);
}
tab.WindowHelper.clearLocationHash = function tab_WindowHelper$clearLocationHash(loc) {
    return loc.href.replaceAll(loc.hash, '');
}
tab.WindowHelper.open = function tab_WindowHelper$open(href, target) {
    window.open(href, target);
}
tab.WindowHelper.reload = function tab_WindowHelper$reload(w, foreGet) {
    w.location.reload(foreGet);
}
tab.WindowHelper.requestAnimationFrame = function tab_WindowHelper$requestAnimationFrame(action) {
    return tab.WindowHelper._requestAnimationFrameFunc(action);
}
tab.WindowHelper.cancelAnimationFrame = function tab_WindowHelper$cancelAnimationFrame(animationId) {
    tab.WindowHelper._cancelAnimationFrameFunc(animationId);
}
tab.WindowHelper.reloadLocation = function tab_WindowHelper$reloadLocation() {
    window.location.replace(tab.WindowHelper.clearLocationHash(window.location));
}
tab.WindowHelper._setDefaultRequestAnimationFrameImpl = function tab_WindowHelper$_setDefaultRequestAnimationFrameImpl() {
    var lastTime = 0;
    tab.WindowHelper._requestAnimationFrameFunc = function(callback) {
        var curTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (curTime - lastTime));
        lastTime = curTime + timeToCall;
        var id = window.setTimeout(function() {
            callback();
        }, timeToCall);
        return id;
    };
}
tab.WindowHelper.prototype = {
    _window: null,
    
    get_pageXOffset: function tab_WindowHelper$get_pageXOffset() {
        return tab.WindowHelper._pageXOffsetFunc(this._window);
    },
    
    get_pageYOffset: function tab_WindowHelper$get_pageYOffset() {
        return tab.WindowHelper._pageYOffsetFunc(this._window);
    },
    
    get_innerWidth: function tab_WindowHelper$get_innerWidth() {
        return tab.WindowHelper._innerWidthFunc(this._window);
    },
    
    get_innerHeight: function tab_WindowHelper$get_innerHeight() {
        return tab.WindowHelper._innerHeightFunc(this._window);
    }
}


tab.EscapingUtil.registerClass('tab.EscapingUtil');
tab.WindowHelper.registerClass('tab.WindowHelper');
tab.WindowHelper._innerWidthFunc = null;
tab.WindowHelper._innerHeightFunc = null;
tab.WindowHelper._pageXOffsetFunc = null;
tab.WindowHelper._pageYOffsetFunc = null;
tab.WindowHelper._requestAnimationFrameFunc = null;
tab.WindowHelper._cancelAnimationFrameFunc = null;
(function () {
    if (('innerWidth' in window)) {
        tab.WindowHelper._innerWidthFunc = function(w) {
            return w.innerWidth;
        };
    }
    else {
        tab.WindowHelper._innerWidthFunc = function(w) {
            return w.document.documentElement.offsetWidth;
        };
    }
    if (('innerHeight' in window)) {
        tab.WindowHelper._innerHeightFunc = function(w) {
            return w.innerHeight;
        };
    }
    else {
        tab.WindowHelper._innerHeightFunc = function(w) {
            return w.document.documentElement.offsetHeight;
        };
    }
    if (ss.isValue(window.self.pageXOffset)) {
        tab.WindowHelper._pageXOffsetFunc = function(w) {
            return w.pageXOffset;
        };
    }
    else {
        tab.WindowHelper._pageXOffsetFunc = function(w) {
            return w.document.documentElement.scrollLeft;
        };
    }
    if (ss.isValue(window.self.pageYOffset)) {
        tab.WindowHelper._pageYOffsetFunc = function(w) {
            return w.pageYOffset;
        };
    }
    else {
        tab.WindowHelper._pageYOffsetFunc = function(w) {
            return w.document.documentElement.scrollTop;
        };
    }
    var vendors = [ 'ms', 'moz', 'webkit', 'o' ];
    var requestFuncName = null;
    var cancelFuncName = null;
    for (var ii = 0; ii < vendors.length && requestFuncName == null; ++ii) {
        var vendor = vendors[ii];
        var funcName = vendor + 'RequestAnimationFrame';
        if ((funcName in window)) {
            requestFuncName = funcName;
        }
        funcName = vendor + 'CancelAnimationFrame';
        if ((funcName in window)) {
            cancelFuncName = funcName;
        }
        funcName = vendor + 'CancelRequestAnimationFrame';
        if ((funcName in window)) {
            cancelFuncName = funcName;
        }
    }
    if (requestFuncName != null) {
        tab.WindowHelper._requestAnimationFrameFunc = function(callback) {
            return window[requestFuncName](callback);
        };
    }
    else {
        tab.WindowHelper._setDefaultRequestAnimationFrameImpl();
    }
    if (cancelFuncName != null) {
        tab.WindowHelper._cancelAnimationFrameFunc = function(animationId) {
            window[cancelFuncName](animationId);
        };
    }
    else {
        tab.WindowHelper._cancelAnimationFrameFunc = function(id) {
            window.clearTimeout(id);
        };
    }
})();

// }());



Type.registerNamespace('tab');

////////////////////////////////////////////////////////////////////////////////
// tab._SheetInfoImpl

tab.$create__SheetInfoImpl = function tab__SheetInfoImpl(name, sheetType, index, size, workbook, url, isActive, isHidden) {
    var $o = { };
    $o._name = name;
    $o._sheetType = sheetType;
    $o._index = index;
    $o._size = size;
    $o._workbook = workbook;
    $o._url = url;
    $o._isActive = isActive;
    $o._isHidden = isHidden;
    return $o;
}


////////////////////////////////////////////////////////////////////////////////
// tab._dashboardObjectFrameInfo

tab.$create__dashboardObjectFrameInfo = function tab__dashboardObjectFrameInfo(name, objectType, position, size) {
    var $o = { };
    $o._name = name;
    $o._objectType = objectType;
    $o._position = position;
    $o._size = size;
    return $o;
}


////////////////////////////////////////////////////////////////////////////////
// tab._ApiCommand

tab._ApiCommand = function tab__ApiCommand(name, sourceId, handlerId, parameters) {
    this._name = name;
    this._sourceId = sourceId;
    this._handlerId = handlerId;
    this._parameters = parameters;
}
tab._ApiCommand.parse = function tab__ApiCommand$parse(serialized) {
    var name;
    var index = serialized.indexOf(',');
    if (index < 0) {
        name = serialized;
        return new tab._ApiCommand(name, null, null, null);
    }
    name = serialized.substr(0, index);
    var sourceId;
    var secondPart = serialized.substr(index + 1);
    index = secondPart.indexOf(',');
    if (index < 0) {
        sourceId = secondPart;
        return new tab._ApiCommand(name, sourceId, null, null);
    }
    sourceId = secondPart.substr(0, index);
    var handlerId;
    var thirdPart = secondPart.substr(index + 1);
    index = thirdPart.indexOf(',');
    if (index < 0) {
        handlerId = thirdPart;
        return new tab._ApiCommand(name, sourceId, handlerId, null);
    }
    handlerId = thirdPart.substr(0, index);
    var parameters = thirdPart.substr(index + 1);
    tab._ApiCommand.lastResponseMessage = serialized;
    if (name === 'api.GetClientInfoCommand') {
        tab._ApiCommand.lastClientInfoResponseMessage = serialized;
    }
    return new tab._ApiCommand(name, sourceId, handlerId, parameters);
}
tab._ApiCommand.prototype = {
    _name: null,
    _handlerId: null,
    _sourceId: null,
    _parameters: null,
    
    get_name: function tab__ApiCommand$get_name() {
        return this._name;
    },
    
    get_handlerId: function tab__ApiCommand$get_handlerId() {
        return this._handlerId;
    },
    
    get_sourceId: function tab__ApiCommand$get_sourceId() {
        return this._sourceId;
    },
    
    get_parameters: function tab__ApiCommand$get_parameters() {
        return this._parameters;
    },
    
    get_isApiCommandName: function tab__ApiCommand$get_isApiCommandName() {
        return !this.get_rawName().indexOf('api.', 0);
    },
    
    get_rawName: function tab__ApiCommand$get_rawName() {
        return this._name;
    },
    
    serialize: function tab__ApiCommand$serialize() {
        var message = [];
        message.push(this._name);
        message.push(this._sourceId);
        message.push(this._handlerId);
        if (ss.isValue(this._parameters)) {
            message.push(this._parameters);
        }
        var serializedMessage = message.join(',');
        tab._ApiCommand.lastRequestMessage = serializedMessage;
        return serializedMessage;
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._apiServerResultParser

tab._apiServerResultParser = function tab__apiServerResultParser(serverResult) {
    var param = JSON.parse(serverResult);
    this._commandResult = param['api.commandResult'];
    this._commandData = param['api.commandData'];
}
tab._apiServerResultParser.prototype = {
    _commandResult: null,
    _commandData: null,
    
    get__result: function tab__apiServerResultParser$get__result() {
        return this._commandResult;
    },
    
    get__data: function tab__apiServerResultParser$get__data() {
        return this._commandData;
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._apiServerNotificationParser

tab._apiServerNotificationParser = function tab__apiServerNotificationParser(serverResult) {
    var param = JSON.parse(serverResult);
    this._workbookName = param['api.workbookName'];
    this._worksheetName = param['api.worksheetName'];
    this._data = param['api.commandData'];
}
tab._apiServerNotificationParser.prototype = {
    _workbookName: null,
    _worksheetName: null,
    _data: null,
    
    get__workbookName: function tab__apiServerNotificationParser$get__workbookName() {
        return this._workbookName;
    },
    
    get__worksheetName: function tab__apiServerNotificationParser$get__worksheetName() {
        return this._worksheetName;
    },
    
    get__data: function tab__apiServerNotificationParser$get__data() {
        return this._data;
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._CommandReturnHandler

tab._CommandReturnHandler = function tab__CommandReturnHandler(commandName, successCallbackTiming, successCallback, errorCallback) {
    this._commandName = commandName;
    this._successCallback = successCallback;
    this._successCallbackTiming = successCallbackTiming;
    this._errorCallback = errorCallback;
}
tab._CommandReturnHandler.prototype = {
    _commandName: null,
    _successCallbackTiming: 0,
    _successCallback: null,
    _errorCallback: null,
    
    get__commandName: function tab__CommandReturnHandler$get__commandName() {
        return this._commandName;
    },
    
    get__successCallback: function tab__CommandReturnHandler$get__successCallback() {
        return this._successCallback;
    },
    
    get__successCallbackTiming: function tab__CommandReturnHandler$get__successCallbackTiming() {
        return this._successCallbackTiming;
    },
    
    get__errorCallback: function tab__CommandReturnHandler$get__errorCallback() {
        return this._errorCallback;
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._CrossDomainMessageRouter

tab._CrossDomainMessageRouter = function tab__CrossDomainMessageRouter() {
}
tab._CrossDomainMessageRouter._initialize = function tab__CrossDomainMessageRouter$_initialize() {
    if (tab._Utility.hasWindowAddEventListener()) {
        window.addEventListener('message', tab._CrossDomainMessageRouter._getHandleCrossDomainMessageDelegate(), false);
    }
    else if (tab._Utility.hasDocumentAttachEvent()) {
        document.attachEvent('onmessage', tab._CrossDomainMessageRouter._getHandleCrossDomainMessageDelegate());
        window.attachEvent('onmessage', tab._CrossDomainMessageRouter._getHandleCrossDomainMessageDelegate());
    }
    else {
        window.onmessage = tab._CrossDomainMessageRouter._getHandleCrossDomainMessageDelegate();
    }
    tab._CrossDomainMessageRouter._nextHandlerId = tab._CrossDomainMessageRouter._nextCommandId = 0;
}
tab._CrossDomainMessageRouter._registerHandler = function tab__CrossDomainMessageRouter$_registerHandler(handler) {
    var uniqueId = 'handler' + tab._CrossDomainMessageRouter._nextHandlerId;
    if (ss.isValue(handler.get_handlerId()) || ss.isValue(tab._CrossDomainMessageRouter._handlers[handler.get_handlerId()])) {
        throw tab._tableauException._createInternalError("Handler '" + handler.get_handlerId() + "' is already registered.");
    }
    tab._CrossDomainMessageRouter._nextHandlerId++;
    handler.set_handlerId(uniqueId);
    tab._CrossDomainMessageRouter._handlers[uniqueId] = handler;
    handler.add_customViewsListLoad(tab._CrossDomainMessageRouter._handleCustomViewsListLoad);
    handler.add_stateReadyForQuery(tab._CrossDomainMessageRouter._handleStateReadyForQuery);
}
tab._CrossDomainMessageRouter._unregisterHandler = function tab__CrossDomainMessageRouter$_unregisterHandler(handler) {
    if (ss.isValue(handler.get_handlerId()) || ss.isValue(tab._CrossDomainMessageRouter._handlers[handler.get_handlerId()])) {
        delete tab._CrossDomainMessageRouter._handlers[handler.get_handlerId()];
        handler.remove_customViewsListLoad(tab._CrossDomainMessageRouter._handleCustomViewsListLoad);
        handler.remove_stateReadyForQuery(tab._CrossDomainMessageRouter._handleStateReadyForQuery);
    }
}
tab._CrossDomainMessageRouter._sendCommand = function tab__CrossDomainMessageRouter$_sendCommand(source, commandParameters, returnHandler) {
    var iframe = source.get_iframe();
    var handlerId = source.get_handlerId();
    if (!tab._Utility.hasWindowPostMessage() || ss.isNullOrUndefined(iframe) || ss.isNullOrUndefined(iframe.contentWindow)) {
        return;
    }
    var sourceId = 'cmd' + tab._CrossDomainMessageRouter._nextCommandId;
    tab._CrossDomainMessageRouter._nextCommandId++;
    var callbackMap = tab._CrossDomainMessageRouter._commandCallbacks[handlerId];
    if (ss.isNullOrUndefined(callbackMap)) {
        callbackMap = {};
        tab._CrossDomainMessageRouter._commandCallbacks[handlerId] = callbackMap;
    }
    callbackMap[sourceId] = returnHandler;
    var commandName = returnHandler.get__commandName();
    if (commandName === 'api.ShowCustomViewCommand') {
        var customViewCallbackMap = tab._CrossDomainMessageRouter._customViewLoadCallbacks[handlerId];
        if (ss.isNullOrUndefined(customViewCallbackMap)) {
            customViewCallbackMap = {};
            tab._CrossDomainMessageRouter._customViewLoadCallbacks[handlerId] = customViewCallbackMap;
        }
        customViewCallbackMap[sourceId] = returnHandler;
    }
    var serializedParams = null;
    if (ss.isValue(commandParameters)) {
        serializedParams = tab.JsonUtil.toJson(commandParameters, false, '');
    }
    var command = new tab._ApiCommand(commandName, sourceId, handlerId, serializedParams);
    var message = command.serialize();
    if (tab._Utility.isPostMessageSynchronous()) {
        window.setTimeout(function() {
            iframe.contentWindow.postMessage(message, source.get_serverRoot());
        }, 0);
    }
    else {
        iframe.contentWindow.postMessage(message, source.get_serverRoot());
    }
}
tab._CrossDomainMessageRouter._handleCustomViewsListLoad = function tab__CrossDomainMessageRouter$_handleCustomViewsListLoad(source) {
    var handlerId = source.get_handlerId();
    var customViewCallbackMap = tab._CrossDomainMessageRouter._customViewLoadCallbacks[handlerId];
    if (ss.isNullOrUndefined(customViewCallbackMap)) {
        return;
    }
    var $dict1 = customViewCallbackMap;
    for (var $key2 in $dict1) {
        var handlers = { key: $key2, value: $dict1[$key2] };
        var returnHandler = handlers.value;
        if (ss.isValue(returnHandler.get__successCallback())) {
            returnHandler.get__successCallback()(null);
        }
    }
    delete tab._CrossDomainMessageRouter._customViewLoadCallbacks[handlerId];
}
tab._CrossDomainMessageRouter._handleStateReadyForQuery = function tab__CrossDomainMessageRouter$_handleStateReadyForQuery(source) {
    var queue = tab._CrossDomainMessageRouter._commandReturnAfterStateReadyQueues[source.get_handlerId()];
    if (tab._Utility.isNullOrEmpty(queue)) {
        return;
    }
    while (queue.length > 0) {
        var successCallback = queue.pop();
        if (ss.isValue(successCallback)) {
            successCallback();
        }
    }
}
tab._CrossDomainMessageRouter._getHandleCrossDomainMessageDelegate = function tab__CrossDomainMessageRouter$_getHandleCrossDomainMessageDelegate() {
    return function(e) {
        tab._CrossDomainMessageRouter._handleCrossDomainMessage(e);
    };
}
tab._CrossDomainMessageRouter._handleCrossDomainMessage = function tab__CrossDomainMessageRouter$_handleCrossDomainMessage(e) {
    if (ss.isNullOrUndefined(e.data)) {
        return;
    }
    var command = tab._ApiCommand.parse(e.data);
    var rawName = command.get_rawName();
    var handlerId = command.get_handlerId();
    var handler = tab._CrossDomainMessageRouter._handlers[handlerId];
    if (ss.isNullOrUndefined(handler) || handler.get_handlerId() !== command.get_handlerId()) {
        handler = new tab._doNothingCrossDomainHandler();
    }
    if (command.get_isApiCommandName()) {
        if (command.get_sourceId() === 'xdomainSourceId') {
            handler.handleEventNotification(command.get_name(), command.get_parameters());
        }
        else {
            tab._CrossDomainMessageRouter._handleCrossDomainResponse(command);
        }
    }
    else {
        tab._CrossDomainMessageRouter._handleLegacyNotifications(rawName, e, handler);
    }
}
tab._CrossDomainMessageRouter._handleCrossDomainResponse = function tab__CrossDomainMessageRouter$_handleCrossDomainResponse(command) {
    var commandCallbackMap = tab._CrossDomainMessageRouter._commandCallbacks[command.get_handlerId()];
    var returnHandler = (ss.isValue(commandCallbackMap)) ? commandCallbackMap[command.get_sourceId()] : null;
    if (ss.isNullOrUndefined(returnHandler)) {
        return;
    }
    delete commandCallbackMap[command.get_sourceId()];
    if (command.get_name() !== returnHandler.get__commandName()) {
        return;
    }
    var crossDomainResult = new tab._apiServerResultParser(command.get_parameters());
    var commandResult = crossDomainResult.get__data();
    if (crossDomainResult.get__result() === 'api.success') {
        switch (returnHandler.get__successCallbackTiming()) {
            case 0:
                if (ss.isValue(returnHandler.get__successCallback())) {
                    returnHandler.get__successCallback()(commandResult);
                }
                break;
            case 1:
                var postponedCallback = function() {
                    if (ss.isValue(returnHandler.get__successCallback())) {
                        returnHandler.get__successCallback()(commandResult);
                    }
                };
                var queue = tab._CrossDomainMessageRouter._commandReturnAfterStateReadyQueues[command.get_handlerId()];
                if (ss.isNullOrUndefined(queue)) {
                    queue = [];
                    tab._CrossDomainMessageRouter._commandReturnAfterStateReadyQueues[command.get_handlerId()] = queue;
                }
                queue.push(postponedCallback);
                break;
            default:
                throw tab._tableauException._createInternalError('Unknown timing value: ' + returnHandler.get__successCallbackTiming());
        }
    }
    else if (ss.isValue(returnHandler.get__errorCallback())) {
        var remoteError = crossDomainResult.get__result() === 'api.remotefailed';
        returnHandler.get__errorCallback()(remoteError, commandResult);
    }
}
tab._CrossDomainMessageRouter._handleLegacyNotifications = function tab__CrossDomainMessageRouter$_handleLegacyNotifications(messageName, e, handler) {
    if (messageName === 'tableau.loadIndicatorsLoaded') {
        var $dict1 = tab._CrossDomainMessageRouter._handlers;
        for (var $key2 in $dict1) {
            var pair = { key: $key2, value: $dict1[$key2] };
            if (tab._Utility.hasOwnProperty(tab._CrossDomainMessageRouter._handlers, pair.key) && pair.value.get_iframe().contentWindow === e.source) {
                pair.value.hideLoadIndicators();
                break;
            }
        }
    }
    else if (messageName === 'layoutInfoReq') {
        tab._CrossDomainMessageRouter._postLayoutInfo(e.source);
    }
    else if (messageName === 'tableau.completed' || messageName === 'completed' || messageName === 'layoutInfoReq') {
        handler.handleVizLoad();
    }
}
tab._CrossDomainMessageRouter._postLayoutInfo = function tab__CrossDomainMessageRouter$_postLayoutInfo(source) {
    if (!tab._Utility.hasWindowPostMessage()) {
        return;
    }
    var win = new tab.WindowHelper(window.self);
    var width = (ss.isValue(win.get_innerWidth())) ? win.get_innerWidth() : document.documentElement.offsetWidth;
    var height = (ss.isValue(win.get_innerHeight())) ? win.get_innerHeight() : document.documentElement.offsetHeight;
    var left = (ss.isValue(win.get_pageXOffset())) ? win.get_pageXOffset() : document.documentElement.scrollLeft;
    var top = (ss.isValue(win.get_pageYOffset())) ? win.get_pageYOffset() : document.documentElement.scrollTop;
    var msgArr = [];
    msgArr.push('layoutInfoResp');
    msgArr.push(left);
    msgArr.push(top);
    msgArr.push(width);
    msgArr.push(height);
    source.postMessage(msgArr.join(','), '*');
}


////////////////////////////////////////////////////////////////////////////////
// tab._doNothingCrossDomainHandler

tab._doNothingCrossDomainHandler = function tab__doNothingCrossDomainHandler() {
}
tab._doNothingCrossDomainHandler.prototype = {
    _handlerId: null,
    
    add_customViewsListLoad: function tab__doNothingCrossDomainHandler$add_customViewsListLoad(value) {
        this.__customViewsListLoad = ss.Delegate.combine(this.__customViewsListLoad, value);
    },
    remove_customViewsListLoad: function tab__doNothingCrossDomainHandler$remove_customViewsListLoad(value) {
        this.__customViewsListLoad = ss.Delegate.remove(this.__customViewsListLoad, value);
    },
    
    __customViewsListLoad: null,
    
    add_stateReadyForQuery: function tab__doNothingCrossDomainHandler$add_stateReadyForQuery(value) {
        this.__stateReadyForQuery = ss.Delegate.combine(this.__stateReadyForQuery, value);
    },
    remove_stateReadyForQuery: function tab__doNothingCrossDomainHandler$remove_stateReadyForQuery(value) {
        this.__stateReadyForQuery = ss.Delegate.remove(this.__stateReadyForQuery, value);
    },
    
    __stateReadyForQuery: null,
    
    get_iframe: function tab__doNothingCrossDomainHandler$get_iframe() {
        return null;
    },
    
    get_handlerId: function tab__doNothingCrossDomainHandler$get_handlerId() {
        return this._handlerId;
    },
    set_handlerId: function tab__doNothingCrossDomainHandler$set_handlerId(value) {
        this._handlerId = value;
        return value;
    },
    
    get_serverRoot: function tab__doNothingCrossDomainHandler$get_serverRoot() {
        return '*';
    },
    
    hideLoadIndicators: function tab__doNothingCrossDomainHandler$hideLoadIndicators() {
    },
    
    handleVizLoad: function tab__doNothingCrossDomainHandler$handleVizLoad() {
    },
    
    handleEventNotification: function tab__doNothingCrossDomainHandler$handleEventNotification(eventName, parameters) {
    },
    
    _silenceTheCompilerWarning: function tab__doNothingCrossDomainHandler$_silenceTheCompilerWarning() {
        this.__customViewsListLoad(null);
        this.__stateReadyForQuery(null);
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._enums

tab._enums = function tab__enums() {
}
tab._enums._normalizePeriodType = function tab__enums$_normalizePeriodType(rawValue, paramName) {
    var rawString = (ss.isValue(rawValue)) ? rawValue : '';
    return tab._enums._normalizeEnum(rawString, paramName, tableauSoftware.PeriodType, true);
}
tab._enums._normalizeDateRangeType = function tab__enums$_normalizeDateRangeType(rawValue, paramName) {
    var rawString = (ss.isValue(rawValue)) ? rawValue : '';
    return tab._enums._normalizeEnum(rawString, paramName, tableauSoftware.DateRangeType, true);
}
tab._enums._normalizeFilterUpdateType = function tab__enums$_normalizeFilterUpdateType(rawValue, paramName) {
    var rawString = (ss.isValue(rawValue)) ? rawValue : '';
    return tab._enums._normalizeEnum(rawString, paramName, tableauSoftware.FilterUpdateType, true);
}
tab._enums._normalizeSelectionUpdateType = function tab__enums$_normalizeSelectionUpdateType(rawValue, paramName) {
    var rawString = (ss.isValue(rawValue)) ? rawValue : '';
    return tab._enums._normalizeEnum(rawString, paramName, tableauSoftware.SelectionUpdateType, true);
}
tab._enums._isSelectionUpdateType = function tab__enums$_isSelectionUpdateType(rawValue) {
    var rawString = (ss.isValue(rawValue)) ? rawValue.toString() : '';
    return tab._enums._normalizeEnum(rawString, '', tableauSoftware.SelectionUpdateType, false) != null;
}
tab._enums._normalizeNullOption = function tab__enums$_normalizeNullOption(rawValue, paramName) {
    var rawString = (ss.isValue(rawValue)) ? rawValue : '';
    return tab._enums._normalizeEnum(rawString, paramName, tableauSoftware.NullOption, true);
}
tab._enums._normalizeSheetSizeBehavior = function tab__enums$_normalizeSheetSizeBehavior(rawValue, paramName) {
    var rawString = (ss.isValue(rawValue)) ? rawValue : '';
    return tab._enums._normalizeEnum(rawString, paramName, tableauSoftware.SheetSizeBehavior, true);
}
tab._enums._normalizeTableauEventName = function tab__enums$_normalizeTableauEventName(rawValue) {
    var rawString = (ss.isValue(rawValue)) ? rawValue : '';
    return tab._enums._normalizeEnum(rawString, '', tableauSoftware.TableauEventName, false);
}
tab._enums._normalizeEnum = function tab__enums$_normalizeEnum(rawValue, paramName, enumObject, throwOnInvalid) {
    if (ss.isValue(rawValue)) {
        var lookup = rawValue.toString().toUpperCase();
        var $dict1 = enumObject;
        for (var $key2 in $dict1) {
            var entry = { key: $key2, value: $dict1[$key2] };
            var compareValue = entry.value.toString().toUpperCase();
            if (lookup === compareValue) {
                return entry.value;
            }
        }
    }
    if (throwOnInvalid) {
        throw tab._tableauException._createInvalidParameter(paramName);
    }
    return null;
}


////////////////////////////////////////////////////////////////////////////////
// tab._ApiBootstrap

tab._ApiBootstrap = function tab__ApiBootstrap() {
}
tab._ApiBootstrap.initialize = function tab__ApiBootstrap$initialize() {
    tab._CrossDomainMessageRouter._initialize();
}


////////////////////////////////////////////////////////////////////////////////
// tab._CustomViewImpl

tab._CustomViewImpl = function tab__CustomViewImpl(workbookImpl, name) {
    this._workbookImpl = workbookImpl;
    this._name = name;
    this._isPublic = false;
    this._isDefault = false;
    this._isStale = false;
}
tab._CustomViewImpl._getAsync = function tab__CustomViewImpl$_getAsync(eventContext) {
    var deferred = new tab._Deferred();
    deferred.resolve(eventContext.get__customViewImpl().get__customView());
    return deferred.get_promise();
}
tab._CustomViewImpl._createNew = function tab__CustomViewImpl$_createNew(workbookImpl, dict, defaultId) {
    var cv = new tab._CustomViewImpl(workbookImpl, dict['name']);
    cv._isPublic = dict['isPublic'];
    cv._url = dict['_sessionUrl'];
    var ownerDict = dict['owner'];
    cv._ownerName = ownerDict['friendlyName'];
    cv._isDefault = false;
    if (defaultId != null && defaultId === dict['id']) {
        cv._isDefault = true;
    }
    cv._serverCustomizedView = dict;
    return cv;
}
tab._CustomViewImpl._removeAsync = function tab__CustomViewImpl$_removeAsync(workbookImpl, customViewImpl) {
    var deferred = new tab._Deferred();
    var param = {};
    param['api.customViewParam'] = customViewImpl._serverCustomizedView;
    var returnHandler = tab._CustomViewImpl._createCustomViewCommandReturnHandler('api.RemoveCustomViewCommand', deferred, function(result) {
        customViewImpl._isStale = true;
        var cvs = result;
        tab._CustomViewImpl._processCustomViews(workbookImpl, cvs);
        deferred.resolve(customViewImpl.get__customView());
    });
    workbookImpl._sendCommand(param, returnHandler);
    return deferred.get_promise();
}
tab._CustomViewImpl._saveNewAsync = function tab__CustomViewImpl$_saveNewAsync(workbookImpl, name) {
    var deferred = new tab._Deferred();
    var param = {};
    param['api.customViewName'] = name;
    var returnHandler = tab._CustomViewImpl._createCustomViewCommandReturnHandler('api.SaveNewCustomViewCommand', deferred, function(result) {
        tab._CustomViewImpl._processCustomViewUpdate(workbookImpl, result, true);
        var newView = null;
        if (ss.isValue(workbookImpl.get__updatedCustomViews())) {
            newView = workbookImpl.get__updatedCustomViews().get_item(0);
        }
        deferred.resolve(newView);
    });
    workbookImpl._sendCommand(param, returnHandler);
    return deferred.get_promise();
}
tab._CustomViewImpl._showCustomViewAsync = function tab__CustomViewImpl$_showCustomViewAsync(workbookImpl, serverCustomizedView) {
    var deferred = new tab._Deferred();
    var param = {};
    if (ss.isValue(serverCustomizedView)) {
        param['api.customViewParam'] = serverCustomizedView;
    }
    var returnHandler = tab._CustomViewImpl._createCustomViewCommandReturnHandler('api.ShowCustomViewCommand', deferred, function(result) {
        var cv = workbookImpl.get__activeCustomView();
        deferred.resolve(cv);
    });
    workbookImpl._sendCommand(param, returnHandler);
    return deferred.get_promise();
}
tab._CustomViewImpl._makeCurrentCustomViewDefaultAsync = function tab__CustomViewImpl$_makeCurrentCustomViewDefaultAsync(workbookImpl) {
    var deferred = new tab._Deferred();
    var param = {};
    var returnHandler = tab._CustomViewImpl._createCustomViewCommandReturnHandler('api.MakeCurrentCustomViewDefaultCommand', deferred, function(result) {
        var cv = workbookImpl.get__activeCustomView();
        deferred.resolve(cv);
    });
    workbookImpl._sendCommand(param, returnHandler);
    return deferred.get_promise();
}
tab._CustomViewImpl._getCustomViewsAsync = function tab__CustomViewImpl$_getCustomViewsAsync(workbookImpl) {
    var deferred = new tab._Deferred();
    var returnHandler = new tab._CommandReturnHandler('api.FetchCustomViewsCommand', 0, function(result) {
        var cvs = result;
        tab._CustomViewImpl._processCustomViews(workbookImpl, cvs);
        deferred.resolve(workbookImpl.get__customViews()._toApiCollection());
    }, function(remoteError, message) {
        deferred.reject(tab._tableauException._create('serverError', message));
    });
    workbookImpl._sendCommand(null, returnHandler);
    return deferred.get_promise();
}
tab._CustomViewImpl._processCustomViews = function tab__CustomViewImpl$_processCustomViews(workbookImpl, info) {
    tab._CustomViewImpl._processCustomViewUpdate(workbookImpl, info, false);
}
tab._CustomViewImpl._processCustomViewUpdate = function tab__CustomViewImpl$_processCustomViewUpdate(workbookImpl, info, doUpdateList) {
    if (doUpdateList) {
        workbookImpl.set__updatedCustomViews(new tab._Collection());
    }
    workbookImpl.set__currentCustomView(null);
    var currentViewName = null;
    if (ss.isValue(info['currentView'])) {
        var currView = info['currentView'];
        currentViewName = currView['name'];
    }
    var defaultId = null;
    if (ss.isValue(info['defaultId'])) {
        defaultId = info['defaultId'];
    }
    if (doUpdateList && ss.isValue(info['newView'])) {
        var newViewImpl = tab._CustomViewImpl._createNew(workbookImpl, info['newView'], defaultId);
        workbookImpl.get__updatedCustomViews()._add(newViewImpl.get__name(), newViewImpl.get__customView());
    }
    workbookImpl.set__removedCustomViews(workbookImpl.get__customViews());
    workbookImpl.set__customViews(new tab._Collection());
    if (ss.isValue(info['list'])) {
        var list = info['list'];
        if (list.length > 0) {
            for (var i = 0; i < list.length; i++) {
                var customViewImpl = tab._CustomViewImpl._createNew(workbookImpl, list[i], defaultId);
                workbookImpl.get__customViews()._add(customViewImpl.get__name(), customViewImpl.get__customView());
                if (workbookImpl.get__removedCustomViews()._has(customViewImpl.get__name())) {
                    workbookImpl.get__removedCustomViews()._remove(customViewImpl.get__name());
                }
                else if (doUpdateList) {
                    if (!workbookImpl.get__updatedCustomViews()._has(customViewImpl.get__name())) {
                        workbookImpl.get__updatedCustomViews()._add(customViewImpl.get__name(), customViewImpl.get__customView());
                    }
                }
                if (ss.isValue(currentViewName) && customViewImpl.get__name() === currentViewName) {
                    workbookImpl.set__currentCustomView(customViewImpl.get__customView());
                }
            }
        }
    }
}
tab._CustomViewImpl._createCustomViewCommandReturnHandler = function tab__CustomViewImpl$_createCustomViewCommandReturnHandler(commandName, deferred, successCallback) {
    var errorCallback = function(remoteError, message) {
        deferred.reject(tab._tableauException._create('serverError', message));
    };
    return new tab._CommandReturnHandler(commandName, 0, successCallback, errorCallback);
}
tab._CustomViewImpl.prototype = {
    _customView: null,
    _serverCustomizedView: null,
    _workbookImpl: null,
    _name: null,
    _ownerName: null,
    _url: null,
    _isPublic: false,
    _isDefault: false,
    _isStale: false,
    
    get__customView: function tab__CustomViewImpl$get__customView() {
        if (this._customView == null) {
            this._customView = new tableauSoftware.CustomView(this);
        }
        return this._customView;
    },
    
    get__workbook: function tab__CustomViewImpl$get__workbook() {
        return this._workbookImpl.get__workbook();
    },
    
    get__url: function tab__CustomViewImpl$get__url() {
        return this._url;
    },
    
    get__name: function tab__CustomViewImpl$get__name() {
        return this._name;
    },
    set__name: function tab__CustomViewImpl$set__name(value) {
        if (this._isStale) {
            throw tab._tableauException._create('staleDataReference', 'Stale data');
        }
        this._name = value;
        return value;
    },
    
    get__ownerName: function tab__CustomViewImpl$get__ownerName() {
        return this._ownerName;
    },
    
    get__advertised: function tab__CustomViewImpl$get__advertised() {
        return this._isPublic;
    },
    set__advertised: function tab__CustomViewImpl$set__advertised(value) {
        if (this._isStale) {
            throw tab._tableauException._create('staleDataReference', 'Stale data');
        }
        this._isPublic = value;
        return value;
    },
    
    get__isDefault: function tab__CustomViewImpl$get__isDefault() {
        return this._isDefault;
    },
    
    saveAsync: function tab__CustomViewImpl$saveAsync() {
        if (this._isStale || ss.isNullOrUndefined(this._serverCustomizedView)) {
            throw tab._tableauException._create('staleDataReference', 'Stale data');
        }
        this._serverCustomizedView['isPublic'] = this._isPublic;
        this._serverCustomizedView['isDefault'] = this._isDefault;
        this._serverCustomizedView['name'] = this._name;
        var deferred = new tab._Deferred();
        var param = {};
        param['api.customViewParam'] = this._serverCustomizedView;
        var returnHandler = tab._CustomViewImpl._createCustomViewCommandReturnHandler('api.UpdateCustomViewCommand', deferred, ss.Delegate.create(this, function(result) {
            tab._CustomViewImpl._processCustomViewUpdate(this._workbookImpl, result, true);
            deferred.resolve(this.get__customView());
        }));
        this._workbookImpl._sendCommand(param, returnHandler);
        return deferred.get_promise();
    },
    
    _showAsync: function tab__CustomViewImpl$_showAsync() {
        if (this._isStale || ss.isNullOrUndefined(this._serverCustomizedView)) {
            throw tab._tableauException._create('staleDataReference', 'Stale data');
        }
        return tab._CustomViewImpl._showCustomViewAsync(this._workbookImpl, this._serverCustomizedView);
    },
    
    _isDifferent: function tab__CustomViewImpl$_isDifferent(other) {
        return (this._ownerName !== other._ownerName || this._url !== other._url || this._isPublic !== other._isPublic || this._isDefault !== other._isDefault);
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._DashboardImpl

tab._DashboardImpl = function tab__DashboardImpl(sheetInfoImpl, workbookImpl) {
    this._worksheets$1 = new tab._Collection();
    this._dashboardObjects$1 = new tab._Collection();
    tab._DashboardImpl.initializeBase(this, [ sheetInfoImpl, workbookImpl ]);
}
tab._DashboardImpl.prototype = {
    _dashboard$1: null,
    
    get__sheet: function tab__DashboardImpl$get__sheet() {
        return this.get__dashboard();
    },
    
    get__dashboard: function tab__DashboardImpl$get__dashboard() {
        if (this._dashboard$1 == null) {
            this._dashboard$1 = new tableauSoftware.Dashboard(this);
        }
        return this._dashboard$1;
    },
    
    get__worksheets: function tab__DashboardImpl$get__worksheets() {
        return this._worksheets$1;
    },
    
    get__objects: function tab__DashboardImpl$get__objects() {
        return this._dashboardObjects$1;
    },
    
    _addObjects: function tab__DashboardImpl$_addObjects(frames, visibleSheets, visibleSheetUrls) {
        this._dashboardObjects$1 = new tab._Collection();
        this._worksheets$1 = new tab._Collection();
        var sheetsMap = {};
        for (var i = 0; i < visibleSheets.length; i++) {
            sheetsMap[visibleSheets[i]] = i;
        }
        for (var i = 0; i < frames.length; i++) {
            var frame = frames[i];
            var name = frame._name;
            if (ss.isNullOrUndefined(name)) {
                continue;
            }
            var worksheet = null;
            if (frames[i]._objectType === 'worksheet') {
                var isHidden = ss.isNullOrUndefined(sheetsMap[name]);
                var index = this._worksheets$1.get__length();
                var size = tab.$create_SheetSize('automatic', null, null);
                var url = '';
                if (!isHidden) {
                    url = visibleSheetUrls[sheetsMap[name]];
                }
                var sheetInfoImpl = tab.$create__SheetInfoImpl(name, 'worksheet', index, size, this.get__workbook(), url, false, isHidden);
                var worksheetImpl = new tab._WorksheetImpl(sheetInfoImpl, this.get__workbookImpl(), this);
                worksheet = worksheetImpl.get__worksheet();
                this._worksheets$1._add(name, worksheetImpl.get__worksheet());
            }
            var obj = new tableauSoftware.DashboardObject(frame, this.get__dashboard(), worksheet);
            this._dashboardObjects$1._add(i.toString(), obj);
        }
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._dataSourceImpl

tab._dataSourceImpl = function tab__dataSourceImpl(name, isPrimary) {
    this._fields = new tab._Collection();
    this._name = name;
    this._isPrimary = isPrimary;
}
tab._dataSourceImpl._getDataSourcesAsync = function tab__dataSourceImpl$_getDataSourcesAsync(worksheetImpl) {
    worksheetImpl._verifyActiveSheetOrEmbeddedInActiveDashboard();
    var deferred = new tab._Deferred();
    var param = {};
    param['api.worksheetName'] = worksheetImpl.get__name();
    if (ss.isValue(worksheetImpl.get__parentDashboardImpl())) {
        param['api.dashboardName'] = worksheetImpl.get__parentDashboardImpl().get__name();
    }
    var returnHandler = new tab._CommandReturnHandler('api.GetDataSourcesCommand', 0, function(result) {
        var dataSourcesDict = result;
        var dataSources = tab._dataSourceImpl._processDataSources(dataSourcesDict, worksheetImpl.get__name());
        worksheetImpl.set__dataSources(dataSources);
        deferred.resolve(dataSources._toApiCollection());
    }, function(remoteError, message) {
        deferred.reject(tab._tableauException._createServerError(message));
    });
    worksheetImpl.get__workbookImpl()._sendCommand(param, returnHandler);
    return deferred.get_promise();
}
tab._dataSourceImpl._getOneDataSourceAsync = function tab__dataSourceImpl$_getOneDataSourceAsync(worksheetImpl, dataSourceName) {
    worksheetImpl._verifyActiveSheetOrEmbeddedInActiveDashboard();
    var deferred = new tab._Deferred();
    var param = {};
    param['api.worksheetName'] = worksheetImpl.get__name();
    if (ss.isValue(worksheetImpl.get__parentDashboardImpl())) {
        param['api.dashboardName'] = worksheetImpl.get__parentDashboardImpl().get__name();
    }
    var returnHandler = new tab._CommandReturnHandler('api.GetDataSourcesCommand', 0, function(result) {
        var dataSourcesDict = result;
        var dataSources = tab._dataSourceImpl._processDataSources(dataSourcesDict, worksheetImpl.get__name());
        worksheetImpl.set__dataSources(dataSources);
        for (var i = 0; i < dataSources.get__length(); i++) {
            var ds = dataSources.get_item(i);
            if (ds.getName() === dataSourceName) {
                deferred.resolve(ds);
            }
        }
        deferred.reject(tab._tableauException._create('serverError', 'datasource not found'));
    }, function(remoteError, message) {
        deferred.reject(tab._tableauException._createServerError(message));
    });
    worksheetImpl.get__workbookImpl()._sendCommand(param, returnHandler);
    return deferred.get_promise();
}
tab._dataSourceImpl._processAggrType = function tab__dataSourceImpl$_processAggrType(aggrType) {
    if (ss.isValue(aggrType) && ss.isValue(tab._dataSourceImpl._fieldAggrDict[aggrType])) {
        return tab._dataSourceImpl._fieldAggrDict[aggrType];
    }
    return 'NONE';
}
tab._dataSourceImpl._processDataSources = function tab__dataSourceImpl$_processDataSources(dataSourcesDict, worksheetname) {
    var priDataSource = dataSourcesDict.worksheetDataSchemaMap[worksheetname].primaryDatasource;
    var paramDataSource = dataSourcesDict.parametersDatasource;
    var dataSources = new tab._Collection();
    var primaryDataSourceImpl = null;
    var list = dataSourcesDict.dataSourceList;
    for (var i = 0; i < list.length; i++) {
        var model = list[i];
        if (model.datasource === paramDataSource) {
            continue;
        }
        var isPrimary = model.datasource === priDataSource;
        var dataSourceImpl = new tab._dataSourceImpl(model.datasource, isPrimary);
        if (isPrimary) {
            primaryDataSourceImpl = dataSourceImpl;
        }
        else {
            dataSources._add(model.datasource, dataSourceImpl.get__dataSource());
        }
        for (var j = 0; j < model.fieldList.length; j++) {
            var fm = model.fieldList[j];
            var fieldRoleType;
            var fieldAggrType;
            if (ss.isValue(fm.baseColumnName)) {
                continue;
            }
            if (ss.isValue(fm.columnList)) {
                var columns = fm.columnList;
                for (var columnIndex = 0, len = columns.length; columnIndex < len; columnIndex++) {
                    var column = columns[columnIndex];
                    fieldRoleType = tab._dataSourceImpl._processRoleType(column.fieldRole);
                    fieldAggrType = tab._dataSourceImpl._processAggrType(column.aggregation);
                    var field = new tableauSoftware.Field(dataSourceImpl.get__dataSource(), column.name, fieldRoleType, fieldAggrType);
                    dataSourceImpl._addField(field);
                }
            }
            else {
                fieldRoleType = tab._dataSourceImpl._processRoleType(fm.defaultFieldRole);
                fieldAggrType = tab._dataSourceImpl._processAggrType(fm.defaultAggregation);
                var field = new tableauSoftware.Field(dataSourceImpl.get__dataSource(), fm.name, fieldRoleType, fieldAggrType);
                dataSourceImpl._addField(field);
            }
        }
    }
    if (ss.isValue(primaryDataSourceImpl)) {
        dataSources._addToFirst(primaryDataSourceImpl.get__name(), primaryDataSourceImpl.get__dataSource());
    }
    return dataSources;
}
tab._dataSourceImpl._processRoleType = function tab__dataSourceImpl$_processRoleType(roleType) {
    if (ss.isValue(roleType)) {
        if (roleType === 'dimension') {
            return 'dimension';
        }
        else if (roleType === 'measure') {
            return 'measure';
        }
    }
    return 'unknown';
}
tab._dataSourceImpl.prototype = {
    _name: null,
    _isPrimary: false,
    _dataSource: null,
    
    get__dataSource: function tab__dataSourceImpl$get__dataSource() {
        if (this._dataSource == null) {
            this._dataSource = new tableauSoftware.DataSource(this);
        }
        return this._dataSource;
    },
    
    get__name: function tab__dataSourceImpl$get__name() {
        return this._name;
    },
    
    get__fields: function tab__dataSourceImpl$get__fields() {
        return this._fields;
    },
    
    get__isPrimary: function tab__dataSourceImpl$get__isPrimary() {
        return this._isPrimary;
    },
    
    _addField: function tab__dataSourceImpl$_addField(field) {
        this._fields._add(field.getName(), field);
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._deferredUtil

tab._deferredUtil = function tab__deferredUtil() {
}
tab._deferredUtil.coerceToTrustedPromise = function tab__deferredUtil$coerceToTrustedPromise(promiseOrValue) {
    var promise;
    if (promiseOrValue instanceof tableauSoftware.Promise) {
        promise = promiseOrValue;
    }
    else {
        if (ss.isValue(promiseOrValue) && typeof(promiseOrValue.valueOf) === 'function') {
            promiseOrValue = promiseOrValue.valueOf();
        }
        if (tab._deferredUtil.isPromise(promiseOrValue)) {
            var deferred = new tab._DeferredImpl();
            (promiseOrValue).then(ss.Delegate.create(deferred, deferred.resolve), ss.Delegate.create(deferred, deferred.reject));
            promise = deferred.get_promise();
        }
        else {
            promise = tab._deferredUtil.resolved(promiseOrValue);
        }
    }
    return promise;
}
tab._deferredUtil.reject = function tab__deferredUtil$reject(promiseOrValue) {
    return tab._deferredUtil.coerceToTrustedPromise(promiseOrValue).then(function(value) {
        return tab._deferredUtil.rejected(value);
    }, null);
}
tab._deferredUtil.resolved = function tab__deferredUtil$resolved(value) {
    var p = new tab._PromiseImpl(function(callback, errback) {
        try {
            return tab._deferredUtil.coerceToTrustedPromise((ss.isValue(callback)) ? callback(value) : value);
        }
        catch (e) {
            return tab._deferredUtil.rejected(e);
        }
    });
    return p;
}
tab._deferredUtil.rejected = function tab__deferredUtil$rejected(reason) {
    var p = new tab._PromiseImpl(function(callback, errback) {
        try {
            return (ss.isValue(errback)) ? tab._deferredUtil.coerceToTrustedPromise(errback(reason)) : tab._deferredUtil.rejected(reason);
        }
        catch (e) {
            return tab._deferredUtil.rejected(e);
        }
    });
    return p;
}
tab._deferredUtil.isPromise = function tab__deferredUtil$isPromise(promiseOrValue) {
    return ss.isValue(promiseOrValue) && typeof(promiseOrValue.then) === 'function';
}


////////////////////////////////////////////////////////////////////////////////
// tab._CollectionImpl

tab._CollectionImpl = function tab__CollectionImpl() {
    this._items = [];
    this._itemMap = {};
}
tab._CollectionImpl.prototype = {
    
    get__length: function tab__CollectionImpl$get__length() {
        return this._items.length;
    },
    
    get__rawArray: function tab__CollectionImpl$get__rawArray() {
        return this._items;
    },
    
    _get: function tab__CollectionImpl$_get(key) {
        var validKey = this._ensureValidKey(key);
        if (ss.isValue(this._itemMap[validKey])) {
            return this._itemMap[validKey];
        }
        return undefined;
    },
    
    _has: function tab__CollectionImpl$_has(key) {
        return ss.isValue(this._get(key));
    },
    
    _add: function tab__CollectionImpl$_add(key, item) {
        this._verifyKeyAndItemParameters(key, item);
        var validKey = this._ensureValidKey(key);
        this._items.push(item);
        this._itemMap[validKey] = item;
    },
    
    _addToFirst: function tab__CollectionImpl$_addToFirst(key, item) {
        this._verifyKeyAndItemParameters(key, item);
        var validKey = this._ensureValidKey(key);
        this._items.unshift(item);
        this._itemMap[validKey] = item;
    },
    
    _remove: function tab__CollectionImpl$_remove(key) {
        var validKey = this._ensureValidKey(key);
        if (ss.isValue(this._itemMap[validKey])) {
            var item = this._itemMap[validKey];
            delete this._itemMap[validKey];
            for (var index = 0; index < this._items.length; index++) {
                if (this._items[index] === item) {
                    this._items.splice(index, 1);
                    break;
                }
            }
        }
    },
    
    _toApiCollection: function tab__CollectionImpl$_toApiCollection() {
        var clone = this._items.concat();
        clone.get = ss.Delegate.create(this, function(key) {
            return this._get(key);
        });
        clone.has = ss.Delegate.create(this, function(key) {
            return this._has(key);
        });
        return clone;
    },
    
    _verifyUniqueKeyParameter: function tab__CollectionImpl$_verifyUniqueKeyParameter(key) {
        if (tab._Utility.isNullOrEmpty(key)) {
            throw new Error('Null key');
        }
        if (this._has(key)) {
            throw new Error("Duplicate key '" + key + "'");
        }
    },
    
    _verifyKeyAndItemParameters: function tab__CollectionImpl$_verifyKeyAndItemParameters(key, item) {
        this._verifyUniqueKeyParameter(key);
        if (ss.isNullOrUndefined(item)) {
            throw new Error('Null item');
        }
    },
    
    _ensureValidKey: function tab__CollectionImpl$_ensureValidKey(key) {
        return '_' + key;
    },
    get_item: function tab__CollectionImpl$get_item(index) {
        return this._items[index];
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._DeferredImpl

tab._DeferredImpl = function tab__DeferredImpl() {
    this._listeners = [];
    this._promise = new tab._PromiseImpl(ss.Delegate.create(this, this.then));
    this._thenFunc = ss.Delegate.create(this, this._preResolutionThen);
    this._resolveFunc = ss.Delegate.create(this, this._transitionToFulfilled);
}
tab._DeferredImpl.prototype = {
    _promise: null,
    _thenFunc: null,
    _resolveFunc: null,
    
    get_promise: function tab__DeferredImpl$get_promise() {
        return this._promise;
    },
    
    all: function tab__DeferredImpl$all(promisesOrValues) {
        var allDone = new tab._DeferredImpl();
        var length = promisesOrValues.length;
        var toResolve = length;
        var results = [];
        if (!length) {
            allDone.resolve(results);
            return allDone.get_promise();
        }
        var resolveOne = function(promiseOrValue, index) {
            var promise = tab._deferredUtil.coerceToTrustedPromise(promiseOrValue);
            promise.then(function(returnValue) {
                results[index] = returnValue;
                toResolve--;
                if (!toResolve) {
                    allDone.resolve(results);
                }
                return null;
            }, function(e) {
                allDone.reject(e);
                return null;
            });
        };
        for (var i = 0; i < length; i++) {
            resolveOne(promisesOrValues[i], i);
        }
        return allDone.get_promise();
    },
    
    then: function tab__DeferredImpl$then(callback, errback) {
        return this._thenFunc(callback, errback);
    },
    
    resolve: function tab__DeferredImpl$resolve(promiseOrValue) {
        return this._resolveFunc(promiseOrValue);
    },
    
    reject: function tab__DeferredImpl$reject(e) {
        return this._resolveFunc(tab._deferredUtil.rejected(e));
    },
    
    _preResolutionThen: function tab__DeferredImpl$_preResolutionThen(callback, errback) {
        var deferred = new tab._DeferredImpl();
        this._listeners.push(function(promise) {
            promise.then(callback, errback).then(ss.Delegate.create(deferred, deferred.resolve), ss.Delegate.create(deferred, deferred.reject));
        });
        return deferred.get_promise();
    },
    
    _transitionToFulfilled: function tab__DeferredImpl$_transitionToFulfilled(completed) {
        var completedPromise = tab._deferredUtil.coerceToTrustedPromise(completed);
        this._thenFunc = completedPromise.then;
        this._resolveFunc = tab._deferredUtil.coerceToTrustedPromise;
        for (var i = 0; i < this._listeners.length; i++) {
            var listener = this._listeners[i];
            listener(completedPromise);
        }
        this._listeners = null;
        return completedPromise;
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._PromiseImpl

tab._PromiseImpl = function tab__PromiseImpl(thenFunc) {
    this.then = thenFunc;
}
tab._PromiseImpl.prototype = {
    then: null,
    
    always: function tab__PromiseImpl$always(callback) {
        return this.then(callback, callback);
    },
    
    otherwise: function tab__PromiseImpl$otherwise(errback) {
        return this.then(null, errback);
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._markImpl

tab._markImpl = function tab__markImpl(tupleIdOrPairs) {
    this._collection = new tab._Collection();
    if (tab._jQueryShim.isArray(tupleIdOrPairs)) {
        var pairArr = tupleIdOrPairs;
        for (var i = 0; i < pairArr.length; i++) {
            var pair = pairArr[i];
            if (!ss.isValue(pair.fieldName)) {
                throw tab._tableauException._createInvalidParameter('pair.fieldName');
            }
            if (!ss.isValue(pair.value)) {
                throw tab._tableauException._createInvalidParameter('pair.value');
            }
            var p = new tableauSoftware.Pair(pair.fieldName, pair.value);
            this._collection._add(p.fieldName, p);
        }
    }
    else {
        this._tupleId = tupleIdOrPairs;
    }
}
tab._markImpl._getAsync = function tab__markImpl$_getAsync(eventContext) {
    if (ss.isValue(eventContext.get__worksheetImpl().get__selectedMarks())) {
        var deferred = new tab._Deferred();
        deferred.resolve(eventContext.get__worksheetImpl().get__selectedMarks()._toApiCollection());
    }
    return tab._markImpl._getSelectedMarksAsync(eventContext.get__worksheetImpl());
}
tab._markImpl._getSelectedMarksAsync = function tab__markImpl$_getSelectedMarksAsync(worksheetImpl) {
    worksheetImpl._verifyActiveSheetOrEmbeddedInActiveDashboard();
    var deferred = new tab._Deferred();
    var param = {};
    param['api.worksheetName'] = worksheetImpl.get__name();
    if (ss.isValue(worksheetImpl.get__parentDashboardImpl())) {
        param['api.dashboardName'] = worksheetImpl.get__parentDashboardImpl().get__name();
    }
    var returnHandler = new tab._CommandReturnHandler('api.FetchSelectedMarksCommand', 0, function(result) {
        var pm = result;
        worksheetImpl.set__selectedMarks(tab._markImpl._processSelectedMarks(pm));
        deferred.resolve(worksheetImpl.get__selectedMarks()._toApiCollection());
    }, function(remoteError, message) {
        deferred.reject(tab._tableauException._createServerError(message));
    });
    worksheetImpl.get__workbookImpl()._sendCommand(param, returnHandler);
    return deferred.get_promise();
}
tab._markImpl._processSelectedMarks = function tab__markImpl$_processSelectedMarks(marksPresModel) {
    var marks = new tab._Collection();
    if (ss.isNullOrUndefined(marksPresModel) || tab._Utility.isNullOrEmpty(marksPresModel.marks)) {
        return marks;
    }
    var $enum1 = ss.IEnumerator.getEnumerator(marksPresModel.marks);
    while ($enum1.moveNext()) {
        var markPresModel = $enum1.current;
        var tupleId = markPresModel.tupleId;
        var mark = new tableauSoftware.Mark(tupleId);
        marks._add(tupleId.toString(), mark);
        var $enum2 = ss.IEnumerator.getEnumerator(markPresModel.pairs);
        while ($enum2.moveNext()) {
            var pairPresModel = $enum2.current;
            var value = tab._Utility.convertRawValue(pairPresModel.value, pairPresModel.valueDataType);
            var pair = new tableauSoftware.Pair(pairPresModel.fieldName, value);
            pair.formattedValue = pairPresModel.formattedValue;
            if (!mark._impl.get__pairs()._has(pair.fieldName)) {
                mark._impl._addPair(pair);
            }
        }
    }
    return marks;
}
tab._markImpl.prototype = {
    _clonedPairs: null,
    _tupleId: 0,
    
    get__pairs: function tab__markImpl$get__pairs() {
        return this._collection;
    },
    
    get__tupleId: function tab__markImpl$get__tupleId() {
        return this._tupleId;
    },
    
    get__clonedPairs: function tab__markImpl$get__clonedPairs() {
        if (this._clonedPairs == null) {
            this._clonedPairs = this._collection._toApiCollection();
        }
        return this._clonedPairs;
    },
    
    _addPair: function tab__markImpl$_addPair(pair) {
        this._collection._add(pair.fieldName, pair);
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._parameterImpl

tab._parameterImpl = function tab__parameterImpl(pm) {
    this._name = pm.name;
    this._parameterName = pm.parameterName;
    this._currentValue = tab._Utility.getDataValue(pm.currentValue);
    this._dataType = tab._parameterImpl._processParamDataType(pm.dataType);
    this._allowableValuesType = tab._parameterImpl._processParamDomainType(pm.allowableValuesType);
    if (ss.isValue(pm.allowableValues) && this._allowableValuesType === 'list') {
        this._allowableValues = [];
        var $enum1 = ss.IEnumerator.getEnumerator(pm.allowableValues);
        while ($enum1.moveNext()) {
            var adv = $enum1.current;
            this._allowableValues.push(tab._Utility.getDataValue(adv));
        }
    }
    if (this._allowableValuesType === 'range') {
        this._minValue = tab._Utility.getDataValue(pm.minValue);
        this._maxValue = tab._Utility.getDataValue(pm.maxValue);
        this._stepSize = pm.stepSize;
        if ((this._dataType === 'date' || this._dataType === 'datetime') && ss.isValue(this._stepSize) && ss.isValue(pm.dateStepPeriod)) {
            this._dateStepPeriod = tab._parameterImpl._processParamDatePeriod(pm.dateStepPeriod);
        }
    }
}
tab._parameterImpl._getAsync = function tab__parameterImpl$_getAsync(eventContext) {
    if (ss.isValue(eventContext.get__workbookImpl().get__lastChangedParameterImpl())) {
        var deferred = new tab._Deferred();
        deferred.resolve(eventContext.get__workbookImpl().get__lastChangedParameterImpl().get__parameter());
        return deferred.get_promise();
    }
    return tab._parameterImpl._getChangedAsync(eventContext.get__workbookImpl(), eventContext.get__parameterName());
}
tab._parameterImpl._changeValueAsync = function tab__parameterImpl$_changeValueAsync(workbookImpl, name, value, parameterChangeCallback) {
    var deferred = new tab._Deferred();
    var parameterImpl = null;
    if (ss.isValue(workbookImpl.get__parameters())) {
        if (ss.isNullOrUndefined(workbookImpl.get__parameters()._get(name))) {
            deferred.reject(tab._tableauException._createInvalidParameter(name));
            return deferred.get_promise();
        }
        parameterImpl = workbookImpl.get__parameters()._get(name)._impl;
        if (ss.isNullOrUndefined(parameterImpl)) {
            deferred.reject(tab._tableauException._createInvalidParameter(name));
            return deferred.get_promise();
        }
        if (parameterImpl.get__allowableValuesType() !== 'all' && !parameterImpl._allowsValue(value)) {
            deferred.reject(tab._tableauException._createInvalidParameter('value'));
            return deferred.get_promise();
        }
    }
    var param = {};
    param['api.setParameterName'] = (ss.isValue(workbookImpl.get__parameters())) ? parameterImpl.get__name() : name;
    if ((ss.isValue(workbookImpl.get__parameters()) && (parameterImpl.get__dataType() === 'date' || parameterImpl.get__dataType() === 'datetime')) || tab._Utility.isDate(value)) {
        var date = value;
        var year = date.getUTCFullYear();
        var month = date.getUTCMonth() + 1;
        var day = date.getUTCDate();
        var dateStr = year.toString() + '/' + month.toString() + '/' + day.toString();
        if (ss.isValue(workbookImpl.get__parameters()) && parameterImpl.get__dataType() === 'datetime') {
            var hh = date.getHours();
            var mm = date.getMinutes();
            var sec = date.getSeconds();
            dateStr += ' ' + hh.toString() + ':' + mm.toString() + ':' + sec.toString();
        }
        param['api.setParameterValue'] = dateStr;
    }
    else {
        param['api.setParameterValue'] = value.toString();
    }
    workbookImpl.set__lastChangedParameterImpl(null);
    var returnHandler = new tab._CommandReturnHandler('api.SetParameterValueCommand', 0, function(result) {
        var pm = result;
        if (ss.isNullOrUndefined(pm)) {
            deferred.reject(tab._tableauException._create('serverError', 'server error'));
            return;
        }
        if (!pm.isValidPresModel) {
            deferred.reject(tab._tableauException._createInvalidParameter(name));
            return;
        }
        var paramUpdated = new tab._parameterImpl(pm);
        workbookImpl.set__lastChangedParameterImpl(paramUpdated);
        deferred.resolve(paramUpdated.get__parameter());
    }, function(remoteError, message) {
        deferred.reject(tab._tableauException._createInvalidParameter(name));
    });
    workbookImpl._sendCommand(param, returnHandler);
    return deferred.get_promise();
}
tab._parameterImpl._getParametersAsync = function tab__parameterImpl$_getParametersAsync(workbookImpl) {
    var deferred = new tab._Deferred();
    var param = {};
    var returnHandler = new tab._CommandReturnHandler('api.FetchParametersCommand', 0, function(result) {
        var paramList = result;
        workbookImpl.set__parameters(tab._parameterImpl._processParameters(paramList));
        deferred.resolve(workbookImpl.get__parameters()._toApiCollection());
    }, function(remoteError, message) {
        deferred.reject(tab._tableauException._createServerError(message));
    });
    workbookImpl._sendCommand(param, returnHandler);
    return deferred.get_promise();
}
tab._parameterImpl._getChangedAsync = function tab__parameterImpl$_getChangedAsync(workbookImpl, parameterName) {
    var deferred = new tab._Deferred();
    var param = {};
    var returnHandler = new tab._CommandReturnHandler('api.FetchParametersCommand', 0, function(result) {
        var paramList = result;
        var parameterImpl = tab._parameterImpl._processChangedParameters(parameterName, paramList);
        workbookImpl.set__lastChangedParameterImpl(parameterImpl);
        deferred.resolve(parameterImpl.get__parameter());
    }, function(remoteError, message) {
        deferred.reject(tab._tableauException._createServerError(message));
    });
    workbookImpl._sendCommand(param, returnHandler);
    return deferred.get_promise();
}
tab._parameterImpl._processParameters = function tab__parameterImpl$_processParameters(paramList) {
    var parameters = new tab._Collection();
    var $enum1 = ss.IEnumerator.getEnumerator(paramList.parameters);
    while ($enum1.moveNext()) {
        var model = $enum1.current;
        var paramImpl = new tab._parameterImpl(model);
        parameters._add(paramImpl.get__name(), paramImpl.get__parameter());
    }
    return parameters;
}
tab._parameterImpl._processChangedParameters = function tab__parameterImpl$_processChangedParameters(parameterName, paramList) {
    var $enum1 = ss.IEnumerator.getEnumerator(paramList.parameters);
    while ($enum1.moveNext()) {
        var model = $enum1.current;
        if (model.name === parameterName) {
            return new tab._parameterImpl(model);
        }
    }
    return null;
}
tab._parameterImpl._processParamDomainType = function tab__parameterImpl$_processParamDomainType(domainType) {
    switch (domainType) {
        case 'list':
            return 'list';
        case 'range':
            return 'range';
        case 'any':
        default:
            return 'all';
    }
}
tab._parameterImpl._processParamDatePeriod = function tab__parameterImpl$_processParamDatePeriod(val) {
    switch (val) {
        case 'hour':
            return 'hour';
        case 'second':
            return 'second';
        case 'minute':
            return 'minute';
        case 'day':
            return 'day';
        case 'week':
            return 'week';
        case 'month':
            return 'month';
        case 'quarter':
            return 'quarter';
        case 'year':
        default:
            return 'year';
    }
}
tab._parameterImpl._processParamDataType = function tab__parameterImpl$_processParamDataType(dataType) {
    if (dataType === 'boolean') {
        return 'boolean';
    }
    switch (dataType) {
        case 'real':
            return 'float';
        case 'integer':
        case 'tuple':
            return 'integer';
        case 'date':
            return 'date';
        case 'datetime':
            return 'datetime';
        case 'cstring':
        default:
            return 'string';
    }
}
tab._parameterImpl.prototype = {
    _parameter: null,
    _parameterName: null,
    _name: null,
    _currentValue: null,
    _dataType: null,
    _allowableValuesType: null,
    _allowableValues: null,
    _minValue: null,
    _maxValue: null,
    _stepSize: null,
    _dateStepPeriod: null,
    
    get__parameter: function tab__parameterImpl$get__parameter() {
        if (this._parameter == null) {
            this._parameter = new tableauSoftware.Parameter(this);
        }
        return this._parameter;
    },
    
    get__name: function tab__parameterImpl$get__name() {
        return this._name;
    },
    
    get__currentValue: function tab__parameterImpl$get__currentValue() {
        return this._currentValue;
    },
    
    get__dataType: function tab__parameterImpl$get__dataType() {
        return this._dataType;
    },
    
    get__allowableValuesType: function tab__parameterImpl$get__allowableValuesType() {
        return this._allowableValuesType;
    },
    
    get__allowableValues: function tab__parameterImpl$get__allowableValues() {
        return this._allowableValues;
    },
    
    get__minValue: function tab__parameterImpl$get__minValue() {
        return this._minValue;
    },
    
    get__maxValue: function tab__parameterImpl$get__maxValue() {
        return this._maxValue;
    },
    
    get__stepSize: function tab__parameterImpl$get__stepSize() {
        return this._stepSize;
    },
    
    get__dateStepPeriod: function tab__parameterImpl$get__dateStepPeriod() {
        return this._dateStepPeriod;
    },
    
    _allowsValue: function tab__parameterImpl$_allowsValue(val) {
        if (this.get__allowableValuesType() === 'all') {
            return true;
        }
        else if (this.get__allowableValuesType() === 'list') {
            for (var i = 0; i < this._allowableValues.length; i++) {
                if (val === this._allowableValues[i]) {
                    return true;
                }
            }
        }
        else if (this.get__allowableValuesType() === 'range') {
            if (this._dataType === 'date' || this._dataType === 'datetime') {
                var dval = val;
                var minDt = this._allowableValues[0].value;
                var maxDt = this._allowableValues[this._allowableValues.length - 1].value;
                if (dval >= minDt && dval <= maxDt) {
                    return true;
                }
            }
            else if (this._dataType === 'integer' || this._dataType === 'float') {
                var nval = val;
                var minNum = this.get__minValue().value;
                var maxNum = this.get__maxValue().value;
                if (nval >= minNum && nval <= maxNum) {
                    return true;
                }
            }
        }
        return false;
    },
    
    _getParameterName: function tab__parameterImpl$_getParameterName() {
        return this._parameterName;
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._SheetImpl

tab._SheetImpl = function tab__SheetImpl(sheetInfoImpl, workbookImpl) {
    this._name = sheetInfoImpl._name;
    this._index = sheetInfoImpl._index;
    this._isActive = sheetInfoImpl._isActive;
    this._isHidden = sheetInfoImpl._isHidden;
    this._sheetType = sheetInfoImpl._sheetType;
    this._size = sheetInfoImpl._size;
    this._url = sheetInfoImpl._url;
    this._workbookImpl = workbookImpl;
}
tab._SheetImpl._convertValueToIntIfValid = function tab__SheetImpl$_convertValueToIntIfValid(value) {
    if (ss.isValue(value)) {
        return tab._Utility.toInt(value);
    }
    return value;
}
tab._SheetImpl._normalizeSheetSize = function tab__SheetImpl$_normalizeSheetSize(size) {
    var behavior = tab._enums._normalizeSheetSizeBehavior(size.behavior, 'size.behavior');
    var minSize = size.minSize;
    if (ss.isValue(minSize)) {
        minSize = tab.$create_Size(tab._SheetImpl._convertValueToIntIfValid(size.minSize.width), tab._SheetImpl._convertValueToIntIfValid(size.minSize.height));
    }
    var maxSize = size.maxSize;
    if (ss.isValue(maxSize)) {
        maxSize = tab.$create_Size(tab._SheetImpl._convertValueToIntIfValid(size.maxSize.width), tab._SheetImpl._convertValueToIntIfValid(size.maxSize.height));
    }
    return tab.$create_SheetSize(behavior, minSize, maxSize);
}
tab._SheetImpl.prototype = {
    _name: null,
    _index: 0,
    _isActive: false,
    _isHidden: false,
    _sheetType: null,
    _size: null,
    _url: null,
    _workbookImpl: null,
    
    get__name: function tab__SheetImpl$get__name() {
        return this._name;
    },
    
    get__index: function tab__SheetImpl$get__index() {
        return this._index;
    },
    
    get__workbookImpl: function tab__SheetImpl$get__workbookImpl() {
        return this._workbookImpl;
    },
    
    get__workbook: function tab__SheetImpl$get__workbook() {
        return this._workbookImpl.get__workbook();
    },
    
    get__url: function tab__SheetImpl$get__url() {
        if (this._isHidden) {
            throw tab._tableauException._createNoUrlForHiddenWorksheet();
        }
        return this._url;
    },
    
    get__size: function tab__SheetImpl$get__size() {
        return this._size;
    },
    
    get__isHidden: function tab__SheetImpl$get__isHidden() {
        return this._isHidden;
    },
    
    get__isActive: function tab__SheetImpl$get__isActive() {
        return this._isActive;
    },
    set__isActive: function tab__SheetImpl$set__isActive(value) {
        this._isActive = value;
        return value;
    },
    
    get__isDashboard: function tab__SheetImpl$get__isDashboard() {
        return this._sheetType === 'dashboard';
    },
    
    get__sheetType: function tab__SheetImpl$get__sheetType() {
        return this._sheetType;
    },
    
    _changeSizeAsync: function tab__SheetImpl$_changeSizeAsync(newSize) {
        newSize = tab._SheetImpl._normalizeSheetSize(newSize);
        if (this._sheetType === 'worksheet' && newSize.behavior !== 'automatic') {
            throw tab._tableauException._createInvalidSizeBehaviorOoWorksheet();
        }
        var deferred = new tab._Deferred();
        if (this._size.behavior === newSize.behavior && newSize.behavior === 'automatic') {
            deferred.resolve(newSize);
            return deferred.get_promise();
        }
        var dict = this._processSheetSize(newSize);
        var param = {};
        param['api.setSheetSizeName'] = this._name;
        param['api.minWidth'] = dict['api.minWidth'];
        param['api.minHeight'] = dict['api.minHeight'];
        param['api.maxWidth'] = dict['api.maxWidth'];
        param['api.maxHeight'] = dict['api.maxHeight'];
        var returnHandler = new tab._CommandReturnHandler('api.SetSheetSizeCommand', 1, ss.Delegate.create(this, function(result) {
            this.get__workbookImpl()._update(ss.Delegate.create(this, function() {
                var updatedSize = this.get__workbookImpl().get__publishedSheets()._get(this.get__name()).getSize();
                deferred.resolve(updatedSize);
            }));
        }), function(remoteError, message) {
            deferred.reject(tab._tableauException._createServerError(message));
        });
        this._workbookImpl._sendCommand(param, returnHandler);
        return deferred.get_promise();
    },
    
    _processSheetSize: function tab__SheetImpl$_processSheetSize(newSize) {
        var fixedSheetSize = null;
        if (ss.isNullOrUndefined(newSize) || ss.isNullOrUndefined(newSize.behavior) || (newSize.behavior !== 'automatic' && ss.isNullOrUndefined(newSize.minSize) && ss.isNullOrUndefined(newSize.maxSize))) {
            throw tab._tableauException._createInvalidSheetSizeParam();
        }
        var minWidth = 0;
        var minHeight = 0;
        var maxWidth = 0;
        var maxHeight = 0;
        var dict = {};
        dict['api.minWidth'] = 0;
        dict['api.minHeight'] = 0;
        dict['api.maxWidth'] = 0;
        dict['api.maxHeight'] = 0;
        if (newSize.behavior === 'automatic') {
            fixedSheetSize = tab.$create_SheetSize('automatic', undefined, undefined);
        }
        else if (newSize.behavior === 'atmost') {
            if (ss.isNullOrUndefined(newSize.maxSize) || ss.isNullOrUndefined(newSize.maxSize.width) || ss.isNullOrUndefined(newSize.maxSize.height)) {
                throw tab._tableauException._createMissingMaxSize();
            }
            if (newSize.maxSize.width < 0 || newSize.maxSize.height < 0) {
                throw tab._tableauException._createInvalidSizeValue();
            }
            dict['api.maxWidth'] = newSize.maxSize.width;
            dict['api.maxHeight'] = newSize.maxSize.height;
            fixedSheetSize = tab.$create_SheetSize('atmost', undefined, newSize.maxSize);
        }
        else if (newSize.behavior === 'atleast') {
            if (ss.isNullOrUndefined(newSize.minSize) || ss.isNullOrUndefined(newSize.minSize.width) || ss.isNullOrUndefined(newSize.minSize.height)) {
                throw tab._tableauException._createMissingMinSize();
            }
            if (newSize.minSize.width < 0 || newSize.minSize.height < 0) {
                throw tab._tableauException._createInvalidSizeValue();
            }
            dict['api.minWidth'] = newSize.minSize.width;
            dict['api.minHeight'] = newSize.minSize.height;
            fixedSheetSize = tab.$create_SheetSize('atleast', newSize.minSize, undefined);
        }
        else if (newSize.behavior === 'range') {
            if (ss.isNullOrUndefined(newSize.minSize) || ss.isNullOrUndefined(newSize.maxSize) || ss.isNullOrUndefined(newSize.minSize.width) || ss.isNullOrUndefined(newSize.maxSize.width) || ss.isNullOrUndefined(newSize.minSize.height) || ss.isNullOrUndefined(newSize.maxSize.height)) {
                throw tab._tableauException._createMissingMinMaxSize();
            }
            if (newSize.minSize.width < 0 || newSize.minSize.height < 0 || newSize.maxSize.width < 0 || newSize.maxSize.height < 0 || newSize.minSize.width > newSize.maxSize.width || newSize.minSize.height > newSize.maxSize.height) {
                throw tab._tableauException._createInvalidRangeSize();
            }
            dict['api.minWidth'] = newSize.minSize.width;
            dict['api.minHeight'] = newSize.minSize.height;
            dict['api.maxWidth'] = newSize.maxSize.width;
            dict['api.maxHeight'] = newSize.maxSize.height;
            fixedSheetSize = tab.$create_SheetSize('range', newSize.minSize, newSize.maxSize);
        }
        else if (newSize.behavior === 'exactly') {
            if (ss.isValue(newSize.minSize) && ss.isValue(newSize.maxSize) && ss.isValue(newSize.minSize.width) && ss.isValue(newSize.maxSize.width) && ss.isValue(newSize.minSize.height) && ss.isValue(newSize.maxSize.height)) {
                minWidth = newSize.minSize.width;
                minHeight = newSize.minSize.height;
                maxWidth = newSize.maxSize.width;
                maxHeight = newSize.maxSize.height;
                if (minWidth !== maxWidth || minHeight !== maxHeight) {
                    throw tab._tableauException._createSizeConflictForExactly();
                }
            }
            else if (ss.isValue(newSize.minSize) && ss.isValue(newSize.minSize.width) && ss.isValue(newSize.minSize.height)) {
                minWidth = newSize.minSize.width;
                minHeight = newSize.minSize.height;
                maxWidth = minWidth;
                maxHeight = minHeight;
            }
            else if (ss.isValue(newSize.maxSize) && ss.isValue(newSize.maxSize.width) && ss.isValue(newSize.maxSize.height)) {
                maxWidth = newSize.maxSize.width;
                maxHeight = newSize.maxSize.height;
                minWidth = maxWidth;
                minHeight = maxHeight;
            }
            dict['api.minWidth'] = minWidth;
            dict['api.minHeight'] = minHeight;
            dict['api.maxWidth'] = maxWidth;
            dict['api.maxHeight'] = maxHeight;
            fixedSheetSize = tab.$create_SheetSize('exactly', tab.$create_Size(minWidth, minHeight), tab.$create_Size(maxWidth, maxHeight));
        }
        this._size = fixedSheetSize;
        return dict;
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._tableauException

tab._tableauException = function tab__tableauException() {
}
tab._tableauException._create = function tab__tableauException$_create(id, message) {
    var x = new Error(message);
    x.tableauSoftwareErrorCode = id;
    return x;
}
tab._tableauException._createInternalError = function tab__tableauException$_createInternalError(details) {
    if (ss.isValue(details)) {
        return tab._tableauException._create('internalError', 'Internal error. Please contact Tableau support with the following information: ' + details);
    }
    else {
        return tab._tableauException._create('internalError', 'Internal error. Please contact Tableau support');
    }
}
tab._tableauException._createServerError = function tab__tableauException$_createServerError(message) {
    return tab._tableauException._create('serverError', message);
}
tab._tableauException._createNotActiveSheet = function tab__tableauException$_createNotActiveSheet() {
    return tab._tableauException._create('notActiveSheet', 'Operation not allowed on non-active sheet');
}
tab._tableauException._createInvalidCustomViewName = function tab__tableauException$_createInvalidCustomViewName(customViewName) {
    return tab._tableauException._create('invalidCustomViewName', 'Invalid custom view name: ' + customViewName);
}
tab._tableauException._createInvalidParameter = function tab__tableauException$_createInvalidParameter(paramName) {
    return tab._tableauException._create('invalidParameter', 'Invalid parameter: ' + paramName);
}
tab._tableauException._createInvalidFilterFieldNameOrValue = function tab__tableauException$_createInvalidFilterFieldNameOrValue(fieldName) {
    return tab._tableauException._create('invalidFilterFieldNameOrValue', 'Invalid filter field name or value: ' + fieldName);
}
tab._tableauException._createInvalidDateParameter = function tab__tableauException$_createInvalidDateParameter(paramName) {
    return tab._tableauException._create('invalidDateParameter', 'Invalid date parameter: ' + paramName);
}
tab._tableauException._createNullOrEmptyParameter = function tab__tableauException$_createNullOrEmptyParameter(paramName) {
    return tab._tableauException._create('nullOrEmptyParameter', 'Parameter cannot be null or empty: ' + paramName);
}
tab._tableauException._createMissingMaxSize = function tab__tableauException$_createMissingMaxSize() {
    return tab._tableauException._create('missingMaxSize', 'Missing maxSize for SheetSizeBehavior.ATMOST');
}
tab._tableauException._createMissingMinSize = function tab__tableauException$_createMissingMinSize() {
    return tab._tableauException._create('missingMinSize', 'Missing minSize for SheetSizeBehavior.ATLEAST');
}
tab._tableauException._createMissingMinMaxSize = function tab__tableauException$_createMissingMinMaxSize() {
    return tab._tableauException._create('missingMinMaxSize', 'Missing minSize or maxSize for SheetSizeBehavior.RANGE');
}
tab._tableauException._createInvalidRangeSize = function tab__tableauException$_createInvalidRangeSize() {
    return tab._tableauException._create('invalidSize', 'Missing minSize or maxSize for SheetSizeBehavior.RANGE');
}
tab._tableauException._createInvalidSizeValue = function tab__tableauException$_createInvalidSizeValue() {
    return tab._tableauException._create('invalidSize', 'Size value cannot be less than zero');
}
tab._tableauException._createInvalidSheetSizeParam = function tab__tableauException$_createInvalidSheetSizeParam() {
    return tab._tableauException._create('invalidSize', 'Invalid sheet size parameter');
}
tab._tableauException._createSizeConflictForExactly = function tab__tableauException$_createSizeConflictForExactly() {
    return tab._tableauException._create('invalidSize', 'Conflicting size values for SheetSizeBehavior.EXACTLY');
}
tab._tableauException._createInvalidSizeBehaviorOoWorksheet = function tab__tableauException$_createInvalidSizeBehaviorOoWorksheet() {
    return tab._tableauException._create('invalidSizeBehaviorOnWorksheet', 'Only SheetSizeBehavior.AUTOMATIC is allowed on Worksheets');
}
tab._tableauException._createNoUrlForHiddenWorksheet = function tab__tableauException$_createNoUrlForHiddenWorksheet() {
    return tab._tableauException._create('noUrlForHiddenWorksheet', 'Hidden worksheets do not have a URL.');
}


////////////////////////////////////////////////////////////////////////////////
// tab._Utility

tab._Utility = function tab__Utility() {
}
tab._Utility.hasOwnProperty = function tab__Utility$hasOwnProperty(obj, field) {
    return obj.hasOwnProperty(field);
}
tab._Utility.isNullOrEmpty = function tab__Utility$isNullOrEmpty(obj) {
    return ss.isNullOrUndefined(obj) || (obj['length'] || 0) <= 0;
}
tab._Utility.isString = function tab__Utility$isString(obj) {
    return typeof(obj) === 'string';
}
tab._Utility.isNumber = function tab__Utility$isNumber(obj) {
    return typeof(obj) === 'number';
}
tab._Utility.isDate = function tab__Utility$isDate(obj) {
    if (typeof(obj) === 'object' && (obj instanceof Date)) {
        return true;
    }
    else if (Object.prototype.toString.call(obj) !== '[object Date]') {
        return false;
    }
    return !isNaN((obj).getTime());
}
tab._Utility.isDateValid = function tab__Utility$isDateValid(dt) {
    return !isNaN(dt.getTime());
}
tab._Utility.indexOf = function tab__Utility$indexOf(array, searchElement, fromIndex) {
    if (ss.isValue((Array).prototype['indexOf'])) {
        return array.indexOf(searchElement, fromIndex);
    }
    fromIndex = (fromIndex || 0);
    var length = array.length;
    if (length > 0) {
        for (var index = fromIndex; index < length; index++) {
            if (array[index] === searchElement) {
                return index;
            }
        }
    }
    return -1;
}
tab._Utility.contains = function tab__Utility$contains(array, searchElement, fromIndex) {
    var index = tab._Utility.indexOf(array, searchElement, fromIndex);
    return index >= 0;
}
tab._Utility.getTopmostWindow = function tab__Utility$getTopmostWindow() {
    var win = window.self;
    while (ss.isValue(win.parent) && win.parent !== win) {
        win = win.parent;
    }
    return win;
}
tab._Utility.toInt = function tab__Utility$toInt(value) {
    if (tab._Utility.isNumber(value)) {
        return value;
    }
    return parseInt(value.toString(), 10);
}
tab._Utility.toBoolean = function tab__Utility$toBoolean(value, defaultIfMissing) {
    var positiveRegex = new RegExp('^(yes|y|true|t|1)$', 'i');
    if (tab._Utility.isNullOrEmpty(value)) {
        return defaultIfMissing;
    }
    var match = value.match(positiveRegex);
    return !tab._Utility.isNullOrEmpty(match);
}
tab._Utility.hasClass = function tab__Utility$hasClass(element, className) {
    var regexClass = new RegExp('[\\n\\t\\r]', 'g');
    return ss.isValue(element) && (' ' + element.className + ' ').replace(regexClass, ' ').indexOf(' ' + className + ' ') > -1;
}
tab._Utility.findParentWithClassName = function tab__Utility$findParentWithClassName(element, className, stopAtElement) {
    var parent = (ss.isValue(element)) ? element.parentNode : null;
    stopAtElement = (stopAtElement || document.body);
    while (parent != null) {
        if (tab._Utility.hasClass(parent, className)) {
            return parent;
        }
        if (parent === stopAtElement) {
            parent = null;
        }
        else {
            parent = parent.parentNode;
        }
    }
    return parent;
}
tab._Utility.hasJsonParse = function tab__Utility$hasJsonParse() {
    return ss.isValue(window.JSON) && ss.isValue(window.JSON.parse);
}
tab._Utility.hasWindowPostMessage = function tab__Utility$hasWindowPostMessage() {
    return ss.isValue(window.postMessage);
}
tab._Utility.isPostMessageSynchronous = function tab__Utility$isPostMessageSynchronous() {
    if (tab._Utility.isIE()) {
        var msieRegEx = new RegExp('(msie) ([\\w.]+)');
        var matches = msieRegEx.exec(window.navigator.userAgent.toLowerCase());
        var versionStr = (matches[2] || '0');
        var version = parseInt(versionStr, 10);
        return version <= 8;
    }
    return false;
}
tab._Utility.hasDocumentAttachEvent = function tab__Utility$hasDocumentAttachEvent() {
    return ss.isValue(document.attachEvent);
}
tab._Utility.hasWindowAddEventListener = function tab__Utility$hasWindowAddEventListener() {
    return ss.isValue(window.addEventListener);
}
tab._Utility.isElementOfTag = function tab__Utility$isElementOfTag(element, tagName) {
    return ss.isValue(element) && element.nodeType === 1 && element.tagName.toLowerCase() === tagName.toLowerCase();
}
tab._Utility.elementToString = function tab__Utility$elementToString(element) {
    var str = new ss.StringBuilder();
    str.append(element.tagName.toLowerCase());
    if (!tab._Utility.isNullOrEmpty(element.id)) {
        str.append('#').append(element.id);
    }
    if (!tab._Utility.isNullOrEmpty(element.className)) {
        var classes = element.className.split(' ');
        str.append('.').append(classes.join('.'));
    }
    return str.toString();
}
tab._Utility.tableauGCS = function tab__Utility$tableauGCS(e) {
    if (ss.isValue(window.getComputedStyle)) {
        return window.getComputedStyle(e);
    }
    else {
        return e.currentStyle;
    }
}
tab._Utility.isIE = function tab__Utility$isIE() {
    return window.navigator.userAgent.indexOf('MSIE') > -1 && ss.isNullOrUndefined(window.opera);
}
tab._Utility.mobileDetect = function tab__Utility$mobileDetect() {
    var ua = window.navigator.userAgent;
    if (ua.indexOf('iPad') !== -1) {
        return true;
    }
    if (ua.indexOf('Android') !== -1) {
        return true;
    }
    if ((ua.indexOf('AppleWebKit') !== -1) && (ua.indexOf('Mobile') !== -1)) {
        return true;
    }
    return false;
}
tab._Utility.elementPosition = function tab__Utility$elementPosition(el) {
    var x = 0;
    var y = 0;
    while (!ss.isNullOrUndefined(el)) {
        y += el.offsetTop;
        x += el.offsetLeft;
        el = el.offsetParent;
    }
    return tab.$create_Point(x, y);
}
tab._Utility.convertRawValue = function tab__Utility$convertRawValue(rawValue, dataType) {
    if (dataType === 'boolean') {
        return rawValue;
    }
    if (ss.isNullOrUndefined(rawValue)) {
        return null;
    }
    switch (dataType) {
        case 'date':
        case 'datetime':
            return new Date(rawValue);
        case 'integer':
        case 'real':
            if (rawValue == null) {
                return Number.NaN;
            }
            return rawValue;
        case 'cstring':
        case 'tuple':
        case 'unknown':
        default:
            return rawValue;
    }
}
tab._Utility.getDataValue = function tab__Utility$getDataValue(dv) {
    if (ss.isNullOrUndefined(dv)) {
        return tab.$create_DataValue(null, null, null);
    }
    return tab.$create_DataValue(tab._Utility.convertRawValue(dv.value, dv.type), dv.formattedValue, dv.aliasedValue);
}


////////////////////////////////////////////////////////////////////////////////
// tab._VizImpl

tab._VizImpl = function tab__VizImpl(viz, parentElement, url, options) {
    if (!tab._Utility.hasWindowPostMessage() || !tab._Utility.hasJsonParse()) {
        throw tab._tableauException._create('browserNotCapable', 'This browser is incapable of supporting the Tableau JavaScript API.');
    }
    this._viz = viz;
    if (ss.isNullOrUndefined(parentElement) || parentElement.nodeType !== 1) {
        parentElement = document.body;
    }
    this._parameters = new tab._VizParameters(parentElement, url, options);
    this._baseUrl = this._parameters.get_url();
    this._clientUrl = this._baseUrl;
    if (ss.isValue(options)) {
        this._onFirstInteractiveCallback = options.onFirstInteractive;
    }
}
tab._VizImpl.prototype = {
    _workbookTabSwitchHandler: null,
    _viz: null,
    _iframe: null,
    _clientUrl: null,
    _parameters: null,
    _baseUrl: null,
    _loadFeedback: null,
    _handlerId: null,
    _workbookImpl: null,
    _onFirstInteractiveCallback: null,
    _areTabsHidden: false,
    _isToolbarHidden: false,
    _areAutomaticUpdatesPaused: false,
    
    add_customViewsListLoad: function tab__VizImpl$add_customViewsListLoad(value) {
        this.__customViewsListLoad = ss.Delegate.combine(this.__customViewsListLoad, value);
    },
    remove_customViewsListLoad: function tab__VizImpl$remove_customViewsListLoad(value) {
        this.__customViewsListLoad = ss.Delegate.remove(this.__customViewsListLoad, value);
    },
    
    __customViewsListLoad: null,
    
    add_stateReadyForQuery: function tab__VizImpl$add_stateReadyForQuery(value) {
        this.__stateReadyForQuery = ss.Delegate.combine(this.__stateReadyForQuery, value);
    },
    remove_stateReadyForQuery: function tab__VizImpl$remove_stateReadyForQuery(value) {
        this.__stateReadyForQuery = ss.Delegate.remove(this.__stateReadyForQuery, value);
    },
    
    __stateReadyForQuery: null,
    
    add__onMarksSelection: function tab__VizImpl$add__onMarksSelection(value) {
        this.__onMarksSelection = ss.Delegate.combine(this.__onMarksSelection, value);
    },
    remove__onMarksSelection: function tab__VizImpl$remove__onMarksSelection(value) {
        this.__onMarksSelection = ss.Delegate.remove(this.__onMarksSelection, value);
    },
    
    __onMarksSelection: null,
    
    add__onFilterChange: function tab__VizImpl$add__onFilterChange(value) {
        this.__onFilterChange = ss.Delegate.combine(this.__onFilterChange, value);
    },
    remove__onFilterChange: function tab__VizImpl$remove__onFilterChange(value) {
        this.__onFilterChange = ss.Delegate.remove(this.__onFilterChange, value);
    },
    
    __onFilterChange: null,
    
    add__onParameterValueChange: function tab__VizImpl$add__onParameterValueChange(value) {
        this.__onParameterValueChange = ss.Delegate.combine(this.__onParameterValueChange, value);
    },
    remove__onParameterValueChange: function tab__VizImpl$remove__onParameterValueChange(value) {
        this.__onParameterValueChange = ss.Delegate.remove(this.__onParameterValueChange, value);
    },
    
    __onParameterValueChange: null,
    
    add__onCustomViewLoad: function tab__VizImpl$add__onCustomViewLoad(value) {
        this.__onCustomViewLoad = ss.Delegate.combine(this.__onCustomViewLoad, value);
    },
    remove__onCustomViewLoad: function tab__VizImpl$remove__onCustomViewLoad(value) {
        this.__onCustomViewLoad = ss.Delegate.remove(this.__onCustomViewLoad, value);
    },
    
    __onCustomViewLoad: null,
    
    add__onCustomViewSave: function tab__VizImpl$add__onCustomViewSave(value) {
        this.__onCustomViewSave = ss.Delegate.combine(this.__onCustomViewSave, value);
    },
    remove__onCustomViewSave: function tab__VizImpl$remove__onCustomViewSave(value) {
        this.__onCustomViewSave = ss.Delegate.remove(this.__onCustomViewSave, value);
    },
    
    __onCustomViewSave: null,
    
    add__onCustomViewRemove: function tab__VizImpl$add__onCustomViewRemove(value) {
        this.__onCustomViewRemove = ss.Delegate.combine(this.__onCustomViewRemove, value);
    },
    remove__onCustomViewRemove: function tab__VizImpl$remove__onCustomViewRemove(value) {
        this.__onCustomViewRemove = ss.Delegate.remove(this.__onCustomViewRemove, value);
    },
    
    __onCustomViewRemove: null,
    
    add__onCustomViewSetDefault: function tab__VizImpl$add__onCustomViewSetDefault(value) {
        this.__onCustomViewSetDefault = ss.Delegate.combine(this.__onCustomViewSetDefault, value);
    },
    remove__onCustomViewSetDefault: function tab__VizImpl$remove__onCustomViewSetDefault(value) {
        this.__onCustomViewSetDefault = ss.Delegate.remove(this.__onCustomViewSetDefault, value);
    },
    
    __onCustomViewSetDefault: null,
    
    add__onTabSwitch: function tab__VizImpl$add__onTabSwitch(value) {
        this.__onTabSwitch = ss.Delegate.combine(this.__onTabSwitch, value);
    },
    remove__onTabSwitch: function tab__VizImpl$remove__onTabSwitch(value) {
        this.__onTabSwitch = ss.Delegate.remove(this.__onTabSwitch, value);
    },
    
    __onTabSwitch: null,
    
    get_handlerId: function tab__VizImpl$get_handlerId() {
        return this._handlerId;
    },
    set_handlerId: function tab__VizImpl$set_handlerId(value) {
        this._handlerId = value;
        return value;
    },
    
    get_iframe: function tab__VizImpl$get_iframe() {
        return this._iframe;
    },
    
    get_serverRoot: function tab__VizImpl$get_serverRoot() {
        return this._parameters.serverRoot;
    },
    
    get__viz: function tab__VizImpl$get__viz() {
        return this._viz;
    },
    
    get__areTabsHidden: function tab__VizImpl$get__areTabsHidden() {
        return this._areTabsHidden;
    },
    
    get__isToolbarHidden: function tab__VizImpl$get__isToolbarHidden() {
        return this._isToolbarHidden;
    },
    
    get__isHidden: function tab__VizImpl$get__isHidden() {
        return this._iframe.style.display === 'none';
    },
    
    get__parentElement: function tab__VizImpl$get__parentElement() {
        return this._parameters.parentElement;
    },
    
    get__clientUrl: function tab__VizImpl$get__clientUrl() {
        return this._clientUrl;
    },
    set__clientUrl: function tab__VizImpl$set__clientUrl(value) {
        this._clientUrl = value;
        return value;
    },
    
    get__url: function tab__VizImpl$get__url() {
        return this._baseUrl;
    },
    
    get__workbook: function tab__VizImpl$get__workbook() {
        return this._workbookImpl.get__workbook();
    },
    
    get__workbookImpl: function tab__VizImpl$get__workbookImpl() {
        return this._workbookImpl;
    },
    
    get__areAutomaticUpdatesPaused: function tab__VizImpl$get__areAutomaticUpdatesPaused() {
        return this._areAutomaticUpdatesPaused;
    },
    
    hideLoadIndicators: function tab__VizImpl$hideLoadIndicators() {
        if (ss.isValue(this._loadFeedback)) {
            this._loadFeedback._dispose();
            this._loadFeedback = null;
            delete this.loadFeedback;
        }
    },
    
    handleVizLoad: function tab__VizImpl$handleVizLoad() {
        this.hideLoadIndicators();
        this._sendVizOffset();
        if (ss.isNullOrUndefined(this._workbookImpl)) {
            this._workbookImpl = new tab._WorkbookImpl(this, ss.Delegate.create(this, function() {
                this._onWorkbookInteractive();
            }));
        }
        else {
            this._workbookImpl._update(ss.Delegate.create(this, function() {
                this._onWorkbookInteractive();
            }));
        }
    },
    
    handleEventNotification: function tab__VizImpl$handleEventNotification(eventName, eventParameters) {
        var notif = new tab._apiServerNotificationParser(eventParameters);
        if (eventName === 'api.VizInteractiveEvent') {
            if (this._onFirstInteractiveCallback != null) {
                if (ss.isValue(this._workbookImpl) && this._workbookImpl.get__name() === notif.get__workbookName()) {
                    this._onWorkbookInteractive();
                }
            }
            this._raiseStateReadyForQuery();
        }
        else if (eventName === 'api.MarksSelectionChangedEvent') {
            if (this.__onMarksSelection != null) {
                if (this._workbookImpl.get__name() === notif.get__workbookName()) {
                    var worksheetImpl = null;
                    var activeSheetImpl = this._workbookImpl.get__activeSheetImpl();
                    if (activeSheetImpl.get__name() === notif.get__worksheetName()) {
                        worksheetImpl = activeSheetImpl;
                    }
                    else if (activeSheetImpl.get__isDashboard()) {
                        var db = activeSheetImpl;
                        worksheetImpl = db.get__worksheets()._get(notif.get__worksheetName())._impl;
                    }
                    if (ss.isValue(worksheetImpl)) {
                        worksheetImpl.set__selectedMarks(null);
                        this.__onMarksSelection(new tab.MarksEvent('marksselection', this._viz, worksheetImpl));
                    }
                }
            }
        }
        else if (eventName === 'api.FilterChangedEvent') {
            if (this.__onFilterChange != null) {
                if (this._workbookImpl.get__name() === notif.get__workbookName()) {
                    var worksheetImpl = null;
                    var activeSheetImpl = this._workbookImpl.get__activeSheetImpl();
                    if (activeSheetImpl.get__name() === notif.get__worksheetName()) {
                        worksheetImpl = activeSheetImpl;
                    }
                    else if (activeSheetImpl.get__isDashboard()) {
                        var db = activeSheetImpl;
                        worksheetImpl = db.get__worksheets()._get(notif.get__worksheetName())._impl;
                    }
                    if (ss.isValue(worksheetImpl)) {
                        var results = JSON.parse(notif.get__data());
                        var filterFieldName = results[0];
                        var filterCaption = results[1];
                        this.__onFilterChange(new tab.FilterEvent('filterchange', this._viz, worksheetImpl, filterFieldName, filterCaption));
                    }
                }
            }
        }
        else if (eventName === 'api.ParameterChangedEvent') {
            if (this.__onParameterValueChange != null) {
                if (this._workbookImpl.get__name() === notif.get__workbookName()) {
                    this._workbookImpl.set__lastChangedParameterImpl(null);
                    var parameterName = notif.get__data();
                    this._raiseParameterValueChange(parameterName);
                }
            }
        }
        else if (eventName === 'api.CustomViewsListLoadedEvent') {
            var cvlistJson = notif.get__data();
            var dict = JSON.parse(cvlistJson);
            if (ss.isNullOrUndefined(this._workbookImpl)) {
                this._workbookImpl = new tab._WorkbookImpl(this, ss.Delegate.create(this, function() {
                    this._onWorkbookInteractive();
                }));
            }
            if (ss.isValue(this._workbookImpl)) {
                tab._CustomViewImpl._processCustomViews(this._workbookImpl, dict);
            }
            this._raiseCustomViewsListLoad();
            if (this.__onCustomViewLoad != null && !dict['customViewLoaded']) {
                this._raiseCustomViewLoad(this._workbookImpl.get__activeCustomView());
            }
        }
        else if (eventName === 'api.CustomViewUpdatedEvent') {
            var cvlistJson = notif.get__data();
            var dict = JSON.parse(cvlistJson);
            if (ss.isNullOrUndefined(this._workbookImpl)) {
                this._workbookImpl = new tab._WorkbookImpl(this, ss.Delegate.create(this, function() {
                    this._onWorkbookInteractive();
                }));
            }
            if (ss.isValue(this._workbookImpl)) {
                tab._CustomViewImpl._processCustomViewUpdate(this._workbookImpl, dict, true);
            }
            if (this.__onCustomViewSave != null) {
                var updated = this._workbookImpl.get__updatedCustomViews()._toApiCollection();
                for (var i = 0, len = updated.length; i < len; i++) {
                    this._raiseCustomViewSave(updated[i]);
                }
            }
        }
        else if (eventName === 'api.CustomViewRemovedEvent') {
            if (this.__onCustomViewRemove != null) {
                var removed = this._workbookImpl.get__removedCustomViews()._toApiCollection();
                for (var i = 0, len = removed.length; i < len; i++) {
                    this._raiseCustomViewRemove(removed[i]);
                }
            }
        }
        else if (eventName === 'api.CustomViewSetDefaultEvent') {
            var cvlistJson = notif.get__data();
            var dict = JSON.parse(cvlistJson);
            if (ss.isValue(this._workbookImpl)) {
                tab._CustomViewImpl._processCustomViews(this._workbookImpl, dict);
            }
            if (this.__onCustomViewSetDefault != null) {
                var updated = this._workbookImpl.get__updatedCustomViews()._toApiCollection();
                for (var i = 0, len = updated.length; i < len; i++) {
                    this._raiseCustomViewSetDefault(updated[i]);
                }
            }
        }
        else if (eventName === 'api.TabSwitchEvent') {
            this._workbookImpl._update(ss.Delegate.create(this, function() {
                if (ss.isValue(this._workbookTabSwitchHandler)) {
                    this._workbookTabSwitchHandler();
                }
                if (this.__onTabSwitch != null) {
                    if (this._workbookImpl.get__name() === notif.get__workbookName()) {
                        var oldSheetName = notif.get__worksheetName();
                        var currSheetName = notif.get__data();
                        this._raiseTabSwitch(oldSheetName, currSheetName);
                    }
                }
                this._onWorkbookInteractive();
            }));
        }
    },
    
    _addEventListener: function tab__VizImpl$_addEventListener(eventName, handler) {
        eventName = tab._enums._normalizeTableauEventName(eventName);
        if (eventName === 'marksselection') {
            this.add__onMarksSelection(handler);
        }
        else if (eventName === 'parametervaluechange') {
            this.add__onParameterValueChange(handler);
        }
        else if (eventName === 'filterchange') {
            this.add__onFilterChange(handler);
        }
        else if (eventName === 'customviewload') {
            this.add__onCustomViewLoad(handler);
        }
        else if (eventName === 'customviewsave') {
            this.add__onCustomViewSave(handler);
        }
        else if (eventName === 'customviewremove') {
            this.add__onCustomViewRemove(handler);
        }
        else if (eventName === 'customviewsetdefault') {
            this.add__onCustomViewSetDefault(handler);
        }
        else if (eventName === 'tabswitch') {
            this.add__onTabSwitch(handler);
        }
        else {
            throw tab._tableauException._create('unsupportedEventName', "Unsupported event '" + eventName + "'");
        }
    },
    
    _removeEventListener: function tab__VizImpl$_removeEventListener(eventName, handler) {
        eventName = tab._enums._normalizeTableauEventName(eventName);
        if (eventName === 'marksselection') {
            this.remove__onMarksSelection(handler);
        }
        else if (eventName === 'parametervaluechange') {
            this.remove__onParameterValueChange(handler);
        }
        else if (eventName === 'filterchange') {
            this.remove__onFilterChange(handler);
        }
        else if (eventName === 'customviewload') {
            this.remove__onCustomViewLoad(handler);
        }
        else if (eventName === 'customviewsave') {
            this.remove__onCustomViewSave(handler);
        }
        else if (eventName === 'customviewremove') {
            this.remove__onCustomViewRemove(handler);
        }
        else if (eventName === 'customviewsetdefault') {
            this.remove__onCustomViewSetDefault(handler);
        }
        else if (eventName === 'tabswitch') {
            this.remove__onTabSwitch(handler);
        }
        else {
            throw tab._tableauException._create('unsupportedEventName', 'Unsupported event name');
        }
    },
    
    _dispose: function tab__VizImpl$_dispose() {
        var contentElement = this._parameters._contentRootElement;
        if (ss.isValue(contentElement)) {
            contentElement.innerHTML = '';
            contentElement.parentNode.removeChild(contentElement);
            this._parameters._contentRootElement = contentElement = null;
        }
        tab._VizManagerImpl._unregisterViz(this._viz);
        tab._CrossDomainMessageRouter._unregisterHandler(this);
    },
    
    _show: function tab__VizImpl$_show() {
        this._iframe.style.display = 'block';
    },
    
    _hide: function tab__VizImpl$_hide() {
        this._iframe.style.display = 'none';
    },
    
    _showExportImageDialog: function tab__VizImpl$_showExportImageDialog() {
        this._invokeCommand('showExportImageDialog');
    },
    
    _showExportDataDialog: function tab__VizImpl$_showExportDataDialog(sheetOrInfoOrName) {
        var sheetName = this._verifyOperationAllowedOnActiveSheetOrSheetWithinActiveDashboard(sheetOrInfoOrName);
        this._invokeCommand('showExportDataDialog', sheetName);
    },
    
    _showExportCrossTabDialog: function tab__VizImpl$_showExportCrossTabDialog(sheetOrInfoOrName) {
        var sheetName = this._verifyOperationAllowedOnActiveSheetOrSheetWithinActiveDashboard(sheetOrInfoOrName);
        this._invokeCommand('showExportCrosstabDialog', sheetName);
    },
    
    _showExportPDFDialog: function tab__VizImpl$_showExportPDFDialog() {
        this._invokeCommand('showExportPDFDialog');
    },
    
    _revertAllAsync: function tab__VizImpl$_revertAllAsync() {
        var deferred = new tab._Deferred();
        var returnHandler = new tab._CommandReturnHandler('api.RevertAllCommand', 1, function(result) {
            deferred.resolve();
        }, function(remoteError, message) {
            deferred.reject(tab._tableauException._createServerError(message));
        });
        this._sendCommand(null, returnHandler);
        return deferred.get_promise();
    },
    
    _refreshDataAsync: function tab__VizImpl$_refreshDataAsync() {
        var deferred = new tab._Deferred();
        var returnHandler = new tab._CommandReturnHandler('api.RefreshDataCommand', 1, function(result) {
            deferred.resolve();
        }, function(remoteError, message) {
            deferred.reject(tab._tableauException._createServerError(message));
        });
        this._sendCommand(null, returnHandler);
        return deferred.get_promise();
    },
    
    _showShareDialog: function tab__VizImpl$_showShareDialog() {
        this._invokeCommand('showShareDialog');
    },
    
    _showDownloadWorkbookDialog: function tab__VizImpl$_showDownloadWorkbookDialog() {
        if (this.get__workbookImpl().get__isDownloadAllowed()) {
            this._invokeCommand('showDownloadWorkbookDialog');
        }
        else {
            throw tab._tableauException._create('downloadWorkbookNotAllowed', 'Download workbook is not allowed');
        }
    },
    
    _pauseAutomaticUpdatesAsync: function tab__VizImpl$_pauseAutomaticUpdatesAsync() {
        return this._invokeAutomaticUpdatesCommandAsync('pauseAutomaticUpdates');
    },
    
    _resumeAutomaticUpdatesAsync: function tab__VizImpl$_resumeAutomaticUpdatesAsync() {
        return this._invokeAutomaticUpdatesCommandAsync('resumeAutomaticUpdates');
    },
    
    _toggleAutomaticUpdatesAsync: function tab__VizImpl$_toggleAutomaticUpdatesAsync() {
        return this._invokeAutomaticUpdatesCommandAsync('toggleAutomaticUpdates');
    },
    
    _setFrameSize: function tab__VizImpl$_setFrameSize(width, height) {
        this._parameters.width = width;
        this._parameters.height = height;
        this._iframe.style.width = this._parameters.width;
        this._iframe.style.height = this._parameters.height;
        this._workbookImpl._updateActiveSheetAsync();
    },
    
    _setAreAutomaticUpdatesPaused: function tab__VizImpl$_setAreAutomaticUpdatesPaused(value) {
        this._areAutomaticUpdatesPaused = value;
    },
    
    _contentRootElement: function tab__VizImpl$_contentRootElement() {
        return this._parameters._contentRootElement;
    },
    
    _create: function tab__VizImpl$_create() {
        try {
            tab._VizManagerImpl._registerViz(this._viz);
        }
        catch (e) {
            this._dispose();
            throw e;
        }
        this._loadFeedback = new tab._loadFeedback();
        this._loadFeedback._createLoadingFeedback(this._parameters);
        this._iframe = this._createIframe();
        this._loadFeedback._show();
        this._show();
        if (!tab._Utility.hasWindowPostMessage()) {
            if (tab._Utility.isIE()) {
                this._iframe.onreadystatechange = this._getOnCheckForDoneDelegate();
            }
            else {
                this._iframe.onload = this._getOnCheckForDoneDelegate();
            }
        }
        this._isToolbarHidden = !this._parameters.toolbar;
        this._areTabsHidden = !this._parameters.tabs;
        tab._CrossDomainMessageRouter._registerHandler(this);
        this._setIframeSrc(9999);
    },
    
    _sendVizOffset: function tab__VizImpl$_sendVizOffset() {
        if (!tab._Utility.hasWindowPostMessage() || ss.isNullOrUndefined(this._iframe) || !ss.isValue(this._iframe.contentWindow)) {
            return;
        }
        var pos = tab._Utility.elementPosition(this._iframe);
        var param = [];
        param.push('vizOffsetResp');
        param.push(pos.x);
        param.push(pos.y);
        this._iframe.contentWindow.postMessage(param.join(','), '*');
    },
    
    _sendCommand: function tab__VizImpl$_sendCommand(commandParameters, returnHandler) {
        tab._CrossDomainMessageRouter._sendCommand(this, commandParameters, returnHandler);
    },
    
    _raiseParameterValueChange: function tab__VizImpl$_raiseParameterValueChange(parameterName) {
        if (this.__onParameterValueChange != null) {
            this.__onParameterValueChange(new tab.ParameterEvent('parametervaluechange', this._viz, parameterName));
        }
    },
    
    _raiseCustomViewLoad: function tab__VizImpl$_raiseCustomViewLoad(customView) {
        if (this.__onCustomViewLoad != null) {
            this.__onCustomViewLoad(new tab.CustomViewEvent('customviewload', this._viz, (ss.isValue(customView)) ? customView._impl : null));
        }
    },
    
    _raiseCustomViewSave: function tab__VizImpl$_raiseCustomViewSave(customView) {
        if (this.__onCustomViewSave != null) {
            this.__onCustomViewSave(new tab.CustomViewEvent('customviewsave', this._viz, customView._impl));
        }
    },
    
    _raiseCustomViewRemove: function tab__VizImpl$_raiseCustomViewRemove(customView) {
        if (this.__onCustomViewRemove != null) {
            this.__onCustomViewRemove(new tab.CustomViewEvent('customviewremove', this._viz, customView._impl));
        }
    },
    
    _raiseCustomViewSetDefault: function tab__VizImpl$_raiseCustomViewSetDefault(customView) {
        if (this.__onCustomViewSetDefault != null) {
            this.__onCustomViewSetDefault(new tab.CustomViewEvent('customviewsetdefault', this._viz, customView._impl));
        }
    },
    
    _raiseTabSwitch: function tab__VizImpl$_raiseTabSwitch(oldSheetName, newSheetName) {
        if (this.__onTabSwitch != null) {
            this.__onTabSwitch(new tab.TabSwitchEvent('tabswitch', this._viz, oldSheetName, newSheetName));
        }
    },
    
    _raiseStateReadyForQuery: function tab__VizImpl$_raiseStateReadyForQuery() {
        if (this.__stateReadyForQuery != null) {
            this.__stateReadyForQuery(this);
        }
    },
    
    _raiseCustomViewsListLoad: function tab__VizImpl$_raiseCustomViewsListLoad() {
        if (this.__customViewsListLoad != null) {
            this.__customViewsListLoad(this);
        }
    },
    
    _verifyOperationAllowedOnActiveSheetOrSheetWithinActiveDashboard: function tab__VizImpl$_verifyOperationAllowedOnActiveSheetOrSheetWithinActiveDashboard(sheetOrInfoOrName) {
        if (ss.isNullOrUndefined(sheetOrInfoOrName)) {
            return null;
        }
        var sheetImpl = this._workbookImpl._findActiveSheetOrSheetWithinActiveDashboard(sheetOrInfoOrName);
        if (ss.isNullOrUndefined(sheetImpl)) {
            throw tab._tableauException._createNotActiveSheet();
        }
        return sheetImpl.get__name();
    },
    
    _invokeAutomaticUpdatesCommandAsync: function tab__VizImpl$_invokeAutomaticUpdatesCommandAsync(command) {
        if (command !== 'pauseAutomaticUpdates' && command !== 'resumeAutomaticUpdates' && command !== 'toggleAutomaticUpdates') {
            throw tab._tableauException._createInternalError(null);
        }
        var param = {};
        param['api.invokeCommandName'] = command;
        var deferred = new tab._Deferred();
        var returnHandler = new tab._CommandReturnHandler('api.InvokeCommandCommand', 0, ss.Delegate.create(this, function(result) {
            var dict = result;
            if (ss.isValue(dict['isAutoUpdate'])) {
                this._areAutomaticUpdatesPaused = !dict['isAutoUpdate'];
            }
            deferred.resolve(this._areAutomaticUpdatesPaused);
        }), function(remoteError, message) {
            deferred.reject(tab._tableauException._createServerError(message));
        });
        this._sendCommand(param, returnHandler);
        return deferred.get_promise();
    },
    
    _setIframeSrc: function tab__VizImpl$_setIframeSrc(loadOrder) {
        var loadOrderOpt = '&:loadOrderID=' + loadOrder.toString();
        var apiIdOpt = '&:apiID=' + this._handlerId;
        this._iframe.src = this._baseUrl + loadOrderOpt + apiIdOpt;
    },
    
    _invokeCommand: function tab__VizImpl$_invokeCommand(command, sheetName) {
        if (command !== 'showExportImageDialog' && command !== 'showExportDataDialog' && command !== 'showExportCrosstabDialog' && command !== 'showExportPDFDialog' && command !== 'showShareDialog' && command !== 'showDownloadWorkbookDialog') {
            throw tab._tableauException._createInternalError(null);
        }
        var param = {};
        param['api.invokeCommandName'] = command;
        if (ss.isValue(sheetName)) {
            param['api.invokeCommandParam'] = sheetName;
        }
        var returnHandler = new tab._CommandReturnHandler('api.InvokeCommandCommand', 0, null, null);
        this._sendCommand(param, returnHandler);
    },
    
    _onWorkbookInteractive: function tab__VizImpl$_onWorkbookInteractive() {
        if (ss.isValue(this._onFirstInteractiveCallback)) {
            this._onFirstInteractiveCallback(new tab.TableauEvent('firstinteractive', this._viz));
            this._onFirstInteractiveCallback = null;
        }
    },
    
    _checkForDone: function tab__VizImpl$_checkForDone() {
        if (tab._Utility.isIE()) {
            if (this._iframe.readyState === 'complete') {
                this.handleVizLoad();
            }
        }
        else {
            this.handleVizLoad();
        }
    },
    
    _onCheckForDone: function tab__VizImpl$_onCheckForDone() {
        window.setTimeout(ss.Delegate.create(this, this._checkForDone), 3000);
    },
    
    _createIframe: function tab__VizImpl$_createIframe() {
        if (ss.isNullOrUndefined(this._contentRootElement())) {
            return null;
        }
        var ifr = document.createElement('IFrame');
        ifr.frameBorder = '0';
        ifr.setAttribute('allowTransparency', 'true');
        ifr.marginHeight = '0';
        ifr.marginWidth = '0';
        var widthString = this._parameters.width;
        var heightString = this._parameters.height;
        if (tab._Utility.isNumber(widthString)) {
            widthString = widthString + 'px';
        }
        if (tab._Utility.isNumber(heightString)) {
            heightString = heightString + 'px';
        }
        ifr.style.width = widthString;
        ifr.style.height = heightString;
        this._contentRootElement().appendChild(ifr);
        return ifr;
    },
    
    _getOnCheckForDoneDelegate: function tab__VizImpl$_getOnCheckForDoneDelegate() {
        return ss.Delegate.create(this, function(e) {
            this._onCheckForDone();
        });
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._VizManagerImpl

tab._VizManagerImpl = function tab__VizManagerImpl() {
}
tab._VizManagerImpl.get__clonedVizs = function tab__VizManagerImpl$get__clonedVizs() {
    return tab._VizManagerImpl._vizs.concat();
}
tab._VizManagerImpl._registerViz = function tab__VizManagerImpl$_registerViz(viz) {
    tab._VizManagerImpl._verifyVizNotAlreadyParented(viz);
    tab._VizManagerImpl._vizs.push(viz);
}
tab._VizManagerImpl._unregisterViz = function tab__VizManagerImpl$_unregisterViz(viz) {
    for (var i = 0, len = tab._VizManagerImpl._vizs.length; i < len; i++) {
        if (tab._VizManagerImpl._vizs[i] === viz) {
            tab._VizManagerImpl._vizs.splice(i, 1);
            break;
        }
    }
}
tab._VizManagerImpl._verifyVizNotAlreadyParented = function tab__VizManagerImpl$_verifyVizNotAlreadyParented(viz) {
    var parent = viz.getParentElement();
    for (var i = 0, len = tab._VizManagerImpl._vizs.length; i < len; i++) {
        if (tab._VizManagerImpl._vizs[i].getParentElement() === parent) {
            var message = "Another viz is already present in element '" + tab._Utility.elementToString(parent) + "'.";
            throw tab._tableauException._create('vizAlreadyInManager', message);
        }
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._VizParameters

tab._VizParameters = function tab__VizParameters(element, url, options) {
    if (ss.isNullOrUndefined(element) || ss.isNullOrUndefined(url)) {
        throw tab._tableauException._create('noUrlOrParentElementNotFound', 'URL is empty or Parent element not found');
    }
    if (ss.isNullOrUndefined(options)) {
        options = {};
        options.width = '800px';
        options.height = '600px';
        options.hideTabs = false;
        options.hideToolbar = false;
        options.onFirstInteractive = null;
    }
    else {
        if (ss.isNullOrUndefined(options.width)) {
            options.width = '800px';
        }
        if (ss.isNullOrUndefined(options.height)) {
            options.height = '600px';
        }
    }
    var html = new ss.StringBuilder();
    html.append('<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; border: 0; padding: 0; margin: 0">');
    html.append('</div>');
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = html.toString();
    this._contentRootElement = tempDiv.firstChild;
    element.appendChild(this._contentRootElement);
    tempDiv.innerHTML = '';
    tempDiv = null;
    this.tabs = !(options.hideTabs || false);
    this.toolbar = !(options.hideToolbar || false);
    this.parentElement = element;
    this.createOptions = options;
    this.width = this.createOptions.width;
    this.height = this.createOptions.height;
    this.toolBarPosition = options.toolbarPosition;
    var urlParts = url.split('?');
    this._urlFromApi = urlParts[0];
    if (urlParts.length === 2) {
        this.userSuppliedParameters = urlParts[1];
    }
    else {
        this.userSuppliedParameters = '';
    }
    var r = new RegExp('.*?[^/:]/', '').exec(this._urlFromApi);
    if (ss.isNullOrUndefined(r) || (r[0].toLowerCase().indexOf('http://') === -1 && r[0].toLowerCase().indexOf('https://') === -1)) {
        throw tab._tableauException._create('invalidUrl', 'Invalid url');
    }
    this.host_url = r[0].toLowerCase();
    this.name = this._urlFromApi.replace(r[0], '');
    this.name = this.name.replace('views/', '');
    this.serverRoot = decodeURIComponent(this.host_url);
}
tab._VizParameters.prototype = {
    name: '',
    host_url: null,
    tabs: false,
    toolbar: false,
    toolBarPosition: null,
    width: null,
    height: null,
    serverRoot: null,
    parentElement: null,
    createOptions: null,
    userSuppliedParameters: null,
    _contentRootElement: null,
    _urlFromApi: null,
    
    get_url: function tab__VizParameters$get_url() {
        return this._constructUrl();
    },
    
    get_baseUrl: function tab__VizParameters$get_baseUrl() {
        return this._urlFromApi;
    },
    
    _constructUrl: function tab__VizParameters$_constructUrl() {
        var url = [];
        url.push(this.get_baseUrl());
        url.push('?');
        if (this.userSuppliedParameters.length > 0) {
            url.push(this.userSuppliedParameters);
            url.push('&');
        }
        url.push(':embed=y');
        if (!this.tabs) {
            url.push('&:tabs=n');
        }
        if (!this.toolbar) {
            url.push('&:toolbar=n');
        }
        else if (!ss.isNullOrUndefined(this.toolBarPosition)) {
            url.push('&:toolbar=');
            url.push(this.toolBarPosition);
        }
        var userOptions = this.createOptions;
        var $dict1 = userOptions;
        for (var $key2 in $dict1) {
            var entry = { key: $key2, value: $dict1[$key2] };
            if (entry.key !== 'embed' && entry.key !== 'height' && entry.key !== 'width' && entry.key !== 'hideTabs' && entry.key !== 'hideToolbar' && entry.key !== 'onFirstInteractive' && entry.key !== 'toolbarPosition') {
                url.push('&');
                url.push(encodeURIComponent(entry.key));
                url.push('=');
                url.push(encodeURIComponent(entry.value.toString()));
            }
        }
        return url.join('');
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._WorkbookImpl

tab._WorkbookImpl = function tab__WorkbookImpl(vizImpl, callback) {
    this._sheetsInfo = new tab._Collection();
    this._customViews = new tab._Collection();
    this._updatedCustomViews = new tab._Collection();
    this._removedCustomViews = new tab._Collection();
    this._vizImpl = vizImpl;
    this._getClientInfo(callback);
}
tab._WorkbookImpl._extractSheetName = function tab__WorkbookImpl$_extractSheetName(sheetOrInfoOrName) {
    if (ss.isNullOrUndefined(sheetOrInfoOrName)) {
        return null;
    }
    if (tab._Utility.isString(sheetOrInfoOrName)) {
        return sheetOrInfoOrName;
    }
    var info = sheetOrInfoOrName;
    var getName = ss.Delegate.create(info, info.getName);
    if (ss.isValue(getName)) {
        return getName();
    }
    return null;
}
tab._WorkbookImpl._createDashboardFrames = function tab__WorkbookImpl$_createDashboardFrames(frames) {
    var framesInfo = [];
    for (var i = 0; i < frames.length; i++) {
        var frame = frames[i];
        var region = frame.r;
        var objectType = 'blank';
        switch (region) {
            case 'color':
            case 'shape':
            case 'size':
            case 'map':
                objectType = 'legend';
                break;
            case 'layout-basic':
            case 'layout-flow':
                continue;
            case 'filter':
                objectType = 'quickFilter';
                break;
            case 'viz':
                objectType = 'worksheet';
                break;
            case 'paramctrl':
                objectType = 'parameterControl';
                break;
            case 'empty':
                objectType = 'blank';
                break;
            case 'title':
                objectType = 'title';
                break;
            case 'text':
                objectType = 'text';
                break;
            case 'bitmap':
                objectType = 'image';
                break;
            case 'web':
                objectType = 'webPage';
                break;
        }
        var size = tab.$create_Size(frame.w, frame.h);
        var position = tab.$create_Point(frame.x, frame.y);
        var name = frame.name;
        var frameInfo = tab.$create__dashboardObjectFrameInfo(name, objectType, position, size);
        framesInfo.push(frameInfo);
    }
    return framesInfo;
}
tab._WorkbookImpl._createSheetSize = function tab__WorkbookImpl$_createSheetSize(baseSheet) {
    if (ss.isNullOrUndefined(baseSheet)) {
        return tab.$create_SheetSize('automatic', null, null);
    }
    var minHeight = baseSheet.minHeight;
    var minWidth = baseSheet.minWidth;
    var maxHeight = baseSheet.maxHeight;
    var maxWidth = baseSheet.maxWidth;
    var behavior = 'automatic';
    var minSize = null;
    var maxSize = null;
    if (!minHeight && !minWidth) {
        if (!maxHeight && !maxWidth) {
        }
        else {
            behavior = 'atmost';
            maxSize = tab.$create_Size(maxWidth, maxHeight);
        }
    }
    else if (!maxHeight && !maxWidth) {
        behavior = 'atleast';
        minSize = tab.$create_Size(minWidth, minHeight);
    }
    else if (maxHeight === minHeight && maxWidth === minWidth) {
        behavior = 'exactly';
        minSize = tab.$create_Size(minWidth, minHeight);
        maxSize = tab.$create_Size(minWidth, minHeight);
    }
    else {
        behavior = 'range';
        minSize = tab.$create_Size(minWidth, minHeight);
        maxSize = tab.$create_Size(maxWidth, maxHeight);
    }
    return tab.$create_SheetSize(behavior, minSize, maxSize);
}
tab._WorkbookImpl.prototype = {
    _workbook: null,
    _vizImpl: null,
    _name: null,
    _activeSheetImpl: null,
    _activatingHiddenSheetImpl: null,
    _currentCustomView: null,
    _parameters: null,
    _lastChangedParameterImpl: null,
    _isDownloadAllowed: false,
    
    get__lastChangedParameterImpl: function tab__WorkbookImpl$get__lastChangedParameterImpl() {
        return this._lastChangedParameterImpl;
    },
    set__lastChangedParameterImpl: function tab__WorkbookImpl$set__lastChangedParameterImpl(value) {
        this._lastChangedParameterImpl = value;
        return value;
    },
    
    get__parameters: function tab__WorkbookImpl$get__parameters() {
        return this._parameters;
    },
    set__parameters: function tab__WorkbookImpl$set__parameters(value) {
        this._parameters = value;
        return value;
    },
    
    get__customViews: function tab__WorkbookImpl$get__customViews() {
        return this._customViews;
    },
    set__customViews: function tab__WorkbookImpl$set__customViews(value) {
        this._customViews = value;
        return value;
    },
    
    get__updatedCustomViews: function tab__WorkbookImpl$get__updatedCustomViews() {
        return this._updatedCustomViews;
    },
    set__updatedCustomViews: function tab__WorkbookImpl$set__updatedCustomViews(value) {
        this._updatedCustomViews = value;
        return value;
    },
    
    get__removedCustomViews: function tab__WorkbookImpl$get__removedCustomViews() {
        return this._removedCustomViews;
    },
    set__removedCustomViews: function tab__WorkbookImpl$set__removedCustomViews(value) {
        this._removedCustomViews = value;
        return value;
    },
    
    get__currentCustomView: function tab__WorkbookImpl$get__currentCustomView() {
        return this._currentCustomView;
    },
    set__currentCustomView: function tab__WorkbookImpl$set__currentCustomView(value) {
        this._currentCustomView = value;
        return value;
    },
    
    get__workbook: function tab__WorkbookImpl$get__workbook() {
        if (ss.isNullOrUndefined(this._workbook)) {
            this._workbook = new tableauSoftware.Workbook(this);
        }
        return this._workbook;
    },
    
    get__viz: function tab__WorkbookImpl$get__viz() {
        return this._vizImpl.get__viz();
    },
    
    get__publishedSheets: function tab__WorkbookImpl$get__publishedSheets() {
        return this._sheetsInfo;
    },
    
    get__name: function tab__WorkbookImpl$get__name() {
        return this._name;
    },
    
    get__activeSheetImpl: function tab__WorkbookImpl$get__activeSheetImpl() {
        return this._activeSheetImpl;
    },
    
    get__activeCustomView: function tab__WorkbookImpl$get__activeCustomView() {
        return this._currentCustomView;
    },
    
    get__isDownloadAllowed: function tab__WorkbookImpl$get__isDownloadAllowed() {
        return this._isDownloadAllowed;
    },
    set__isDownloadAllowed: function tab__WorkbookImpl$set__isDownloadAllowed(value) {
        this._isDownloadAllowed = value;
        return value;
    },
    
    _findActiveSheetOrSheetWithinActiveDashboard: function tab__WorkbookImpl$_findActiveSheetOrSheetWithinActiveDashboard(sheetOrInfoOrName) {
        if (ss.isNullOrUndefined(this._activeSheetImpl)) {
            return null;
        }
        var sheetName = tab._WorkbookImpl._extractSheetName(sheetOrInfoOrName);
        if (ss.isNullOrUndefined(sheetName)) {
            return null;
        }
        if (sheetName === this._activeSheetImpl.get__name()) {
            return this._activeSheetImpl;
        }
        if (this._activeSheetImpl.get__isDashboard()) {
            var dashboardImpl = this._activeSheetImpl;
            var sheet = dashboardImpl.get__worksheets()._get(sheetName);
            if (ss.isValue(sheet)) {
                return sheet._impl;
            }
        }
        return null;
    },
    
    _setActiveSheetAsync: function tab__WorkbookImpl$_setActiveSheetAsync(sheetNameOrInfoOrIndex) {
        if (tab._Utility.isNumber(sheetNameOrInfoOrIndex)) {
            var index = sheetNameOrInfoOrIndex;
            if (index < this._sheetsInfo.get__length() && index >= 0) {
                return this._activateSheetWithInfoAsync(this._sheetsInfo.get_item(index)._impl);
            }
            else {
                throw tab._tableauException._create('indexOutOfRange', 'Sheet index is out of range');
            }
        }
        var sheetName = tab._WorkbookImpl._extractSheetName(sheetNameOrInfoOrIndex);
        var sheetInfo = this._sheetsInfo._get(sheetName);
        if (ss.isValue(sheetInfo)) {
            return this._activateSheetWithInfoAsync(sheetInfo._impl);
        }
        else if (this._activeSheetImpl.get__isDashboard()) {
            var d = this._activeSheetImpl;
            var sheet = d.get__worksheets()._get(sheetName);
            if (ss.isValue(sheet)) {
                this._activatingHiddenSheetImpl = null;
                var sheetUrl = '';
                if (sheet.getIsHidden()) {
                    this._activatingHiddenSheetImpl = sheet._impl;
                }
                else {
                    sheetUrl = sheet._impl.get__url();
                }
                return this._activateSheetInternalAsync(sheet._impl.get__name(), sheetUrl);
            }
        }
        throw tab._tableauException._create('sheetNotInWorkbook', 'Sheet is not found in Workbook');
    },
    
    _revertAllAsync: function tab__WorkbookImpl$_revertAllAsync() {
        var deferred = new tab._Deferred();
        var returnHandler = new tab._CommandReturnHandler('api.RevertAllCommand', 1, function(result) {
            deferred.resolve();
        }, function(remoteError, message) {
            deferred.reject(tab._tableauException._createServerError(message));
        });
        this._sendCommand(null, returnHandler);
        return deferred.get_promise();
    },
    
    _getCustomViewsAsync: function tab__WorkbookImpl$_getCustomViewsAsync() {
        return tab._CustomViewImpl._getCustomViewsAsync(this);
    },
    
    _showCustomViewAsync: function tab__WorkbookImpl$_showCustomViewAsync(customViewName) {
        if (ss.isNullOrUndefined(customViewName) || tab._Utility.isNullOrEmpty(customViewName)) {
            return tab._CustomViewImpl._showCustomViewAsync(this, null);
        }
        else {
            var cv = this._customViews._get(customViewName);
            if (ss.isNullOrUndefined(cv)) {
                var deferred = new tab._Deferred();
                deferred.reject(tab._tableauException._createInvalidCustomViewName(customViewName));
                return deferred.get_promise();
            }
            return cv._impl._showAsync();
        }
    },
    
    _removeCustomViewAsync: function tab__WorkbookImpl$_removeCustomViewAsync(customViewName) {
        if (tab._Utility.isNullOrEmpty(customViewName)) {
            throw tab._tableauException._createNullOrEmptyParameter('customViewName');
        }
        var cv = this._customViews._get(customViewName);
        if (ss.isNullOrUndefined(cv)) {
            var deferred = new tab._Deferred();
            deferred.reject(tab._tableauException._createInvalidCustomViewName(customViewName));
            return deferred.get_promise();
        }
        return tab._CustomViewImpl._removeAsync(this, cv._impl);
    },
    
    _rememberCustomViewAsync: function tab__WorkbookImpl$_rememberCustomViewAsync(customViewName) {
        if (tab._Utility.isNullOrEmpty(customViewName)) {
            throw tab._tableauException._createInvalidParameter('customViewName');
        }
        return tab._CustomViewImpl._saveNewAsync(this, customViewName);
    },
    
    _setActiveCustomViewAsDefaultAsync: function tab__WorkbookImpl$_setActiveCustomViewAsDefaultAsync() {
        return tab._CustomViewImpl._makeCurrentCustomViewDefaultAsync(this);
    },
    
    _getParametersAsync: function tab__WorkbookImpl$_getParametersAsync() {
        return tab._parameterImpl._getParametersAsync(this);
    },
    
    _changeParameterValueAsync: function tab__WorkbookImpl$_changeParameterValueAsync(parameterName, value) {
        return tab._parameterImpl._changeValueAsync(this, parameterName, value, ss.Delegate.create(this, function(changedName) {
            this._vizImpl._raiseParameterValueChange(changedName);
        }));
    },
    
    _update: function tab__WorkbookImpl$_update(callback) {
        this._getClientInfo(callback);
    },
    
    _sendCommand: function tab__WorkbookImpl$_sendCommand(commandParameters, returnHandler) {
        this._vizImpl._sendCommand(commandParameters, returnHandler);
    },
    
    _activateSheetWithInfoAsync: function tab__WorkbookImpl$_activateSheetWithInfoAsync(sheetInfoImpl) {
        return this._activateSheetInternalAsync(sheetInfoImpl._name, sheetInfoImpl._url);
    },
    
    _activateSheetInternalAsync: function tab__WorkbookImpl$_activateSheetInternalAsync(sheetName, sheetUrl) {
        var deferred = new tab._Deferred();
        if (ss.isValue(this._activeSheetImpl) && sheetName === this._activeSheetImpl.get__name()) {
            deferred.resolve(this._activeSheetImpl.get__sheet());
            return deferred.get_promise();
        }
        var param = {};
        param['api.switchToSheetName'] = sheetName;
        param['api.switchToRepositoryUrl'] = sheetUrl;
        param['api.oldRepositoryUrl'] = this._activeSheetImpl.get__url();
        var returnHandler = new tab._CommandReturnHandler('api.SwitchActiveSheetCommand', 0, ss.Delegate.create(this, function(result) {
            this._vizImpl._workbookTabSwitchHandler = ss.Delegate.create(this, function() {
                this._vizImpl._workbookTabSwitchHandler = null;
                deferred.resolve(this._activeSheetImpl.get__sheet());
            });
        }), function(remoteError, message) {
            deferred.reject(tab._tableauException._createServerError(message));
        });
        this._sendCommand(param, returnHandler);
        return deferred.get_promise();
    },
    
    _updateActiveSheetAsync: function tab__WorkbookImpl$_updateActiveSheetAsync() {
        var deferred = new tab._Deferred();
        var param = {};
        param['api.switchToSheetName'] = this._activeSheetImpl.get__name();
        param['api.switchToRepositoryUrl'] = this._activeSheetImpl.get__url();
        param['api.oldRepositoryUrl'] = this._activeSheetImpl.get__url();
        var returnHandler = new tab._CommandReturnHandler('api.UpdateActiveSheetCommand', 0, ss.Delegate.create(this, function(result) {
            deferred.resolve(this._activeSheetImpl.get__sheet());
        }), function(remoteError, message) {
            deferred.reject(tab._tableauException._createServerError(message));
        });
        this._sendCommand(param, returnHandler);
        return deferred.get_promise();
    },
    
    _getClientInfo: function tab__WorkbookImpl$_getClientInfo(callback) {
        var returnHandler = new tab._CommandReturnHandler('api.GetClientInfoCommand', 0, ss.Delegate.create(this, function(result) {
            var clientInfo = result;
            this._processInfo(clientInfo);
            if (ss.isValue(callback)) {
                callback();
            }
        }), null);
        this._sendCommand(null, returnHandler);
    },
    
    _processInfo: function tab__WorkbookImpl$_processInfo(clientInfo) {
        if (ss.isValue(clientInfo.isAutoUpdate)) {
            this._vizImpl._setAreAutomaticUpdatesPaused(!clientInfo.isAutoUpdate);
        }
        if (ss.isValue(clientInfo.isDownloadAllowed)) {
            this.set__isDownloadAllowed(clientInfo.isDownloadAllowed);
        }
        if (ss.isValue(clientInfo.clientUrl)) {
            this._vizImpl.set__clientUrl(clientInfo.clientUrl);
        }
        if (ss.isValue(clientInfo.workbookName)) {
            this._name = clientInfo.workbookName;
        }
        this._createSheetsInfo(clientInfo);
        this._initializeActiveSheet(clientInfo);
    },
    
    _initializeActiveSheet: function tab__WorkbookImpl$_initializeActiveSheet(clientInfo) {
        var currentSheetName = clientInfo.currentSheetName;
        var newActiveSheetInfo = this._sheetsInfo._get(currentSheetName);
        if (ss.isNullOrUndefined(newActiveSheetInfo) && ss.isNullOrUndefined(this._activatingHiddenSheetImpl)) {
            throw tab._tableauException._createInternalError('The active sheet was not specified in baseSheets');
        }
        if (ss.isValue(this._activeSheetImpl) && this._activeSheetImpl.get__name() === currentSheetName) {
            return;
        }
        if (ss.isValue(this._activeSheetImpl)) {
            this._activeSheetImpl.set__isActive(false);
            var oldActiveSheetInfo = this._sheetsInfo._get(this._activeSheetImpl.get__name());
            if (ss.isValue(oldActiveSheetInfo)) {
                oldActiveSheetInfo._impl._isActive = false;
            }
        }
        if (ss.isValue(this._activatingHiddenSheetImpl)) {
            var infoImpl = tab.$create__SheetInfoImpl(this._activatingHiddenSheetImpl.get__name(), 'worksheet', -1, this._activatingHiddenSheetImpl.get__size(), this.get__workbook(), '', true, true);
            this._activatingHiddenSheetImpl = null;
            this._activeSheetImpl = new tab._WorksheetImpl(infoImpl, this, null);
        }
        else {
            var baseSheet = null;
            for (var i = 0, len = clientInfo.baseSheets.length; i < len; i++) {
                if (clientInfo.visibleSheets[i] === currentSheetName) {
                    baseSheet = clientInfo.baseSheets[i];
                    break;
                }
            }
            if (ss.isNullOrUndefined(baseSheet)) {
                throw tab._tableauException._createInternalError('No base sheet was found corresponding to the active sheet.');
            }
            if (baseSheet.isDashboard) {
                var dashboardImpl = new tab._DashboardImpl(newActiveSheetInfo._impl, this);
                this._activeSheetImpl = dashboardImpl;
                var dashboardFrames = tab._WorkbookImpl._createDashboardFrames(clientInfo.frames);
                dashboardImpl._addObjects(dashboardFrames, clientInfo.visibleSheets, clientInfo.repositoryUrls);
            }
            else {
                this._activeSheetImpl = new tab._WorksheetImpl(newActiveSheetInfo._impl, this, null);
            }
            newActiveSheetInfo._impl._isActive = true;
        }
        this._activeSheetImpl.set__isActive(true);
    },
    
    _createSheetsInfo: function tab__WorkbookImpl$_createSheetsInfo(clientInfo) {
        var visibleSheets = clientInfo.visibleSheets;
        var sheetUrls = clientInfo.repositoryUrls;
        var baseSheets = clientInfo.baseSheets;
        if (ss.isNullOrUndefined(baseSheets)) {
            return;
        }
        for (var index = 0; index < visibleSheets.length; index++) {
            var baseSheet = baseSheets[index];
            var sheetName = visibleSheets[index];
            var sheetInfo = this._sheetsInfo._get(sheetName);
            var size = tab._WorkbookImpl._createSheetSize(baseSheet);
            if (ss.isNullOrUndefined(sheetInfo)) {
                var isActive = sheetName === clientInfo.currentSheetName;
                var sheetInfoImpl = tab.$create__SheetInfoImpl(sheetName, (baseSheet.isDashboard) ? 'dashboard' : 'worksheet', index, size, this.get__workbook(), sheetUrls[index], isActive, false);
                sheetInfo = new tableauSoftware.SheetInfo(sheetInfoImpl);
                this._sheetsInfo._add(sheetName, sheetInfo);
            }
            else {
                sheetInfo._impl._size = size;
            }
        }
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._WorksheetImpl

tab._WorksheetImpl = function tab__WorksheetImpl(sheetInfoImpl, workbookImpl, parentDashboardImpl) {
    this._dataSources$1 = new tab._Collection();
    this._filters$1 = new tab._Collection();
    this._selectedMarks$1 = new tab._Collection();
    tab._WorksheetImpl.initializeBase(this, [ sheetInfoImpl, workbookImpl ]);
    this._parentDashboardImpl$1 = parentDashboardImpl;
}
tab._WorksheetImpl._filterCommandError = function tab__WorksheetImpl$_filterCommandError(errorData) {
    if (ss.isValue(errorData['invalidFieldCaption'])) {
        return tab._tableauException._create('invalidFilterFieldName', errorData['invalidFieldCaption']);
    }
    else if (ss.isValue(errorData['invalidValues'])) {
        return tab._tableauException._create('invalidFilterFieldValue', errorData['invalidValues']);
    }
    return null;
}
tab._WorksheetImpl._normalizeRangeFilterOption$1 = function tab__WorksheetImpl$_normalizeRangeFilterOption$1(filterOptions) {
    if (ss.isNullOrUndefined(filterOptions)) {
        throw tab._tableauException._createNullOrEmptyParameter('filterOptions');
    }
    if (ss.isNullOrUndefined(filterOptions.min) && ss.isNullOrUndefined(filterOptions.max)) {
        throw tab._tableauException._create('invalidParameter', 'At least one of filterOptions.min or filterOptions.max must be specified.');
    }
    var fixedUpFilterOptions = {};
    if (ss.isValue(filterOptions.min)) {
        fixedUpFilterOptions.min = filterOptions.min;
    }
    if (ss.isValue(filterOptions.max)) {
        fixedUpFilterOptions.max = filterOptions.max;
    }
    if (ss.isValue(filterOptions.nullOption)) {
        fixedUpFilterOptions.nullOption = tab._enums._normalizeNullOption(filterOptions.nullOption, 'filterOptions.nullOption');
    }
    return fixedUpFilterOptions;
}
tab._WorksheetImpl._normalizeRelativeDateFilterOptions$1 = function tab__WorksheetImpl$_normalizeRelativeDateFilterOptions$1(filterOptions) {
    if (ss.isNullOrUndefined(filterOptions)) {
        throw tab._tableauException._createNullOrEmptyParameter('filterOptions');
    }
    var fixedUpFilterOptions = {};
    fixedUpFilterOptions.rangeType = tab._enums._normalizeDateRangeType(filterOptions.rangeType, 'filterOptions.rangeType');
    fixedUpFilterOptions.periodType = tab._enums._normalizePeriodType(filterOptions.periodType, 'filterOptions.periodType');
    if (fixedUpFilterOptions.rangeType === 'lastn' || fixedUpFilterOptions.rangeType === 'nextn') {
        if (ss.isNullOrUndefined(filterOptions.rangeN)) {
            throw tab._tableauException._create('missingRangeNForRelativeDateFilters', 'Missing rangeN field for a relative date filter of LASTN or NEXTN.');
        }
        fixedUpFilterOptions.rangeN = tab._Utility.toInt(filterOptions.rangeN);
    }
    if (ss.isValue(filterOptions.anchorDate)) {
        if (!tab._Utility.isDate(filterOptions.anchorDate) || !tab._Utility.isDateValid(filterOptions.anchorDate)) {
            throw tab._tableauException._createInvalidDateParameter('filterOptions.anchorDate');
        }
        fixedUpFilterOptions.anchorDate = filterOptions.anchorDate;
    }
    return fixedUpFilterOptions;
}
tab._WorksheetImpl._createFilterCommandReturnHandler$1 = function tab__WorksheetImpl$_createFilterCommandReturnHandler$1(commandName, fieldName, deferred) {
    return new tab._CommandReturnHandler(commandName, 1, function(result) {
        var error = tab._WorksheetImpl._filterCommandError(result);
        if (error == null) {
            deferred.resolve(fieldName);
        }
        else {
            deferred.reject(error);
        }
    }, function(remoteError, message) {
        if (remoteError) {
            deferred.reject(tab._tableauException._createInvalidFilterFieldNameOrValue(fieldName));
        }
        else {
            var error = tab._tableauException._create('filterCannotBePerformed', message);
            deferred.reject(error);
        }
    });
}
tab._WorksheetImpl._createSelectionCommandError$1 = function tab__WorksheetImpl$_createSelectionCommandError$1(errorData) {
    if (ss.isValue(errorData['invalidFields'])) {
        return tab._tableauException._create('invalidSelectionFieldName', errorData['invalidFields']);
    }
    else if (ss.isValue(errorData['invalidValues'])) {
        return tab._tableauException._create('invalidSelectionValue', errorData['invalidValues']);
    }
    else if (ss.isValue(errorData['invalidDates'])) {
        return tab._tableauException._create('invalidSelectionDate', errorData['invalidDates']);
    }
    return null;
}
tab._WorksheetImpl._serializeDateForServer$1 = function tab__WorksheetImpl$_serializeDateForServer$1(dt) {
    if (ss.isValue(dt) && tab._Utility.isDate(dt)) {
        var year = dt.getUTCFullYear();
        var month = dt.getUTCMonth() + 1;
        var day = dt.getUTCDate();
        return year.toString() + '-' + month.toString() + '-' + day.toString();
    }
    return '';
}
tab._WorksheetImpl.prototype = {
    _worksheet$1: null,
    _parentDashboardImpl$1: null,
    
    get__dataSources: function tab__WorksheetImpl$get__dataSources() {
        return this._dataSources$1;
    },
    set__dataSources: function tab__WorksheetImpl$set__dataSources(value) {
        this._dataSources$1 = value;
        return value;
    },
    
    get__sheet: function tab__WorksheetImpl$get__sheet() {
        return this.get__worksheet();
    },
    
    get__worksheet: function tab__WorksheetImpl$get__worksheet() {
        if (this._worksheet$1 == null) {
            this._worksheet$1 = new tableauSoftware.Worksheet(this);
        }
        return this._worksheet$1;
    },
    
    get__parentDashboardImpl: function tab__WorksheetImpl$get__parentDashboardImpl() {
        return this._parentDashboardImpl$1;
    },
    
    get__parentDashboard: function tab__WorksheetImpl$get__parentDashboard() {
        if (ss.isValue(this._parentDashboardImpl$1)) {
            return this._parentDashboardImpl$1.get__dashboard();
        }
        return null;
    },
    
    _getDataSourcesAsync: function tab__WorksheetImpl$_getDataSourcesAsync() {
        return tab._dataSourceImpl._getDataSourcesAsync(this);
    },
    
    _showExportDataDialog: function tab__WorksheetImpl$_showExportDataDialog() {
        this._verifyActiveSheetOrEmbeddedInActiveDashboard();
        this.get__workbookImpl().get__viz()._impl._showExportDataDialog(this.get__name());
    },
    
    _showExportCrossTabDialog: function tab__WorksheetImpl$_showExportCrossTabDialog() {
        this._verifyActiveSheetOrEmbeddedInActiveDashboard();
        this.get__workbookImpl().get__viz()._impl._showExportCrossTabDialog(this.get__name());
    },
    
    _verifyActiveSheetOrEmbeddedInActiveDashboard: function tab__WorksheetImpl$_verifyActiveSheetOrEmbeddedInActiveDashboard() {
        if (!this.get__isActive() && ss.isNullOrUndefined(this._parentDashboardImpl$1)) {
            throw tab._tableauException._createNotActiveSheet();
        }
    },
    
    get__filters: function tab__WorksheetImpl$get__filters() {
        return this._filters$1;
    },
    set__filters: function tab__WorksheetImpl$set__filters(value) {
        this._filters$1 = value;
        return value;
    },
    
    _getFiltersAsync: function tab__WorksheetImpl$_getFiltersAsync(options) {
        return tableauSoftware.Filter._getFiltersAsync(this, options);
    },
    
    _applyFilterAsync: function tab__WorksheetImpl$_applyFilterAsync(fieldName, values, updateType, options) {
        return this._applyFilterWithValuesInternalAsync$1(fieldName, values, updateType, options);
    },
    
    _clearFilterAsync: function tab__WorksheetImpl$_clearFilterAsync(fieldName) {
        return this._clearFilterInternalAsync$1(fieldName);
    },
    
    _applyRangeFilterAsync: function tab__WorksheetImpl$_applyRangeFilterAsync(fieldName, options) {
        var fixedUpFilterOptions = tab._WorksheetImpl._normalizeRangeFilterOption$1(options);
        return this._applyRangeFilterInternalAsync$1(fieldName, fixedUpFilterOptions);
    },
    
    _applyRelativeDateFilterAsync: function tab__WorksheetImpl$_applyRelativeDateFilterAsync(fieldName, options) {
        var fixedUpFilterOptions = tab._WorksheetImpl._normalizeRelativeDateFilterOptions$1(options);
        return this._applyRelativeDateFilterInternalAsync$1(fieldName, fixedUpFilterOptions);
    },
    
    _applyHierarchicalFilterAsync: function tab__WorksheetImpl$_applyHierarchicalFilterAsync(fieldName, values, updateType, options) {
        if (ss.isNullOrUndefined(values) && updateType !== 'all') {
            throw tab._tableauException._createInvalidParameter('values');
        }
        return this._applyHierarchicalFilterInternalAsync$1(fieldName, values, updateType, options);
    },
    
    _clearFilterInternalAsync$1: function tab__WorksheetImpl$_clearFilterInternalAsync$1(fieldName) {
        this._verifyActiveSheetOrEmbeddedInActiveDashboard();
        if (tab._Utility.isNullOrEmpty(fieldName)) {
            throw tab._tableauException._createNullOrEmptyParameter('fieldName');
        }
        var deferred = new tab._Deferred();
        var param = {};
        param['api.fieldCaption'] = fieldName;
        param['api.worksheetName'] = this.get__name();
        if (ss.isValue(this.get__parentDashboardImpl())) {
            param['api.dashboardName'] = this.get__parentDashboardImpl().get__name();
        }
        var returnHandler = tab._WorksheetImpl._createFilterCommandReturnHandler$1('api.ClearFilterCommand', fieldName, deferred);
        this.get__workbookImpl()._sendCommand(param, returnHandler);
        return deferred.get_promise();
    },
    
    _applyFilterWithValuesInternalAsync$1: function tab__WorksheetImpl$_applyFilterWithValuesInternalAsync$1(fieldName, values, updateType, options) {
        this._verifyActiveSheetOrEmbeddedInActiveDashboard();
        if (tab._Utility.isNullOrEmpty(fieldName)) {
            throw tab._tableauException._createNullOrEmptyParameter('fieldName');
        }
        updateType = tab._enums._normalizeFilterUpdateType(updateType, 'updateType');
        var fieldValues = [];
        if (tab._jQueryShim.isArray(values)) {
            for (var i = 0; i < values.length; i++) {
                fieldValues.push(values[i].toString());
            }
        }
        else if (ss.isValue(values)) {
            fieldValues.push(values.toString());
        }
        var deferred = new tab._Deferred();
        var param = {};
        param['api.fieldCaption'] = fieldName;
        param['api.filterUpdateType'] = updateType;
        param['api.exclude'] = (ss.isValue(options) && options.isExcludeMode) ? true : false;
        if (updateType !== 'all') {
            param['api.filterCategoricalValues'] = tab.JsonUtil.toJson(fieldValues, false, '');
        }
        param['api.worksheetName'] = this.get__name();
        if (ss.isValue(this.get__parentDashboardImpl())) {
            param['api.dashboardName'] = this.get__parentDashboardImpl().get__name();
        }
        var returnHandler = tab._WorksheetImpl._createFilterCommandReturnHandler$1('api.ApplyCategoricalFilterCommand', fieldName, deferred);
        this.get__workbookImpl()._sendCommand(param, returnHandler);
        return deferred.get_promise();
    },
    
    _applyRangeFilterInternalAsync$1: function tab__WorksheetImpl$_applyRangeFilterInternalAsync$1(fieldName, filterOptions) {
        this._verifyActiveSheetOrEmbeddedInActiveDashboard();
        if (tab._Utility.isNullOrEmpty(fieldName)) {
            throw tab._tableauException._createNullOrEmptyParameter('fieldName');
        }
        if (ss.isNullOrUndefined(filterOptions)) {
            throw tab._tableauException._createNullOrEmptyParameter('filterOptions');
        }
        var param = {};
        param['api.fieldCaption'] = fieldName;
        if (ss.isValue(filterOptions.min)) {
            if (tab._Utility.isDate(filterOptions.min)) {
                var dt = filterOptions.min;
                if (tab._Utility.isDateValid(dt)) {
                    param['api.filterRangeMin'] = tab._WorksheetImpl._serializeDateForServer$1(dt);
                }
                else {
                    throw tab._tableauException._createInvalidDateParameter('filterOptions.min');
                }
            }
            else {
                param['api.filterRangeMin'] = filterOptions.min;
            }
        }
        if (ss.isValue(filterOptions.max)) {
            if (tab._Utility.isDate(filterOptions.max)) {
                var dt = filterOptions.max;
                if (tab._Utility.isDateValid(dt)) {
                    param['api.filterRangeMax'] = tab._WorksheetImpl._serializeDateForServer$1(dt);
                }
                else {
                    throw tab._tableauException._createInvalidDateParameter('filterOptions.max');
                }
            }
            else {
                param['api.filterRangeMax'] = filterOptions.max;
            }
        }
        if (ss.isValue(filterOptions.nullOption)) {
            param['api.filterRangeNullOption'] = filterOptions.nullOption;
        }
        param['api.worksheetName'] = this.get__name();
        if (ss.isValue(this.get__parentDashboardImpl())) {
            param['api.dashboardName'] = this.get__parentDashboardImpl().get__name();
        }
        var deferred = new tab._Deferred();
        var returnHandler = tab._WorksheetImpl._createFilterCommandReturnHandler$1('api.ApplyRangeFilterCommand', fieldName, deferred);
        this.get__workbookImpl()._sendCommand(param, returnHandler);
        return deferred.get_promise();
    },
    
    _applyRelativeDateFilterInternalAsync$1: function tab__WorksheetImpl$_applyRelativeDateFilterInternalAsync$1(fieldName, filterOptions) {
        this._verifyActiveSheetOrEmbeddedInActiveDashboard();
        if (tab._Utility.isNullOrEmpty(fieldName)) {
            throw tab._tableauException._createInvalidParameter('fieldName');
        }
        else if (ss.isNullOrUndefined(filterOptions)) {
            throw tab._tableauException._createInvalidParameter('filterOptions');
        }
        var param = {};
        param['api.fieldCaption'] = fieldName;
        if (ss.isValue(filterOptions)) {
            param['api.filterPeriodType'] = filterOptions.periodType;
            param['api.filterDateRangeType'] = filterOptions.rangeType;
            if (filterOptions.rangeType === 'lastn' || filterOptions.rangeType === 'nextn') {
                if (ss.isNullOrUndefined(filterOptions.rangeN)) {
                    throw tab._tableauException._create('missingRangeNForRelativeDateFilters', 'Missing rangeN field for a relative date filter of LASTN or NEXTN.');
                }
                param['api.filterDateRange'] = filterOptions.rangeN;
            }
            if (ss.isValue(filterOptions.anchorDate)) {
                param['api.filterDateArchorValue'] = tab._WorksheetImpl._serializeDateForServer$1(filterOptions.anchorDate);
            }
        }
        param['api.worksheetName'] = this.get__name();
        if (ss.isValue(this.get__parentDashboardImpl())) {
            param['api.dashboardName'] = this.get__parentDashboardImpl().get__name();
        }
        var deferred = new tab._Deferred();
        var returnHandler = tab._WorksheetImpl._createFilterCommandReturnHandler$1('api.ApplyRelativeDateFilterCommand', fieldName, deferred);
        this.get__workbookImpl()._sendCommand(param, returnHandler);
        return deferred.get_promise();
    },
    
    _applyHierarchicalFilterInternalAsync$1: function tab__WorksheetImpl$_applyHierarchicalFilterInternalAsync$1(fieldName, values, updateType, options) {
        this._verifyActiveSheetOrEmbeddedInActiveDashboard();
        if (tab._Utility.isNullOrEmpty(fieldName)) {
            throw tab._tableauException._createNullOrEmptyParameter('fieldName');
        }
        updateType = tab._enums._normalizeFilterUpdateType(updateType, 'updateType');
        var fieldValues = null;
        var levelValues = null;
        if (tab._jQueryShim.isArray(values)) {
            fieldValues = [];
            var arr = values;
            for (var i = 0; i < arr.length; i++) {
                fieldValues.push(arr[i].toString());
            }
        }
        else if (tab._Utility.isString(values)) {
            fieldValues = [];
            fieldValues.push(values.toString());
        }
        else if (ss.isValue(values) && ss.isValue(values.levels)) {
            var levelValue = values.levels;
            levelValues = [];
            if (tab._jQueryShim.isArray(levelValue)) {
                var levels = levelValue;
                for (var i = 0; i < levels.length; i++) {
                    levelValues.push(levels[i].toString());
                }
            }
            else {
                levelValues.push(levelValue.toString());
            }
        }
        else if (ss.isValue(values)) {
            throw tab._tableauException._createInvalidParameter('values');
        }
        var param = {};
        param['api.fieldCaption'] = fieldName;
        param['api.filterUpdateType'] = updateType;
        param['api.exclude'] = (ss.isValue(options) && options.isExcludeMode) ? true : false;
        if (fieldValues != null) {
            param['api.filterHierarchicalValues'] = tab.JsonUtil.toJson(fieldValues, false, '');
        }
        if (levelValues != null) {
            param['api.filterHierarchicalLevels'] = tab.JsonUtil.toJson(levelValues, false, '');
        }
        var deferred = new tab._Deferred();
        param['api.worksheetName'] = this.get__name();
        if (ss.isValue(this.get__parentDashboardImpl())) {
            param['api.dashboardName'] = this.get__parentDashboardImpl().get__name();
        }
        var returnHandler = tab._WorksheetImpl._createFilterCommandReturnHandler$1('api.ApplyHierarchicalFilterCommand', fieldName, deferred);
        this.get__workbookImpl()._sendCommand(param, returnHandler);
        return deferred.get_promise();
    },
    
    get__selectedMarks: function tab__WorksheetImpl$get__selectedMarks() {
        return this._selectedMarks$1;
    },
    set__selectedMarks: function tab__WorksheetImpl$set__selectedMarks(value) {
        this._selectedMarks$1 = value;
        return value;
    },
    
    _clearSelectedMarksAsync: function tab__WorksheetImpl$_clearSelectedMarksAsync() {
        this._verifyActiveSheetOrEmbeddedInActiveDashboard();
        var deferred = new tab._Deferred();
        var param = {};
        param['api.worksheetName'] = this.get__name();
        if (ss.isValue(this.get__parentDashboardImpl())) {
            param['api.dashboardName'] = this.get__parentDashboardImpl().get__name();
        }
        param['api.filterUpdateType'] = 'replace';
        var returnHandler = new tab._CommandReturnHandler('api.SelectMarksCommand', 1, function(result) {
            deferred.resolve();
        }, function(remoteError, message) {
            deferred.reject(tab._tableauException._createServerError(message));
        });
        this.get__workbookImpl()._sendCommand(param, returnHandler);
        return deferred.get_promise();
    },
    
    _selectMarksAsync: function tab__WorksheetImpl$_selectMarksAsync(fieldNameOrFieldValuesMap, valueOrUpdateType, updateType) {
        this._verifyActiveSheetOrEmbeddedInActiveDashboard();
        if (fieldNameOrFieldValuesMap == null && valueOrUpdateType == null) {
            return this._clearSelectedMarksAsync();
        }
        if (tab._Utility.isString(fieldNameOrFieldValuesMap) && (tab._jQueryShim.isArray(valueOrUpdateType) || tab._Utility.isString(valueOrUpdateType) || !tab._enums._isSelectionUpdateType(valueOrUpdateType))) {
            return this._selectMarksWithFieldNameAndValueAsync$1(fieldNameOrFieldValuesMap, valueOrUpdateType, updateType);
        }
        else if (tab._jQueryShim.isArray(fieldNameOrFieldValuesMap)) {
            return this._selectMarksWithMarksArrayAsync$1(fieldNameOrFieldValuesMap, valueOrUpdateType);
        }
        else {
            return this._selectMarksWithMultiDimOptionAsync$1(fieldNameOrFieldValuesMap, valueOrUpdateType);
        }
    },
    
    _getSelectedMarksAsync: function tab__WorksheetImpl$_getSelectedMarksAsync() {
        return tab._markImpl._getSelectedMarksAsync(this);
    },
    
    _selectMarksWithFieldNameAndValueAsync$1: function tab__WorksheetImpl$_selectMarksWithFieldNameAndValueAsync$1(fieldName, value, updateType) {
        var catNameList = [];
        var catValueList = [];
        var hierNameList = [];
        var hierValueList = [];
        var rangeNameList = [];
        var rangeValueList = [];
        this._parseMarksParam$1(catNameList, catValueList, hierNameList, hierValueList, rangeNameList, rangeValueList, fieldName, value);
        return this._selectMarksWithValuesAsync$1(null, catNameList, catValueList, hierNameList, hierValueList, rangeNameList, rangeValueList, updateType);
    },
    
    _selectMarksWithMultiDimOptionAsync$1: function tab__WorksheetImpl$_selectMarksWithMultiDimOptionAsync$1(fieldValuesMap, updateType) {
        var dict = fieldValuesMap;
        var catNameList = [];
        var catValueList = [];
        var hierNameList = [];
        var hierValueList = [];
        var rangeNameList = [];
        var rangeValueList = [];
        var $dict1 = dict;
        for (var $key2 in $dict1) {
            var ent = { key: $key2, value: $dict1[$key2] };
            if (fieldValuesMap.hasOwnProperty(ent.key)) {
                if (!tab._jQueryShim.isFunction(dict[ent.key])) {
                    this._parseMarksParam$1(catNameList, catValueList, hierNameList, hierValueList, rangeNameList, rangeValueList, ent.key, ent.value);
                }
            }
        }
        return this._selectMarksWithValuesAsync$1(null, catNameList, catValueList, hierNameList, hierValueList, rangeNameList, rangeValueList, updateType);
    },
    
    _selectMarksWithMarksArrayAsync$1: function tab__WorksheetImpl$_selectMarksWithMarksArrayAsync$1(marksArray, updateType) {
        var catNameList = [];
        var catValueList = [];
        var hierNameList = [];
        var hierValueList = [];
        var rangeNameList = [];
        var rangeValueList = [];
        var tupleIdList = [];
        for (var i = 0; i < marksArray.length; i++) {
            var mark = marksArray[i];
            if (ss.isValue(mark._impl.get__tupleId()) && mark._impl.get__tupleId() > 0) {
                tupleIdList.push(mark._impl.get__tupleId());
            }
            else {
                var pairs = mark._impl.get__pairs();
                for (var j = 0; j < pairs.get__length(); j++) {
                    var pair = pairs.get_item(j);
                    if (pair.hasOwnProperty('fieldName') && pair.hasOwnProperty('value') && !tab._jQueryShim.isFunction(pair.fieldName) && !tab._jQueryShim.isFunction(pair.value)) {
                        this._parseMarksParam$1(catNameList, catValueList, hierNameList, hierValueList, rangeNameList, rangeValueList, pair.fieldName, pair.value);
                    }
                }
            }
        }
        return this._selectMarksWithValuesAsync$1(tupleIdList, catNameList, catValueList, hierNameList, hierValueList, rangeNameList, rangeValueList, updateType);
    },
    
    _parseMarksParam$1: function tab__WorksheetImpl$_parseMarksParam$1(catNameList, catValueList, hierNameList, hierValueList, rangeNameList, rangeValueList, fieldName, value) {
        var sourceOptions = value;
        if (tab._WorksheetImpl._regexHierarchicalFieldName$1.test(fieldName)) {
            this._addToParamLists$1(hierNameList, hierValueList, fieldName, value);
        }
        else if (ss.isValue(sourceOptions.min) || ss.isValue(sourceOptions.max)) {
            var range = {};
            if (ss.isValue(sourceOptions.min)) {
                if (tab._Utility.isDate(sourceOptions.min)) {
                    var dt = sourceOptions.min;
                    if (tab._Utility.isDateValid(dt)) {
                        range.min = tab._WorksheetImpl._serializeDateForServer$1(dt);
                    }
                    else {
                        throw tab._tableauException._createInvalidDateParameter('options.min');
                    }
                }
                else {
                    range.min = sourceOptions.min;
                }
            }
            if (ss.isValue(sourceOptions.max)) {
                if (tab._Utility.isDate(sourceOptions.max)) {
                    var dt = sourceOptions.max;
                    if (tab._Utility.isDateValid(dt)) {
                        range.max = tab._WorksheetImpl._serializeDateForServer$1(dt);
                    }
                    else {
                        throw tab._tableauException._createInvalidDateParameter('options.max');
                    }
                }
                else {
                    range.max = sourceOptions.max;
                }
            }
            if (ss.isValue(sourceOptions.nullOption)) {
                var nullOption = tab._enums._normalizeNullOption(sourceOptions.nullOption, 'options.nullOption');
                range.nullOption = nullOption;
            }
            else {
                range.nullOption = 'allValues';
            }
            var jsonValue = tab.JsonUtil.toJson(range, false, '');
            this._addToParamLists$1(rangeNameList, rangeValueList, fieldName, jsonValue);
        }
        else {
            this._addToParamLists$1(catNameList, catValueList, fieldName, value);
        }
    },
    
    _addToParamLists$1: function tab__WorksheetImpl$_addToParamLists$1(paramNameList, paramValueList, paramName, paramValue) {
        var markValues = [];
        if (tab._jQueryShim.isArray(paramValue)) {
            var values = paramValue;
            for (var i = 0; i < values.length; i++) {
                markValues.push(values[i]);
            }
        }
        else {
            markValues.push(paramValue);
        }
        paramValueList.push(markValues);
        paramNameList.push(paramName);
    },
    
    _selectMarksWithValuesAsync$1: function tab__WorksheetImpl$_selectMarksWithValuesAsync$1(tupleIdList, catNameList, catValueList, hierNameList, hierValueList, rangeNameList, rangeValueList, updateType) {
        var param = {};
        updateType = tab._enums._normalizeSelectionUpdateType(updateType, 'updateType');
        param['api.worksheetName'] = this.get__name();
        if (ss.isValue(this.get__parentDashboardImpl())) {
            param['api.dashboardName'] = this.get__parentDashboardImpl().get__name();
        }
        param['api.filterUpdateType'] = updateType;
        if (!tab._Utility.isNullOrEmpty(tupleIdList)) {
            param['api.tupleIds'] = tab.JsonUtil.toJson(tupleIdList, false, '');
        }
        if (!tab._Utility.isNullOrEmpty(catNameList) && !tab._Utility.isNullOrEmpty(catValueList)) {
            param['api.categoricalFieldCaption'] = tab.JsonUtil.toJson(catNameList, false, '');
            var markValues = [];
            for (var i = 0; i < catValueList.length; i++) {
                var values = tab.JsonUtil.toJson(catValueList[i], false, '');
                markValues.push(values);
            }
            param['api.categoricalMarkValues'] = tab.JsonUtil.toJson(markValues, false, '');
        }
        if (!tab._Utility.isNullOrEmpty(hierNameList) && !tab._Utility.isNullOrEmpty(hierValueList)) {
            param['api.hierarchicalFieldCaption'] = tab.JsonUtil.toJson(hierNameList, false, '');
            var markValues = [];
            for (var i = 0; i < hierValueList.length; i++) {
                var values = tab.JsonUtil.toJson(hierValueList[i], false, '');
                markValues.push(values);
            }
            param['api.hierarchicalMarkValues'] = tab.JsonUtil.toJson(markValues, false, '');
        }
        if (!tab._Utility.isNullOrEmpty(rangeNameList) && !tab._Utility.isNullOrEmpty(rangeValueList)) {
            param['api.rangeFieldCaption'] = tab.JsonUtil.toJson(rangeNameList, false, '');
            var markValues = [];
            for (var i = 0; i < rangeValueList.length; i++) {
                var values = tab.JsonUtil.toJson(rangeValueList[i], false, '');
                markValues.push(values);
            }
            param['api.rangeMarkValues'] = tab.JsonUtil.toJson(markValues, false, '');
        }
        if (tab._Utility.isNullOrEmpty(param['api.tupleIds']) && tab._Utility.isNullOrEmpty(param['api.categoricalFieldCaption']) && tab._Utility.isNullOrEmpty(param['api.hierarchicalFieldCaption']) && tab._Utility.isNullOrEmpty(param['api.rangeFieldCaption'])) {
            throw tab._tableauException._createInvalidParameter('fieldNameOrFieldValuesMap');
        }
        var deferred = new tab._Deferred();
        var returnHandler = new tab._CommandReturnHandler('api.SelectMarksCommand', 1, function(result) {
            var error = tab._WorksheetImpl._createSelectionCommandError$1(result);
            if (error == null) {
                deferred.resolve();
            }
            else {
                deferred.reject(error);
            }
        }, function(remoteError, message) {
            deferred.reject(tab._tableauException._createServerError(message));
        });
        this.get__workbookImpl()._sendCommand(param, returnHandler);
        return deferred.get_promise();
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab.JsonUtil

tab.JsonUtil = function tab_JsonUtil() {
}
tab.JsonUtil.parseJson = function tab_JsonUtil$parseJson(jsonValue) {
    return tab._jQueryShim.parseJSON(jsonValue);
}
tab.JsonUtil.toJson = function tab_JsonUtil$toJson(it, pretty, indentStr) {
    pretty = (pretty || false);
    indentStr = (indentStr || '');
    var stack = [];
    return tab.JsonUtil._serialize(it, pretty, indentStr, stack);
}
tab.JsonUtil._indexOf = function tab_JsonUtil$_indexOf(array, searchElement, fromIndex) {
    if (ss.isValue((Array).prototype['indexOf'])) {
        return array.indexOf(searchElement, fromIndex);
    }
    fromIndex = (fromIndex || 0);
    var length = array.length;
    if (length > 0) {
        for (var index = fromIndex; index < length; index++) {
            if (array[index] === searchElement) {
                return index;
            }
        }
    }
    return -1;
}
tab.JsonUtil._contains = function tab_JsonUtil$_contains(array, searchElement, fromIndex) {
    var index = tab.JsonUtil._indexOf(array, searchElement, fromIndex);
    return index >= 0;
}
tab.JsonUtil._serialize = function tab_JsonUtil$_serialize(it, pretty, indentStr, stack) {
    if (tab.JsonUtil._contains(stack, it)) {
        throw Error.createError('The object contains recursive reference of sub-objects', null);
    }
    if (ss.isUndefined(it)) {
        return 'undefined';
    }
    if (it == null) {
        return 'null';
    }
    var objtype = tab._jQueryShim.type(it);
    if (objtype === 'number' || objtype === 'boolean') {
        return it.toString();
    }
    if (objtype === 'string') {
        return tab.JsonUtil._escapeString(it);
    }
    stack.push(it);
    var newObj;
    indentStr = (indentStr || '');
    var nextIndent = (pretty) ? indentStr + '\t' : '';
    var tf = (it.__json__ || it.json);
    if (tab._jQueryShim.isFunction(tf)) {
        var jsonCallback = tf;
        newObj = jsonCallback(it);
        if (it !== newObj) {
            var res = tab.JsonUtil._serialize(newObj, pretty, nextIndent, stack);
            stack.pop();
            return res;
        }
    }
    if (ss.isValue(it.nodeType) && ss.isValue(it.cloneNode)) {
        throw Error.createError("Can't serialize DOM nodes", null);
    }
    var separator = (pretty) ? ' ' : '';
    var newLine = (pretty) ? '\n' : '';
    if (tab._jQueryShim.isArray(it)) {
        return tab.JsonUtil._serializeArray(it, pretty, indentStr, stack, nextIndent, newLine);
    }
    if (objtype === 'function') {
        stack.pop();
        return null;
    }
    return tab.JsonUtil._serializeGeneric(it, pretty, indentStr, stack, nextIndent, newLine, separator);
}
tab.JsonUtil._serializeGeneric = function tab_JsonUtil$_serializeGeneric(it, pretty, indentStr, stack, nextIndent, newLine, separator) {
    var d = it;
    var bdr = new ss.StringBuilder('{');
    var init = false;
    var $dict1 = d;
    for (var $key2 in $dict1) {
        var e = { key: $key2, value: $dict1[$key2] };
        var keyStr;
        var val;
        if (typeof(e.key) === 'number') {
            keyStr = '"' + e.key + '"';
        }
        else if (typeof(e.key) === 'string') {
            keyStr = tab.JsonUtil._escapeString(e.key);
        }
        else {
            continue;
        }
        val = tab.JsonUtil._serialize(e.value, pretty, nextIndent, stack);
        if (val == null) {
            continue;
        }
        if (init) {
            bdr.append(',');
        }
        bdr.append(newLine + nextIndent + keyStr + ':' + separator + val);
        init = true;
    }
    bdr.append(newLine + indentStr + '}');
    stack.pop();
    return bdr.toString();
}
tab.JsonUtil._serializeArray = function tab_JsonUtil$_serializeArray(it, pretty, indentStr, stack, nextIndent, newLine) {
    var initialized = false;
    var sb = new ss.StringBuilder('[');
    var a = it;
    for (var i = 0; i < a.length; i++) {
        var o = a[i];
        var s = tab.JsonUtil._serialize(o, pretty, nextIndent, stack);
        if (s == null) {
            s = 'undefined';
        }
        if (initialized) {
            sb.append(',');
        }
        sb.append(newLine + nextIndent + s);
        initialized = true;
    }
    sb.append(newLine + indentStr + ']');
    stack.pop();
    return sb.toString();
}
tab.JsonUtil._escapeString = function tab_JsonUtil$_escapeString(str) {
    str = ('"' + str.replace(/(["\\])/g, '\\$1') + '"');
    str = str.replace(new RegExp('[\u000c]', 'g'), '\\f');
    str = str.replace(new RegExp('[\u0008]', 'g'), '\\b');
    str = str.replace(new RegExp('[\n]', 'g'), '\\n');
    str = str.replace(new RegExp('[\t]', 'g'), '\\t');
    str = str.replace(new RegExp('[\r]', 'g'), '\\r');
    return str;
}


Type.registerNamespace('tableauSoftware');

////////////////////////////////////////////////////////////////////////////////
// tab.DataValue

tab.$create_DataValue = function tab_DataValue(value, formattedValue, aliasedValue) {
    var $o = { };
    $o.value = value;
    if (tab._Utility.isNullOrEmpty(aliasedValue)) {
        $o.formattedValue = formattedValue;
    }
    else {
        $o.formattedValue = aliasedValue;
    }
    return $o;
}


////////////////////////////////////////////////////////////////////////////////
// tab.Point

tab.$create_Point = function tab_Point(x, y) {
    var $o = { };
    $o.x = x;
    $o.y = y;
    return $o;
}


////////////////////////////////////////////////////////////////////////////////
// tab.Size

tab.$create_Size = function tab_Size(width, height) {
    var $o = { };
    $o.width = width;
    $o.height = height;
    return $o;
}


////////////////////////////////////////////////////////////////////////////////
// tab.SheetSize

tab.$create_SheetSize = function tab_SheetSize(behavior, minSize, maxSize) {
    var $o = { };
    $o.behavior = (behavior || 'automatic');
    if (ss.isValue(minSize)) {
        $o.minSize = minSize;
    }
    if (ss.isValue(maxSize)) {
        $o.maxSize = maxSize;
    }
    return $o;
}


////////////////////////////////////////////////////////////////////////////////
// tableauSoftware.CustomView

tableauSoftware.CustomView = function tableauSoftware_CustomView(customViewImpl) {
    this._impl = customViewImpl;
}
tableauSoftware.CustomView.prototype = {
    _impl: null,
    
    getWorkbook: function tableauSoftware_CustomView$getWorkbook() {
        return this._impl.get__workbook();
    },
    
    getUrl: function tableauSoftware_CustomView$getUrl() {
        return this._impl.get__url();
    },
    
    getName: function tableauSoftware_CustomView$getName() {
        return this._impl.get__name();
    },
    
    setName: function tableauSoftware_CustomView$setName(value) {
        this._impl.set__name(value);
    },
    
    getOwnerName: function tableauSoftware_CustomView$getOwnerName() {
        return this._impl.get__ownerName();
    },
    
    getAdvertised: function tableauSoftware_CustomView$getAdvertised() {
        return this._impl.get__advertised();
    },
    
    setAdvertised: function tableauSoftware_CustomView$setAdvertised(value) {
        this._impl.set__advertised(value);
    },
    
    getDefault: function tableauSoftware_CustomView$getDefault() {
        return this._impl.get__isDefault();
    },
    
    saveAsync: function tableauSoftware_CustomView$saveAsync() {
        return this._impl.saveAsync();
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab.CustomViewEvent

tab.CustomViewEvent = function tab_CustomViewEvent(eventName, viz, customViewImpl) {
    tab.CustomViewEvent.initializeBase(this, [ eventName, viz ]);
    this._context$1 = new tab._customViewEventContext(viz._impl.get__workbookImpl(), customViewImpl);
}
tab.CustomViewEvent.prototype = {
    _context$1: null,
    
    getCustomViewAsync: function tab_CustomViewEvent$getCustomViewAsync() {
        return tab._CustomViewImpl._getAsync(this._context$1);
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._customViewEventContext

tab._customViewEventContext = function tab__customViewEventContext(workbook, customViewImpl) {
    tab._customViewEventContext.initializeBase(this, [ workbook, null ]);
    this._customViewImpl$1 = customViewImpl;
}
tab._customViewEventContext.prototype = {
    _customViewImpl$1: null,
    
    get__customViewImpl: function tab__customViewEventContext$get__customViewImpl() {
        return this._customViewImpl$1;
    }
}


////////////////////////////////////////////////////////////////////////////////
// tableauSoftware.Dashboard

tableauSoftware.Dashboard = function tableauSoftware_Dashboard(dashboardImpl) {
    tableauSoftware.Dashboard.initializeBase(this, [ dashboardImpl ]);
}
tableauSoftware.Dashboard.prototype = {
    _impl: null,
    
    getObjects: function tableauSoftware_Dashboard$getObjects() {
        return this._impl.get__objects()._toApiCollection();
    },
    
    getWorksheets: function tableauSoftware_Dashboard$getWorksheets() {
        return this._impl.get__worksheets()._toApiCollection();
    }
}


////////////////////////////////////////////////////////////////////////////////
// tableauSoftware.DashboardObject

tableauSoftware.DashboardObject = function tableauSoftware_DashboardObject(frameInfo, dashboard, worksheet) {
    if (frameInfo._objectType === 'worksheet' && ss.isNullOrUndefined(worksheet)) {
        throw tab._tableauException._createInternalError('worksheet parameter is required for WORKSHEET objects');
    }
    else if (frameInfo._objectType !== 'worksheet' && ss.isValue(worksheet)) {
        throw tab._tableauException._createInternalError('worksheet parameter should be undefined for non-WORKSHEET objects');
    }
    this._frameInfo = frameInfo;
    this._dashboard = dashboard;
    this._worksheet = worksheet;
}
tableauSoftware.DashboardObject.prototype = {
    _frameInfo: null,
    _dashboard: null,
    _worksheet: null,
    
    getObjectType: function tableauSoftware_DashboardObject$getObjectType() {
        return this._frameInfo._objectType;
    },
    
    getDashboard: function tableauSoftware_DashboardObject$getDashboard() {
        return this._dashboard;
    },
    
    getWorksheet: function tableauSoftware_DashboardObject$getWorksheet() {
        return this._worksheet;
    },
    
    getPosition: function tableauSoftware_DashboardObject$getPosition() {
        return this._frameInfo._position;
    },
    
    getSize: function tableauSoftware_DashboardObject$getSize() {
        return this._frameInfo._size;
    }
}


////////////////////////////////////////////////////////////////////////////////
// tableauSoftware.DataSource

tableauSoftware.DataSource = function tableauSoftware_DataSource(impl) {
    this._impl = impl;
}
tableauSoftware.DataSource.prototype = {
    _impl: null,
    
    getName: function tableauSoftware_DataSource$getName() {
        return this._impl.get__name();
    },
    
    getFields: function tableauSoftware_DataSource$getFields() {
        return this._impl.get__fields()._toApiCollection();
    },
    
    getIsPrimary: function tableauSoftware_DataSource$getIsPrimary() {
        return this._impl.get__isPrimary();
    }
}


////////////////////////////////////////////////////////////////////////////////
// tableauSoftware.Field

tableauSoftware.Field = function tableauSoftware_Field(dataSource, name, fieldRoleType, fieldAggrType) {
    this._dataSource = dataSource;
    this._name = name;
    this._fieldRoleType = fieldRoleType;
    this._fieldAggrType = fieldAggrType;
}
tableauSoftware.Field.prototype = {
    _dataSource: null,
    _name: null,
    _fieldRoleType: null,
    _fieldAggrType: null,
    
    getDataSource: function tableauSoftware_Field$getDataSource() {
        return this._dataSource;
    },
    
    getName: function tableauSoftware_Field$getName() {
        return this._name;
    },
    
    getRole: function tableauSoftware_Field$getRole() {
        return this._fieldRoleType;
    },
    
    getAggregation: function tableauSoftware_Field$getAggregation() {
        return this._fieldAggrType;
    }
}


////////////////////////////////////////////////////////////////////////////////
// tableauSoftware.CategoricalFilter

tableauSoftware.CategoricalFilter = function tableauSoftware_CategoricalFilter(worksheetImpl, filterJson) {
    tableauSoftware.CategoricalFilter.initializeBase(this, [ worksheetImpl, filterJson ]);
    this._initializeFromJson$1(filterJson);
}
tableauSoftware.CategoricalFilter.prototype = {
    _isExclude$1: false,
    _appliedValues$1: null,
    
    getIsExcludeMode: function tableauSoftware_CategoricalFilter$getIsExcludeMode() {
        return this._isExclude$1;
    },
    
    getAppliedValues: function tableauSoftware_CategoricalFilter$getAppliedValues() {
        return this._appliedValues$1;
    },
    
    _updateFromJson: function tableauSoftware_CategoricalFilter$_updateFromJson(filterJson) {
        this._initializeFromJson$1(filterJson);
    },
    
    _initializeFromJson$1: function tableauSoftware_CategoricalFilter$_initializeFromJson$1(filterJson) {
        this._isExclude$1 = filterJson.isExclude;
        if (ss.isValue(filterJson.catAppliedValues)) {
            this._appliedValues$1 = [];
            var $enum1 = ss.IEnumerator.getEnumerator(filterJson.catAppliedValues);
            while ($enum1.moveNext()) {
                var v = $enum1.current;
                this._appliedValues$1.push(tab._Utility.getDataValue(v));
            }
        }
    }
}


////////////////////////////////////////////////////////////////////////////////
// tableauSoftware.Filter

tableauSoftware.Filter = function tableauSoftware_Filter(worksheetImpl, filterJson) {
    this._worksheetImpl = worksheetImpl;
    this._initializeFromJson(filterJson);
}
tableauSoftware.Filter._getAsync = function tableauSoftware_Filter$_getAsync(eventContext) {
    return tableauSoftware.Filter._getFilterAsync(eventContext.get__worksheetImpl(), eventContext.get__filterFieldName(), null, null);
}
tableauSoftware.Filter._getFilterAsync = function tableauSoftware_Filter$_getFilterAsync(worksheetImpl, fieldName, fieldCaption, options) {
    if (!tab._Utility.isNullOrEmpty(fieldName) && !tab._Utility.isNullOrEmpty(fieldCaption)) {
        throw tab._tableauException._createInternalError('Only fieldName OR fieldCaption is allowed, not both.');
    }
    options = (options || {});
    var deferred = new tab._Deferred();
    var param = {};
    param['api.worksheetName'] = worksheetImpl.get__name();
    if (ss.isValue(worksheetImpl.get__parentDashboardImpl())) {
        param['api.dashboardName'] = worksheetImpl.get__parentDashboardImpl().get__name();
    }
    if (!tab._Utility.isNullOrEmpty(fieldCaption) && tab._Utility.isNullOrEmpty(fieldName)) {
        param['api.fieldCaption'] = fieldCaption;
    }
    if (!tab._Utility.isNullOrEmpty(fieldName)) {
        param['api.fieldName'] = fieldName;
    }
    param['api.filterHierarchicalLevels'] = 0;
    param['api.ignoreDomain'] = (options.ignoreDomain || false);
    var returnHandler = new tab._CommandReturnHandler('api.GetOneFilterInfoCommand', 0, function(result) {
        var error = tab._WorksheetImpl._filterCommandError(result);
        if (error == null) {
            var filterJson = result;
            var filter = tableauSoftware.Filter._createFilter(worksheetImpl, filterJson);
            deferred.resolve(filter);
        }
        else {
            deferred.reject(error);
        }
    }, function(remoteError, message) {
        deferred.reject(tab._tableauException._createServerError(message));
    });
    worksheetImpl.get__workbookImpl()._sendCommand(param, returnHandler);
    return deferred.get_promise();
}
tableauSoftware.Filter._getFiltersAsync = function tableauSoftware_Filter$_getFiltersAsync(worksheetImpl, options) {
    worksheetImpl._verifyActiveSheetOrEmbeddedInActiveDashboard();
    options = (options || {});
    var deferred = new tab._Deferred();
    var param = {};
    param['api.worksheetName'] = worksheetImpl.get__name();
    if (ss.isValue(worksheetImpl.get__parentDashboardImpl())) {
        param['api.dashboardName'] = worksheetImpl.get__parentDashboardImpl().get__name();
    }
    param['api.ignoreDomain'] = (options.ignoreDomain || false);
    var returnHandler = new tab._CommandReturnHandler('api.GetFiltersListCommand', 0, function(result) {
        var filtersListJson = result;
        worksheetImpl.set__filters(tableauSoftware.Filter._processFiltersList(worksheetImpl, filtersListJson));
        deferred.resolve(worksheetImpl.get__filters()._toApiCollection());
    }, function(remoteError, message) {
        deferred.reject(tab._tableauException._createServerError(message));
    });
    worksheetImpl.get__workbookImpl()._sendCommand(param, returnHandler);
    return deferred.get_promise();
}
tableauSoftware.Filter._createFilter = function tableauSoftware_Filter$_createFilter(worksheetImpl, filterDict) {
    switch (filterDict.type) {
        case 'C':
            return new tableauSoftware.CategoricalFilter(worksheetImpl, filterDict);
        case 'RD':
            return new tableauSoftware.RelativeDateFilter(worksheetImpl, filterDict);
        case 'H':
            return new tableauSoftware.HierarchicalFilter(worksheetImpl, filterDict);
        case 'Q':
            return new tableauSoftware.QuantitativeFilter(worksheetImpl, filterDict);
    }
    return null;
}
tableauSoftware.Filter._processFiltersList = function tableauSoftware_Filter$_processFiltersList(worksheetImpl, filtersListDict) {
    var filters = new tab._Collection();
    var $enum1 = ss.IEnumerator.getEnumerator(filtersListDict.filters);
    while ($enum1.moveNext()) {
        var filter = $enum1.current;
        filters._add(filter.fieldName, tableauSoftware.Filter._createFilter(worksheetImpl, filter));
    }
    return filters;
}
tableauSoftware.Filter._processFieldRole = function tableauSoftware_Filter$_processFieldRole(role) {
    switch (role) {
        case 'dimension':
            return 'dimension';
        case 'measure':
            return 'measure';
    }
    return 'unknown';
}
tableauSoftware.Filter.prototype = {
    _fieldName: null,
    _worksheetImpl: null,
    _type: null,
    _caption: null,
    _field: null,
    _datasourceName: null,
    _fieldRoleType: null,
    _fieldAggrType: null,
    
    getFilterType: function tableauSoftware_Filter$getFilterType() {
        return this._type;
    },
    
    getFieldName: function tableauSoftware_Filter$getFieldName() {
        return this._caption;
    },
    
    getWorksheet: function tableauSoftware_Filter$getWorksheet() {
        return this._worksheetImpl.get__worksheet();
    },
    
    getFieldAsync: function tableauSoftware_Filter$getFieldAsync() {
        var deferred = new tab._Deferred();
        if (this._field == null) {
            var rejected = function(e) {
                deferred.reject(e);
                return null;
            };
            var fulfilled = ss.Delegate.create(this, function(value) {
                this._field = new tableauSoftware.Field(value, this._fieldName, this._fieldRoleType, this._fieldAggrType);
                deferred.resolve(this._field);
                return null;
            });
            tab._dataSourceImpl._getOneDataSourceAsync(this._worksheetImpl, this._datasourceName).then(fulfilled, rejected);
        }
        else {
            window.setTimeout(ss.Delegate.create(this, function() {
                deferred.resolve(this._field);
            }), 0);
        }
        return deferred.get_promise();
    },
    
    _update: function tableauSoftware_Filter$_update(filterJson) {
        this._initializeFromJson(filterJson);
        this._updateFromJson(filterJson);
    },
    
    _addFieldParams: function tableauSoftware_Filter$_addFieldParams(param) {
    },
    
    _initializeFromJson: function tableauSoftware_Filter$_initializeFromJson(filterJson) {
        this._fieldName = filterJson.fieldName;
        this._caption = filterJson.caption;
        switch (filterJson.type) {
            case 'C':
                this._type = 'categorical';
                break;
            case 'RD':
                this._type = 'relativedate';
                break;
            case 'H':
                this._type = 'hierarchical';
                break;
            case 'Q':
                this._type = 'quantitative';
                break;
        }
        this._field = null;
        this._datasourceName = filterJson.datasourceName;
        this._fieldRoleType = tableauSoftware.Filter._processFieldRole(filterJson.fieldRoleType);
        this._fieldAggrType = tab._dataSourceImpl._processAggrType(filterJson.fieldAggrType);
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab.FilterEvent

tab.FilterEvent = function tab_FilterEvent(eventName, viz, worksheetImpl, fieldName, filterCaption) {
    tab.FilterEvent.initializeBase(this, [ eventName, viz, worksheetImpl ]);
    this._filterCaption$2 = filterCaption;
    this._context$2 = new tab._filterEventContext(viz._impl.get__workbookImpl(), worksheetImpl, fieldName, filterCaption);
}
tab.FilterEvent.prototype = {
    _filterCaption$2: null,
    _context$2: null,
    
    getFieldName: function tab_FilterEvent$getFieldName() {
        return this._filterCaption$2;
    },
    
    getFilterAsync: function tab_FilterEvent$getFilterAsync() {
        return tableauSoftware.Filter._getAsync(this._context$2);
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._filterEventContext

tab._filterEventContext = function tab__filterEventContext(workbookImpl, worksheetImpl, fieldFieldName, filterCaption) {
    tab._filterEventContext.initializeBase(this, [ workbookImpl, worksheetImpl ]);
    this._fieldFieldName$1 = fieldFieldName;
    this._filterCaption$1 = filterCaption;
}
tab._filterEventContext.prototype = {
    _fieldFieldName$1: null,
    _filterCaption$1: null,
    
    get__filterFieldName: function tab__filterEventContext$get__filterFieldName() {
        return this._fieldFieldName$1;
    },
    
    get__filterCaption: function tab__filterEventContext$get__filterCaption() {
        return this._filterCaption$1;
    }
}


////////////////////////////////////////////////////////////////////////////////
// tableauSoftware.HierarchicalFilter

tableauSoftware.HierarchicalFilter = function tableauSoftware_HierarchicalFilter(worksheetImpl, filterJson) {
    tableauSoftware.HierarchicalFilter.initializeBase(this, [ worksheetImpl, filterJson ]);
    this._initializeFromJson$1(filterJson);
}
tableauSoftware.HierarchicalFilter.prototype = {
    _levels$1: 0,
    
    _addFieldParams: function tableauSoftware_HierarchicalFilter$_addFieldParams(param) {
        param['api.filterHierarchicalLevels'] = this._levels$1;
    },
    
    _updateFromJson: function tableauSoftware_HierarchicalFilter$_updateFromJson(filterJson) {
        this._initializeFromJson$1(filterJson);
    },
    
    _initializeFromJson$1: function tableauSoftware_HierarchicalFilter$_initializeFromJson$1(filterJson) {
        this._levels$1 = filterJson.levels;
    }
}


////////////////////////////////////////////////////////////////////////////////
// tableauSoftware.QuantitativeFilter

tableauSoftware.QuantitativeFilter = function tableauSoftware_QuantitativeFilter(worksheetImpl, filterJson) {
    tableauSoftware.QuantitativeFilter.initializeBase(this, [ worksheetImpl, filterJson ]);
    this._initializeFromJson$1(filterJson);
}
tableauSoftware.QuantitativeFilter.prototype = {
    _domainMin$1: null,
    _domainMax$1: null,
    _min$1: null,
    _max$1: null,
    _includeNullValues$1: false,
    
    getMin: function tableauSoftware_QuantitativeFilter$getMin() {
        return this._min$1;
    },
    
    getMax: function tableauSoftware_QuantitativeFilter$getMax() {
        return this._max$1;
    },
    
    getIncludeNullValues: function tableauSoftware_QuantitativeFilter$getIncludeNullValues() {
        return this._includeNullValues$1;
    },
    
    getDomainMin: function tableauSoftware_QuantitativeFilter$getDomainMin() {
        return this._domainMin$1;
    },
    
    getDomainMax: function tableauSoftware_QuantitativeFilter$getDomainMax() {
        return this._domainMax$1;
    },
    
    _updateFromJson: function tableauSoftware_QuantitativeFilter$_updateFromJson(filterJson) {
        this._initializeFromJson$1(filterJson);
    },
    
    _initializeFromJson$1: function tableauSoftware_QuantitativeFilter$_initializeFromJson$1(filterJson) {
        this._domainMin$1 = tab._Utility.getDataValue(filterJson.domainMinValue);
        this._domainMax$1 = tab._Utility.getDataValue(filterJson.domainMaxValue);
        this._min$1 = tab._Utility.getDataValue(filterJson.minValue);
        this._max$1 = tab._Utility.getDataValue(filterJson.maxValue);
        this._includeNullValues$1 = filterJson.includeNullValues;
    }
}


////////////////////////////////////////////////////////////////////////////////
// tableauSoftware.RelativeDateFilter

tableauSoftware.RelativeDateFilter = function tableauSoftware_RelativeDateFilter(worksheetImpl, filterJson) {
    tableauSoftware.RelativeDateFilter.initializeBase(this, [ worksheetImpl, filterJson ]);
    this._initializeFromJson$1(filterJson);
}
tableauSoftware.RelativeDateFilter.prototype = {
    _periodType$1: null,
    _rangeType$1: null,
    _rangeN$1: 0,
    
    getPeriod: function tableauSoftware_RelativeDateFilter$getPeriod() {
        return this._periodType$1;
    },
    
    getRange: function tableauSoftware_RelativeDateFilter$getRange() {
        return this._rangeType$1;
    },
    
    getRangeN: function tableauSoftware_RelativeDateFilter$getRangeN() {
        return this._rangeN$1;
    },
    
    _updateFromJson: function tableauSoftware_RelativeDateFilter$_updateFromJson(filterJson) {
        this._initializeFromJson$1(filterJson);
    },
    
    _initializeFromJson$1: function tableauSoftware_RelativeDateFilter$_initializeFromJson$1(filterJson) {
        if (ss.isValue(filterJson.periodType)) {
            this._periodType$1 = tab._enums._normalizePeriodType(filterJson.periodType, 'periodType');
        }
        if (ss.isValue(filterJson.rangeType)) {
            this._rangeType$1 = tab._enums._normalizeDateRangeType(filterJson.rangeType, 'rangeType');
        }
        if (ss.isValue(filterJson.rangeN)) {
            this._rangeN$1 = filterJson.rangeN;
        }
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._loadFeedback

tab._loadFeedback = function tab__loadFeedback() {
}
tab._loadFeedback.prototype = {
    _placeholderDiv: null,
    _glassPaneElement: null,
    _displayStyle: null,
    
    _createLoadingFeedback: function tab__loadFeedback$_createLoadingFeedback(objectParams) {
        this._placeholderDiv = objectParams._contentRootElement;
        var placeholderStyle = this._placeholderDiv.style;
        this._displayStyle = placeholderStyle.display;
        placeholderStyle.position = 'relative';
        placeholderStyle.overflow = 'hidden';
        placeholderStyle.display = 'none';
        var html = [];
        html.push('<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; border: 0; padding: 0; margin: 0">');
        html.push('</div>');
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = html.join('');
        this._glassPaneElement = tempDiv.firstChild;
        this._placeholderDiv.appendChild(this._glassPaneElement);
        tempDiv.innerHTML = '';
        tempDiv = null;
    },
    
    _show: function tab__loadFeedback$_show() {
        if (ss.isValue(this._placeholderDiv)) {
            this._placeholderDiv.style.display = this._displayStyle;
        }
    },
    
    _dispose: function tab__loadFeedback$_dispose() {
        if (ss.isValue(this._glassPaneElement)) {
            this._glassPaneElement.innerHTML = '';
            this._glassPaneElement.parentNode.removeChild(this._glassPaneElement);
            this._glassPaneElement = null;
        }
    }
}


////////////////////////////////////////////////////////////////////////////////
// tableauSoftware.Mark

tableauSoftware.Mark = function tableauSoftware_Mark(tupleIdOrPairs) {
    this._impl = new tab._markImpl(tupleIdOrPairs);
}
tableauSoftware.Mark.prototype = {
    _impl: null,
    
    getPairs: function tableauSoftware_Mark$getPairs() {
        return this._impl.get__clonedPairs();
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab.MarksEvent

tab.MarksEvent = function tab_MarksEvent(eventName, viz, worksheetImpl) {
    tab.MarksEvent.initializeBase(this, [ eventName, viz, worksheetImpl ]);
    this._context$2 = new tab._marksEventContext(viz._impl.get__workbookImpl(), worksheetImpl);
}
tab.MarksEvent.prototype = {
    _context$2: null,
    
    getMarksAsync: function tab_MarksEvent$getMarksAsync() {
        return tab._markImpl._getAsync(this._context$2);
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._marksEventContext

tab._marksEventContext = function tab__marksEventContext(workbookImpl, worksheetImpl) {
    tab._marksEventContext.initializeBase(this, [ workbookImpl, worksheetImpl ]);
}


////////////////////////////////////////////////////////////////////////////////
// tableauSoftware.Pair

tableauSoftware.Pair = function tableauSoftware_Pair(fieldName, value) {
    this.fieldName = fieldName;
    this.value = value;
    this.formattedValue = (ss.isValue(value)) ? value.toString() : '';
}
tableauSoftware.Pair.prototype = {
    fieldName: null,
    value: null,
    formattedValue: null
}


////////////////////////////////////////////////////////////////////////////////
// tableauSoftware.Parameter

tableauSoftware.Parameter = function tableauSoftware_Parameter(impl) {
    this._impl = impl;
}
tableauSoftware.Parameter.prototype = {
    _impl: null,
    
    getName: function tableauSoftware_Parameter$getName() {
        return this._impl.get__name();
    },
    
    getCurrentValue: function tableauSoftware_Parameter$getCurrentValue() {
        return this._impl.get__currentValue();
    },
    
    getDataType: function tableauSoftware_Parameter$getDataType() {
        return this._impl.get__dataType();
    },
    
    getAllowableValuesType: function tableauSoftware_Parameter$getAllowableValuesType() {
        return this._impl.get__allowableValuesType();
    },
    
    getAllowableValues: function tableauSoftware_Parameter$getAllowableValues() {
        return this._impl.get__allowableValues();
    },
    
    getMinValue: function tableauSoftware_Parameter$getMinValue() {
        return this._impl.get__minValue();
    },
    
    getMaxValue: function tableauSoftware_Parameter$getMaxValue() {
        return this._impl.get__maxValue();
    },
    
    getStepSize: function tableauSoftware_Parameter$getStepSize() {
        return this._impl.get__stepSize();
    },
    
    getDateStepPeriod: function tableauSoftware_Parameter$getDateStepPeriod() {
        return this._impl.get__dateStepPeriod();
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab.ParameterEvent

tab.ParameterEvent = function tab_ParameterEvent(eventName, viz, parameterName) {
    tab.ParameterEvent.initializeBase(this, [ eventName, viz ]);
    this._context$1 = new tab._parameterEventContext(viz._impl.get__workbookImpl(), parameterName);
}
tab.ParameterEvent.prototype = {
    _context$1: null,
    
    getParameterName: function tab_ParameterEvent$getParameterName() {
        return this._context$1.get__parameterName();
    },
    
    getParameterAsync: function tab_ParameterEvent$getParameterAsync() {
        return tab._parameterImpl._getAsync(this._context$1);
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._parameterEventContext

tab._parameterEventContext = function tab__parameterEventContext(workbookImpl, parameterName) {
    tab._parameterEventContext.initializeBase(this, [ workbookImpl, null ]);
    this._parameterName$1 = parameterName;
}
tab._parameterEventContext.prototype = {
    _parameterName$1: null,
    
    get__parameterName: function tab__parameterEventContext$get__parameterName() {
        return this._parameterName$1;
    }
}


////////////////////////////////////////////////////////////////////////////////
// tableauSoftware.Sheet

tableauSoftware.Sheet = function tableauSoftware_Sheet(sheetImpl) {
    this._impl = sheetImpl;
}
tableauSoftware.Sheet.prototype = {
    _impl: null,
    
    getName: function tableauSoftware_Sheet$getName() {
        return this._impl.get__name();
    },
    
    getIndex: function tableauSoftware_Sheet$getIndex() {
        return this._impl.get__index();
    },
    
    getWorkbook: function tableauSoftware_Sheet$getWorkbook() {
        return this._impl.get__workbookImpl().get__workbook();
    },
    
    getSize: function tableauSoftware_Sheet$getSize() {
        return this._impl.get__size();
    },
    
    getIsHidden: function tableauSoftware_Sheet$getIsHidden() {
        return this._impl.get__isHidden();
    },
    
    getIsActive: function tableauSoftware_Sheet$getIsActive() {
        return this._impl.get__isActive();
    },
    
    getSheetType: function tableauSoftware_Sheet$getSheetType() {
        return this._impl.get__sheetType();
    },
    
    getUrl: function tableauSoftware_Sheet$getUrl() {
        return this._impl.get__url();
    },
    
    changeSizeAsync: function tableauSoftware_Sheet$changeSizeAsync(size) {
        return this._impl._changeSizeAsync(size);
    }
}


////////////////////////////////////////////////////////////////////////////////
// tableauSoftware.SheetInfo

tableauSoftware.SheetInfo = function tableauSoftware_SheetInfo(impl) {
    this._impl = impl;
}
tableauSoftware.SheetInfo.prototype = {
    _impl: null,
    
    getName: function tableauSoftware_SheetInfo$getName() {
        return this._impl._name;
    },
    
    getSheetType: function tableauSoftware_SheetInfo$getSheetType() {
        return this._impl._sheetType;
    },
    
    getSize: function tableauSoftware_SheetInfo$getSize() {
        return this._impl._size;
    },
    
    getIndex: function tableauSoftware_SheetInfo$getIndex() {
        return this._impl._index;
    },
    
    getUrl: function tableauSoftware_SheetInfo$getUrl() {
        return this._impl._url;
    },
    
    getIsActive: function tableauSoftware_SheetInfo$getIsActive() {
        return this._impl._isActive;
    },
    
    getIsHidden: function tableauSoftware_SheetInfo$getIsHidden() {
        return this._impl._isHidden;
    },
    
    getWorkbook: function tableauSoftware_SheetInfo$getWorkbook() {
        return this._impl._workbook;
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab.TableauEvent

tab.TableauEvent = function tab_TableauEvent(eventName, viz) {
    this._viz = viz;
    this._eventName = eventName;
}
tab.TableauEvent.prototype = {
    _viz: null,
    _eventName: null,
    
    getViz: function tab_TableauEvent$getViz() {
        return this._viz;
    },
    
    getEventName: function tab_TableauEvent$getEventName() {
        return this._eventName;
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab.EventContext

tab.EventContext = function tab_EventContext(workbookImpl, worksheetImpl) {
    this._workbookImpl = workbookImpl;
    this._worksheetImpl = worksheetImpl;
}
tab.EventContext.prototype = {
    _workbookImpl: null,
    _worksheetImpl: null,
    
    get__workbookImpl: function tab_EventContext$get__workbookImpl() {
        return this._workbookImpl;
    },
    
    get__worksheetImpl: function tab_EventContext$get__worksheetImpl() {
        return this._worksheetImpl;
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab.TabSwitchEvent

tab.TabSwitchEvent = function tab_TabSwitchEvent(eventName, viz, oldName, newName) {
    tab.TabSwitchEvent.initializeBase(this, [ eventName, viz ]);
    this._oldName$1 = oldName;
    this._newName$1 = newName;
}
tab.TabSwitchEvent.prototype = {
    _oldName$1: null,
    _newName$1: null,
    
    getOldSheetName: function tab_TabSwitchEvent$getOldSheetName() {
        return this._oldName$1;
    },
    
    getNewSheetName: function tab_TabSwitchEvent$getNewSheetName() {
        return this._newName$1;
    }
}


////////////////////////////////////////////////////////////////////////////////
// tableauSoftware.Viz

tableauSoftware.Viz = function tableauSoftware_Viz(parentElement, url, options) {
    this._impl = new tab._VizImpl(this, parentElement, url, options);
    this._impl._create();
}
tableauSoftware.Viz.getLastRequestMessage = function tableauSoftware_Viz$getLastRequestMessage() {
    return tab._ApiCommand.lastRequestMessage;
}
tableauSoftware.Viz.getLastResponseMessage = function tableauSoftware_Viz$getLastResponseMessage() {
    return tab._ApiCommand.lastResponseMessage;
}
tableauSoftware.Viz.getLastClientInfoResponseMessage = function tableauSoftware_Viz$getLastClientInfoResponseMessage() {
    return tab._ApiCommand.lastClientInfoResponseMessage;
}
tableauSoftware.Viz.prototype = {
    _impl: null,
    
    getAreTabsHidden: function tableauSoftware_Viz$getAreTabsHidden() {
        return this._impl.get__areTabsHidden();
    },
    
    getIsToolbarHidden: function tableauSoftware_Viz$getIsToolbarHidden() {
        return this._impl.get__isToolbarHidden();
    },
    
    getIsHidden: function tableauSoftware_Viz$getIsHidden() {
        return this._impl.get__isHidden();
    },
    
    getParentElement: function tableauSoftware_Viz$getParentElement() {
        return this._impl.get__parentElement();
    },
    
    getUrl: function tableauSoftware_Viz$getUrl() {
        return this._impl.get__url();
    },
    
    getWorkbook: function tableauSoftware_Viz$getWorkbook() {
        return this._impl.get__workbook();
    },
    
    getAreAutomaticUpdatesPaused: function tableauSoftware_Viz$getAreAutomaticUpdatesPaused() {
        return this._impl.get__areAutomaticUpdatesPaused();
    },
    
    addEventListener: function tableauSoftware_Viz$addEventListener(eventName, handler) {
        this._impl._addEventListener(eventName, handler);
    },
    
    removeEventListener: function tableauSoftware_Viz$removeEventListener(eventName, handler) {
        this._impl._removeEventListener(eventName, handler);
    },
    
    dispose: function tableauSoftware_Viz$dispose() {
        this._impl._dispose();
    },
    
    show: function tableauSoftware_Viz$show() {
        this._impl._show();
    },
    
    hide: function tableauSoftware_Viz$hide() {
        this._impl._hide();
    },
    
    showExportDataDialog: function tableauSoftware_Viz$showExportDataDialog(worksheetWithinDashboard) {
        this._impl._showExportDataDialog(worksheetWithinDashboard);
    },
    
    showExportCrossTabDialog: function tableauSoftware_Viz$showExportCrossTabDialog(worksheetWithinDashboard) {
        this._impl._showExportCrossTabDialog(worksheetWithinDashboard);
    },
    
    showExportImageDialog: function tableauSoftware_Viz$showExportImageDialog() {
        this._impl._showExportImageDialog();
    },
    
    showExportPDFDialog: function tableauSoftware_Viz$showExportPDFDialog() {
        this._impl._showExportPDFDialog();
    },
    
    revertAllAsync: function tableauSoftware_Viz$revertAllAsync() {
        return this._impl._revertAllAsync();
    },
    
    refreshDataAsync: function tableauSoftware_Viz$refreshDataAsync() {
        return this._impl._refreshDataAsync();
    },
    
    showShareDialog: function tableauSoftware_Viz$showShareDialog() {
        this._impl._showShareDialog();
    },
    
    showDownloadWorkbookDialog: function tableauSoftware_Viz$showDownloadWorkbookDialog() {
        this._impl._showDownloadWorkbookDialog();
    },
    
    pauseAutomaticUpdatesAsync: function tableauSoftware_Viz$pauseAutomaticUpdatesAsync() {
        return this._impl._pauseAutomaticUpdatesAsync();
    },
    
    resumeAutomaticUpdatesAsync: function tableauSoftware_Viz$resumeAutomaticUpdatesAsync() {
        return this._impl._resumeAutomaticUpdatesAsync();
    },
    
    toggleAutomaticUpdatesAsync: function tableauSoftware_Viz$toggleAutomaticUpdatesAsync() {
        return this._impl._toggleAutomaticUpdatesAsync();
    },
    
    setFrameSize: function tableauSoftware_Viz$setFrameSize(width, height) {
        var widthString = width;
        var heightString = height;
        if (tab._Utility.isNumber(width)) {
            widthString = width + 'px';
        }
        if (tab._Utility.isNumber(height)) {
            heightString = height + 'px';
        }
        this._impl._setFrameSize(widthString, heightString);
    }
}


////////////////////////////////////////////////////////////////////////////////
// tableauSoftware.VizManager

tableauSoftware.VizManager = function tableauSoftware_VizManager() {
}
tableauSoftware.VizManager.getVizs = function tableauSoftware_VizManager$getVizs() {
    return tab._VizManagerImpl.get__clonedVizs();
}


////////////////////////////////////////////////////////////////////////////////
// tableauSoftware.Workbook

tableauSoftware.Workbook = function tableauSoftware_Workbook(workbookImpl) {
    this._workbookImpl = workbookImpl;
}
tableauSoftware.Workbook.prototype = {
    _workbookImpl: null,
    
    getViz: function tableauSoftware_Workbook$getViz() {
        return this._workbookImpl.get__viz();
    },
    
    getPublishedSheetsInfo: function tableauSoftware_Workbook$getPublishedSheetsInfo() {
        return this._workbookImpl.get__publishedSheets()._toApiCollection();
    },
    
    getName: function tableauSoftware_Workbook$getName() {
        return this._workbookImpl.get__name();
    },
    
    getActiveSheet: function tableauSoftware_Workbook$getActiveSheet() {
        return this._workbookImpl.get__activeSheetImpl().get__sheet();
    },
    
    getActiveCustomView: function tableauSoftware_Workbook$getActiveCustomView() {
        return this._workbookImpl.get__activeCustomView();
    },
    
    activateSheetAsync: function tableauSoftware_Workbook$activateSheetAsync(sheetNameOrIndex) {
        return this._workbookImpl._setActiveSheetAsync(sheetNameOrIndex);
    },
    
    revertAllAsync: function tableauSoftware_Workbook$revertAllAsync() {
        return this._workbookImpl._revertAllAsync();
    },
    
    getCustomViewsAsync: function tableauSoftware_Workbook$getCustomViewsAsync() {
        return this._workbookImpl._getCustomViewsAsync();
    },
    
    showCustomViewAsync: function tableauSoftware_Workbook$showCustomViewAsync(customViewName) {
        return this._workbookImpl._showCustomViewAsync(customViewName);
    },
    
    removeCustomViewAsync: function tableauSoftware_Workbook$removeCustomViewAsync(customViewName) {
        return this._workbookImpl._removeCustomViewAsync(customViewName);
    },
    
    rememberCustomViewAsync: function tableauSoftware_Workbook$rememberCustomViewAsync(customViewName) {
        return this._workbookImpl._rememberCustomViewAsync(customViewName);
    },
    
    setActiveCustomViewAsDefaultAsync: function tableauSoftware_Workbook$setActiveCustomViewAsDefaultAsync() {
        return this._workbookImpl._setActiveCustomViewAsDefaultAsync();
    },
    
    getParametersAsync: function tableauSoftware_Workbook$getParametersAsync() {
        return this._workbookImpl._getParametersAsync();
    },
    
    changeParameterValueAsync: function tableauSoftware_Workbook$changeParameterValueAsync(parameterName, value) {
        return this._workbookImpl._changeParameterValueAsync(parameterName, value);
    }
}


////////////////////////////////////////////////////////////////////////////////
// tableauSoftware.Worksheet

tableauSoftware.Worksheet = function tableauSoftware_Worksheet(impl) {
    tableauSoftware.Worksheet.initializeBase(this, [ impl ]);
}
tableauSoftware.Worksheet.prototype = {
    _impl: null,
    
    getDataSourcesAsync: function tableauSoftware_Worksheet$getDataSourcesAsync() {
        return this._impl._getDataSourcesAsync();
    },
    
    getParentDashboard: function tableauSoftware_Worksheet$getParentDashboard() {
        return this._impl.get__parentDashboard();
    },
    
    getFilterAsync: function tableauSoftware_Worksheet$getFilterAsync(fieldName, options) {
        return tableauSoftware.Filter._getFilterAsync(this._impl, null, fieldName, options);
    },
    
    getFiltersAsync: function tableauSoftware_Worksheet$getFiltersAsync(options) {
        return this._impl._getFiltersAsync(options);
    },
    
    applyFilterAsync: function tableauSoftware_Worksheet$applyFilterAsync(fieldName, values, updateType, options) {
        return this._impl._applyFilterAsync(fieldName, values, updateType, options);
    },
    
    clearFilterAsync: function tableauSoftware_Worksheet$clearFilterAsync(fieldName) {
        return this._impl._clearFilterAsync(fieldName);
    },
    
    applyRangeFilterAsync: function tableauSoftware_Worksheet$applyRangeFilterAsync(fieldName, options) {
        return this._impl._applyRangeFilterAsync(fieldName, options);
    },
    
    applyRelativeDateFilterAsync: function tableauSoftware_Worksheet$applyRelativeDateFilterAsync(fieldName, options) {
        return this._impl._applyRelativeDateFilterAsync(fieldName, options);
    },
    
    applyHierarchicalFilterAsync: function tableauSoftware_Worksheet$applyHierarchicalFilterAsync(fieldName, values, updateType, options) {
        return this._impl._applyHierarchicalFilterAsync(fieldName, values, updateType, options);
    },
    
    clearSelectedMarksAsync: function tableauSoftware_Worksheet$clearSelectedMarksAsync() {
        return this._impl._clearSelectedMarksAsync();
    },
    
    selectMarksAsync: function tableauSoftware_Worksheet$selectMarksAsync(fieldNameOrFieldValuesMap, valueOrUpdateType, updateType) {
        return this._impl._selectMarksAsync(fieldNameOrFieldValuesMap, valueOrUpdateType, updateType);
    },
    
    getSelectedMarksAsync: function tableauSoftware_Worksheet$getSelectedMarksAsync() {
        return this._impl._getSelectedMarksAsync();
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab.WorksheetEvent

tab.WorksheetEvent = function tab_WorksheetEvent(eventName, viz, worksheetImpl) {
    tab.WorksheetEvent.initializeBase(this, [ eventName, viz ]);
    this._worksheetImpl$1 = worksheetImpl;
}
tab.WorksheetEvent.prototype = {
    _worksheetImpl$1: null,
    
    getWorksheet: function tab_WorksheetEvent$getWorksheet() {
        return this._worksheetImpl$1.get__worksheet();
    }
}


////////////////////////////////////////////////////////////////////////////////
// tab._jQueryShim

tab._jQueryShim = function tab__jQueryShim() {
}
tab._jQueryShim.isFunction = function tab__jQueryShim$isFunction(obj) {
    return tab._jQueryShim.type(obj) === 'function';
}
tab._jQueryShim.isArray = function tab__jQueryShim$isArray(obj) {
    if (ss.isValue(Array.isArray)) {
        return Array.isArray(obj);
    }
    return tab._jQueryShim.type(obj) === 'array';
}
tab._jQueryShim.type = function tab__jQueryShim$type(obj) {
    return (obj == null) ? String(obj) : (tab._jQueryShim._class2type[tab._jQueryShim._toString.call(obj)] || 'object');
}
tab._jQueryShim.trim = function tab__jQueryShim$trim(text) {
    if (ss.isValue(tab._jQueryShim._trim)) {
        return (text == null) ? '' : tab._jQueryShim._trim.call(text);
    }
    return (text == null) ? '' : text.replace(tab._jQueryShim._trimLeft, '').replace(tab._jQueryShim._trimRight, '');
}
tab._jQueryShim.parseJSON = function tab__jQueryShim$parseJSON(data) {
    if (typeof(data) !== 'string' || ss.isNullOrUndefined(data)) {
        return null;
    }
    data = tab._jQueryShim.trim(data);
    if (window.JSON && window.JSON.parse) {
        return window.JSON.parse(data);
    }
    if (tab._jQueryShim._rvalidchars.test(data.replace(tab._jQueryShim._rvalidescape, '@').replace(tab._jQueryShim._rvalidtokens, ']').replace(tab._jQueryShim._rvalidbraces, ''))) {
        return (new Function("return " + data))();
    }
    throw new Error('Invalid JSON: ' + data);
}


tab._ApiCommand.registerClass('tab._ApiCommand');
tab._apiServerResultParser.registerClass('tab._apiServerResultParser');
tab._apiServerNotificationParser.registerClass('tab._apiServerNotificationParser');
tab._CommandReturnHandler.registerClass('tab._CommandReturnHandler');
tab._CrossDomainMessageRouter.registerClass('tab._CrossDomainMessageRouter');
tab._doNothingCrossDomainHandler.registerClass('tab._doNothingCrossDomainHandler', null, tab.ICrossDomainMessageHandler);
tab._enums.registerClass('tab._enums');
tab._ApiBootstrap.registerClass('tab._ApiBootstrap');
tab._CustomViewImpl.registerClass('tab._CustomViewImpl');
tab._SheetImpl.registerClass('tab._SheetImpl');
tab._DashboardImpl.registerClass('tab._DashboardImpl', tab._SheetImpl);
tab._dataSourceImpl.registerClass('tab._dataSourceImpl');
tab._deferredUtil.registerClass('tab._deferredUtil');
tab._CollectionImpl.registerClass('tab._CollectionImpl');
tab._DeferredImpl.registerClass('tab._DeferredImpl');
tab._PromiseImpl.registerClass('tab._PromiseImpl');
tab._markImpl.registerClass('tab._markImpl');
tab._parameterImpl.registerClass('tab._parameterImpl');
tab._tableauException.registerClass('tab._tableauException');
tab._Utility.registerClass('tab._Utility');
tab._VizImpl.registerClass('tab._VizImpl', null, tab.ICrossDomainMessageHandler);
tab._VizManagerImpl.registerClass('tab._VizManagerImpl');
tab._VizParameters.registerClass('tab._VizParameters');
tab._WorkbookImpl.registerClass('tab._WorkbookImpl');
tab._WorksheetImpl.registerClass('tab._WorksheetImpl', tab._SheetImpl);
tab.JsonUtil.registerClass('tab.JsonUtil');
tableauSoftware.CustomView.registerClass('tableauSoftware.CustomView');
tab.TableauEvent.registerClass('tab.TableauEvent');
tab.CustomViewEvent.registerClass('tab.CustomViewEvent', tab.TableauEvent);
tab.EventContext.registerClass('tab.EventContext');
tab._customViewEventContext.registerClass('tab._customViewEventContext', tab.EventContext);
tableauSoftware.Sheet.registerClass('tableauSoftware.Sheet');
tableauSoftware.Dashboard.registerClass('tableauSoftware.Dashboard', tableauSoftware.Sheet);
tableauSoftware.DashboardObject.registerClass('tableauSoftware.DashboardObject');
tableauSoftware.DataSource.registerClass('tableauSoftware.DataSource');
tableauSoftware.Field.registerClass('tableauSoftware.Field');
tableauSoftware.Filter.registerClass('tableauSoftware.Filter');
tableauSoftware.CategoricalFilter.registerClass('tableauSoftware.CategoricalFilter', tableauSoftware.Filter);
tab.WorksheetEvent.registerClass('tab.WorksheetEvent', tab.TableauEvent);
tab.FilterEvent.registerClass('tab.FilterEvent', tab.WorksheetEvent);
tab._filterEventContext.registerClass('tab._filterEventContext', tab.EventContext);
tableauSoftware.HierarchicalFilter.registerClass('tableauSoftware.HierarchicalFilter', tableauSoftware.Filter);
tableauSoftware.QuantitativeFilter.registerClass('tableauSoftware.QuantitativeFilter', tableauSoftware.Filter);
tableauSoftware.RelativeDateFilter.registerClass('tableauSoftware.RelativeDateFilter', tableauSoftware.Filter);
tab._loadFeedback.registerClass('tab._loadFeedback');
tableauSoftware.Mark.registerClass('tableauSoftware.Mark');
tab.MarksEvent.registerClass('tab.MarksEvent', tab.WorksheetEvent);
tab._marksEventContext.registerClass('tab._marksEventContext', tab.EventContext);
tableauSoftware.Pair.registerClass('tableauSoftware.Pair');
tableauSoftware.Parameter.registerClass('tableauSoftware.Parameter');
tab.ParameterEvent.registerClass('tab.ParameterEvent', tab.TableauEvent);
tab._parameterEventContext.registerClass('tab._parameterEventContext', tab.EventContext);
tableauSoftware.SheetInfo.registerClass('tableauSoftware.SheetInfo');
tab.TabSwitchEvent.registerClass('tab.TabSwitchEvent', tab.TableauEvent);
tableauSoftware.Viz.registerClass('tableauSoftware.Viz');
tableauSoftware.VizManager.registerClass('tableauSoftware.VizManager');
tableauSoftware.Workbook.registerClass('tableauSoftware.Workbook');
tableauSoftware.Worksheet.registerClass('tableauSoftware.Worksheet', tableauSoftware.Sheet);
tab._jQueryShim.registerClass('tab._jQueryShim');
tab._ApiCommand.crossDomainEventNotificationId = 'xdomainSourceId';
tab._ApiCommand.lastRequestMessage = null;
tab._ApiCommand.lastResponseMessage = null;
tab._ApiCommand.lastClientInfoResponseMessage = null;
tab._CrossDomainMessageRouter._nextHandlerId = 0;
tab._CrossDomainMessageRouter._nextCommandId = 0;
tab._CrossDomainMessageRouter._handlers = {};
tab._CrossDomainMessageRouter._commandCallbacks = {};
tab._CrossDomainMessageRouter._customViewLoadCallbacks = {};
tab._CrossDomainMessageRouter._commandReturnAfterStateReadyQueues = {};
tab._dataSourceImpl._fieldAggrDict = { sum: 'SUM', average: 'AVG', min: 'MIN', max: 'MAX', 'std-dev': 'STDEV', 'std-dev-p': 'STDEVP', 'var': 'VAR', 'var-p': 'VARP', count: 'COUNT', 'count-d': 'COUNTD', median: 'MEDIAN', attr: 'ATTR', none: 'NONE', year: 'YEAR', qtr: 'QTR', month: 'MONTH', day: 'DAY', hour: 'HOUR', minute: 'MINUTE', second: 'SECOND', week: 'WEEK', weekday: 'WEEKDAY', 'month-year': 'MONTHYEAR', mdy: 'MDY', end: 'END', 'trunc-year': 'TRUNC_YEAR', 'trunc-qtr': 'TRUNC_QTR', 'trunc-month': 'TRUNC_MONTH', 'trunc-week': 'TRUNC_WEEK', 'trunc-day': 'TRUNC_DAY', 'trunc-hour': 'TRUNC_HOUR', 'trunc-minute': 'TRUNC_MINUTE', 'trunc-second': 'TRUNC_SECOND', quart1: 'QUART1', quart3: 'QUART3', skewness: 'SKEWNESS', kurtosis: 'KURTOSIS', 'in-out': 'INOUT', 'sum-xsqr': 'SUM_XSQR', user: 'USER' };
tab._VizManagerImpl._vizs = [];
tab._WorksheetImpl._regexHierarchicalFieldName$1 = new RegExp('\\[[^\\]]+\\]\\.', 'g');
tab._jQueryShim._class2type = { '[object Boolean]': 'boolean', '[object Number]': 'number', '[object String]': 'string', '[object Function]': 'function', '[object Array]': 'array', '[object Date]': 'date', '[object RegExp]': 'regexp', '[object Object]': 'object' };
tab._jQueryShim._trim = String.prototype.trim;
tab._jQueryShim._toString = Object.prototype.toString;
tab._jQueryShim._trimLeft = new RegExp('^[\\s\\xA0]+');
tab._jQueryShim._trimRight = new RegExp('[\\s\\xA0]+$');
tab._jQueryShim._rvalidchars = new RegExp('^[\\],:{}\\s]*$');
tab._jQueryShim._rvalidescape = new RegExp('\\\\(?:["\\\\\\/bfnrt]|u[0-9a-fA-F]{4})', 'g');
tab._jQueryShim._rvalidtokens = new RegExp('"[^"\\\\\\n\\r]*"|true|false|null|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?', 'g');
tab._jQueryShim._rvalidbraces = new RegExp('(?:^|:|,)(?:\\s*\\[)+', 'g');

tableauSoftware.Promise = tab._PromiseImpl;
tab._Deferred = tab._DeferredImpl;
tab._Collection = tab._CollectionImpl;

////////////////////////////////////////////////////////////////////////////////
// Enums
////////////////////////////////////////////////////////////////////////////////

tableauSoftware.DashboardObjectType = {
  BLANK: 'blank',
  WORKSHEET: 'worksheet',
  QUICK_FILTER: 'quickFilter',
  PARAMETER_CONTROL: 'parameterControl',
  PAGE_FILTER: 'pageFilter',
  LEGEND: 'legend',
  TITLE: 'title',
  TEXT: 'text',
  IMAGE: 'image',
  WEB_PAGE: 'webPage'
};

tableauSoftware.FilterType = {
  CATEGORICAL: 'categorical',
  QUANTITATIVE: 'quantitative',
  HIERARCHICAL: 'hierarchical',
  RELATIVEDATE: 'relativedate'
};

tableauSoftware.ParameterDataType = {
  FLOAT: 'float',
  INTEGER: 'integer',
  STRING: 'string',
  BOOLEAN: 'boolean',
  DATE: 'date',
  DATETIME: 'datetime'
};

tableauSoftware.ParameterAllowableValuesType = {
  ALL: 'all',
  LIST: 'list',
  RANGE: 'range'
};

tableauSoftware.PeriodType = {
  YEAR: 'year',
  QUARTER: 'quarter',
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day',
  HOUR: 'hour',
  MINUTE: 'minute',
  SECOND: 'second'
};

tableauSoftware.DateRangeType = {
  LAST: 'last',
  LASTN: 'lastn',
  NEXT: 'next',
  NEXTN: 'nextn',
  CURR: 'curr',
  TODATE: 'todate'
};

tableauSoftware.SheetSizeBehavior = {
  AUTOMATIC: 'automatic',
  EXACTLY: 'exactly',
  RANGE: 'range',
  ATLEAST: 'atleast',
  ATMOST: 'atmost'
};

tableauSoftware.SheetType = {
  WORKSHEET: 'worksheet',
  DASHBOARD: 'dashboard'
};

tableauSoftware.FilterUpdateType = {
  ALL: 'all',
  REPLACE: 'replace',
  ADD: 'add',
  REMOVE: 'remove'
};

tableauSoftware.SelectionUpdateType = {
  REPLACE: 'replace',
  ADD: 'add',
  REMOVE: 'remove'
};

tableauSoftware.NullOption = {
  NULL_VALUES: 'nullValues',
  NON_NULL_VALUES: 'nonNullValues',
  ALL_VALUES: 'allValues'
};

tableauSoftware.ErrorCode = {
  INTERNAL_ERROR: 'internalError',
  SERVER_ERROR: 'serverError',
  INVALID_PARAMETER: 'invalidParameter',
  INVALID_URL: 'invalidUrl',
  STALE_DATA_REFERENCE: 'staleDataReference',
  VIZ_ALREADY_IN_MANAGER: 'vizAlreadyInManager',
  NO_URL_OR_PARENT_ELEMENT_NOT_FOUND: 'noUrlOrParentElementNotFound',
  INVALID_FILTER_FIELDNAME: 'invalidFilterFieldName',
  INVALID_FILTER_FIELDVALUE: 'invalidFilterFieldValue',
  INVALID_FILTER_FIELDNAME_OR_VALUE: 'invalidFilterFieldNameOrValue',
  FILTER_CANNOT_BE_PERFORMED: 'filterCannotBePerformed',
  NOT_ACTIVE_SHEET: 'notActiveSheet',
  INVALID_CUSTOM_VIEW_NAME: 'invalidCustomViewName',
  MISSING_RANGEN_FOR_RELATIVE_DATE_FILTERS: 'missingRangeNForRelativeDateFilters',
  MISSING_MAX_SIZE: 'missingMaxSize',
  MISSING_MIN_SIZE: 'missingMinSize',
  MISSING_MINMAX_SIZE: 'missingMinMaxSize',
  INVALID_SIZE: 'invalidSize',
  INVALID_SIZE_BEHAVIOR_ON_WORKSHEET: 'invalidSizeBehaviorOnWorksheet',
  SHEET_NOT_IN_WORKBOOK: 'sheetNotInWorkbook',
  INDEX_OUT_OF_RANGE: 'indexOutOfRange',
  DOWNLOAD_WORKBOOK_NOT_ALLOWED: 'downloadWorkbookNotAllowed',
  NULL_OR_EMPTY_PARAMETER: 'nullOrEmptyParameter',
  BROWSER_NOT_CAPABLE: 'browserNotCapable',
  UNSUPPORTED_EVENT_NAME: 'unsupportedEventName',
  INVALID_DATE_PARAMETER: 'invalidDateParameter',
  INVALID_SELECTION_FIELDNAME: 'invalidSelectionFieldName',
  INVALID_SELECTION_VALUE: 'invalidSelectionValue',
  INVALID_SELECTION_DATE: 'invalidSelectionDate',
  NO_URL_FOR_HIDDEN_WORKSHEET: 'noUrlForHiddenWorksheet'
};

tableauSoftware.TableauEventName = {
  FIRST_INTERACTIVE: 'firstinteractive',
  MARKS_SELECTION: 'marksselection',
  PARAMETER_VALUE_CHANGE: 'parametervaluechange',
  FILTER_CHANGE: 'filterchange',
  CUSTOM_VIEW_LOAD: 'customviewload',
  CUSTOM_VIEW_SAVE: 'customviewsave',
  CUSTOM_VIEW_REMOVE: 'customviewremove',
  CUSTOM_VIEW_SET_DEFAULT: 'customviewsetdefault',
  TAB_SWITCH: 'tabswitch'
};

tableauSoftware.FieldRoleType = {
  DIMENSION: 'dimension',
  MEASURE: 'measure',
  UNKNOWN: 'unknown'
};

tableauSoftware.FieldAggregationType = {
  SUM: 'SUM',
  AVG: 'AVG',
  MIN: 'MIN',
  MAX: 'MAX',
  STDEV: 'STDEV',
  STDEVP: 'STDEVP',
  VAR: 'VAR',
  VARP: 'VARP',
  COUNT: 'COUNT',
  COUNTD: 'COUNTD',
  MEDIAN: 'MEDIAN',
  ATTR: 'ATTR',
  NONE: 'NONE',
  YEAR: 'YEAR',
  QTR: 'QTR',
  MONTH: 'MONTH',
  DAY: 'DAY',
  HOUR: 'HOUR',
  MINUTE: 'MINUTE',
  SECOND: 'SECOND',
  WEEK: 'WEEK',
  WEEKDAY: 'WEEKDAY',
  MONTHYEAR: 'MONTHYEAR',
  MDY: 'MDY',
  END: 'END',
  TRUNC_YEAR: 'TRUNC_YEAR',
  TRUNC_QTR: 'TRUNC_QTR',
  TRUNC_MONTH: 'TRUNC_MONTH',
  TRUNC_WEEK: 'TRUNC_WEEK',
  TRUNC_DAY: 'TRUNC_DAY',
  TRUNC_HOUR: 'TRUNC_HOUR',
  TRUNC_MINUTE: 'TRUNC_MINUTE',
  TRUNC_SECOND: 'TRUNC_SECOND',
  QUART1: 'QUART1',
  QUART3: 'QUART3',
  SKEWNESS: 'SKEWNESS',
  KURTOSIS: 'KURTOSIS',
  INOUT: 'INOUT',
  SUM_XSQR: 'SUM_XSQR',
  USER: 'USER'
};

tableauSoftware.ToolbarPosition = {
  TOP: 'top',
  BOTTOM: 'bottom'
};

////////////////////////////////////////////////////////////////////////////////
// API Initialization
////////////////////////////////////////////////////////////////////////////////

// Clean up the mscorlib stuff.
restoreTypeSystem();

tab._ApiBootstrap.initialize();
})();
