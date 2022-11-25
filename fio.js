const fioErrCode = {
        PERMISSION_REFUSED: 1,
        NO_FACES_DETECTED: 2,
        UNRECOGNIZED_FACE: 3,
        MANY_FACES: 4,
        PAD_ATTACK: 5,
        FACE_MISMATCH: 6,
        NETWORK_IO: 7,
        WRONG_PIN_CODE: 8,
        PROCESSING_ERR: 9,
        UNAUTHORIZED: 10,
        TERMS_NOT_ACCEPTED: 11,
        UI_NOT_READY: 12,
        SESSION_EXPIRED: 13,
        TIMEOUT: 14,
        TOO_MANY_REQUESTS: 15,
        EMPTY_ORIGIN: 16,
        FORBIDDDEN_ORIGIN: 17,
        FORBIDDDEN_COUNTRY: 18,
        UNIQUE_PIN_REQUIRED: 19,
        SESSION_IN_PROGRESS: 20
    },
    fioState = {
        UI_READY: 1,
        PERM_WAIT: 2,
        PERM_REFUSED: 3,
        PERM_GRANTED: 4,
        REPLY_WAIT: 5,
        PERM_PIN_WAIT: 6,
        AUTH_FAILURE: 7,
        AUTH_SUCCESS: 8
    };
class faceIO {
    constructor(a) {
        this.VERSION = "1.70", this.Author = "Pix", this._pub_app_id = a, this._app_rand_token = function() {
            let a = "";
            for (let b = 0; b < 32; b++) a += "abcdef0123456789".charAt(Math.floor(16 * Math.random()));
            return a
        }(), this._srv_payload = null, this._authParam = {}, this._locale = {}, this._videoElem = null, this._grayBuf = null, this._recs = null, this._state = fioState.UI_READY, this._isEnrollment = !1, this._pin = "", this._cnpin = null, this._activeUi = null, this._resolve = null, this._reject = null, this._temp_token = null, this._frame_offset = 0, this._n_faces = 0, this._wss = null, this._socket = null, this._frame_ack = !1, this._threshold = 12, this._canvasWords = null, this._rc = 0, this._fival = null, this._sival = null, this._pinPad = !1, this._rejectWeakPin = !1, this._pinmax = 16, this._consentId = null, this._termsOfUse = ""
    }
    _defaultParamValues(a) {
        switch (a) {
            case "userConsent":
                return !1;
            case "payload":
                break;
            case "termsTimeout":
                return 6e5;
            case "permissionTimeout":
            case "idleTimeout":
                return 27e3;
            case "replyTimeout":
                return 4e4;
            case "enrollIntroTimeout":
                return 15e3;
            case "locale":
            case "language":
                return "auto"
        }
        return null
    }
    _toggleSpinner() {
        let a = faceIO.fioShadowDOM.getElementById("fioSpin");
        null !== a && a.classList.toggle("faceio-spinner")
    }
    _launchModal() {
        let a = faceIO.fioShadowDOM.getElementById("fioUiModal");
        null !== a && (a.classList.remove("fio-hide-modal"), a.classList.add("fio-show-modal"))
    }
    _closeModal() {
        let a = faceIO.fioShadowDOM.getElementById("fioUiModal");
        null !== a && (a.classList.add("fio-hide-modal"), a.classList.remove("fio-show-modal"))
    }
    _showCloseBtn() {
        let a = faceIO.fioShadowDOM.getElementById("fioCloseBtn");
        null !== a && (a.style.display = "block")
    }
    _setActiveUi(b) {
        let a = faceIO.fioShadowDOM.getElementById(b);
        if (null !== a) {
            if (null !== this._activeUi) {
                if (this._activeUi.isSameNode(a)) return;
                this._activeUi.setAttribute("hidden", "true")
            }
            a.removeAttribute("hidden"), this._activeUi = a
        }
    }
    _printMsg(b, c) {
        let a = faceIO.fioShadowDOM.getElementById(c);
        null !== a && (a.textContent = b)
    }
    _showSuccessWindow() {
        this._setActiveUi("fioAuthOk"), this._printMsg(this._locale.AUTH_OK, "fioAuthOkTxt")
    }
    _showFailureWindow(a) {
        this._setActiveUi("fioAuthFail"), null !== a ? a.length > 0 && this._printMsg(a, "fioAuthFailTxt") : this._printMsg(this._locale.AUTH_FAIL, "fioAuthFailTxt")
    }
    _runTimer(b, c, e) {
        let a = faceIO.fioShadowDOM.getElementById(c);
        if (null !== a) {
            let d = b;
            a.textContent = d / 1e3;
            let f = setInterval(() => {
                (d < 1 || null === e && this._state != fioState.PERM_WAIT) && (clearInterval(f), null !== e && e()), (d -= 100) % 1e3 == 0 && (a.textContent = d < 0 ? "0" : d / 1e3)
            }, 100)
        }
    }
    _showCameraAuthorizationWindow(a) {
        this._setActiveUi("fioCameraAuthorize"), this._printMsg(this._locale.ALLOW_ACCESS, "fioCamTxt"), this._runTimer(a, "fioCameraTimer", null)
    }
    _showCanvas() {
        null !== this._videoElem && this._videoElem.play(), this._setActiveUi("fioStream")
    }
    _CanvasUnpaint() {
        null === this._videoElem || this._videoElem.paused || this._videoElem.ended || this._videoElem.pause()
    }
    _showLoadingWindow(a) {
        this._CanvasUnpaint(), this._setActiveUi("fioNetWait"), this._printMsg(a, "fioWaitTxt")
    }
    _stopCameraStream() {
        if (null !== this._videoElem) {
            let a = this._videoElem.srcObject,
                b = a.getTracks();
            b.forEach(function(a) {
                a.stop()
            }), this._videoElem.srcObject = null, this._videoElem = null
        }
        this._srv_payload = null
    }
    _closeSocket() {
        null !== this._socket && (this._socket.close(), this._socket = null)
    }
    _handleFailure(a, b) {
        void 0 === a && (a = fioErrCode.NETWORK_IO), null !== this._temp_token && (this._state = fioState.PERM_REFUSED), this._closeSocket(), this._stopCameraStream(), this._CanvasUnpaint(), this._pin = "", a != fioErrCode.SESSION_EXPIRED && (this._showFailureWindow(b), setTimeout(() => {
            this._showCloseBtn(), this._closeModal()
        }, 2e3), this._reject(a))
    }
    _handleSuccess(a) {
        this._state = fioState.AUTH_SUCCESS, this._closeSocket(), this._stopCameraStream(), this._CanvasUnpaint(), this._showSuccessWindow(), this._pin = "", setTimeout(() => {
            this._showCloseBtn(), this._closeModal()
        }, 2e3), this._resolve(a)
    }
    _permNotgranted() {
        this._handleFailure(fioErrCode.PERMISSION_REFUSED, this._locale.PERM_REFUSED)
    }
    _newSocketBuffer(b) {
        if (null === this._srv_payload) {
            this._srv_payload = new Uint8ClampedArray(b);
            for (let a = 1; a <= this._temp_token.length; a++) this._srv_payload[a] = this._temp_token.charCodeAt(a - 1)
        }
    }
    _sendPin() {
        let e = 1 + this._temp_token.length + this._pin.length + 1,
            a = null;
        this._isEnrollment && (e += 2 + (a = JSON.stringify(this._authParam.payload)).length), this._newSocketBuffer(e), this._frame_offset = 1 + this._temp_token.length, this._srv_payload[this._frame_offset + 0] = 255 & this._pin.length;
        for (let b = 1; b <= this._pin.length; b++) this._srv_payload[this._frame_offset + b] = this._pin.charCodeAt(b - 1);
        if (this._isEnrollment) {
            let c = this._frame_offset + this._pin.length + 1;
            this._srv_payload[c + 0] = 255 & a.length, this._srv_payload[c + 1] = a.length >> 8, c += 2;
            for (let d = 0; d < a.length; d++) this._srv_payload[c + d] = a.charCodeAt(d)
        }
        this._socket.send(this._srv_payload.buffer), this._state = fioState.REPLY_WAIT, this._showLoadingWindow(this._locale.WAIT_PROCESSING), this._sival = setTimeout(() => {
            this._state == fioState.REPLY_WAIT && this._handleFailure(fioErrCode.TIMEOUT, null)
        }, this._authParam.replyTimeout)
    }
    _enrollSetStep(b) {
        let a = faceIO.fioShadowDOM.getElementById("eStep" + b);
        null !== a && a.classList.add("fio-ui-modal-done")
    }
    _enrollConfirmPin(a) {
        if (null !== this._cnpin) this._cnpin != this._pin ? (this._printMsg(this._locale.CONFIRM_PIN_ERR, "fioPinTip"), this._pin = "", a && (a.classList.add("fio-ui-pin-wrong"), a.value = "")) : (this._printMsg(this._locale.CONFIRM_PIN_OK, "fioPinTip"), this._cnpin = null, this._sendPin());
        else {
            let c = !1;
            if (this._rejectWeakPin && !(c = this._pin.length < 5)) {
                let b = this._pin.split("").map(Number),
                    d = a => a.every((b, a, c) => !a || b == c[a - 1]);
                if (d(b)) c = !0;
                else {
                    let e = a => a.every((b, a, c) => !a || a > 8 || b - c[a - 1] == 1 || b - c[a - 1] == -1);
                    if (e(b)) c = !0;
                    else {
                        let f = b.pop();
                        d(b) ? c = !0 : (b.push(f), b.shift(), d(b) && (c = !0))
                    }
                }
            }
            c ? (this._printMsg(this._locale.WEAK_PIN, "fioPinTxt"), this._printMsg(this._locale.WEAK_PIN_HINT, "fioPinTip"), a && a.classList.add("fio-ui-pin-wrong")) : (this._cnpin = this._pin, this._printMsg(this._locale.CONFIRM_PIN, "fioPinTxt"), this._printMsg(this._locale.CONFIRM_PIN_HINT, "fioPinTip"), a && a.classList.add("fio-ui-pin-ok")), this._pin = "", a && (a.value = "")
        }
    }
    _handlePinCodePress(b, a) {
        switch (b) {
            case "done":
                this._pin.length < 4 ? (this._printMsg(this._locale.SMALL_PIN, "fioPinTip"), a && a.classList.add("fio-ui-pin-wrong")) : this._isEnrollment ? this._enrollConfirmPin(a) : this._sendPin();
                return;
            case "backspace":
                this._pin.length > 0 && (this._pin = this._pin.substring(0, this._pin.length - 1));
                break;
            default:
                if (isNaN(b)) {
                    this._printMsg(this._locale.WRONG_PIN_NUM, "fioPinTip"), a && a.classList.add("fio-ui-pin-wrong");
                    return
                }
                if (this._pin += b, this._pin.length >= this._pinmax) {
                    this._isEnrollment ? this._enrollConfirmPin(a) : this._sendPin();
                    return
                }
        }
        a && (a.value = "_".repeat(this._pin.length), a.classList.remove("fio-ui-pin-wrong"), a.classList.remove("fio-ui-pin-ok"))
    }
    _generatePinPad() {
        if (this._srv_payload = null, !this._pinPad) {
            this._isEnrollment && this._enrollSetStep(2);
            let a = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "backspace", "0", "done"],
                b = faceIO.fioShadowDOM.getElementById("fioPin__numpad");
            if (null !== b) {
                let c = faceIO.fioShadowDOM.getElementById("fioPinInput");
                a.forEach(d => {
                    let a = document.createElement("button");
                    "backspace" == d ? (a.classList.add("fio-ui-modal-delete"), a.innerHTML = "&crarr;") : "done" == d ? (a.classList.add("fio-ui-modal-done"), a.innerHTML = '<span style="color: green;"><strong>&#10004;</strong></span>', a.setAttribute("type", "submit"), a.setAttribute("title", this._locale.CONFIRM_PIN)) : a.textContent = d, a.addEventListener("click", () => {
                        this._handlePinCodePress(d, c)
                    }), b.appendChild(a)
                }), this._pinPad = !0
            }
        }
    }
    _showPinPad() {
        if (this._generatePinPad(), this._setActiveUi("fioPinPad"), this._isEnrollment) this._printMsg(this._locale.CHOOSE_PIN, "fioPinTxt"), this._printMsg(this._locale.CHOOSE_PIN_HINT, "fioPinTip");
        else if (this._pin.length > 0) {
            this._pin = "", this._printMsg(this._locale.WRONG_PIN, "fioPinTxt");
            let a = faceIO.fioShadowDOM.getElementById("fioPinInput");
            a && (a.classList.add("fio-ui-pin-wrong"), a.value = "")
        } else this._printMsg(this._locale.ENTER_PIN, "fioPinTxt"), this._printMsg(this._locale.PIN_HINT, "fioPinTip")
    }
    _requestNewFrame() {
        this._n_faces = 0, this._isEnrollment || (this._threshold += 1, this._canvasWords = this._locale.NO_FACES_DETECTED.split(" ")), this._showCanvas(), setTimeout(() => {
            this._frame_ack = !0
        }, 200)
    }
    _wrapTextOnCanvas(c, d, f, e, i, j, k) {
        let a = "",
            g = () => {
                d.font = "bold 25px -apple-system, BlinkMacSystemFont, Ubuntu, Calibri", d.textBaseline = "bottom", d.fillStyle = k, d.textAlign = "center"
            };
        for (let b = 0; b < c.length; b++) {
            let h = a + c[b] + " ";
            d.measureText(h).width > i && b > 0 ? (g(), d.fillText(a, f, e), a = c[b] + " ", e += j) : a = h
        }
        g(), d.fillText(a, f, e)
    }
    _launchVideoStream() {
        if (this._state != fioState.UI_READY) return;
        this._state = fioState.PERM_WAIT, this._showCameraAuthorizationWindow(this._authParam.permissionTimeout);
        let a = {
            width: 640,
            height: 480,
            facingMode: "user"
        };
        window.matchMedia("only screen and (max-width: 760px)").matches && (a = !0), setTimeout(() => {
            this._state == fioState.PERM_WAIT && this._permNotgranted()
        }, this._authParam.permissionTimeout), navigator.mediaDevices.getUserMedia({
            audio: !1,
            video: a
        }).then(b => {
            if (this._state == fioState.PERM_REFUSED) setTimeout(() => {
                let a = b.getTracks();
                a.forEach(function(a) {
                    a.stop()
                })
            }, 1e3);
            else {
                this._state = fioState.PERM_GRANTED, this._socket = new WebSocket(this._wss), this._printMsg(this._locale.ACCESS_GRANTED, "fioCamTxt"), this._socket.binaryType = "blob", this._socket.onerror = a => {
                    this._handleFailure(fioErrCode.NETWORK_IO, null)
                }, this._socket.onclose = a => {
                    this._state == fioState.REPLY_WAIT && this._handleFailure(fioErrCode.NETWORK_IO, null)
                }, this._socket.addEventListener("open", c => {
                    this._frame_ack = !0;
                    let b = new Uint8ClampedArray(this._temp_token.length + 1);
                    for (let a = 1; a <= this._temp_token.length; a++) b[a] = this._temp_token.charCodeAt(a - 1);
                    this._socket.send(b.buffer)
                }), this._socket.addEventListener("message", d => {
                    this._state = fioState.PERM_GRANTED, null !== this._sival && clearTimeout(this._sival);
                    let a = JSON.parse(d.data);
                    if (this._rc = a.code, null !== this._fival && (clearTimeout(this._fival), this._fival = null), this._isEnrollment) {
                        if (201 == this._rc) this._requestNewFrame();
                        else if (this._stopCameraStream(), 200 == this._rc) this._enrollSetStep(3), this._handleSuccess(a.payload);
                        // else if (202 == this._rc) this._setActiveUi("fioPinIntro"), this._runTimer(this._authParam.enrollIntroTimeout, "fioPinIntroLoader", () => {
                        //     this._state = fioState.PERM_PIN_WAIT, this._showPinPad()
                        // });
                        else if (202 == this._rc) this._enrollSetStep(3), this._handleSuccess(a.payload);
                        else if (203 == this._rc) {
                            this._generatePinPad(), this._setActiveUi("fioPinPad"), this._pin = "", this._printMsg(this._locale.UNIQUE_PIN, "fioPinTxt"), this._printMsg(this._locale.UNIQUE_PIN_HINT, "fioPinTip");
                            let b = faceIO.fioShadowDOM.getElementById("fioPinInput");
                            b && (b.classList.add("fio-ui-pin-wrong"), b.value = "")
                        } else 400 == this._rc ? this._handleFailure(a.fioErr, null) : 430 == this._rc ? this._handleFailure(fioErrCode.TIMEOUT, null) : this._handleFailure(fioErrCode.PROCESSING_ERR, null)
                    } else if (201 == this._rc) this._requestNewFrame();
                    else if (this._stopCameraStream(), 200 == this._rc) {
                        let c = a.userData;
                        c.payload = JSON.parse(c.payload), this._handleSuccess(c)
                    } else 429 == this._rc ? this._handleFailure(fioErrCode.UNRECOGNIZED_FACE, null) : 430 == this._rc ? this._handleFailure(fioErrCode.TIMEOUT, null) : 440 == this._rc ? this._handleFailure(fioErrCode.WRONG_PIN_CODE, null) : 400 == this._rc ? this._handleFailure(a.fioErr, null) : 202 == this._rc ? (this._pinmax = a.max, this._showPinPad()) : this._handleFailure(fioErrCode.PROCESSING_ERR, null)
                });
                let a = faceIO.fioShadowDOM.getElementById("fioVideo"),
                    c = faceIO.fioShadowDOM.getElementById("fioCanvas"),
                    d = c.getContext("2d");
                a.srcObject = b;
                let e = (function() {
                    if (!a.paused && !a.ended) {
                        if (d.drawImage(a, 0, 0), d.font = "bold 25px Montserrat, sans-serif", d.fillStyle = "#000000", d.textBaseline = "top", d.textAlign = "left", d.fillText("", 2, 2), null === this._grayBuf) this._grayBuf = _realnet_alloc_gray_image_buffer(1280, 720), this._recs = new Float32Array(Module.HEAPU8.buffer, _realnet_alloc_face_result_array(), _realnet_face_max_detection());
                        else if (null !== this._srv_payload && this._state == fioState.PERM_GRANTED) {
                            let b = d.getImageData(0, 0, c.width, c.height),
                                j = new Uint8ClampedArray(Module.HEAPU8.buffer, this._grayBuf, b.width * b.height);
                            for (let g = this._frame_offset, f = 0; f < b.data.length; f += 4, g += 3) j[f >> 2] = 306 * b.data[f] + 601 * b.data[f + 1] + 117 * b.data[f + 2] >> 10, this._srv_payload[g] = b.data[f + 2], this._srv_payload[g + 1] = b.data[f + 1], this._srv_payload[g + 2] = b.data[f];
                            let i = _realnet_face_detect(this._grayBuf, b.width, b.height, this._threshold, this._recs.byteOffset);
                            if (1 == i) {
                                if (d.strokeStyle = "#32cd32", d.lineJoin = "round", d.lineWidth = 2, d.strokeRect(this._recs[0], this._recs[1], this._recs[2], this._recs[3]), this._frame_ack) {
                                    this._recs[2], b.width, this._recs[3], b.height;
                                    let h = this._frame_offset - 4;
                                    this._srv_payload[h + 0] = 255 & b.width, this._srv_payload[h + 1] = b.width >> 8, this._srv_payload[h + 2] = 255 & b.height, this._srv_payload[h + 3] = b.height >> 8, this._socket.send(this._srv_payload.buffer), this._frame_ack = !1, setTimeout(() => {
                                        this._state = fioState.REPLY_WAIT, this._showLoadingWindow(this._locale.WAIT_PROCESSING), setTimeout(() => {
                                            this._state == fioState.REPLY_WAIT && this._printMsg(this._locale.WAIT_PROCESSING_2, "fioWaitTxt")
                                        }, 5300)
                                    }, 900), this._sival = setTimeout(() => {
                                        this._state == fioState.REPLY_WAIT && this._handleFailure(fioErrCode.TIMEOUT, null)
                                    }, this._authParam.replyTimeout)
                                }
                            } else i > 1 ? this._frame_ack && this._handleFailure(fioErrCode.MANY_FACES, null) : this._frame_ack && (d.strokeStyle = "#03459c", d.lineJoin = "round", d.lineWidth = 3, d.strokeRect(c.width / 2 - 120, c.height / 2 - 120, 220, 220), this._wrapTextOnCanvas(this._canvasWords, d, c.width / 2, c.height / 2 + 132, c.width - 15, 25, 1 == this._srv_payload[0] ? "#ff4d00" : "#fafafa"));
                            this._n_faces += i
                        }
                        requestAnimationFrame(e)
                    }
                }).bind(this);
                a.onloadedmetadata = b => {
                    c.width = a.videoWidth, c.height = a.videoHeight, this._newSocketBuffer(this._frame_offset + a.videoWidth * a.videoHeight * 3), this._showCanvas(), a.play(), this._videoElem = a
                }, a.onplay = () => {
                    e(), null === this._fival && (this._fival = setTimeout((function() {
                        this._state == fioState.PERM_GRANTED && this._n_faces < 1 && this._handleFailure(fioErrCode.NO_FACES_DETECTED, null)
                    }).bind(this), this._authParam.idleTimeout)), setTimeout((function() {
                        this._state == fioState.PERM_GRANTED && this._n_faces < 1 && (this._srv_payload[0] = 1)
                    }).bind(this), 4e3), setTimeout((function() {
                        this._state == fioState.PERM_GRANTED && null !== this._videoElem && !this._videoElem.paused && this._n_faces < 1 && (this._setActiveUi("fioFaceInst"), this._printMsg(this._locale.NO_FACES_DETECTED, "fioFaceInstrTitle"), this._CanvasUnpaint(), setTimeout(() => {
                            this._state == fioState.PERM_GRANTED && null !== this._videoElem && this._videoElem.paused && this._showCanvas()
                        }, 3e3))
                    }).bind(this), 5700)
                }
            }
        }).catch(a => {
            this._state != fioState.PERM_REFUSED && (this._state = fioState.PERM_REFUSED, this._permNotgranted())
        })
    }
    _clearConsentTimeout() {
        null !== this._consentId && clearTimeout(this._consentId), this._consentId = null
    }
    _acceptfioTerms() {
        this._clearConsentTimeout(), this._launchVideoStream()
    }
    _rejectfioTerms() {
        this._clearConsentTimeout(), this._handleFailure(fioErrCode.TERMS_NOT_ACCEPTED, this._locale.TERMS_REFUSED)
    }
    _requestUserConsent() {
        if (null !== this._consentId || this._state != fioState.UI_READY) return;
        this._consentId = setTimeout(() => {
            this._state == fioState.UI_READY && (this._clearConsentTimeout(), this._handleFailure(fioErrCode.TIMEOUT, this._locale.TERMS_REFUSED))
        }, this._authParam.termsTimeout), this._setActiveUi("fioTerms");
        let a = faceIO.fioShadowDOM.getElementById("fioTermsTxt");
        null !== a && (a.textContent = this._termsOfUse)
    }
    _enrollProceed() {
        let a = faceIO.fioShadowDOM.getElementById("fioEnrollHeader");
        null !== a && a.hasAttribute("hidden") && a.removeAttribute("hidden"), !0 === this._authParam.userConsent ? this._launchVideoStream() : this._requestUserConsent()
    }
    _enrollUser() {
        this._setActiveUi("fioEnrollIntro"), this._runTimer(this._authParam.enrollIntroTimeout, "fioEnrollIntroLoader", () => {
            this._enrollProceed()
        }), "" == this._termsOfUse && !1 == this._authParam.userConsent && fetch("https://cdn.faceio.net/terms-of-use.txt").then(a => a.text()).then(a => {
            this._termsOfUse = a
        }).catch(a => {
            this._termsOfUse = "!!!!!!!!The terms of Use agreement is available to consult online for this session at:\n\nhttps://faceio.net/terms-of-use"
        })
    }
    _prepareUi(a) {
        var b, g;
        this._temp_token = a.temp_token, this._frame_offset = 1 + this._temp_token.length + 4, this._locale = a.locale;
        let c = document.createElement("div");
        if (c.innerHTML = a.html, faceIO.fioShadowDOM.appendChild(c), null === faceIO.fioShadowDOM.getElementById("fioUiModal")) return !1;
        let d = faceIO.fioShadowDOM.getElementById("fioCloseBtn");
        if (null !== d && d.addEventListener("click", this._closeModal.bind(this)), this._isEnrollment) {
            let e = faceIO.fioShadowDOM.getElementById("fio-terms-accept-btn");
            null !== e && e.addEventListener("click", this._acceptfioTerms.bind(this));
            let f = faceIO.fioShadowDOM.getElementById("fio-terms-reject-btn");
            null !== f && f.addEventListener("click", this._rejectfioTerms.bind(this)), setTimeout(() => {
                if (this._printMsg(this._locale.ENROLL_INTRO_3, "enrollIntroHdr"), this._authParam.enrollIntroTimeout > 15e3) {
                    let a = faceIO.fioShadowDOM.getElementById("fio-enroll-now-btn");
                    null !== a && (a.removeAttribute("hidden"), a.addEventListener("click", this._enrollProceed.bind(this)))
                }
            }, 5200), this._rejectWeakPin = a.rejectWeakPin
        }
        return this._wss = (b = a.wss, g = this._app_rand_token, Array.from(b, (a, b) => String.fromCharCode(a.charCodeAt() ^ g.charCodeAt(b % g.length))).join("")), this._canvasWords = this._locale.FACE_INSTR.split(" "), this._state = fioState.UI_READY, !0
    }
    _fillParameters(a) {
        if (a instanceof Object ? this._authParam = a : this._authParam = a = {}, a.hasOwnProperty("userConsent") ? this._authParam.userConsent = !0 === a.userConsent : this._authParam.userConsent = this._defaultParamValues("userConsent"), a.hasOwnProperty("payload") ? this._authParam.payload = a.payload : this._authParam.payload = this._defaultParamValues("payload"), a.hasOwnProperty("termsTimeout")) {
            let b = a.termsTimeout;
            b < 3 || b > 30 ? this._authParam.termsTimeout = this._defaultParamValues("termsTimeout") : this._authParam.termsTimeout = 6e4 * b
        } else this._authParam.termsTimeout = this._defaultParamValues("termsTimeout");
        if (a.hasOwnProperty("permissionTimeout")) {
            let f = a.permissionTimeout;
            this._authParam.permissionTimeout = 1e3 * f
        } else this._authParam.permissionTimeout = this._defaultParamValues("permissionTimeout");
        if (a.hasOwnProperty("idleTimeout")) {
            let c = a.idleTimeout;
            this._authParam.idleTimeout = c > 9 ? 1e3 * c : this._defaultParamValues("idleTimeout")
        } else this._authParam.idleTimeout = this._defaultParamValues("idleTimeout");
        if (a.hasOwnProperty("replyTimeout")) {
            let d = a.replyTimeout;
            this._authParam.replyTimeout = d > 15 ? 1e3 * d : this._defaultParamValues("replyTimeout")
        } else this._authParam.replyTimeout = this._defaultParamValues("replyTimeout");
        if (a.hasOwnProperty("enrollIntroTimeout")) {
            let e = a.enrollIntroTimeout;
            this._authParam.enrollIntroTimeout = e > 4 ? 1e3 * e : this._defaultParamValues("enrollIntroTimeout")
        } else this._authParam.enrollIntroTimeout = this._defaultParamValues("enrollIntroTimeout");
        a.hasOwnProperty("locale") || (this._authParam.locale = this._defaultParamValues("locale"))
    }
    _isExpiredSession() {
        return null !== this._temp_token && (this._state == fioState.PERM_REFUSED && (this._launchModal(), this._handleFailure(fioErrCode.SESSION_EXPIRED, "")), !0)
    }
    authenticate(a) {
        return new Promise((c, b) => {
            this._isExpiredSession() ? b(this._state != fioState.PERM_REFUSED ? fioErrCode.SESSION_IN_PROGRESS : fioErrCode.SESSION_EXPIRED) : (this._toggleSpinner(), this._reject = b, this._resolve = c, this._isEnrollment = !1, this._fillParameters(a), fetch("https://widget.faceio.net/?public_app_id=" + this._pub_app_id + "&app_rand_token=" + this._app_rand_token + "&op=auth&locale=" + this._authParam.locale).then(a => a.json()).then(a => {
                if (this._isEnrollment) this._toggleSpinner(), this._reject(fioErrCode.SESSION_IN_PROGRESS);
                else {
                    if (200 != a.status) throw a.errCode; {
                        let b = this._prepareUi(a.payload);
                        this._toggleSpinner(), b ? (this._launchModal(), this._launchVideoStream()) : this._handleFailure(fioErrCode.UI_NOT_READY, null)
                    }
                }
            }).catch(a => {
                this._toggleSpinner(), this._handleFailure(a, null)
            }))
        })
    }
    auth(a) {
        return this.authenticate(a)
    }
    identify(a) {
        return this.authenticate(a)
    }
    recognize(a) {
        return this.authenticate(a)
    }
    enroll(a) {
        return new Promise((c, b) => {
            this._isExpiredSession() ? b(this._state != fioState.PERM_REFUSED ? fioErrCode.SESSION_IN_PROGRESS : fioErrCode.SESSION_EXPIRED) : (this._toggleSpinner(), this._reject = b, this._resolve = c, this._isEnrollment = !0, this._fillParameters(a), fetch("https://widget.faceio.net/?public_app_id=" + this._pub_app_id + "&app_rand_token=" + this._app_rand_token + "&op=enroll&locale=" + this._authParam.locale).then(a => a.json()).then(a => {
                if (this._isEnrollment) {
                    if (200 != a.status) throw a.errCode; {
                        let b = this._prepareUi(a.payload);
                        this._toggleSpinner(), b ? (this._launchModal(), this._launchVideoStream()) : this._handleFailure(fioErrCode.UI_NOT_READY, null)
                    }
                } else this._toggleSpinner(), this._reject(fioErrCode.SESSION_IN_PROGRESS)
            }).catch(a => {
                this._toggleSpinner(), this._handleFailure(a, null)
            }))
        })
    }
    enrol(a) {
        return this.enroll(a)
    }
    register(a) {
        return this.enroll(a)
    }
    record(a) {
        return this.enroll(a)
    }
}! function() {
    "use strict";
    let a = document.getElementById("faceio-modal");
    a || ((a = document.createElement("div")).setAttribute("id", "faceio-modal"), document.body.appendChild(a)), faceIO.fioShadowDOM = a.attachShadow({
        mode: "open"
    });
    let b = document.createElement("script");
    b.setAttribute("type", "text/javascript"), b.setAttribute("async", "true"), b.setAttribute("src", "https://cdn.faceio.net/facemodel.js"), a.appendChild(b);
    let d = document.createElement("div");
    d.setAttribute("id", "fioSpin");
    let c = document.createElement("link");
    c.setAttribute("type", "text/css"), c.setAttribute("rel", "stylesheet"), c.setAttribute("href", "https://cdn.faceio.net/fio.css"), faceIO.fioShadowDOM.appendChild(c), faceIO.fioShadowDOM.appendChild(d)
}()