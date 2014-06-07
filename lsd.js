!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.lsd=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var start = _dereq_('./lib/start');

module.exports = {
  start: start
};
},{"./lib/start":4}],2:[function(_dereq_,module,exports){
var randomNumber = function(min, max) {
  return (Math.random()*max+min).toFixed(2);
  //return Math.floor(Math.random()*(max-min+1)+min);
};

var filters = {
  blur: function() {
    return 'blur('+randomNumber(0, 5)+'px)';
  },
  saturate: function() {
    return 'saturate('+randomNumber(0, 5)+')';
  },
  contrast: function() {
    return 'contrast('+randomNumber(0, 5)+')';
  },
  'hue-rotate': function() {
    return 'hue-rotate('+randomNumber(0, 300)+'deg)';
  },
};

var damnSon = function(vidEl) {
  var randomFilter = Object.keys(filters)
  .map(function(k){
    var fn = filters[k];
    return fn();
  }).join(' ');

  vidEl.style['-webkit-filter'] = randomFilter;
};

module.exports = damnSon;
},{}],3:[function(_dereq_,module,exports){
module.exports = function(file) {
  var audio = new Audio(file);
  audio.play();
  return audio;
};
},{}],4:[function(_dereq_,module,exports){
var events = _dereq_('add-event-listener');
var gum = _dereq_('getusermedia');
var attach = _dereq_('attachmediastream');
var playAudio = _dereq_('./playAudio');
var damnSon = _dereq_('./damnSon');

module.exports = function() {
  gum({video: true, audio: false}, function(err, stream){
    if (err) {
      return console.error(err);
    }
    var vid = attach(stream);
    vid.className = 'lsd-video';
    document.body.appendChild(vid);
    damnSon(vid);

    setInterval(function(){
      damnSon(vid);
    }, 500);
  });
};
},{"./damnSon":2,"./playAudio":3,"add-event-listener":5,"attachmediastream":6,"getusermedia":7}],5:[function(_dereq_,module,exports){
addEventListener.removeEventListener = removeEventListener
addEventListener.addEventListener = addEventListener

module.exports = addEventListener

var Events = null

function addEventListener(el, eventName, listener, useCapture) {
  Events = Events || (
    document.addEventListener ?
    {add: stdAttach, rm: stdDetach} :
    {add: oldIEAttach, rm: oldIEDetach}
  )
  
  return Events.add(el, eventName, listener, useCapture)
}

function removeEventListener(el, eventName, listener, useCapture) {
  Events = Events || (
    document.addEventListener ?
    {add: stdAttach, rm: stdDetach} :
    {add: oldIEAttach, rm: oldIEDetach}
  )
  
  return Events.rm(el, eventName, listener, useCapture)
}

function stdAttach(el, eventName, listener, useCapture) {
  el.addEventListener(eventName, listener, useCapture)
}

function stdDetach(el, eventName, listener, useCapture) {
  el.removeEventListener(eventName, listener, useCapture)
}

function oldIEAttach(el, eventName, listener, useCapture) {
  if(useCapture) {
    throw new Error('cannot useCapture in oldIE')
  }

  el.attachEvent('on' + eventName, listener)
}

function oldIEDetach(el, eventName, listener, useCapture) {
  el.detachEvent('on' + eventName, listener)
}

},{}],6:[function(_dereq_,module,exports){
module.exports = function (stream, el, options) {
    var URL = window.URL;
    var opts = {
        autoplay: true,
        mirror: false,
        muted: false
    };
    var element = el || document.createElement('video');
    var item;

    if (options) {
        for (item in options) {
            opts[item] = options[item];
        }
    }

    if (opts.autoplay) element.autoplay = 'autoplay';
    if (opts.muted) element.muted = true;
    if (opts.mirror) {
        ['', 'moz', 'webkit', 'o', 'ms'].forEach(function (prefix) {
            var styleName = prefix ? prefix + 'Transform' : 'transform';
            element.style[styleName] = 'scaleX(-1)';
        });
    }

    // this first one should work most everywhere now
    // but we have a few fallbacks just in case.
    if (URL && URL.createObjectURL) {
        element.src = URL.createObjectURL(stream);
    } else if (element.srcObject) {
        element.srcObject = stream;
    } else if (element.mozSrcObject) {
        element.mozSrcObject = stream;
    } else {
        return false;
    }

    return element;
};

},{}],7:[function(_dereq_,module,exports){
// getUserMedia helper by @HenrikJoreteg
var func = (window.navigator.getUserMedia ||
            window.navigator.webkitGetUserMedia ||
            window.navigator.mozGetUserMedia ||
            window.navigator.msGetUserMedia);


module.exports = function (constraints, cb) {
    var options;
    var haveOpts = arguments.length === 2;
    var defaultOpts = {video: true, audio: true};
    var error;
    var denied = 'PERMISSION_DENIED';
    var notSatified = 'CONSTRAINT_NOT_SATISFIED';

    // make constraints optional
    if (!haveOpts) {
        cb = constraints;
        constraints = defaultOpts;
    }

    // treat lack of browser support like an error
    if (!func) {
        // throw proper error per spec
        error = new Error('NavigatorUserMediaError');
        error.name = 'NOT_SUPPORTED_ERROR';
        return cb(error);
    }

    func.call(window.navigator, constraints, function (stream) {
        cb(null, stream);
    }, function (err) {
        var error;
        // coerce into an error object since FF gives us a string
        // there are only two valid names according to the spec
        // we coerce all non-denied to "constraint not satisfied".
        if (typeof err === 'string') {
            error = new Error('NavigatorUserMediaError');
            if (err === denied) {
                error.name = denied;
            } else {
                error.name = notSatified;
            }
        } else {
            // if we get an error object make sure '.name' property is set
            // according to spec: http://dev.w3.org/2011/webrtc/editor/getusermedia.html#navigatorusermediaerror-and-navigatorusermediaerrorcallback
            error = err;
            if (!error.name) {
                // this is likely chrome which
                // sets a property called "ERROR_DENIED" on the error object
                // if so we make sure to set a name
                if (error[denied]) {
                    err.name = denied;
                } else {
                    err.name = notSatified;
                }
            }
        }

        cb(error);
    });
};

},{}]},{},[1])
(1)
});