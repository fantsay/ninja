/**
 * Created by fantsay on 05.02.2017.
 */
!function () {
    function CustomStyle() {
        this.selectors = ["#livechat-badge", "#livechat-full", "#livechat-compact-container", "#livechat-eye-catcher", "#livechat-compact-view"], this.parseMobileCss = function (e, t) {
            e = e.replace(/\/\*[^*]*\*+([^\/*][^*]*\*+)*\//gi, "");
            var i = function (e, t) {
                t = t || 0;
                var n, o, a, r;
                return n = e.indexOf("}", t), n !== -1 && (o = e.substr(0, n + 1), a = o.match(/{/g) && o.match(/{/g).length || 0, r = o.match(/}/g) && o.match(/}/g).length || 0, a !== r ? i(e, o.length) : o = o.substr(o.indexOf("{") + 1, o.lastIndexOf("}") - o.indexOf("{") - 1))
            }, n = -1;
            return n = e.indexOf("@livechat-mobile"), n !== -1 && (e = e.substr(n, e.length + 1 - n), cuttedCustomStyle = i(e), cuttedCustomStyle)
        }, this.appendStyle = function (e) {
            var t = document.createElement("style");
            t.type = "text/css", t.styleSheet ? t.styleSheet.cssText = e : t.appendChild(document.createTextNode(e)), document.getElementsByTagName("head")[0].appendChild(t)
        }, this.cssProperties = function (e, t, i, n) {
            if ("string" == typeof e && (e = document.getElementById(e)), e || e instanceof HTMLElement) {
                var o = CSSStyleDeclaration.prototype.setProperty ? "setProperty" : "setAttribute";
                if ("[object Object]" === Object.prototype.toString.call(t))for (var a in t)n ? e.style[o](a, t[a]) : e.style[o](a, t[a], "important"); else {
                    if (null === i || void 0 === i)return e.style.getPropertyValue(t);
                    n ? (e.style[o](t, null), e.style[o](t, i)) : e.style[o](t, i, "important")
                }
                return e
            }
        }, this.parseCss = function (e) {
            var t;
            if (e.indexOf("prevent_parsing_custom_css") !== -1)return !1;
            try {
                e = e.replace(/\/\*[^*]*\*+([^\/*][^*]*\*+)*\//gi, ""), t = this.parseMobileCss(e), Mobile.isNewMobile() || (e = e.replace(t, ""));
                for (var i, n, o, a = -1, r = -1, s = 0; s < this.selectors.length; s++)i = e.indexOf(this.selectors[s]), n = e.lastIndexOf(this.selectors[s]), i !== -1 && (a === -1 || i < a) && (a = i), n !== -1 && n > r && (r = n);
                if (o = e.indexOf("}", r), o === -1 && (o = e.length), a === -1)return !1;
                e = e.substr(a, o + 1 - a);
                var l = /{([^}]*)}/gm, c = e.replace(l, "$%^");
                c = c.replace(/\@media[^\}]*\}[^\}]*\}/, ""), c = c.replace(/(\[([^\]])*\])/gi, function (e) {
                    return e = e.replace(/\,/g, "*@!")
                });
                for (var d = c.split("$%^"), u = "", _ = "", h = "", m = "", f = 0; f < d.length; f++) {
                    u = d[f];
                    for (var p = 0; p < this.selectors.length; p++)if (u.indexOf(this.selectors[p]) !== -1 && (_ = e.substr(e.indexOf(u), e.length + 1), _.length > 1)) {
                        h = u.split(",");
                        for (var g = 0; g < h.length; g++)h[g].indexOf(this.selectors[p]) !== -1 && (_ = _.replace(/(\r\n|\n|\r)/gm, "").match(/{(.*?)}/)[0], m = m + h[g] + _)
                    }
                }
                if ("" !== m) {
                    if (m.indexOf("transform") !== -1) {
                        for (var b = m.split(";"), s = 0; s < b.length; s++)b[s].indexOf("transform") !== -1 && b[s].indexOf("text-transform") === -1 && (b[s] = b[s] + "!important");
                        m = b.join(";")
                    }
                    return this.appendStyle(m), !0
                }
                return !1
            } catch (t) {
                return Events.track("chat_window", "CSS parse error: " + e), !1
            }
        }
    }

    function $(e) {
        return document.getElementById(e)
    }

    function LiveChat(config) {
        this.lang_sent_phrases = null, this.embedded_chat_hidden_by_api = !1, this.invoked_callbacks = {}, this.is_main_window = !1, this.EMBEDDED_LOADED = 0, this.httpp = window.location.protocol.indexOf("https") != -1 ? "https://" : "http://", this.location = encodeURIComponent(document.location), this.INVITATION_NONE = 0, this.INVITATION_STANDARD = 1, this.INVITATION_AUTO = 2, this.INVITATION_PERSONAL = 3, this.current_invitation = this.INVITATION_NONE, this.$invitation_layer = !1, this.$invitation_image = !1, this.$overlay = !1, this.conf = config, this.invitation_layer_id = "lc_invite_layer", this.private_invite_script_id = "LC_Private_Invite", this.auto_invite_script_id = "LC_Auto_Invite", this.invite_layer = "lc_invite_layer", this.is_popped_out = !1, this.destinationSkillChosen = null, this.msie = /msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent), this.msie_version = !!this.msie && function () {
                var e = navigator.userAgent, t = e.indexOf("MSIE ");
                return t == -1 ? 0 : parseFloat(e.substring(t + 5, e.indexOf(";", t)))
            }(), this.embeddedWindowSupported = !0, window.postMessage || (this.embeddedWindowSupported = !1), this.conf.overlay.id = "lc_overlay_layer", this.chat_id = null, this.animationTimeout = null, this.standard_invite_html = '<div style="position:relative">', this.standard_invite_html += '<a style="display:block;position:absolute;top:0;right:0;width:70px;height:25px;cursor:pointer;background:url(//cdn.livechatinc.com/img/pixel.gif)" href="javascript:void(0)" onclick="LC_Invite.lc_popup_close()"></a>', this.standard_invite_html += '<a href="javascript:void(0)" onclick="LC_Invite.lc_open_chat(\'manual\')" style="display:block;cursor:pointer;"><img src="' + this.httpp + this.conf.invite_img_name + '" id="lc_standard_invitation_img" border="0" alt="" style="display:block"></a>', this.standard_invite_html += "</div>", this.text_buttons_queue = [], this.init_location_change_observer = function () {
            var e = this;
            return __lc.embedded_in_iframe !== !0 && void(__lc.wix ? Wix.addEventListener(Wix.Events.PAGE_NAVIGATION, function (t) {
                        Wix.getSiteInfo(function (t) {
                            Loader.pageData.title = t.siteTitle, Loader.pageData.url = t.url, e.update_page_address()
                        })
                    }) : setInterval(function () {
                        var t = document.location.toString();
                        t !== Loader.pageData.url && (Loader.pageData.title = document.title, Loader.pageData.url = t, e.update_page_address())
                    }, 2e3))
        }, this.update_page_address = function () {
            Pinger.set_force_reload(!0).ping()
        }, this.init = function () {
            if (this.checkDomainWhitelist() === !1)return !1;
            var e = Utils.inArray(__lc.license, [100000334, 100000006, 7188861, 6463811]) !== -1;
            return e && (this.statusChecker = StatusChecker, this.statusChecker.init({
                hostname: __lc.hostname,
                protocol: Loader.protocol,
                licence: config.lic
            }), config.client_limit_exceeded && this.statusChecker.startChecking()), this.setupIntegrations(), Pinger.isInited() ? this.pinger.setConfig(this.conf) : (this.pinger = Pinger.init({
                    config: this.conf,
                    app: this,
                    minimized: Minimized,
                    loaderInfo: Loader,
                    chatBetweenGroups: __lc.chat_between_groups,
                    hostname: __lc.hostname,
                    skill: __lc.skill,
                    visitorEmail: __lc.visitor && __lc.visitor.email,
                    scriptVersion: __lc_script_version,
                    embedded: !0,
                    statusChecker: this.statusChecker
                }).set_force_reload(!0), this.pinger.ping()), this.lookup_custom_variables(), Chat.init(), EyeCatcher.init(this.conf), this.display_chat_buttons(), NotifyChild.chat_reloaded ? void(Mobile.isNewMobile() && Mobile.onMinimizeChatWindow()) : (this.load_embedded_window(), this.init_location_change_observer(), NotifyChild.init(), this.prepare_elements(), (LC_API.mobile_is_detected() || LC_API.new_mobile_is_detected()) && Mobile.preloadSound(), void this.bindWindowEvents())
        }, this.checkDomainWhitelist = function (e) {
            var t, i, e = e || location.hostname, n = this.conf.domain_whitelist;
            if (0 === n.length)return !0;
            for (e = e.toLowerCase(), "." === e[e.length - 1] && (e = e.slice(0, -1)), n.push("livechatinc.com"), t = 0; t < n.length; t++)if (i = n[t], e.indexOf(i, e.length - i.length) !== -1 && (e.length === i.length || "." === e.charAt(e.length - i.length - 1)))return !0;
            return "object" == typeof console && console.log("[LiveChat] Current domain is not added to the whitelist. LiveChat has been disabled."), !1
        }, this.sendLangPhrasesToEmbedded = function (e) {
            return LC_API.embedded_chat_enabled() !== !1 && (null == e && (e = this.lang_sent_phrases), NotifyChild.send("language_phrases;" + JSON.stringify(e)), void(this.lang_sent_phrases = e))
        }, this.sendWindowConfigToEmbedded = function (e) {
            var t = "window_config;" + encodeURIComponent(JSON.stringify(__script_data_response));
            e && (t += ";" + encodeURIComponent(JSON.stringify(e))), NotifyChild.send(t), NotifyChild.send("is_new_mobile;" + encodeURIComponent(Mobile.isNewMobile()))
        }, this.setLangPhrasesForMinimized = function () {
            Minimized.setLangPhrases(this.conf.localization_basic)
        }, this.prepare_elements = function () {
            var e, t;
            document.getElementsByTagName("body")[0];
            e = document.createElement("div"), e.setAttribute("id", this.invitation_layer_id), e.style.textAlign = "left", this.$invitation_layer = e, t = this.$invitation_layer.style, t.display = "none", t.zIndex = 16777261, DOM.appendToBody(this.$invitation_layer);
            var e = document.createElement("div");
            e.setAttribute("id", this.conf.overlay.id), this.$overlay = e, t = this.$overlay.style, t.backgroundColor = this.conf.overlay.color, t.position = "fixed", t.left = 0, t.top = 0, t.zIndex = 16777260, t.display = "none", t.width = "100%", t.height = "100%", DOM.appendToBody(this.$overlay)
        }, this.lookup_custom_variables = function () {
            return "string" != typeof __lc_params || (0 == __lc_params.length || void this.set_custom_variables(__lc_params))
        }, this.embedded_chat_enabled = function () {
            return __lc_settings.embedded.enabled
        }, this.embedded_hide_when_offline = function () {
            return this.destinationSkillChosen !== !0 && (!this.getVisitorInteraction() && __lc_settings.embedded.hide_when_offline)
        }, this.display_chat_buttons = function () {
            if (document.querySelectorAll) {
                var i, j, len, len2, DOMButtons, DOMButton, DOMButtonID, availableButtons, button, text, url;
                for (availableButtons = LC_Invite.conf.buttons, len2 = availableButtons.length, DOMButtons = document.querySelectorAll(".livechat_button"), i = 0, len = DOMButtons.length; i < len; i++)if (DOMButton = DOMButtons[i], DOMButtonID = DOMButton.getAttribute("data-id"), text = DOMButton.innerText || DOMButton.textContent, url = "", DOMButton.children[0] && DOMButton.children[0].href && (url = DOMButton.children[0].href), DOMButtonID)for (j = 0; j < len2; j++)button = availableButtons[j], button.id === DOMButtonID && ("image" === button.type ? DOM.innerHTML(DOMButton, '<a href="' + url + '" onclick="LC_API.open_chat_window({source:\'button\'});return false;"><img src="//' + button.value + '" alt="' + text + '" title="' + text + '"></a>') : "text" === button.type && DOM.innerHTML(DOMButton, '<a href="" onclick="LC_API.open_chat_window({source:\'button\'});return false;">' + button.value + "</a>"))
            }
            if ("undefined" == typeof __lc_buttons) {
                var self = this, wait_for_lc_buttons_counter = 0, wait_for_lc_buttons = function () {
                    return wait_for_lc_buttons_counter++, wait_for_lc_buttons_counter > 20 || ("undefined" != typeof __lc_buttons ? (self.display_chat_buttons(), !0) : void setTimeout(function () {
                            wait_for_lc_buttons()
                        }, 500))
                };
                wait_for_lc_buttons()
            }
            var i, button, e, img, container, script, lc_onclick, lc_onclick_fn, buttonPath;
            if ("object" != typeof __lc_buttons || "number" != typeof __lc_buttons.length || 0 == __lc_buttons.length)return !0;
            for (i in __lc_buttons)if (__lc_buttons.hasOwnProperty(i) && (button = __lc_buttons[i], "string" == typeof button.elementId)) {
                if (button.language = button.language || null, button.language && 0 == /^[a-z]+$/.test(button.language) && (button.language = "en"), "undefined" != typeof button.skill && 0 != /^[0-9]+$/.test(button.skill) || (button.skill = 0), button.skill = parseInt(button.skill, 10), "undefined" == typeof button.window && (button.window = {}), "undefined" == typeof button.window.width && (button.window.width = 530), "undefined" == typeof button.window.height && (button.window.height = 520), container = $(button.elementId), null == container)return !0;
                "undefined" != typeof button.link && 0 == button.link && (container.innerHTML = ""), "undefined" == typeof button.type && (button.type = "graphical");
                var urlOpts = {};
                urlOpts.groups = button.skill, "undefined" != typeof button.params && (urlOpts.params = unescape(button.params)), "undefined" != typeof button.name ? urlOpts.name = unescape(button.name) : "" !== __lc_settings.nick && "$" !== __lc_settings.nick && (urlOpts.name = __lc_settings.nick), "" !== __lc_settings.email && (urlOpts.email = __lc_settings.email), "undefined" != typeof button.autologin && 1 == button.autologin && (urlOpts.autologin = 1);
                var that = this, url = Loader.getChatUrl(urlOpts, {force_ssl: !0, include_current_page_address: !0});
                switch (lc_onclick = "if (LC_API.mobile_is_detected()) { LC_API.open_mobile_window({skill:" + button.skill + "}); } else if (LC_API.embedded_chat_supported() && LC_API.embedded_chat_enabled()) { LC_API.show_full_view({skill:" + button.skill + ",source:'button'}); } else { LC_Invite.windowRef = window.open('" + url + "','Chat_" + this.conf.lic + "','width=" + button.window.width + ",height=" + button.window.height + ",resizable=yes,scrollbars=no'); }", button.type) {
                    case"text":
                        this.text_buttons_queue.push({
                            button: button,
                            container: container,
                            lc_onclick: lc_onclick + ";return false"
                        });
                        break;
                    default:
                        var buttonContainerName = button.elementId + "_button", oldButton = $(buttonContainerName);
                        oldButton && container.removeChild(oldButton), DOM.innerHTML(container, '<div id="' + buttonContainerName + '"></div>' + container.innerHTML), container = $(button.elementId + "_button");
                        var children = $(button.elementId).childNodes;
                        if ("undefined" != typeof children[1] && "A" == children[1].nodeName && (children[1].style.fontFamily = "Tahoma,sans-serif", children[1].style.fontSize = "11px", children[1].style.lineHeight = "16px", children[1].style.textDecoration = "none", children[1].setAttribute("target", "_blank")), "undefined" != typeof children[2] && "SPAN" == children[2].nodeName && (children[2].style.fontFamily = "Tahoma,sans-serif", children[2].style.fontSize = "11px", children[2].style.lineHeight = "16px", children[2].style.color = "#333"), e = document.createElement("a"), e.setAttribute("id", button.elementId + "_btn"), e.setAttribute("href", Loader.getChatUrl({groups: button.skill}, {force_ssl: !0})), e.setAttribute("target", "chat_" + this.conf.lic + "_" + this.conf.serv), function (button, url) {
                                var onclick_fn, skill, onclick = lc_onclick;
                                skill = button.skill, onclick_fn = function () {
                                    LC_API.mobile_is_detected() ? LC_API.open_mobile_window({skill: skill}) : LC_API.embedded_chat_supported() && LC_API.embedded_chat_enabled() ? LC_API.show_full_view({
                                                skill: skill,
                                                source: "button"
                                            }) : LC_Invite.windowRef = window.open(url, "Chat_" + LC_Invite.conf.lic, "width=" + button.window.width + ",height=" + button.window.height + ",resizable=yes,scrollbars=no")
                                }, this.msie && this.msie_version < 8 ? e.setAttribute("onclick", function () {
                                        return eval(onclick), !1
                                    }) : (this.msie === !1 && e.setAttribute("onclick", onclick + ";return false;"), e.onclick = function () {
                                        return onclick_fn(), !1
                                    })
                            }(button, url), container.appendChild(e), img = document.createElement("img"), buttonPath = "", this.conf.skills.length > 0)for (j = 0; j < this.conf.skills.length; j++)this.conf.skills[j].id === button.skill && (buttonPath = "offline" === this.conf.skills[j].status ? "//" + this.conf.skills[j].chat_button.offline_url.replace("s3.amazonaws.com/livechat/", "cdn.livechatinc.com/s3/").replace("livechat.s3.amazonaws.com/", "cdn.livechatinc.com/s3/") : "//" + this.conf.skills[j].chat_button.online_url.replace("s3.amazonaws.com/livechat/", "cdn.livechatinc.com/s3/").replace("livechat.s3.amazonaws.com/", "cdn.livechatinc.com/s3/"));
                        if ("" === buttonPath) {
                            var langParamInUrl = button.language ? "lang=" + button.language + decodeURIComponent("%26") : "";
                            buttonPath = ("https:" == document.location.protocol ? "https://" : "http://") + this.conf.serv + "/licence/" + this.conf.lic + "/button.cgi?" + langParamInUrl + "groups=" + button.skill + decodeURIComponent("%26") + "d=" + (new Date).getTime()
                        }
                        img.src = buttonPath, img.alt = "LiveChat", img.style.border = "0", e = $(button.elementId + "_btn"), e.appendChild(img)
                }
            }
            this.runTextButtonsQueue()
        }, this.runTextButtonsQueue = function () {
            if (0 == this.text_buttons_queue.length)return !0;
            var e = LC_Invite;
            e.lc_text_link = null;
            var t = function () {
                function t() {
                    this.display = function () {
                        var e;
                        return "undefined" != typeof LC_Status && "wait" !== LC_Status && (clearInterval(this.interval), this.interval = null, "undefined" == typeof this.button.labels && (this.button.labels = {}), "undefined" == typeof this.button.labels.online && (this.button.labels.online = escape("LiveChat online")), "undefined" == typeof this.button.labels.offline && (this.button.labels.offline = escape("Leave a message")), "undefined" == typeof this.button.labels.callback && (this.button.labels.callback = escape("Leave a message. We'll call you back.")), "undefined" == typeof this.button.labels.voice && (this.button.labels.voice = escape("Callback available")), "online" == LC_Status ? e = this.button.labels.online : "offline" == LC_Status ? e = this.button.labels.offline : "callback" == LC_Status ? e = this.button.labels.callback : "voice" == LC_Status && (e = this.button.labels.voice), e = unescape(e), void DOM.innerHTML(this.container, '<a href="#" onclick="' + this.lc_onclick + '">' + e + "</a>"))
                    }
                }

                var i;
                if (null === e.lc_text_link || null === e.lc_text_link.interval) {
                    if (0 == e.text_buttons_queue.length)return clearInterval(e.process_button_interval), e.process_button_interval = null, !0;
                    var n = e.text_buttons_queue.shift();
                    LC_Status = "wait"
                }
                return "undefined" == typeof n || (script = document.createElement("script"), script.type = "text/javascript", script.async = !0, script.src = e.httpp + e.conf.serv + "/licence/" + e.conf.lic + "/buttontype.cgi?groups=" + n.button.skill, i = document.getElementsByTagName("script")[0], i.parentNode.insertBefore(script, i), e.lc_text_link = new t, e.lc_text_link.button = n.button, e.lc_text_link.container = n.container, e.lc_text_link.lc_onclick = n.lc_onclick, void(e.lc_text_link.interval = setInterval(function () {
                        e.lc_text_link.display()
                    }, 30)))
            };
            e.process_button_interval = setInterval(function () {
                t()
            }, 100)
        }, this.setEmbeddedLoaded = function () {
            this.EMBEDDED_LOADED = 1
        }, this.getEmbeddedLoaded = function () {
            return this.EMBEDDED_LOADED
        }, this.set_custom_variables = function (e) {
            var t;
            return t = CustomVariablesParser.parse(e), t !== !1 && (this.conf.lc.params = t, NotifyChild.send("params;" + encodeURIComponent(this.conf.lc.params)), void Pinger.set_force_reload(!0).ping())
        }, this.check_if_invitation_allowed = function (e) {
            return LC_API.chat_window_maximized() !== !0 && (e > this.current_invitation || e == this.current_invitation && e != this.INVITATION_STANDARD)
        }, this.load_standard_invitation = function () {
            var e;
            return LC_API.embedded_chat_enabled() === !0 ? this.chat_ended ? (function (e, t) {
                        t = t || {}, "undefined" != typeof e ? NotifyChild.send("start_chat;" + encodeURIComponent(e)) : NotifyChild.send("start_chat"), Mobile.isDetected() !== !1 || t.ignoreOpening || LC_Invite.open_chat_window()
                    }(e, {ignoreOpening: !0}), !0) : (LC_API.start_chat(), !0) : 0 != this.check_if_invitation_allowed(this.INVITATION_STANDARD) && (this.current_invitation = this.INVITATION_STANDARD, AnalyticsIntegrations.trackPageView("Standard greeting", {
                    nonInteraction: !0,
                    onlyMainWindow: !1
                }), void this.display_invitation(this.standard_invite_html, this.conf.position))
        }, this.load_personal_invitation = function (e) {
            if (LC_API.embedded_chat_enabled() === !0) this.current_invitation = this.INVITATION_PERSONAL; else {
                if (0 == this.check_if_invitation_allowed(this.INVITATION_PERSONAL))return !1;
                this.current_invitation = this.INVITATION_PERSONAL, AnalyticsIntegrations.trackPageView("Personal greeting")
            }
            window.PersonalInvitation.render(e)
        }, this.load_auto_invitation = function (e) {
            return 0 != this.check_if_invitation_allowed(this.INVITATION_AUTO) && (this.current_invitation = this.INVITATION_AUTO, void this.trackAndRenderAutoInvitation(e, {maximizeWindow: !0}))
        }, this.trackAndRenderAutoInvitation = function (e, t) {
            e.displayed_first_time !== !1 && AnalyticsIntegrations.trackPageView("Automated greeting", {
                nonInteraction: !0,
                onlyMainWindow: !1
            }), window.AutoInvitation.render(e, t)
        }, this.show_overlay_layer = function () {
            this.$overlay.style.display = "block", this.overlay_fade_in()
        }, this.hide_overlay_layer = function () {
            this.$overlay.style.display = "none"
        }, this.show_invitation_layer = function (e, t) {
            if (0 == this.$invitation_image.complete)return setTimeout(function () {
                LC_Invite.show_invitation_layer(e, t)
            }, 50), !1;
            if ("left" == t.option && (t.option = "centered", t.arg1 = 0, t.arg2 = 0), this.conf.overlay.enabled = Boolean("centered" == t.option), this.$invitation_layer.style.display = "block", this.$invitation_layer.style.width = parseInt(this.$invitation_image.width) + "px", this.conf.overlay.enabled ? (this.$invitation_layer.style.marginLeft = "-" + parseInt(this.$invitation_image.width / 2) + "px", this.$invitation_layer.style.marginTop = "-" + parseInt(this.$invitation_image.height / 2) + "px") : (this.$invitation_layer.style.marginLeft = "0", this.$invitation_layer.style.marginTop = "0"), this.conf.overlay.enabled ? (this.show_overlay_layer(), this.$invitation_layer.style.position = "fixed", this.$invitation_layer.style.top = "50%", this.$invitation_layer.style.left = "50%", this.$invitation_layer.style.bottom = "") : (this.hide_overlay_layer(), this.$invitation_layer.style.position = "absolute", this.$invitation_layer.style.left = "", this.$invitation_layer.style.top = "", this.$invitation_layer.style.bottom = ""), this.$invitation_image.style.backgroundColor = "transparent", this.conf.overlay.enabled)return !1;
            var i = document, n = (i.documentElement, i.getElementById ? i.getElementById(e) : i.all ? i.all[e] : i.layers[e]), o = document.layers ? "" : "px";
            window[e + "_obj"] = n, i.layers && (n.style = n);
            var a = this;
            n.cx = n.sx = t.arg2, n.cy = n.sy = t.arg1, n.sP = function (e, i) {
                var n = -2 * t.arg1 + LC_Invite.getClientHeight() - a.$invitation_image.height;
                "topLeft" == t.option ? (this.style.left = e + o, this.style.top = i + o) : "topRight" == t.option ? (this.style.left = a.getClientWidth() - a.$invitation_image.width - e + o, this.style.top = i + o) : "topCenter" == t.option ? (this.style.top = i + o, this.style.left = "50%", this.style.marginLeft = -parseInt(a.$invitation_image.width / 2) + "px") : "bottomRight" == t.option ? (this.style.left = a.getClientWidth() - a.$invitation_image.width - e + o, this.style.top = i + n + o) : "bottomLeft" == t.option ? (this.style.top = i + n + o, this.style.left = e + o) : "bottomCenter" == t.option && (this.style.top = i + n + o, this.style.left = "50%", this.style.marginLeft = -parseInt(a.$invitation_image.width / 2) + "px")
            }, n.floatIt = function () {
                var e, t;
                e = this.sx >= 0 ? 0 : LC_Invite.getClientWidth(), t = LC_Invite.getScrollTop(), this.sy < 0 && (t += LC_Invite.getClientHeight()), this.cx += parseInt((e + this.sx - this.cx) / 8), this.cy += parseInt((t + this.sy - this.cy) / 8), this.sP(this.cx, this.cy), a.floatItTimeout = setTimeout(this.id + "_obj.floatIt()", 20)
            }, n.floatIt()
        }, this.lc_popup_hide = function () {
            this.$invitation_layer.style.display = "none", this.$overlay.style.display = "none", clearTimeout(this.floatItTimeout)
        }, this.lc_popup_close = function () {
            this.lc_popup_hide(), this.current_invitation = this.INVITATION_NONE, document.createElement("img").src = this.httpp + this.conf.serv + "/licence/" + this.conf.lic + "/tunnel.cgi?IWCS0014C^inviterefused^" + LC_API.get_visitor_id() + "^$^&rand=" + Math.floor(1e3 * Math.random())
        }, this.lc_open_chat = function (e, t) {
            var i, n;
            this.lc_popup_hide(), "undefined" == typeof e ? (NotifyChild.send("source_invitation"), e = "") : NotifyChild.send("source_invitation;" + encodeURIComponent(e)), "undefined" == typeof t && (t = this.conf.lc.groups), LC_API.embedded_chat_supported() && LC_API.embedded_chat_enabled() ? LC_API.show_full_view({source: "manual" === e ? "manual invitation" : "embedded invitation"}) : (n = {
                    groups: t,
                    timestamp: +new Date,
                    trigger: e
                }, "" !== __lc_settings.nick && "$" !== __lc_settings.nick && (n.name = __lc_settings.nick), "" !== __lc_settings.email && "$" !== __lc_settings.email && (n.email = __lc_settings.email), i = Loader.getChatUrl(n, {
                    force_ssl: !0,
                    include_current_page_address: !0
                }), LC_Invite.windowRef = window.open(i, "Chat_" + this.conf.lic, "width=530,height=520,resizable=yes,scrollbars=no"))
        }, this.open_chat_window = function (e) {
            e = e || {}, "popup" === LC_API.get_window_type() || Mobile.isOldMobile() ? Mobile.isDetected() ? LC_API.open_mobile_window(e) : this.lc_open_chat() : Full.isLoaded() ? Mobile.isDetected() ? LC_API.open_mobile_window(e) : LC_API.show_full_view(e) : (Minimized.displayLoadingMessage(), Full.onAfterLoad(function () {
                        LC_Invite.open_chat_window(e)
                    }))
        }, this.open_mobile_window = function (e) {
            var t, e = e || {};
            if (LC_API.embedded_chat_supported() && !LC_API.agents_are_available() && this.embedded_hide_when_offline() === !0)return !1;
            if (LC_API.embedded_chat_enabled() && Minimized.disableNewMessageNotification(), LC_API.new_mobile_is_detected())return this.lc_open_chat();
            t = null != e.skill ? e.skill : this.conf.lc.groups;
            var i = {groups: t, mobile: 1};
            "" !== __lc_settings.nick && "$" !== __lc_settings.nick && (i.name = __lc_settings.nick), "" !== __lc_settings.email && "$" !== __lc_settings.email && (i.email = __lc_settings.email), url = Loader.getChatUrl(i, {
                force_ssl: !0,
                include_current_page_address: !0
            }), LC_Invite.windowRef = window.open(url, "Chat_" + this.conf.lic), NotifyChild.send("preload_sounds"), Mobile.playSound({preloadOnMobile: !0})
        }, this.getWindowDimensions = function () {
            return "CSS1Compat" !== document.compatMode && document.body.clientHeight ? [document.body.clientWidth, document.body.clientHeight] : [document.documentElement.clientWidth, document.documentElement.clientHeight]
        }, this.getClientWidth = function () {
            return this.getWindowDimensions()[0]
        }, this.getClientHeight = function () {
            return this.getWindowDimensions()[1]
        }, this.getScrollTop = function () {
            var e;
            return self.pageYOffset ? e = self.pageYOffset : document.documentElement && document.documentElement.scrollTop ? e = document.documentElement.scrollTop : document.body && (e = document.body.scrollTop), e
        }, this.display_invitation = function (e, t) {
            if ("undefined" != typeof LC_PrivateInvite && LC_API.embedded_chat_enabled() === !0) {
                var i, n;
                return i = e.match(/id="div_greeting-message">((.|[\r\n])*?)<\/div>/), n = i[1], LC_API.start_chat(n), !0
            }
            if ("undefined" != typeof LC_AutoInvite && LC_API.embedded_chat_enabled() === !0) {
                var i, o, a, r;
                return i = e.match(/lc_open_chat\('(.*?)', (.*?)\)/), o = i[1], a = i[2], "function" == typeof LC_AutoInvite.get_invitation_content ? r = LC_AutoInvite.get_invitation_content() : "function" == typeof LC_AutoInvite.construct_invite ? (r = LC_AutoInvite.construct_invite(), r = r.match(/div_greeting-message">(.*?)<\/div>/)[1] ? r.match(/div_greeting-message">(.*?)<\/div>/)[1] : "") : r = "", LC_API.display_embedded_invitation(r, o, a), !0
            }
            this.lc_popup_hide(), this.conf.overlay.enabled = Boolean("centered" == t.option), this.$invitation_layer.innerHTML = e;
            var s;
            this.current_invitation == this.INVITATION_STANDARD ? s = "lc_standard_invitation_img" : this.current_invitation == this.INVITATION_PERSONAL ? s = "lc_personal_invitation_img" : this.current_invitation == this.INVITATION_AUTO && (s = "lc_auto_invitation_img"), this.$invitation_image = $(s), this.show_invitation_layer(this.invitation_layer_id, t)
        }, this.overlay_fade_in = function () {
            var e = function (e) {
                var t = LC_Invite.$overlay.style;
                t.opacity = t.MozOpacity = t.KhtmlOpacity = e / 100, t.filter = "alpha(opacity=" + e + ")"
            };
            e(0);
            var t = 0, i = parseInt(100 * this.conf.overlay.opacity), n = Math.abs((i - t) / 5), o = 1, a = function (o) {
                return o > n ? void e(i) : (e(Math.ceil(t + (i - t) * (o / n))), ++o, void setTimeout(function () {
                        a(o)
                    }, 40))
            };
            a(o)
        }, this.iframe_full_view_loaded = function () {
        }, this.load_embedded_window = function () {
            var e, t, i, n, o, a, r, s, l, c = this, d = function (e) {
                null == c.invoked_callbacks[e] && (c.invoked_callbacks[e] = !0, LC_API[e]())
            };
            if (LC_API.embedded_chat_supported() === !1)return d("on_before_load"), !1;
            if (LC_API.embedded_chat_enabled() === !1)return d("on_before_load"), !1;
            e = document.getElementsByTagName("body")[0];
            var u = this.isLC4() ? "350px" : this.conf.embedded.dimensions.width + "px", _ = this.isLC4() ? "100%" : this.conf.embedded.dimensions.height + "px";
            if (n = document.createElement("div"), n.setAttribute("id", "livechat-full"), t = n.style, t.position = "fixed", t.bottom = "0", t.right = this.conf.embedded.dimensions.margin + "px", t.width = u, t.height = _, t.overflow = "hidden", t.visibility = "hidden", t.zIndex = "-1", t.background = "transparent", t.border = "0", t.transition = "transform .2s ease-in-out", t.WebkitTransition = "transform .2s ease-in-out", t.MozTransition = "transform .2s ease-in-out", t.OTransition = "transform .2s ease-in-out", t.MsTransition = "transform .2s ease-in-out", Mobile.isDetected() === !1 && (t.webkitBackfaceVisibility = "hidden"), LC_API.mobile_is_detected() && !LC_API.new_mobile_is_detected() && (t.position = "absolute", t.top = "-9999em", t.left = "-9999em", t.bottom = "auto", t.right = "auto"), LC_API.new_mobile_is_detected() && (t.zIndex = "-1"), a = document.createElement("iframe"), a.setAttribute("src", __lc_iframe_src_hash), a.setAttribute("id", "livechat-full-view"), a.setAttribute("name", "livechat-full-view"), a.setAttribute("scrolling", "no"), a.setAttribute("frameborder", "0"), a.setAttribute("allowtransparency", "true"), r = a.style, r.position = "absolute", r.top = "0", r.right = "0", r.bottom = "0", r.left = "0", r.width = "100%", r.height = "100%", r.border = "0", r.padding = "0", r.margin = "0", r.float = "none", r.background = "none", a.onload = LC_Invite.iframe_full_view_loaded, n.appendChild(a), o = document.createElement("div"), o.setAttribute("id", "livechat-compact-container"), i = o.style, i.position = "fixed", i.bottom = "0", i.right = this.conf.embedded.dimensions.margin + "px", i.width = this.conf.embedded.dimensions.width_minimized + "px", i.height = "53px", i.overflow = "hidden", i.visibility = "hidden", i.zIndex = "2147483639", i.background = "transparent", i.border = "0", i.transition = "transform .2s ease-in-out", i.WebkitTransition = "transform .2s ease-in-out", i.MozTransition = "transform .2s ease-in-out", i.OTransition = "transform .2s ease-in-out", i.MsTransition = "transform .2s ease-in-out", Mobile.isDetected() === !1 && (i.webkitBackfaceVisibility = "hidden"), s = ["position: absolute", "display: block", "visibility: hidden", "height: 16px", "padding: 0 4px", "line-height: 16px", "background: #f00", "color: #fff", "font-size: 10px", "text-decoration: none", "font-family: 'Lucida Grande', 'Lucida Sans Unicode', Arial, Verdana, sans-serif", "border-radius: 3px", "box-shadow: 0 -1px 0px #f00, -1px 0 0px #f00, 1px 0 0px #f00, 0 1px 0px #f00, 0 0 2px #000", "border-top: 1px solid #f99"], Utils.inArray(this.conf.chat_window.theme.name, ["modern", "postmodern", "minimal"]) !== -1 && (s.push("width: 16px"), s.push("border-radius: 50%"), s.push("box-shadow: none"), s.push("border-top: 0"), s.push("padding: 0"), s.push("text-align: center"), s.push("font-family: 'Lato', sans-serif")), this.conf.group_properties.chat_window && "circle" === this.conf.group_properties.chat_window.theme.minimized ? (s.push("top: 23px"), s.push("right: 8px")) : (s.push("top: 12px"), s.push("left: 20px")), r = ["position: relative", "top: 20px", "left: 0", "width: 100%", "border: 0", "padding: 0", "margin: 0", "float: none", "background: none"], l = "about:blank", __lc.mute_csp_errors) {
                var h = function () {
                    var e = document.getElementById("livechat-compact-view"), t = e && (e.contentWindow || e.contentDocument);
                    if (!t)return void setTimeout(h, 300);
                    var i = function (e) {
                        e.preventDefault(), LC_API.show_full_view()
                    };
                    return document.attachEvent ? void t.attachEvent("onclick", i) : void t.addEventListener("click", i, !0)
                };
                h()
            }
            o.innerHTML = '<iframe src="' + l + '" id="livechat-compact-view" style="' + r.join(";") + '" scrolling="no" frameborder="0" allowtransparency="true"></iframe><a id="livechat-badge" href="#" onclick="LC_API.show_full_view({source:\'minimized click\'});return false" style="' + s.join(";") + '"></a>';
            var m = this, f = function () {
                Minimized.init();
                var e = function (e) {
                    EyeCatcher.setState("offline" === e ? "offline" : "online")
                };
                Minimized.setStateCallback(e)
            }, p = function () {
                var e;
                return m.setLangPhrasesForMinimized(), m.embedded_chat_hidden_by_api = !1, Minimized.setLC2Theme(m.conf.chat_window.use_lc2_theme), Minimized.setTheme(m.conf.chat_window.theme.name, m.conf.chat_window.theme.color), m.conf.group_properties.chat_window && m.conf.group_properties.chat_window.theme.minimized && Minimized.setMinimizedTheme(m.conf.group_properties.chat_window.theme.minimized), Minimized.setOperatorsOnline("online" === m.conf.status), customStyle = new CustomStyle, "postmodern" !== m.conf.chat_window.theme.name || Mobile.isNewMobile() || (customStyle.parseCss("#livechat-full {height: 440px !important;}"), NotifyChild.send("update_body_height")), "minimal" === m.conf.chat_window.theme.name && (customStyle.parseCss("#livechat-full {width: 270px !important;height: 332px !important;}"), NotifyChild.send("update_body_height")), m.conf.chat_window.theme.css && (!Minimized.useLC2Theme() || "0" !== m.conf.chat_window.theme.customized && m.conf.chat_window.theme.customized !== !1) && (cssStyle = m.conf.chat_window.theme.css, Mobile.isNewMobile() && (cssStyle = customStyle.parseMobileCss(cssStyle)), cssStyle && (Minimized.setCustomCSS(cssStyle), NotifyChild.send("custom_css;" + encodeURIComponent(m.conf.chat_window.theme.css)), customStyle.parseCss(cssStyle) && NotifyChild.send("update_body_height"))), NotifyChild.send("mobile_input_blur"), e = $("livechat-compact-view"), e = e.contentWindow || e.contentDocument, e = e.document || e, Minimized.onRender(function () {
                    Mobile.isDetected() && Mobile.isiOS() && (window.addEventListener("focusin", function (e) {
                        var t = e.target && e.target.type;
                        t && Utils.inArray(t, ["email", "text", "url", "search", "number", "date", "textarea"]) !== -1 && LC_API.chat_window_minimized() === !0 && (Minimized.hiddenByInputFocus = !0, Minimized.hide())
                    }), window.addEventListener("focusout", function (e) {
                        Minimized.hiddenByInputFocus && Minimized.show()
                    }))
                }), e && "complete" === e.readyState ? Minimized.render() : document.attachEvent ? $("livechat-compact-view").attachEvent("onload", function () {
                            Minimized.render()
                        }) : $("livechat-compact-view").onload = function () {
                            Minimized.render()
                        }, LC_API.new_mobile_is_detected() && Mobile.setWindowStyle(), "offline" !== m.conf.status || m.embedded_hide_when_offline() !== !0 || Chat.running() || Chat.waitingInQueue() ? m.embedded_chat_hidden_by_api === !0 ? (d("on_before_load"), !0) : void(m.conf.automatic_greeting || Chat.running() || Chat.waitingInQueue() || (d("on_before_load"), m.embedded_chat_hidden_by_api !== !0 && LC_API.minimize_chat_window({callAPI: !1}))) : (d("on_before_load"), LC_API.hide_chat_window(), !0)
            };
            DOM.appendToBody(o, function () {
                f(), p()
            }), EyeCatcher.appendToDOM(), DOM.appendToBody(n), Mobile.isNewMobile() && Mobile.initNewMobile()
        }, this.init_firefly = function (e) {
            var t, i, n;
            return e = e || {}, null != this.conf.integrations.firefly && (null != this.conf.integrations.firefly.api_key && (window.fireflyAPI = {},
                fireflyAPI.ready = function (e) {
                    "function" == typeof e && (e = [e]), fireflyAPI.onLoaded = fireflyAPI.onLoaded || [], fireflyAPI.isLoaded ? e.forEach(function (e) {
                            e()
                        }) : e.forEach(function (e) {
                            fireflyAPI.onLoaded.push(e)
                        })
                }, fireflyAPI.token = "5134be7651f9f4005600fb87", t = document.createElement("script"), t.type = "text/javascript", t.src = "https://firefly-071591.s3.amazonaws.com/scripts/loaders/loader.js", t.async = !0, i = document.getElementsByTagName("script")[0], i.parentNode.insertBefore(t, i), void(e.callback && (n = setInterval(function () {
                return "undefined" != typeof window.fireflyAPI.set && (clearInterval(n), void e.callback())
            }, 300)))))
        }, this.bindWindowEvents = function () {
            var e = this;
            return null != window.addEventListener && (window.addEventListener("focus", function (e) {
                    NotifyChild.send("window_focus")
                }, !1), window.addEventListener("blur", function (e) {
                    NotifyChild.send("window_blur")
                }, !1), void(this.isFirefox() && window.addEventListener("beforeunload", function (t) {
                    e.pageUnloaded = !0, Pinger.setPageUnloaded(!0)
                }, !1)))
        }, this.isFirefox = function () {
            return navigator.userAgent && navigator.userAgent.indexOf("Firefox") !== -1
        }, this.setupIntegrations = function () {
            null != this.conf.integrations.analytics && GoogleAnalytics.setEnabled(!0), null != this.conf.integrations.kissmetrics && Kissmetrics.setEnabled(!0), null != this.conf.integrations.mixpanel && Mixpanel.setEnabled(!0)
        }, this.setPingSent = function (e) {
            return this.setFlag("ping_sent", e), this
        }, this.wasPingSent = function () {
            return this._pingSent
        }, this.setConfig = function (e) {
            return this.conf = e, this
        }, this.setVisitorInteraction = function (e) {
            return this.setFlag("visitor_interaction", e), this
        }, this.getVisitorInteraction = function () {
            return this._visitor_interaction
        }, this.setFlag = function (e, t) {
            var i = this;
            return i["_" + e] = t, Utils.makeItDone(function () {
                NotifyChild.send(e + ";" + t)
            }).when(function () {
                return Loader.is_iframe_loaded
            }), this
        }, this.hideChatWindow = function () {
            return null !== $("livechat-compact-container") && ($("livechat-compact-container").style.visibility = "hidden", $("livechat-compact-container").style.opacity = 0, $("livechat-eye-catcher") && ($("livechat-eye-catcher").style.visibility = "hidden", $("livechat-eye-catcher").style.opacity = 0), $("livechat-full") && ($("livechat-full").style.visibility = "hidden", $("livechat-full").style.opacity = 0, $("livechat-full").style.zIndex = "-1"), $("livechat-badge") && ($("livechat-badge").style.visibility = "hidden", $("livechat-badge").style.opacity = 0), LC_API.on_chat_window_hidden(), void NotifyChild.send("window_state;minimized"))
        }, this.isLC4 = function () {
            return __lc.lc4
        }, this.minimize_chat_window = function (e) {
            var e = e || {};
            if (null == e.callAPI && (e.callAPI = !0), null === $("livechat-compact-container"))return !1;
            if (Cookie.set("lc_window_state", "minimized"), $("livechat-compact-container").style.visibility = "visible", $("livechat-compact-container").style.opacity = 1, $("livechat-compact-container").style.zIndex = "2147483639", $("livechat-compact-container").style.transform = "translateY(0%)", $("livechat-eye-catcher") && LC_API.agents_are_available() && ($("livechat-eye-catcher").style.visibility = "visible", $("livechat-eye-catcher").style.opacity = 1), $("livechat-full")) {
                var t = window.getComputedStyle && getComputedStyle($("livechat-full")).transitionDuration || "200";
                t = t.indexOf("ms") !== -1 ? t.replace("ms", "") : t.indexOf("s") !== -1 ? 1e3 * t.replace("s", "") : 200, $("livechat-full").style.transform = "translateY(100%)", this.animationTimeout && clearTimeout(this.animationTimeout), this.animationTimeout = setTimeout(function () {
                    $("livechat-full").style.visibility = "hidden", $("livechat-full").style.opacity = 0, $("livechat-full").style.zIndex = "-1"
                }, t)
            }
            "" != $("livechat-badge").innerHTML && ($("livechat-badge").style.visibility = "visible", $("livechat-badge").style.opacity = 1), e.callAPI && LC_API.on_chat_window_minimized(), NotifyChild.send("window_state;minimized"), Mobile.isNewMobile() && Mobile.onMinimizeChatWindow()
        }, this.show_full_view = function (e) {
            var t, i, n, o, a = !1;
            "undefined" == typeof e && (a = !0);
            var e = e || {};
            if ("undefined" == typeof e.skill && (e.skill = __lc_settings.lc.groups), e.skill = parseInt(e.skill, 10), null === $("livechat-compact-container"))return !1;
            if (Mobile.isNewMobile() && Mobile.onShowFullView(), Minimized.getState() !== Minimized.STATE_INVITATION_WITH_AGENT && Minimized.getState() !== Minimized.STATE_CHATTING || (Cookie.set("lc_invitation_opened", "opened"), Minimized.updateWindowHTML()), !LC_API.agents_are_available() && LC_Invite.embedded_hide_when_offline() === !0)return !1;
            if (Cookie.set("lc_window_state", "full"), Minimized.newMessagesCounter = 0, $("livechat-badge").innerHTML = "", $("livechat-badge").style.visibility = "hidden", $("livechat-badge").style.opacity = 0, a === !1 && e.skill !== __lc_iframe_current_skill) e.skill = parseInt(e.skill, 10), __lc_iframe_current_skill = e.skill, __lc_iframe_src = Loader.getChatUrl({
                groups: __lc_iframe_current_skill,
                langSkillUpdated: 1,
                embedded: LC_Invite.embedded_chat_enabled() ? "1" : "0"
            }), __lc_iframe_src_hash = __lc_iframe_src + "#" + document.location.toString(), t = $("livechat-full-view"), LC_Invite.embedded_chat_hidden_by_api = !1, i = function () {
                Minimized.updateText(), NotifyChild.maximizeOnInit(!0), $("livechat-compact-container").style.visibility = "hidden", $("livechat-compact-container").style.opacity = 0, $("livechat-compact-container").style.zIndex = "2147483638", $("livechat-eye-catcher") && ($("livechat-eye-catcher").style.visibility = "hidden", $("livechat-eye-catcher").style.opacity = 0), $("livechat-full").style.visibility = "visible", $("livechat-full").style.opacity = 1, $("livechat-full").style.zIndex = "2147483639", $("livechat-full").style.transform = "translateY(0%)"
            }, LC_Invite.msie ? LC_Invite.iframe_full_view_loaded = i : t.onload = i, t.src ? t.src = __lc_iframe_src_hash : null !== t.contentWindow && null !== t.contentWindow.location ? t.contentWindow.location = __lc_iframe_src_hash : t.setAttribute("src", __lc_iframe_src_hash); else {
                Minimized.updateText(), n = "1", document.activeElement && document.activeElement.tagName && (o = String(document.activeElement.tagName).toLowerCase(), "input" !== o && "textarea" !== o || (n = "0")), NotifyChild.send("maximize;" + n + ";" + e.source), $("livechat-compact-container").style.transform = "translateY(100%)";
                var r = window.getComputedStyle && getComputedStyle($("livechat-full")).transitionDuration || "200";
                r = r.indexOf("ms") !== -1 ? r.replace("ms", "") : r.indexOf("s") !== -1 ? 1e3 * r.replace("s", "") : 200, this.animationTimeout && clearTimeout(this.animationTimeout), this.animationTimeout = setTimeout(function () {
                    $("livechat-compact-container").style.visibility = "hidden", $("livechat-compact-container").style.opacity = 0, $("livechat-compact-container").style.zIndex = "-1"
                }, r), $("livechat-eye-catcher") && ($("livechat-eye-catcher").style.visibility = "hidden", $("livechat-eye-catcher").style.opacity = 0), $("livechat-full").style.visibility = "visible", $("livechat-full").style.opacity = 1, $("livechat-full").style.zIndex = "2147483639", $("livechat-full").style.transform = "translateY(0%)"
            }
            LC_API.on_chat_window_opened()
        }
    }

    var __define, __exports;
    if ("undefined" != typeof define && (__define = define, define = void 0), "undefined" != typeof exports && (__exports = exports, exports = void 0), "undefined" != typeof window.__lc_inited)return !0;
    window.__lc_inited = 1;
    var __lc = window.__lc || {};
    (function () {
        function e(t, n) {
            function a(e, t) {
                try {
                    e()
                } catch (e) {
                    t && t()
                }
            }

            function r(e) {
                if (null != r[e])return r[e];
                var t;
                if ("bug-string-char-index" == e) t = "a" != "a"[0]; else if ("json" == e) t = r("json-stringify") && r("date-serialization") && r("json-parse"); else if ("date-serialization" == e) {
                    if (t = r("json-stringify") && y) {
                        var i = n.stringify;
                        a(function () {
                            t = '"-271821-04-20T00:00:00.000Z"' == i(new u((-864e13))) && '"+275760-09-13T00:00:00.000Z"' == i(new u(864e13)) && '"-000001-01-01T00:00:00.000Z"' == i(new u((-621987552e5))) && '"1969-12-31T23:59:59.999Z"' == i(new u((-1)))
                        })
                    }
                } else {
                    var o, s = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
                    if ("json-stringify" == e) {
                        var i = n.stringify, d = "function" == typeof i;
                        d && ((o = function () {
                            return 1
                        }).toJSON = o, a(function () {
                            d = "0" === i(0) && "0" === i(new l) && '""' == i(new c) && i(b) === p && i(p) === p && i() === p && "1" === i(o) && "[1]" == i([o]) && "[null]" == i([p]) && "null" == i(null) && "[null,null,null]" == i([p, b, null]) && i({a: [o, !0, !1, null, "\0\b\n\f\r\t"]}) == s && "1" === i(null, o) && "[\n 1,\n 2\n]" == i([1, 2], null, 1)
                        }, function () {
                            d = !1
                        })), t = d
                    }
                    if ("json-parse" == e) {
                        var _, h = n.parse;
                        "function" == typeof h && a(function () {
                            0 !== h("0") || h(!1) || (o = h(s), _ = 5 == o.a.length && 1 === o.a[0], _ && (a(function () {
                                _ = !h('"\t"')
                            }), _ && a(function () {
                                _ = 1 !== h("01")
                            }), _ && a(function () {
                                _ = 1 !== h("1.")
                            })))
                        }, function () {
                            _ = !1
                        }), t = _
                    }
                }
                return r[e] = !!t
            }

            function s(e) {
                return D(this)
            }

            t || (t = o.Object()), n || (n = o.Object());
            var l = t.Number || o.Number, c = t.String || o.String, d = t.Object || o.Object, u = t.Date || o.Date, _ = t.SyntaxError || o.SyntaxError, h = t.TypeError || o.TypeError, m = t.Math || o.Math, f = t.JSON || o.JSON;
            "object" == typeof f && f && (n.stringify = f.stringify, n.parse = f.parse);
            var p, g = d.prototype, b = g.toString, v = g.hasOwnProperty, y = new u((-0xc782b5b800cec));
            if (a(function () {
                    y = y.getUTCFullYear() == -109252 && 0 === y.getUTCMonth() && 1 === y.getUTCDate() && 10 == y.getUTCHours() && 37 == y.getUTCMinutes() && 6 == y.getUTCSeconds() && 708 == y.getUTCMilliseconds()
                }), r["bug-string-char-index"] = r["date-serialization"] = r.json = r["json-stringify"] = r["json-parse"] = null, !r("json")) {
                var w = "[object Function]", A = "[object Date]", C = "[object Number]", I = "[object String]", M = "[object Array]", x = "[object Boolean]", T = r("bug-string-char-index"), L = function (e, t) {
                    var n, o, a, r = 0;
                    (n = function () {
                        this.valueOf = 0
                    }).prototype.valueOf = 0, o = new n;
                    for (a in o)v.call(o, a) && r++;
                    return n = o = null, r ? L = function (e, t) {
                            var i, n, o = b.call(e) == w;
                            for (i in e)o && "prototype" == i || !v.call(e, i) || (n = "constructor" === i) || t(i);
                            (n || v.call(e, i = "constructor")) && t(i)
                        } : (o = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"], L = function (e, t) {
                            var n, a, r = b.call(e) == w, s = !r && "function" != typeof e.constructor && i[typeof e.hasOwnProperty] && e.hasOwnProperty || v;
                            for (n in e)r && "prototype" == n || !s.call(e, n) || t(n);
                            for (a = o.length; n = o[--a]; s.call(e, n) && t(n));
                        }), L(e, t)
                };
                if (!r("json-stringify") && !r("date-serialization")) {
                    var k = {
                        92: "\\\\",
                        34: '\\"',
                        8: "\\b",
                        12: "\\f",
                        10: "\\n",
                        13: "\\r",
                        9: "\\t"
                    }, z = "000000", S = function (e, t) {
                        return (z + (t || 0)).slice(-e)
                    }, D = function (e) {
                        var t, i, n, o, a, r, s, l, c;
                        if (y) t = function (e) {
                            i = e.getUTCFullYear(), n = e.getUTCMonth(), o = e.getUTCDate(), r = e.getUTCHours(), s = e.getUTCMinutes(), l = e.getUTCSeconds(), c = e.getUTCMilliseconds()
                        }; else {
                            var d = m.floor, u = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], _ = function (e, t) {
                                return u[t] + 365 * (e - 1970) + d((e - 1969 + (t = +(t > 1))) / 4) - d((e - 1901 + t) / 100) + d((e - 1601 + t) / 400)
                            };
                            t = function (e) {
                                for (o = d(e / 864e5), i = d(o / 365.2425) + 1970 - 1; _(i + 1, 0) <= o; i++);
                                for (n = d((o - _(i, 0)) / 30.42); _(i, n + 1) <= o; n++);
                                o = 1 + o - _(i, n), a = (e % 864e5 + 864e5) % 864e5, r = d(a / 36e5) % 24, s = d(a / 6e4) % 60, l = d(a / 1e3) % 60, c = a % 1e3
                            }
                        }
                        return (D = function (e) {
                            return e > -1 / 0 && e < 1 / 0 ? (t(e), e = (i <= 0 || i >= 1e4 ? (i < 0 ? "-" : "+") + S(6, i < 0 ? -i : i) : S(4, i)) + "-" + S(2, n + 1) + "-" + S(2, o) + "T" + S(2, r) + ":" + S(2, s) + ":" + S(2, l) + "." + S(3, c) + "Z", i = n = o = r = s = l = c = null) : e = null, e
                        })(e)
                    };
                    if (r("json-stringify") && !r("date-serialization")) {
                        var P = n.stringify;
                        n.stringify = function (e, t, i) {
                            var n = u.prototype.toJSON;
                            u.prototype.toJSON = s;
                            var o = P(e, t, i);
                            return u.prototype.toJSON = n, o
                        }
                    } else {
                        var N = "\\u00", B = function (e) {
                            var t = e.charCodeAt(0), i = k[t];
                            return i ? i : N + S(2, t.toString(16))
                        }, O = /[\x00-\x1f\x22\x5c]/g, E = function (e) {
                            return O.lastIndex = 0, '"' + (O.test(e) ? e.replace(O, B) : e) + '"'
                        }, R = function (e, t, i, n, o, r, s) {
                            var l, c, d, _, m, f, g, v, y;
                            if (a(function () {
                                    l = t[e]
                                }), "object" == typeof l && l && (l.getUTCFullYear && b.call(l) == A && l.toJSON === u.prototype.toJSON ? l = D(l) : "function" == typeof l.toJSON && (l = l.toJSON(e))), i && (l = i.call(t, e, l)), l == p)return l === p ? l : "null";
                            switch (c = typeof l, "object" == c && (d = b.call(l)), d || c) {
                                case"boolean":
                                case x:
                                    return "" + l;
                                case"number":
                                case C:
                                    return l > -1 / 0 && l < 1 / 0 ? "" + l : "null";
                                case"string":
                                case I:
                                    return E("" + l)
                            }
                            if ("object" == typeof l) {
                                for (g = s.length; g--;)if (s[g] === l)throw h();
                                if (s.push(l), _ = [], v = r, r += o, d == M) {
                                    for (f = 0, g = l.length; f < g; f++)m = R(f, l, i, n, o, r, s), _.push(m === p ? "null" : m);
                                    y = _.length ? o ? "[\n" + r + _.join(",\n" + r) + "\n" + v + "]" : "[" + _.join(",") + "]" : "[]"
                                } else L(n || l, function (e) {
                                    var t = R(e, l, i, n, o, r, s);
                                    t !== p && _.push(E(e) + ":" + (o ? " " : "") + t)
                                }), y = _.length ? o ? "{\n" + r + _.join(",\n" + r) + "\n" + v + "}" : "{" + _.join(",") + "}" : "{}";
                                return s.pop(), y
                            }
                        };
                        n.stringify = function (e, t, n) {
                            var o, a, r, s;
                            if (i[typeof t] && t)if (s = b.call(t), s == w) a = t; else if (s == M) {
                                r = {};
                                for (var l, c = 0, d = t.length; c < d; l = t[c++], s = b.call(l), (s == I || s == C) && (r[l] = 1));
                            }
                            if (n)if (s = b.call(n), s == C) {
                                if ((n -= n % 1) > 0)for (o = "", n > 10 && (n = 10); o.length < n; o += " ");
                            } else s == I && (o = n.length <= 10 ? n : n.slice(0, 10));
                            return R("", (l = {}, l[""] = e, l), a, r, o, "", [])
                        }
                    }
                }
                if (!r("json-parse")) {
                    var $, U, W = c.fromCharCode, H = {
                        92: "\\",
                        34: '"',
                        47: "/",
                        98: "\b",
                        116: "\t",
                        110: "\n",
                        102: "\f",
                        114: "\r"
                    }, j = function () {
                        throw $ = U = null, _()
                    }, F = function () {
                        for (var e, t, i, n, o, a = U, r = a.length; $ < r;)switch (o = a.charCodeAt($)) {
                            case 9:
                            case 10:
                            case 13:
                            case 32:
                                $++;
                                break;
                            case 123:
                            case 125:
                            case 91:
                            case 93:
                            case 58:
                            case 44:
                                return e = T ? a.charAt($) : a[$], $++, e;
                            case 34:
                                for (e = "@", $++; $ < r;)if (o = a.charCodeAt($), o < 32) j(); else if (92 == o)switch (o = a.charCodeAt(++$)) {
                                    case 92:
                                    case 34:
                                    case 47:
                                    case 98:
                                    case 116:
                                    case 110:
                                    case 102:
                                    case 114:
                                        e += H[o], $++;
                                        break;
                                    case 117:
                                        for (t = ++$, i = $ + 4; $ < i; $++)o = a.charCodeAt($), o >= 48 && o <= 57 || o >= 97 && o <= 102 || o >= 65 && o <= 70 || j();
                                        e += W("0x" + a.slice(t, $));
                                        break;
                                    default:
                                        j()
                                } else {
                                    if (34 == o)break;
                                    for (o = a.charCodeAt($), t = $; o >= 32 && 92 != o && 34 != o;)o = a.charCodeAt(++$);
                                    e += a.slice(t, $)
                                }
                                if (34 == a.charCodeAt($))return $++, e;
                                j();
                            default:
                                if (t = $, 45 == o && (n = !0, o = a.charCodeAt(++$)), o >= 48 && o <= 57) {
                                    for (48 == o && (o = a.charCodeAt($ + 1), o >= 48 && o <= 57) && j(), n = !1; $ < r && (o = a.charCodeAt($), o >= 48 && o <= 57); $++);
                                    if (46 == a.charCodeAt($)) {
                                        for (i = ++$; i < r && (o = a.charCodeAt(i), o >= 48 && o <= 57); i++);
                                        i == $ && j(), $ = i
                                    }
                                    if (o = a.charCodeAt($), 101 == o || 69 == o) {
                                        for (o = a.charCodeAt(++$), 43 != o && 45 != o || $++, i = $; i < r && (o = a.charCodeAt(i), o >= 48 && o <= 57); i++);
                                        i == $ && j(), $ = i
                                    }
                                    return +a.slice(t, $)
                                }
                                n && j();
                                var s = a.slice($, $ + 4);
                                if ("true" == s)return $ += 4, !0;
                                if ("fals" == s && 101 == a.charCodeAt($ + 4))return $ += 5, !1;
                                if ("null" == s)return $ += 4, null;
                                j()
                        }
                        return "$"
                    }, V = function (e) {
                        var t, i;
                        if ("$" == e && j(), "string" == typeof e) {
                            if ("@" == (T ? e.charAt(0) : e[0]))return e.slice(1);
                            if ("[" == e) {
                                for (t = []; e = F(), "]" != e;)i ? "," == e ? (e = F(), "]" == e && j()) : j() : i = !0, "," == e && j(), t.push(V(e));
                                return t
                            }
                            if ("{" == e) {
                                for (t = {}; e = F(), "}" != e;)i ? "," == e ? (e = F(), "}" == e && j()) : j() : i = !0, "," != e && "string" == typeof e && "@" == (T ? e.charAt(0) : e[0]) && ":" == F() || j(), t[e.slice(1)] = V(F());
                                return t
                            }
                            j()
                        }
                        return e
                    }, q = function (e, t, i) {
                        var n = G(e, t, i);
                        n === p ? delete e[t] : e[t] = n
                    }, G = function (e, t, i) {
                        var n, o = e[t];
                        if ("object" == typeof o && o)if (b.call(o) == M)for (n = o.length; n--; q(o, n, i)); else L(o, function (e) {
                            q(o, e, i)
                        });
                        return i.call(e, t, o)
                    };
                    n.parse = function (e, t) {
                        var i, n;
                        return $ = 0, U = "" + e, i = V(F()), "$" != F() && j(), $ = U = null, t && b.call(t) == w ? G((n = {}, n[""] = i, n), "", t) : i
                    }
                }
            }
            return n.runInContext = e, n
        }

        var t = "function" == typeof define && define.amd, i = {
            function: !0,
            object: !0
        }, n = i[typeof exports] && exports && !exports.nodeType && exports, o = i[typeof window] && window || this, a = n && i[typeof module] && module && !module.nodeType && "object" == typeof global && global;
        if (!a || a.global !== a && a.window !== a && a.self !== a || (o = a), n && !t) e(o, n); else {
            var r = o.JSON, s = o.JSON3, l = !1, c = e(o, o.JSON3 = {
                noConflict: function () {
                    return l || (l = !0, o.JSON = r, o.JSON3 = s, r = s = null), c
                }
            });
            o.JSON = {parse: c.parse, stringify: c.stringify}
        }
        t && define(function () {
            return c
        })
    }).call(this);
    var json3 = JSON3.noConflict();
    if ("undefined" == typeof JSON3)try {
        delete JSON3
    } catch (e) {
    }
    var JSON = {
        nativeRegex: /native code/, stringifyWith: function (e, t, i) {
            var n = Array.prototype.toJSON;
            delete Array.prototype.toJSON;
            var o = e.apply(t, i);
            return n && (Array.prototype.toJSON = n), o
        }, stringify: function () {
            return this.nativeRegex.test(window.JSON.stringify) ? this.stringifyWith(window.JSON.stringify, window.JSON, arguments) : this.stringifyWith(json3.stringify, json3, arguments)
        }, parse: function () {
            return this.nativeRegex.test(window.JSON.parse) ? window.JSON.parse.apply(window.JSON, arguments) : json3.parse.apply(json3, arguments)
        }
    }, CustomVariablesParser = {
        parse: function (e) {
            return "string" == typeof e ? this._parseObject(this.getArrayByString(e)) : "object" == typeof e ? this._parseObject(e) : ""
        }, getArrayByString: function (e) {
            var t, i, n, o;
            try {
                if ("" === e || "$" === e)return "";
                for (e = IncorrectCharactersStripper.strip(e), n = [], o = e.split("&"), t = 0; t < o.length; t++)if (i = o[t].split("="), i[1])try {
                    i[0] = decodeURIComponent(i[0]), i[1] = decodeURIComponent(i[1]), n.push({name: i[0], value: i[1]})
                } catch (e) {
                }
                return n
            } catch (e) {
                return []
            }
        }, _parseObject: function (e) {
            var t, i, n, o;
            o = IncorrectCharactersStripper.strip, t = [];
            for (i in e)n = e[i], "object" == typeof n && "undefined" != typeof n.name && "undefined" != typeof n.value && (n.name = String(n.name).substring(0, 500), n.value = String(n.value).substring(0, 3500), t.push(encodeURIComponent(o(n.name)) + "=" + encodeURIComponent(o(n.value))));
            return t.join("&")
        }
    }, IncorrectCharactersStripper = {
        strip: function (e) {
            return "string" != typeof e ? e : e.replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
        }
    }, Pinger = function () {
        var e, t, i, n, o, a, r, s, l, c, d, u, _, h, m, f, p, g, b = 5, v = b, y = 18e5, w = IncorrectCharactersStripper.strip, A = function (e) {
            return e.replace(/[\/]/g, "\\/").replace(/[\b]/g, "\\b").replace(/[\f]/g, "\\f").replace(/[\n]/g, "\\n").replace(/[\r]/g, "\\r").replace(/[\t]/g, "\\t")
        };
        return {
            init: function (o) {
                return e = o.config, t = o.app, i = o.minimized, n = o.loaderInfo, a = o.chatBetweenGroups, r = o.hostname, s = o.skill, l = o.visitorEmail, c = o.scriptVersion, d = o.embedded, m = o.statusChecker, n || (n = {
                    pageData: {
                        title: document.title,
                        url: document.location.toString(),
                        referrer: document.referrer
                    }, protocol: window.location.protocol.indexOf("https") != -1 ? "https://" : "http://"
                }), h = !0, this.resetPingStart(), this
            }, ping: function (u) {
                var _, h, g, b, C, I, M, x, T, L = this;
                if (u = u || {}, u.forcePing && (o = !0, this.set_force_reload(!0), this.resetPingStart(), m && m.stopChecking()), +new Date - this.getPingStart() > y && (p = !0, t.setPingSent(!1), m && m.startChecking()), this.getPageUnloaded())return !1;
                if (!o && (p === !0 || e.client_limit_exceeded))return !1;
                if (f && clearTimeout(f), this.get_force_reload()) {
                    this.set_force_reload(!1);
                    var k = e.lc && "undefined" != typeof e.lc.groups ? e.lc.groups : e.visitor.groups;
                    for (_ = {
                        visitor: {
                            id: LC_API.get_visitor_id(),
                            group: k
                        }
                    }, l && (_.visitor.email = l), "" !== e.nick && "$" !== e.nick && (_.visitor.name = w(e.nick)), g = w(n.pageData.title), _.page = {}, g && (_.page.title = g), g = n.pageData.url, g && (_.page.url = g), g = w(n.pageData.referrer), g && (_.page.referrer = g), c && (_.script_version = c), I = [], g = e.lc && "undefined" != typeof e.lc.params ? e.lc.params : $.getUrlParam("params") || "", g = g.split("&"), 1 === g.length && "" === g[0] && (g = []), h = 0; h < g.length; h++)b = g[h].split("="), I.push({
                        name: decodeURIComponent(b[0]),
                        value: decodeURIComponent(b[1])
                    });
                    I.length > 0 && (_.visitor.custom_variables = I)
                } else _ = {visitor: {id: LC_API.get_visitor_id()}};
                M = Math.ceil(1e6 * Math.random()), window["__lc_ping_" + M] = function (e) {
                    i && i.isChattingSupported() && (e.standard_greeting && t.load_standard_invitation && t.load_standard_invitation(), e.personal_greeting && t.load_personal_invitation && t.load_personal_invitation(e.personal_greeting), e.automatic_greeting && t.load_auto_invitation && t.load_auto_invitation(e.automatic_greeting)), e.next_ping_send_full_details ? (L.set_force_reload(!0), L.sendNextPing(0)) : t.setPingSent(!0), null != e.next_ping_delay && (0 === e.next_ping_delay ? f && clearTimeout(f) : v = e.next_ping_delay), e.group_status && ("offline" !== e.group_status && "online_for_chat" !== e.group_status && "online_for_queue" !== e.group_status || LC_API.on_chat_state_changed({state: e.group_status})), window["__lc_ping_" + M] = void 0
                }, T = "t=" + +new Date, T += "&data=" + encodeURIComponent(A(JSON.stringify(_))), T += "&jsonp=__lc_ping_" + M, C = document.getElementById("livechat-ping"), C && C.parentNode.removeChild(C), x = document.createElement("script"), x.id = "livechat-ping", a ? x.src = n.protocol + r + "/licence/" + e.lic + "/ping?" + T : x.src = n.protocol + r + "/licence/g" + e.lic + "_" + s + "/ping?" + T, d ? DOM.appendToBody(x) : document.body.appendChild(x), this.sendNextPing(v)
            }, sendNextPing: function (e) {
                var t = this;
                f && clearTimeout(f), f = setTimeout(function () {
                    t.ping.call(t)
                }, 1e3 * e)
            }, get_force_reload: function () {
                return g
            }, set_force_reload: function (e) {
                return this.resetPingStart(), g = e, this
            }, getPageUnloaded: function () {
                return u
            }, setPageUnloaded: function (e) {
                return u = e, this
            }, getPingStart: function () {
                return _
            }, resetPingStart: function () {
                return _ = +new Date, this
            }, isInited: function () {
                return h
            }, setConfig: function (t) {
                return e = t, this
            }
        }
    }(), Utils = function () {
        var e = {domain: /[^:]+:\/\/[^\/\s]+/}, t = Date.now || function () {
                return +new Date
            }, i = t(), n = function () {
            return Array.isArray || function (e) {
                    return "[object Array]" === {}.toString.call(e)
                }
        }(), o = function (e, t) {
            var i, o = [];
            if (n(e)) {
                for (i = 0; i < e.length; ++i)o.push(t(e[i], i, e));
                return o
            }
            for (i in e)e.hasOwnProperty(i) && o.push(t(e[i], i, e));
            return o
        };
        return {
            extractDomain: function (t) {
                var i = t.match(e.domain);
                return i && i[0]
            }, makeItDone: function (e) {
                var t;
                return {
                    when: function (i) {
                        var n, o, a, r = 100, s = function () {
                            return !!i() && (clearInterval(o), e(), a = !0)
                        }, l = function () {
                            t && t(), o = setInterval(s, n || r)
                        };
                        return this.tryEach = function (e) {
                            a || (n = e, clearInterval(o), l())
                        }, s() || l(), this
                    }, doBeforeTrying: function (e) {
                        return t = e, this
                    }
                }
            }, inArray: function (e, t, i) {
                var n;
                if (t) {
                    if (Array.prototype.indexOf)return Array.prototype.indexOf.call(t, e, i);
                    for (n = t.length, i = i ? i < 0 ? Math.max(0, n + i) : i : 0; i < n; i++)if (i in t && t[i] === e)return i
                }
                return -1
            }, forEach: function (e, t) {
                for (var i = 0; i < e.length; ++i)t(e[i], i, e)
            }, find: function (e, t) {
                for (var i = 0; i < e.length; ++i)if (t(e[i], i, e))return e[i]
            }, throttle: function (e, i) {
                var n, o, a, r, s;
                i = i || 500;
                var l = function () {
                    e.apply(a, r), o = n
                };
                return function () {
                    if (a = this, r = [].slice.call(arguments), n = t(), !o)return void l();
                    var e = i - (n - o);
                    return e > 0 ? (clearTimeout(s), void(s = setTimeout(function () {
                            l()
                        }, e))) : void l()
                }
            }, jsonpRequest: function (e) {
                e = e || {}, e.protocol = e.protocol || (window.location.protocol.indexOf("https") != -1 ? "https://" : "http://"), e.callback = e.callback || function () {
                    }, e.requestName = e.requestName || "__lc_jsonp_request", e.queryParams = e.queryParams || {};
                var t = e.requestName + Math.floor(1e6 * Math.random());
                e.queryParams.jsonp = t, window[t] = function (i) {
                    delete window[t], e.callback(i)
                };
                var i = document.getElementById(e.requestName);
                i && i.parentNode.removeChild(i);
                var n = document.createElement("script");
                n.id = e.requestName, n.src = e.protocol + e.hostname + e.endpoint + "?" + Utils.encodeQueryParams(e.queryParams), DOM.appendToBody(n)
            }, encodeQueryParams: function (e) {
                return o(e, function (e, t) {
                    return t + "=" + e
                }).join("&")
            }, once: function (e) {
                var t;
                return function () {
                    return t ? t : t = e()
                }
            }, getNavigationStart: function () {
                return window.performance && window.performance.timing && window.performance.timing.navigationStart || i
            }, isArray: n, map: o
        }
    }(), AnalyticsIntegrations = {
        enabledIntegrations: [], isEnabled: function (e) {
            for (var t = 0; t < this.enabledIntegrations.length; t++)if (this.enabledIntegrations[t].name === e)return !0;
            return !1
        }, removeEmptyValues: function (e) {
            for (var t in e)e.hasOwnProperty(t) && !e[t] && delete e[t]
        }, trackPageView: function (e, t) {
            t = t || {}, t.nonInteraction = t.nonInteraction || !1, t.onlyMainWindow = "undefined" == typeof t.onlyMainWindow || t.onlyMainWindow, t.event_data && this.removeEmptyValues(t.event_data);
            for (var i = 0; i < this.enabledIntegrations.length; i++)Utils.inArray(e, this.enabledIntegrations[i].events) !== -1 && this.enabledIntegrations[i].callback(e, t)
        }, subscribe: function (e) {
            this.isEnabled(e.name) || this.enabledIntegrations.push(e)
        }
    }, AutoInvitation = {
        render: function (e, t) {
            function i() {
                this.get_invitation_content = function () {
                    var e = this.config.greeting_message.text;
                    return e = e.replace(/\</g, "&lt;").replace(/\>/g, "&gt;").replace(/&lt;br&gt;/g, "<br>")
                }, this.get_layer_html = function () {
                    var e = this.get_invitation_content(), t = "";
                    return e = e.replace(/\n/g, "<br>"), t += '<div style="top:0px;left:0px;width:100%;height:100%;position:relative;overflow:hidden;">', t += '<a style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;cursor:pointer;z-index:9;background:url(//cdn.livechatinc.com/img/pixel.gif)" href="#" onclick="LC_Invite.lc_open_chat(\'' + this.config.unique_id + "', " + this.config.destination_skill + ');return false"></a>', t += '<a style="position:absolute;top:' + this.config.close_button.top + "px;left:" + this.config.close_button.left + "px;width:" + this.config.close_button.width + "px;height:" + this.config.close_button.height + 'px;display:block;cursor:pointer;z-index:10;background:url(//cdn.livechatinc.com/img/pixel.gif)" href="#" onclick="LC_Invite.lc_popup_close();return false"></a>', this.config.greeting_message.color = this.config.greeting_message.color.replace(/^#/, ""), t += '<div style="top:' + this.config.greeting_message.top + "px;left:" + this.config.greeting_message.left + "px;width:" + this.config.greeting_message.width + "px;height:" + this.config.greeting_message.height + "px;overflow:auto;z-index:8;position:absolute;overflow:hidden;color:#" + this.config.greeting_message.color + ";font-size:" + this.config.greeting_message.size + "px;line-height:1.25em;font-family:" + this.config.greeting_message.font + '" id="div_greeting-message">', t += e, t += "</div>", t += '<span><img border="0" src="' + LC_Invite.httpp + this.config.image_url + '" id="lc_auto_invitation_img"></span></div>'
                }, this.load_invite = function () {
                    LC_API.embedded_chat_enabled() ? (LC_API.display_embedded_invitation(this.get_invitation_content(), this.config.unique_id, this.config.destination_skill, this.config.agent, this.maximize_on_load), LC_Invite.conf.lc2 !== !0 || Cookie.get("autoinvite_callback") || (LC_API.on_message({
                            text: this.get_invitation_content(),
                            user_type: "agent",
                            agent_login: this.config.agent.login,
                            agent_name: this.config.agent.name,
                            timestamp: Math.round(new Date / 1e3)
                        }), Cookie.set("autoinvite_callback", !0)), this.autoInvited = !0, this.ignoreFirstMessage = !1) : LC_Invite.display_invitation(this.get_layer_html(), this.config.position)
                }, this.autoInvited = !1, this.ignoreFirstMessage = !1
            }

            return !e.error && (t = t || {}, window.LC_AutoInvite = new i, window.LC_AutoInvite.config = e, window.LC_AutoInvite.config.position = {
                    arg1: e.position.y,
                    arg2: e.position.x,
                    option: e.position.h_align
                }, t.maximizeWindow && (window.LC_AutoInvite.maximize_on_load = !0), void window.LC_AutoInvite.load_invite())
        }
    };
    window.AutoInvitation = AutoInvitation;
    var Chat = {
        init: function () {
            "1" === Cookie.get("chat_running") && (this._running = "1"), "1" === Cookie.get("waiting_in_queue") && (this._waitingInQueue = "1")
        }, running: function (e) {
            return null != e && (this._running = e, "1" === e && Cookie.set("chat_running", e)), this._running
        }, waitingInQueue: function (e) {
            return null != e && (this._waitingInQueue = e, "1" === e && Cookie.set("waiting_in_queue", e)), this._waitingInQueue
        }
    }, Client = {
        setName: function (e) {
            NotifyChild.send("nick;" + encodeURIComponent(e))
        }, setEmail: function (e) {
            NotifyChild.send("email;" + encodeURIComponent(e))
        }
    }, Cookie = {
        set: function (e, t, i) {
            var n, o, a, r, s;
            i ? (a = new Date, a.setTime(a.getTime() + 24 * i * 60 * 60 * 1e3), r = "; expires=" + a.toGMTString()) : r = "", s = location.host, 1 === s.split(".").length ? (__lc.chat_between_groups === !1 && __lc.skill > 0 && (e = e + ".group" + __lc.skill), document.cookie = e + "=" + t + r + "; path=/") : (o = s.split("."), o.shift(), n = "." + o.join("."), __lc.chat_between_groups === !1 && __lc.skill > 0 && (e = e + ".group" + __lc.skill), document.cookie = e + "=" + t + r + "; path=/; domain=" + n, null != Cookie.get(e) && Cookie.get(e) == t || (n = "." + s, document.cookie = e + "=" + t + r + "; path=/; domain=" + n))
        }, get: function (e) {
            __lc.chat_between_groups === !1 && __lc.skill > 0 && (e = e + ".group" + __lc.skill);
            for (var t = e + "=", i = document.cookie.split(";"), n = 0; n < i.length; n++) {
                for (var o = i[n]; " " == o.charAt(0);)o = o.substring(1, o.length);
                if (0 == o.indexOf(t))return o.substring(t.length, o.length)
            }
            return null
        }, erase: function (e) {
            Cookie.set(e, "", -1)
        }
    }, DOM = {
        appendToBody: function (e, t) {
            var i, n;
            i = function () {
                try {
                    return document.body.appendChild(e), n && (clearInterval(n), n = null), "function" == typeof t && t(), !0
                } catch (e) {
                    return !1
                }
            }, i() || (n = setInterval(i, 100))
        }, isReady: !1, ready: function (e) {
            document.attachEvent ? this.waitForDOMReady(e) : e()
        }, waitForDOMReady: function (e) {
            DOM.readyFn = e, document.attachEvent("onreadystatechange", function () {
                "complete" === document.readyState && DOM.itsReady()
            }), window.attachEvent("onload", DOM.itsReady);
            var t = !1;
            try {
                t = null == window.frameElement
            } catch (e) {
            }
            document.documentElement.doScroll && t && DOM.doScrollCheck()
        }, doScrollCheck: function () {
            if (!DOM.isReady) {
                try {
                    document.documentElement.doScroll("left")
                } catch (e) {
                    return void setTimeout(DOM.doScrollCheck, 1)
                }
                DOM.itsReady()
            }
        }, itsReady: function () {
            if (!DOM.isReady) {
                if (!document.body)return setTimeout(DOM.itsReady, 1);
                DOM.isReady = !0, "function" == typeof DOM.readyFn && DOM.readyFn()
            }
        }, innerHTML: function (e, t) {
            var i;
            try {
                e.innerHTML = t
            } catch (n) {
                i = document.createElement(e.tagName), i.id = e.id, i.className = e.className;
                try {
                    i.innerHTML = t, e.parentNode.replaceChild(i, e)
                } catch (n) {
                    t = t.replace(/<div([^>]*)>/g, "<span$1>"), t = t.replace(/<\/div>/g, "</span>"), i.innerHTML = t, e.parentNode.replaceChild(i, e)
                }
            }
        }
    }, Events = {
        _receivedEvents: [], _isErlang: !1, _storedMetrics: [], track: function (e, t) {
            var i, n;
            i = new Image, n = "https://queue.livechatinc.com/logs", n += "?licence_id=" + __lc.license, n += "&event_id=" + encodeURIComponent(e), n += "&message=" + encodeURIComponent(t), i.src = n
        }, setErlang: function (e) {
            this._isErlang = e
        }, isErlang: function () {
            return this._isErlang
        }, sendStoredMetrics: function () {
            var e = this;
            Utils.forEach(this._storedMetrics, function (t) {
                e.trackEngagement(t)
            })
        }, trackEngagement: function (e) {
            NotifyChild.send("track_engagement;" + JSON.stringify(e))
        }, trackSpeed: function (e, t) {
            if (!window.performance || !window.performance.timing)return !1;
            if (Utils.inArray(e, this._receivedEvents) !== -1)return !1;
            this._receivedEvents.push(e);
            var i = (new Date).getTime(), n = i - window.performance.timing.navigationStart, o = t || {};
            o.name = e, o.page_load_time = n, this._storedMetrics.push(o)
        }
    }, EyeCatcher = {
        imageAppended: !1, init: function (e) {
            this.config = e, this.imageHTML = '<img src="//' + this.config.embedded.eye_grabber.path + '" style="border:0;display:block;" alt="">'
        }, enabled: function () {
            return this.config.embedded.eye_grabber.enabled
        }, shouldBeDisplayed: function () {
            return !LC_API.mobile_is_detected() && !LC_API.new_mobile_is_detected() && (this.enabled() === !0 && "1" !== Cookie.get("hide_eye_catcher"))
        }, appendToDOM: function () {
            var e, t, i, n = this;
            return !!this.shouldBeDisplayed() && (e = document.createElement("div"), e.setAttribute("id", "livechat-eye-catcher"), e.setAttribute("onmouseover", 'var els = this.getElementsByTagName("a"); if (els.length) els[0].style.display = "block";'), e.setAttribute("onmouseout", 'var els = this.getElementsByTagName("a"); if (els.length) els[0].style.display = "none";'), document.getElementsByTagName && (e.onmouseover = function () {
                    var e = this.getElementsByTagName("a");
                    e.length && (e[0].style.display = "block")
                }, e.onmouseout = function () {
                    var e = this.getElementsByTagName("a");
                    e.length && (e[0].style.display = "none")
                }), t = e.style, t.position = "fixed", t.right = this.config.embedded.eye_grabber.x + this.config.embedded.eye_grabber.point_zero.x + "px", t.bottom = this.config.embedded.eye_grabber.y + this.config.embedded.eye_grabber.point_zero.y + "px", t.visibility = "hidden", t.zIndex = "2147483639", t.background = "transparent", t.border = "0", t.padding = "10px 10px 0 0", t.float = "left", t.marginRight = "-10px", Mobile.isDetected() === !1 && (t.webkitBackfaceVisibility = "hidden"), t = ["position:absolute", "display:none", "top:-5px", "right:-5px", "padding:2px 7px", "text-decoration:none", "color:#000", "font-size:20px", "font-family:Arial,sans-serif"], "online" === this.config.status ? (i = this.imageHTML, this.imageAppended = !0) : i = "", e.innerHTML = '\t\t<a href="#" onclick="LC_API.hide_eye_catcher();return false" style="' + t.join(";") + '" onmouseover="this.style.color=\'#666\'" onmouseout="this.style.color=\'#000\'">&times;</a>\t\t<a href="#" onclick="LC_API.open_chat_window({source:\'eye catcher\'});return false" style="display:block" id="livechat-eye-catcher-img">' + i + "</a>", void DOM.appendToBody(e, function () {
                    n.setState("online" === n.config.status ? "online" : "offline")
                }))
        }, appendImage: function () {
            $("livechat-eye-catcher-img").innerHTML = this.imageHTML
        }, setState: function (e) {
            var t;
            return !!(t = $("livechat-eye-catcher")) && void("online" === e && LC_API.chat_window_minimized() && !LC_Invite.embedded_chat_hidden_by_api ? (this.imageAppended === !1 && this.appendImage(), t.style.visibility = "visible") : t.style.visibility = "hidden")
        }
    }, Full = {
        _loaded: !1, _afterLoad: null, isLoaded: function (e) {
            return null != e && (this._loaded = e), this._loaded
        }, onAfterLoad: function (e) {
            this._afterLoad = e
        }, onload: function () {
            this.isLoaded(!0), this._afterLoad && this._afterLoad()
        }
    }, GoogleAnalytics = {
        enabled: null, gaType: null, setEnabled: function (e) {
            var t = this;
            this.enabled = e, AnalyticsIntegrations.subscribe({
                name: "GoogleAnalytics",
                events: ["Standard greeting", "Personal greeting", "Automated greeting", "Chat", "Ticket form", "After-hours form", "Pre-chat survey", "Post-chat survey"],
                callback: function () {
                    t.track.apply(t, arguments)
                }
            })
        }, _trackpageTracker: function (e, t, i) {
            "object" == typeof pageTracker && "function" == typeof pageTracker._trackEvent && pageTracker._trackEvent("LiveChat", e, t, null, i);
        }, _trackurchinTracker: function (e) {
            "function" == typeof urchinTracker && urchinTracker(e)
        }, _trackgtm: function (e, t, i) {
            1 != __lc.ga_omit_gtm && "object" == typeof dataLayer && "function" == typeof dataLayer.push && dataLayer.push({
                event: "LiveChat",
                eventCategory: "LiveChat",
                eventAction: e,
                eventLabel: t,
                nonInteraction: i
            })
        }, _trackgaq: function (e, t, i) {
            "object" == typeof _gaq && _gaq.push(["_trackEvent", "LiveChat", e, t, null, i])
        }, _sendToGaTracker: function (e, t, i, n, o) {
            var a = o ? o + ".send" : "send";
            window[n](a, {
                hitType: "event",
                eventCategory: "LiveChat",
                eventAction: e,
                eventLabel: t,
                nonInteraction: i
            })
        }, _trackga: function (e, t, i) {
            var n = window.GoogleAnalyticsObject || "ga";
            if (__lc.ga_send_to_all_trackers)for (var o = window[n].getAll(), a = 0; a < o.length; a++) {
                var r = o[a].get && o[a].get("name");
                this._sendToGaTracker(e, t, i, n, r)
            } else"function" == typeof window[n] && function () {
                var e = !1;
                return window[n](function (t) {
                    "object" == typeof t && (e = !0)
                }), e
            }() && this._sendToGaTracker(e, t, i, n)
        }, _doTrack: function (e, t, i) {
            var n = this.getGaType();
            if (n && this["_track" + n])return this["_track" + n](e, t, i)
        }, track: function (e, t) {
            this.trackPageView(e, t)
        }, trackPageView: function (e, t) {
            var i;
            if (t = t || {}, t.nonInteraction = t.nonInteraction || !1, t.onlyMainWindow === !0 && LC_Invite.is_main_window !== !0)return !1;
            if (this.enabled !== !0)return !1;
            i = "(no group)";
            var n = t.event_data && t.event_data.skill || __lc.skill;
            n > 0 && (i = "Group ID: " + parseInt(n, 10)), this._doTrack(e, i, t.nonInteraction)
        }, detectGaType: function () {
            __lc.ga_version && this["_track" + __lc.ga_version] ? this.gaType = __lc.ga_version : "object" == typeof pageTracker && "function" == typeof pageTracker._trackEvent ? this.gaType = "pageTracker" : "function" == typeof urchinTracker ? this.gaType = "urchinTracker" : 1 != __lc.ga_omit_gtm && "object" == typeof dataLayer && "function" == typeof dataLayer.push ? this.gaType = "gtm" : "object" == typeof _gaq ? this.gaType = "gaq" : "function" == typeof ga && function () {
                                    var e = !1;
                                    return ga(function (t) {
                                        "object" == typeof t && (e = !0)
                                    }), e
                                }() ? (this.gaType = "ga", this.gaName = "ga") : window.GoogleAnalyticsObject && "string" == typeof window.GoogleAnalyticsObject && (this.gaType = "ga")
        }, getGaType: function () {
            return this.gaType ? this.gaType : (this.detectGaType(), this.gaType)
        }
    }, Kissmetrics = {
        enabled: null,
        setEnabled: function (e) {
            var t = this;
            this.enabled = e, AnalyticsIntegrations.subscribe({
                name: "Kissmetrics",
                events: ["Standard greeting", "Personal greeting", "Automated greeting", "Chat", "Ticket form", "Ticket form filled in", "After-hours form", "Pre-chat survey", "Pre-chat survey filled in", "Post-chat survey", "Post-chat survey filled in"],
                callback: function () {
                    t.track.apply(t, arguments)
                }
            })
        },
        eventsMapper: {
            "Standard greeting": "LiveChat Standard greeting displayed",
            "Personal greeting": "LiveChat Personal greeting displayed",
            "Automated greeting": "LiveChat Automated greeting displayed",
            Chat: "LiveChat Chat started",
            "Ticket form": "LiveChat Ticket form displayed",
            "Ticket form filled in": "LiveChat Ticket form filled in",
            "After-hours form": "LiveChat After-hours form displayed",
            "Pre-chat survey": "LiveChat Pre-chat survey displayed",
            "Pre-chat survey filled in": "LiveChat Pre-chat survey filled in",
            "Post-chat survey": "LiveChat Post-chat survey displayed",
            "Post-chat survey filled in": "LiveChat Post-chat survey filled in"
        },
        track: function (e, t) {
            if ("object" == typeof _kmq) {
                var i = "(no group)";
                t = t || {}, t.event_data = t.event_data || {};
                var n = t.event_data && t.event_data.skill || __lc.skill;
                n > 0 && (i = "Group ID: " + parseInt(n, 10)), t.event_data.group = i, this.eventsMapper[e] && (e = this.eventsMapper[e]), _kmq.push(["record", e, t.event_data]), t.user_data && _kmq.push(["set", t.user_data]), t.event_data && t.event_data.email && _kmq.push(["alias", t.event_data.email, KM.i()])
            }
        }
    }, Minimized = {
        STATE_OFFLINE: 0,
        STATE_PRE_CHAT: 1,
        STATE_QUEUE: 2,
        STATE_CHATTING: 3,
        STATE_POST_CHAT: 4,
        STATE_CHAT_ENDED: 5,
        STATE_INVITATION: 6,
        STATE_INVITATION_WITH_AGENT: 7,
        previous_state: null,
        state: null,
        welcomeMessage: null,
        inited: !1,
        rendered: !1,
        _onRender: null,
        onStateChanged: null,
        operator_display_name: null,
        text_label: "",
        circle_group_property: null,
        custom_css: "",
        titleNotification: "",
        originalTitle: "",
        TITLE_NOTIFICATION_HIDDEN: !0,
        TITLE_NOTIFICATION_APPENDED: !1,
        titleNotificationInterval: null,
        titleNotificationAnimateSpeed: 1e3,
        titleNotificationFlag: !0,
        tabActive: !0,
        langPhrases: {},
        styles: {
            mobileFonts: "@font-face%20%7B%0A%20%20%20%20font-family:%20'livechat-mobile';%0A%20%20%20%20src:%20%20%20%20url('//cdn.livechatinc.com/fonts/mobile/livechat-mobile_cdfaf5185d.eot?3i1s7d');%0A%20%20%20%20src:%20%20%20%20url('//cdn.livechatinc.com/fonts/mobile/livechat-mobile_cdfaf5185d.eot?3i1s7d#iefix')%20format('embedded-opentype'),%0A%20%20%20%20%20%20%20%20url('//cdn.livechatinc.com/fonts/mobile/livechat-mobile_fbd9d3a5be.ttf?3i1s7d')%20format('truetype'),%0A%20%20%20%20%20%20%20%20url('//cdn.livechatinc.com/fonts/mobile/livechat-mobile_2972642f7a.woff?3i1s7d')%20format('woff'),%0A%20%20%20%20%20%20%20%20url('//cdn.livechatinc.com/fonts/mobile/livechat-mobile_9f69825941.svg?3i1s7d#icomoon')%20format('svg');%0A%20%20%20%20font-weight:%20normal;%0A%20%20%20%20font-style:%20normal;%0A%7D%0A%0A%5Bclass%5E=%22icon-%22%5D,%20%5Bclass*=%22%20icon-%22%5D%20%7B%0A%20%20%20%20/*%20use%20!important%20to%20prevent%20issues%20with%20browser%20extensions%20that%20change%20fonts%20*/%0A%20%20%20%20font-family:%20'livechat-mobile'%20!important;%0A%20%20%20%20speak:%20none;%0A%20%20%20%20font-style:%20normal;%0A%20%20%20%20font-weight:%20normal;%0A%20%20%20%20font-variant:%20normal;%0A%20%20%20%20text-transform:%20none;%0A%20%20%20%20line-height:%201;%0A%0A%20%20%20%20/*%20Better%20Font%20Rendering%20===========%20*/%0A%20%20%20%20-webkit-font-smoothing:%20antialiased;%0A%20%20%20%20-moz-osx-font-smoothing:%20grayscale;%0A%7D%0A%0A.icon-tick:before%20%7B%0A%20%20%20%20content:%20%22%5Ce900%22;%0A%7D%0A.icon-leavemessage:before%20%7B%0A%20%20%20%20content:%20%22%5Ce90a%22;%0A%7D%0A.icon-agentonline:before%20%7B%0A%20%20%20%20content:%20%22%5Ce90b%22;%0A%7D%0A.icon-clip:before%20%7B%0A%20%20%20%20content:%20%22%5Ce90c%22;%0A%7D%0A.icon-close:before%20%7B%0A%20%20%20%20content:%20%22%5Ce90d%22;%0A%7D%0A.icon-email:before%20%7B%0A%20%20%20%20content:%20%22%5Ce90e%22;%0A%7D%0A.icon-maximize:before%20%7B%0A%20%20%20%20content:%20%22%5Ce90f%22;%0A%7D%0A.icon-menu:before%20%7B%0A%20%20%20%20content:%20%22%5Ce910%22;%0A%7D%0A.icon-minimize:before%20%7B%0A%20%20%20%20content:%20%22%5Ce911%22;%0A%7D%0A.icon-mobile:before%20%7B%0A%20%20%20%20content:%20%22%5Ce912%22;%0A%7D%0A.icon-thumbs-down:before%20%7B%0A%20%20%20%20content:%20%22%5Ce913%22;%0A%7D%0A.icon-thumbs-up:before%20%7B%0A%20%20%20%20content:%20%22%5Ce914%22;%0A%7D%0A",
            mobileCSS: "#content-container.new-mobile%20#content,#extra.new-mobile%7Bmargin-top:2em!important%7D#body%20input,#body%20label,#body%20select,#body%20table,#body%20textarea,a,body,input,label,select,table,table#content,textarea%7Bfont:12px/16px%20%22Lucida%20Grande%22,%22Lucida%20Sans%20Unicode%22,Arial,Verdana,sans-serif%7D.new-mobile%20#content%20a#full-view-button%20#open-label%7Bfont-size:1.1em!important;line-height:3em;padding-top:0!important%7D.new-mobile%20#full-view-button,.new-mobile%20#title%20#title-text%7Bfont-size:1em!important%7D.new-mobile%20a#full-view-button%20span:nth-child(2)%7Bpadding:.1em%20.5em!important;width:60%25!important%7D.new-mobile%20.s-maximize%7Bdisplay:none!important%7D#content-container.new-mobile%7Bpadding:0%20.5em!important;box-sizing:border-box;line-height:1em%7D#content-container.new-mobile%20#content%7Bheight:100%25;box-shadow:0%20.05em%202em%20rgba(0,0,0,.2)!important%7D.lc2%20#content%20#open-icon%7Bfont-family:livechat-mobile;speak:none;font-style:normal;font-weight:400;font-variant:normal;text-transform:none;top:0;right:0;font-size:.9em;line-height:4em;color:#fff;display:inline-block;margin-right:.8em;float:right%7D#open-icon.icon-maximize:before%7Bcontent:%22%5Ce90f%22%7D#extra.new-mobile%7Bleft:.5em!important;right:.5em!important;width:auto!important%7D",
            modernFonts: "@font-face%20%7B%0A%20%20%20%20font-family:%20'livechat-modern';%0A%20%20%20%20src:%20%20%20%20url('//cdn.livechatinc.com/fonts/modern/livechat-modern_fa44078c17.eot?ekgvz6');%0A%20%20%20%20src:%20%20%20%20url('//cdn.livechatinc.com/fonts/modern/livechat-modern_fa44078c17.eot?ekgvz6#iefix')%20format('embedded-opentype'),%0A%20%20%20%20%20%20%20%20url('//cdn.livechatinc.com/fonts/modern/livechat-modern_7cf45543dc.ttf?ekgvz6')%20format('truetype'),%0A%20%20%20%20%20%20%20%20url('//cdn.livechatinc.com/fonts/modern/livechat-modern_27a85e5f71.woff?ekgvz6')%20format('woff'),%0A%20%20%20%20%20%20%20%20url('//cdn.livechatinc.com/fonts/modern/livechat-modern_bfb0fd8212.svg?ekgvz6#icomoon')%20format('svg');%0A%20%20%20%20font-weight:%20normal;%0A%20%20%20%20font-style:%20normal;%0A%7D%0A%0A%5Bclass%5E=%22icon-%22%5D,%20%5Bclass*=%22%20icon-%22%5D%20%7B%0A%20%20%20%20/*%20use%20!important%20to%20prevent%20issues%20with%20browser%20extensions%20that%20change%20fonts%20*/%0A%20%20%20%20font-family:%20'livechat-modern'%20!important;%0A%20%20%20%20speak:%20none;%0A%20%20%20%20font-style:%20normal;%0A%20%20%20%20font-weight:%20normal;%0A%20%20%20%20font-variant:%20normal;%0A%20%20%20%20text-transform:%20none;%0A%20%20%20%20line-height:%201;%0A%0A%20%20%20%20/*%20Better%20Font%20Rendering%20===========%20*/%0A%20%20%20%20-webkit-font-smoothing:%20antialiased;%0A%20%20%20%20-moz-osx-font-smoothing:%20grayscale;%0A%7D%0A%0A.icon-tick:before%20%7B%0A%20%20%20%20content:%20%22%5Ce915%22;%0A%7D%0A.icon-leavemessage:before%20%7B%0A%20%20%20%20content:%20%22%5Ce90b%22;%0A%7D%0A.icon-agentonline:before%20%7B%0A%20%20%20%20content:%20%22%5Ce90c%22;%0A%7D%0A.icon-clip:before%20%7B%0A%20%20%20%20content:%20%22%5Ce90d%22;%0A%7D%0A.icon-close:before%20%7B%0A%20%20%20%20content:%20%22%5Ce90e%22;%0A%7D%0A.icon-email:before%20%7B%0A%20%20%20%20content:%20%22%5Ce90f%22;%0A%7D%0A.icon-maximize:before%20%7B%0A%20%20%20%20content:%20%22%5Ce910%22;%0A%7D%0A.icon-minimize:before%20%7B%0A%20%20%20%20content:%20%22%5Ce911%22;%0A%7D%0A.icon-mobile:before%20%7B%0A%20%20%20%20content:%20%22%5Ce912%22;%0A%7D%0A.icon-thumbs-down:before%20%7B%0A%20%20%20%20content:%20%22%5Ce913%22;%0A%7D%0A.icon-thumbs-up:before%20%7B%0A%20%20%20%20content:%20%22%5Ce914%22;%0A%7D%0A @font-face%20%7B%0A%20%20font-family:%20'Lato';%0A%20%20font-style:%20normal;%0A%20%20font-weight:%20400;%0A%20%20src:%20local('Lato%20Regular'),%20local('Lato-Regular'),%20url(https://themes.googleusercontent.com/static/fonts/lato/v6/9k-RPmcnxYEPm8CNFsH2gg.woff)%20format('woff');%0A%7D%0A",
            modernCSS: "body%20%7B%0A%09font-family:%20'Lato',%20sans-serif%20!important;%0A%7D%0A%0A#content%20%7B%0A%09padding:%200;%0A%09background:%20#FFF;%0A%09border-radius:%204px%204px%200%200%20!important;%0A%09box-shadow:%20none;%0A%09background-clip:%20padding-box%20!important;%0A%09border:%200%20!important;%0A%09height:%20100%25;%0A%7D%0A%0A#content%20#open-icon%20%7B%0A%09top:%208px;%0A%09right:%208px;%0A%7D%0A.icon-maximize%20%7B%0A%09font-size:%2018px;%0A%7D%0A%0A.lc2%20#content%20#full-view-button%20%7B%0A%09white-space:%20nowrap;%0A%09font-size:%2016px;%0A%09font-weight:%20400;%0A%7D%0A%0A#full-view-button%20span:nth-child(2)%20%7B%0A%09width:%20100%25!important;%0A%09box-sizing:%20border-box;%0A%09overflow:%20hidden;%0A%09text-overflow:%20ellipsis;%0A%09padding-right:%2038px%20!important;%0A%09display:%20inline-block!important;%0A%7D%0A",
            postmodernFonts: "@font-face%20%7B%0A%20%20%20%20font-family:%20'livechat-circle';%0A%20%20%20%20src:%20%20%20%20url('//cdn.livechatinc.com/fonts/circle/livechat-circle_7d31e3ce2a.eot?boihvb');%0A%20%20%20%20src:%20%20%20%20url('//cdn.livechatinc.com/fonts/circle/livechat-circle_7d31e3ce2a.eot?boihvb#iefix')%20format('embedded-opentype'),%0A%20%20%20%20%20%20%20%20url('//cdn.livechatinc.com/fonts/circle/livechat-circle_e24970c490.ttf?boihvb')%20format('truetype'),%0A%20%20%20%20%20%20%20%20url('//cdn.livechatinc.com/fonts/circle/livechat-circle_b2f4faff07.woff?boihvb')%20format('woff'),%0A%20%20%20%20%20%20%20%20url('//cdn.livechatinc.com/fonts/circle/livechat-circle_fb831257c0.svg?boihvb#icomoon')%20format('svg');%0A%20%20%20%20font-weight:%20normal;%0A%20%20%20%20font-style:%20normal;%0A%7D%0A%0A%5Bclass%5E=%22icon-%22%5D,%20%5Bclass*=%22%20icon-%22%5D%20%7B%0A%20%20%20%20/*%20use%20!important%20to%20prevent%20issues%20with%20browser%20extensions%20that%20change%20fonts%20*/%0A%20%20%20%20font-family:%20'livechat-circle'%20!important;%0A%20%20%20%20speak:%20none;%0A%20%20%20%20font-style:%20normal;%0A%20%20%20%20font-weight:%20normal;%0A%20%20%20%20font-variant:%20normal;%0A%20%20%20%20text-transform:%20none;%0A%20%20%20%20line-height:%201;%0A%0A%20%20%20%20/*%20Better%20Font%20Rendering%20===========%20*/%0A%20%20%20%20-webkit-font-smoothing:%20antialiased;%0A%20%20%20%20-moz-osx-font-smoothing:%20grayscale;%0A%7D%0A%0A.icon-tick:before%20%7B%0A%20%20%20%20content:%20%22%5Ce90b%22;%0A%7D%0A.icon-leavemessage:before%20%7B%0A%20%20%20%20content:%20%22%5Ce900%22;%0A%7D%0A.icon-agentonline:before%20%7B%0A%20%20%20%20content:%20%22%5Ce901%22;%0A%7D%0A.icon-clip:before%20%7B%0A%20%20%20%20content:%20%22%5Ce902%22;%0A%7D%0A.icon-close:before%20%7B%0A%20%20%20%20content:%20%22%5Ce903%22;%0A%7D%0A.icon-email:before%20%7B%0A%20%20%20%20content:%20%22%5Ce904%22;%0A%7D%0A.icon-maximize:before%20%7B%0A%20%20%20%20content:%20%22%5Ce905%22;%0A%7D%0A.icon-menu:before%20%7B%0A%20%20%20%20content:%20%22%5Ce906%22;%0A%7D%0A.icon-minimize:before%20%7B%0A%20%20%20%20content:%20%22%5Ce907%22;%0A%7D%0A.icon-mobile:before%20%7B%0A%20%20%20%20content:%20%22%5Ce908%22;%0A%7D%0A.icon-thumbs-down:before%20%7B%0A%20%20%20%20content:%20%22%5Ce909%22;%0A%7D%0A.icon-thumbs-up:before%20%7B%0A%20%20%20%20content:%20%22%5Ce90a%22;%0A%7D%0A @font-face%7Bfont-family:Lato;font-style:normal;font-weight:400;src:local('Lato%20Regular'),local('Lato-Regular'),url(https://themes.googleusercontent.com/static/fonts/lato/v6/9k-RPmcnxYEPm8CNFsH2gg.woff)%20format('woff')%7D",
            postmodernCSS: "#body%20input,#body%20label,#body%20select,#body%20table,#body%20textarea,a,body,input,label,select,table,table#content,textarea%7Bfont-family:Lato,sans-serif!important%7D#content%7Bbackground:#FFF;border-radius:4px%204px%200%200!important;box-shadow:0%202px%2010px%20rgba(0,0,0,.1)!important;background-clip:padding-box!important;border:1px%20solid%20rgba(0,0,0,.02)!important;height:100%25%7D#content-container%7Bpadding:10px!important;box-sizing:border-box%7D#content-container.new-mobile%7Bpadding:0%20.5em!important%7D#content-container.new-mobile%20#content%7Bmargin-top:2em!important;border-radius:.5em!important%7D.icon-maximize%7Btop:11px;right:11px;font-size:19px;color:#5c5c5c%7D#full-view-button,#title%20#title-text%7Bcolor:#FFF;font-size:16px!important;font-weight:400!important;text-shadow:none!important%7D#full-view-button%7Bcolor:#000!important;font-size:14px!important;white-space:nowrap%7D#full-view-button%20span:nth-child(2)%7Bpadding:10px%2038px%2010px%2011px!important;width:100%25!important;box-sizing:border-box;overflow:hidden;text-overflow:ellipsis;display:inline-block!important%7D.new-mobile%20#open-icon.icon-maximize:before%7Bcolor:#000%7D.new-mobile%20#full-view-button%7Bline-height:2em%7D",
            minimalFonts: "@font-face%20%7B%0A%20%20%20%20font-family:%20'livechat-minimal';%0A%20%20%20%20src:%20%20%20%20url('//cdn.livechatinc.com/fonts/minimal/livechat-minimal_750d47d198.eot?i0ym10');%0A%20%20%20%20src:%20%20%20%20url('//cdn.livechatinc.com/fonts/minimal/livechat-minimal_750d47d198.eot?i0ym10#iefix')%20format('embedded-opentype'),%0A%20%20%20%20%20%20%20%20url('//cdn.livechatinc.com/fonts/minimal/livechat-minimal_337558d286.ttf?i0ym10')%20format('truetype'),%0A%20%20%20%20%20%20%20%20url('//cdn.livechatinc.com/fonts/minimal/livechat-minimal_56b8359e5a.woff?i0ym10')%20format('woff'),%0A%20%20%20%20%20%20%20%20url('//cdn.livechatinc.com/fonts/minimal/livechat-minimal_91c8f9da62.svg?i0ym10#icomoon')%20format('svg');%0A%20%20%20%20font-weight:%20normal;%0A%20%20%20%20font-style:%20normal;%0A%7D%0A%0A%5Bclass%5E=%22icon-%22%5D,%20%5Bclass*=%22%20icon-%22%5D%20%7B%0A%20%20%20%20/*%20use%20!important%20to%20prevent%20issues%20with%20browser%20extensions%20that%20change%20fonts%20*/%0A%20%20%20%20font-family:%20'livechat-minimal'%20!important;%0A%20%20%20%20speak:%20none;%0A%20%20%20%20font-style:%20normal;%0A%20%20%20%20font-weight:%20normal;%0A%20%20%20%20font-variant:%20normal;%0A%20%20%20%20text-transform:%20none;%0A%20%20%20%20line-height:%201;%0A%0A%20%20%20%20/*%20Better%20Font%20Rendering%20===========%20*/%0A%20%20%20%20-webkit-font-smoothing:%20antialiased;%0A%20%20%20%20-moz-osx-font-smoothing:%20grayscale;%0A%7D%0A%0A.icon-agentonline:before%20%7B%0A%20%20%20%20content:%20%22%5Ce900%22;%0A%7D%0A.icon-leavemessage:before%20%7B%0A%20%20%20%20content:%20%22%5Ce901%22;%0A%7D%0A.icon-tick:before%20%7B%0A%20%20%20%20content:%20%22%5Ce902%22;%0A%7D%0A.icon-clip:before%20%7B%0A%20%20%20%20content:%20%22%5Ce903%22;%0A%7D%0A.icon-close:before%20%7B%0A%20%20%20%20content:%20%22%5Ce904%22;%0A%7D%0A.icon-maximize:before%20%7B%0A%20%20%20%20content:%20%22%5Ce905%22;%0A%7D%0A.icon-minimize:before%20%7B%0A%20%20%20%20content:%20%22%5Ce906%22;%0A%7D%0A.icon-mobile:before%20%7B%0A%20%20%20%20content:%20%22%5Ce907%22;%0A%7D%0A.icon-thumbs-down:before%20%7B%0A%20%20%20%20content:%20%22%5Ce908%22;%0A%7D%0A.icon-thumbs-up:before%20%7B%0A%20%20%20%20content:%20%22%5Ce909%22;%0A%7D%0A%0A @font-face%7Bfont-family:Lato;font-style:normal;font-weight:400;src:local('Lato%20Regular'),local('Lato-Regular'),url(https://themes.googleusercontent.com/static/fonts/lato/v6/9k-RPmcnxYEPm8CNFsH2gg.woff)%20format('woff')%7D",
            minimalCSS: "#body%20input,#body%20label,#body%20select,#body%20table,#body%20textarea,a,body,input,label,select,table,table#content,textarea%7Bfont-family:Lato,sans-serif!important%7D#content%7Bpadding:0;background:#fff;border-radius:0!important;box-shadow:none!important;background-clip:padding-box!important;border:0!important;height:100%25;margin-top:3px%7D#content%20#open-icon%7Btop:11px;right:11px%7D#open-icon.icon-maximize%7Bfont-size:10px%7D#content%20#open-label%7Bfont-size:10px!important;letter-spacing:.13em!important;color:#FFF!important;font-weight:400!important;text-transform:uppercase;padding-top:5px!important;text-overflow:ellipsis%7D.new-mobile%20#full-view-button%20span%7Bfont-size:.8em!important%7D#content-container.new-mobile%20#content%7Bborder-radius:0!important%7D#full-view-button%7Bwhite-space:nowrap%7D#full-view-button%20span:nth-child(2)%7Bwidth:100%25!important;box-sizing:border-box;overflow:hidden;text-overflow:ellipsis;padding-right:28px!important;display:inline-block!important%7D#full-view-button,#title%20#title-text%7Bcolor:#FFF;font-size:16px!important;font-weight:400!important;text-shadow:none!important%7D",
            classicFonts: "@font-face%20%7B%0A%20%20%20%20font-family:%20'livechat-classic';%0A%20%20%20%20src:%20%20%20%20url('//cdn.livechatinc.com/fonts/classic/livechat-classic_2fa490e037.eot?uw2fw7');%0A%20%20%20%20src:%20%20%20%20url('//cdn.livechatinc.com/fonts/classic/livechat-classic_2fa490e037.eot?uw2fw7#iefix')%20format('embedded-opentype'),%0A%20%20%20%20%20%20%20%20url('//cdn.livechatinc.com/fonts/classic/livechat-classic_f726105e9a.ttf?uw2fw7')%20format('truetype'),%0A%20%20%20%20%20%20%20%20url('//cdn.livechatinc.com/fonts/classic/livechat-classic_59701eb4b0.woff?uw2fw7')%20format('woff'),%0A%20%20%20%20%20%20%20%20url('//cdn.livechatinc.com/fonts/classic/livechat-classic_898ec71fdc.svg?uw2fw7#icomoon')%20format('svg');%0A%20%20%20%20font-weight:%20normal;%0A%20%20%20%20font-style:%20normal;%0A%7D%0A%0A%5Bclass%5E=%22icon-%22%5D,%20%5Bclass*=%22%20icon-%22%5D%20%7B%0A%20%20%20%20/*%20use%20!important%20to%20prevent%20issues%20with%20browser%20extensions%20that%20change%20fonts%20*/%0A%20%20%20%20font-family:%20'livechat-classic'%20!important;%0A%20%20%20%20speak:%20none;%0A%20%20%20%20font-style:%20normal;%0A%20%20%20%20font-weight:%20normal;%0A%20%20%20%20font-variant:%20normal;%0A%20%20%20%20text-transform:%20none;%0A%20%20%20%20line-height:%201;%0A%0A%20%20%20%20/*%20Better%20Font%20Rendering%20===========%20*/%0A%20%20%20%20-webkit-font-smoothing:%20antialiased;%0A%20%20%20%20-moz-osx-font-smoothing:%20grayscale;%0A%7D%0A%0A.icon-tick:before%20%7B%0A%20%20%20%20content:%20%22%5Ce90a%22;%0A%7D%0A.icon-leavemessage:before%20%7B%0A%20%20%20%20content:%20%22%5Ce900%22;%0A%7D%0A.icon-agentonline:before%20%7B%0A%20%20%20%20content:%20%22%5Ce901%22;%0A%7D%0A.icon-clip:before%20%7B%0A%20%20%20%20content:%20%22%5Ce902%22;%0A%7D%0A.icon-close:before%20%7B%0A%20%20%20%20content:%20%22%5Ce903%22;%0A%7D%0A.icon-email:before%20%7B%0A%20%20%20%20content:%20%22%5Ce904%22;%0A%7D%0A.icon-maximize:before%20%7B%0A%20%20%20%20content:%20%22%5Ce905%22;%0A%7D%0A.icon-minimize:before%20%7B%0A%20%20%20%20content:%20%22%5Ce906%22;%0A%7D%0A.icon-mobile:before%20%7B%0A%20%20%20%20content:%20%22%5Ce907%22;%0A%7D%0A.icon-thumbs-down:before%20%7B%0A%20%20%20%20content:%20%22%5Ce908%22;%0A%7D%0A.icon-thumbs-up:before%20%7B%0A%20%20%20%20content:%20%22%5Ce909%22;%0A%7D%0A",
            classicCSS: ".lc2%20#content%20#full-view-button,body%7Bfont-family:'Lucida%20Grande','Lucida%20Sans%20Unicode',Arial,Verdana,sans-serif%7D.lc2%20#content%20#open-icon%7Btop:13px;right:12px%7D.lc2%20.icon-maximize%7Bfont-size:10px%7D#content-container.new-mobile%20#content%7Bborder-size:.1em;text-shadow:none%7D",
            cloud: "#extra%7Bbackground:#a4b4bf;background:rgba(75,107,130,.5)%7D#content%7Bbackground:#EBEBEB%7D#open-label%7Bcolor:#333;text-shadow:1px%201px%200%20#fff%7D#open-icon%7Bbackground-color:#b2c5d4%7D",
            fire: "#extra%7Bbackground:#d99;background:rgba(189,60,60,.5)%7D#content%7Bbackground:#EBEBEB%7D#open-label%7Bcolor:#333;text-shadow:1px%201px%200%20#fff%7D#open-icon%7Bbackground-color:#d3d3d3%7D",
            sun: "#extra%7Bbackground:#f9ccaa;background:rgba(240,149,103,.5)%7D#content%7Bbackground:#EBEBEB%7D#open-label%7Bcolor:#333;text-shadow:1px%201px%200%20#fff%7D#open-icon%7Bbackground-color:#d3d3d3%7D",
            grass: "#extra%7Bbackground:#9b7;background:rgba(66,119,12,.5)%7D#content%7Bbackground:#EBEBEB%7D#open-label%7Bcolor:#333;text-shadow:1px%201px%200%20#fff%7D#open-icon%7Bbackground-color:#d3d3d3%7D",
            night: "#extra%7Bbackground:#999;background:rgba(54,54,54,.5)%7D#content%7Bbackground:#EBEBEB%7D#open-label%7Bcolor:#333;text-shadow:1px%201px%200%20#fff%7D#open-icon%7Bbackground-color:#d3d3d3%7D"
        },
        mobileInvitationText: "",
        operator_avatar_url: "",
        showMobileInvitation: !1,
        showMobileInvitationText: !0,
        mobileInvitationOpened: !1,
        invitationOpened: !1,
        visitor_name: "",
        displayAvatar: null,
        __supportsChatting: !0,
        hiddenByInputFocus: !1,
        supportRoundedInvitations: function () {
            return Mobile.isNewMobile() || "circle" === this.circle_group_property
        },
        init: function () {
            return LC_API.embedded_chat_enabled() !== !1 && (this.inited = !0, __lc_settings.automatic_greeting && Minimized.setState(Minimized.STATE_INVITATION_WITH_AGENT), this.originalTitle = Loader.pageData.title, this.checkIfTabActive(), this.mobileInvitationOpened = this.mobileInvitationOpened || Cookie.get("lc_mobile_invitation_opened"), void(this.invitationOpened = this.invitationOpened || Cookie.get("lc_invitation_opened")))
        },
        __t: function () {
            var e, t;
            if (e = "", t = arguments[0], "undefined" == typeof this.langPhrases[t])return "";
            if (e = this.langPhrases[t], arguments[1])for (var i in arguments[1])e = e.replace("%" + i + "%", arguments[1][i]), e = e.replace("%" + i, arguments[1][i]);
            return e
        },
        setLangPhrases: function (e) {
            this.langPhrases = e
        },
        setLC2Theme: function (e) {
            this.LC2Theme = e
        },
        setTheme: function (e, t) {
            var i;
            "false" === t && (t = ""), t || this.useLC2Theme() !== !0 || (i = {
                sun: "#cf992d",
                cloud: "#799BB3",
                fire: "#c2613e",
                grass: "#949c41",
                night: "#3B3B3B"
            }, i[e] && (t = i[e], e = "classic")), this.theme = e, this.color = t
        },
        setMinimizedTheme: function (e) {
            this.circle_group_property = e
        },
        getMinimizedTheme: function () {
            return this.circle_group_property || "bar"
        },
        setDisplayAvatar: function (e) {
            this.displayAvatar = e
        },
        parseMinimizedMessage: function (e) {
            return visitor_name = this.getVisitorName(), operator_name = this.getOperatorName(), operator_name && (e = e.replace(/%agent%/g, operator_name)), visitor_name && (e = e.replace(/%name%/g, visitor_name)), e = Minimized.shortenTooLongText(e, 70)
        },
        reparseMinimizedMessages: function () {
            var e = this.getWelcomeMessage(), t = this.getMobileInvitationText();
            e && this.setWelcomeMessage(e), t && this.setMobileInvitationText(t)
        },
        setWelcomeMessage: function (e) {
            var t = this.parseMinimizedMessage(e);
            this.welcomeMessage = t
        },
        getWelcomeMessage: function () {
            return this.welcomeMessage
        },
        getDisplayAvatar: function () {
            return this.displayAvatar
        },
        useLC2Theme: function () {
            return this.LC2Theme
        },
        isInternetExplorer: function () {
            var e = navigator.userAgent.toLowerCase();
            return e.indexOf("msie") != -1 && parseInt(e.split("msie")[1])
        },
        checkIfTabActive: function () {
            fnFocus = function () {
                Minimized.tabActive = !0, NotifyChild.send("tab_active")
            }, fnBlur = function () {
                Minimized.tabActive = !1, NotifyChild.send("tab_inactive")
            }, window.onfocus = fnFocus, window.onblur = fnBlur
        },
        getIFrameBody: function () {
            var e;
            return document.frames && document.frames["livechat-compact-view"] ? e = document.frames["livechat-compact-view"].document : (e = $("livechat-compact-view"), e = e.contentWindow || e.contentDocument, e.document && (e = e.document)), e
        },
        escapeString: function (e) {
            return e ? (e = e.replace(/</g, "&lt;"), e = e.replace(/>/g, "&gt;")) : ""
        },
        modifyColor: function (e, t) {
            var i, n;
            e = String(e).replace(/[^0-9a-f]/gi, ""), e.length < 6 && (e = e[0] + e[0] + e[1] + e[1] + e[2] + e[2]), t = t || 0, i = "#";
            for (var o = 0; o < 3; o++)n = parseInt(e.substr(2 * o, 2), 16), n = Math.round(Math.min(Math.max(0, n + n * t), 255)).toString(16), i += ("00" + n).substr(n.length);
            return i
        },
        styleForTheme: function (e, t) {
            var i, n;
            return t && (i = this.modifyColor(t, -.1)), n = {
                classic: "#content { background-color: " + t + "; border: 1px solid " + i + "; text-shadow: 1px 1px 0 " + i + " } #operator_avatar { background-color: " + t + "; }",
                modern: "#content { background-color: " + t + "; } #operator_avatar { background-color: " + t + "; }",
                minimal: "#content { background-color: " + t + "; } #operator_avatar { background-color: " + t + "; }",
                postmodern: "#operator_avatar { background-color: " + t + "; }"
            }, n[e] || ""
        },
        onRender: function (e) {
            this._onRender = e
        },
        setCompactSize: function (e) {
            if (Mobile.isNewMobile())return !1;
            var t = e ? "330px" : "75px";
            this.customStyle = this.customStyle || new CustomStyle, this.compactSizeSet = !0, this.customStyle.cssProperties("livechat-compact-container", {
                height: "105px",
                width: t
            }, null, !0)
        },
        setNormalSize: function () {
            if (!this.rendered)return !0;
            if (Mobile.isNewMobile())return !1;
            var e = {};
            this.customStyle = this.customStyle || new CustomStyle, "minimal" === this.theme ? (e.width = "240px", e.padding = "0 15px") : "postmodern" === this.theme ? (e.width = "280px", e.padding = "0 15px", e.height = "70px") : e.width = "250px", this.customStyle.cssProperties("livechat-compact-container", e, null, !0)
        },
        getPlatform: function () {
            return Mobile.isNewMobile() ? "newMobile" : Mobile.isOldMobile() ? "oldMobile" : "desktop"
        },
        shouldRenderRoundedMinimized: function (e, t, i, n) {
            return 8 !== Minimized.isInternetExplorer() && ("oldMobile" !== e && "circle" === i || "newMobile" === e && (t === Minimized.STATE_CHATTING || t === Minimized.STATE_INVITATION_WITH_AGENT))
        },
        shouldRenderRoundedMinimizedText: function (e, t, i, n) {
            return 8 !== Minimized.isInternetExplorer() && (!("newMobile" !== e || t !== Minimized.STATE_CHATTING && t !== Minimized.STATE_INVITATION_WITH_AGENT || n) || ("desktop" === e && t === Minimized.STATE_CHATTING && !n || "desktop" === e && t === Minimized.STATE_INVITATION_WITH_AGENT))
        },
        addMinimizedClass: function (e) {
            var t = Minimized.getIFrameBody();
            return !(!t || !t.body) && (t = t.body, t.className.indexOf(e) !== -1 || void(t.className = t.className + " " + e))
        },
        removeMinimizedClass: function (e) {
            var t = Minimized.getIFrameBody();
            if (!t || !t.body)return !1;
            t = t.body;
            var i = new RegExp(e);
            t.className = t.className.replace(i, "")
        },
        render: function () {
            var e, t, i, n, o, a, r, s, l, c, d, u = [], _ = "", h = "", m = this;
            if (this.inited === !1)return !1;
            if (this.$iframeBody = Minimized.getIFrameBody(), this.invitationOpened = this.invitationOpened || Cookie.get("lc_invitation_opened"), isNewMobile = Mobile.isNewMobile(), a = Mobile.isNewMobile() ? "new-mobile" : "", circleInvitation = Minimized.shouldRenderRoundedMinimized(Minimized.getPlatform(), this.state, this.getMinimizedTheme(), "opened" === Minimized.invitationOpened), circleInvitationText = Minimized.shouldRenderRoundedMinimizedText(Minimized.getPlatform(), this.state, this.getMinimizedTheme(), "opened" === Minimized.invitationOpened), o = circleInvitationText ? "table-cell" : "none", circleInvitation ? (n = "none", r = "block", this.setCompactSize(circleInvitationText), circleInvitationText ? Mobile.setContainerSize("normal") : Mobile.setContainerSize("small")) : (n = "block", r = "none", this.setNormalSize(), Mobile.setContainerSize("normal")), l = !1, /trident/i.test(navigator.userAgent) && (c = /(ie) ([\w.]+)/i.exec(navigator.userAgent) || [], d = c[2], d && parseInt(d, 10) <= 8 && (l = !0)), t = "", this.styles[this.theme + "Fonts"] ? (t += decodeURI(this.styles[this.theme + "Fonts"]), t += decodeURI(this.styles[this.theme + "CSS"])) : t += decodeURI(this.styles[this.theme]), Mobile.isNewMobile() && (t += decodeURI(this.styles.mobileFonts), t += decodeURI(this.styles.mobileCSS)), t = t.replace(/url\(\'\/\//g, "url('" + (window.location.protocol.indexOf("https") != -1 ? "https://" : "http://")), t = this.useLC2Theme() === !0 ? decodeURI("#content-container%7Bposition:absolute;top:0;right:0;bottom:0;left:0;width:100%25;height:100%25;z-index:6;line-height:22px%7D#content%7Bborder-radius:10px%2010px%200%200;box-shadow:inset%201px%201px%201px%20rgba(255,255,255,.2)%7D#content%20#full-view-button%7Bdisplay:block;position:relative;padding:0;outline:0;color:#fff;font-size:14px;text-decoration:none;font-weight:700%7D#content%20#open-label%7Bdisplay:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding:6px%2015px%7D.lc2%20#content%20#open-icon%7Bfloat:right;position:relative%7D#mobile_invitation_container%7Bposition:absolute;left:0;right:0;width:100%25;font-size:.9em%7D#mobile_invitation_container:hover%7Bcursor:pointer%7D.invitation_message%7Bmargin-right:1em;display:table-cell;vertical-align:middle;width:100%25%7D#operator_avatar_container%7Bdisplay:table-cell;padding:.1em%7D#invitation_message_text%7Bfloat:right;color:#4a546c;background:#e7eaf1;border-radius:.3em;font-size:1em;padding:.7em%20.9em;margin-right:.8em;max-height:3.2em;line-height:1.15em;overflow:hidden;display:block;border:1px%20solid%20rgba(0,0,0,.07);box-shadow:0%201px%205px%20rgba(0,0,0,.1);margin-left:.5em%7D.invitation_message:after%7Bborder:.5em%20solid%20transparent;border-color:transparent%20transparent%20transparent%20#DFE1E4;display:block;position:absolute;content:%22%22;margin-top:.5em;right:5.1em;top:1.5em%7D#operator_avatar%7Bfloat:right;border-radius:50%25;width:4.5em;height:4.5em;box-shadow:0%201px%203px%20rgba(0,0,0,.2);border:.3em%20solid%20#fff;box-sizing:content-box;overflow:hidden;color:#fff;text-align:center;position:relative;transition:background-color%20.2s%20ease-in-out%20.2s;-webkit-transition:background-color%20.2s%20ease-in-out%20.2s;-ms-transition:background-color%20.2s%20ease-in-out%20.2s;-o-transition:background-color%20.2s%20ease-in-out%20.2s%7D.avatar-loaded%20#operator_avatar%7Bbackground-color:#fff%7D#operator_avatar%20img%7Bwidth:0;height:0;border-radius:50%25;overflow:hidden;box-sizing:border-box;margin-top:50%25;margin-left:50%25;opacity:.5;position:absolute;top:0;left:0;transition:all%201s;-webkit-transition:all%20.2s%20ease-in-out;-moz-transition:all%20.2s%20ease-in-out;-ms-transition:all%20.2s%20ease-in-out;-o-transition:all%20.2s%20ease-in-out%7D.avatar-loaded%20#operator_avatar%20img%7Bwidth:4.5em;height:4.5em;margin-top:0;margin-left:0;opacity:1;background-color:#fff%7D#content-container.new-mobile%20#content,#extra.new-mobile%7Bmargin-top:1.5em!important;border-radius:.5em!important%7D#extra.new-mobile%7Bleft:.5em!important;right:.5em!important;width:auto!important%7D#content%20%5Bclass*=%22%20icon-%22%5D,#content%20%5Bclass%5E=icon-%5D%7B-webkit-font-smoothing:none%7D.icon-agentonline:before%7Bfont-size:2em%7D.icon-leavemessage:before%7Bfont-size:1.8em%7D.icon-leavemessage%7Bline-height:4.5em!important%7D.icon-agentonline%7Bline-height:4.6em!important%7D") + t : decodeURI(".lc1%20#content%20#full-view-button,body%7Bfont-family:'Lucida%20Grande','Lucida%20Sans%20Unicode',Arial,Verdana,sans-serif%7D.lc1%20#content-container%7Bposition:absolute;top:0;right:0;bottom:0;left:0;width:100%25;height:100%25;z-index:6;line-height:22px%7D.lc1%20#content%7Bmargin:7px%207px%200;padding:2px%208px;border-radius:10px%2010px%200%200%7D.lc1%20#content%20#full-view-button%7Bdisplay:block;position:relative;padding:0;outline:0;color:#fff;font-size:14px;text-decoration:none;font-weight:700%7D.lc1%20#content%20#open-label%7Bdisplay:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis%7D.lc1%20#content%20#open-icon%7Bposition:relative;display:block;float:right;width:19px;height:19px;margin-top:2px;background-repeat:no-repeat;background-position:-16px%20-153px%7D.lc1.http%20#content%20#open-icon%7Bbackground-image:url(http://cdn.livechatinc.com/img/sprite.20111206.png)%7D.lc1.https%20#content%20#open-icon%7Bbackground-image:url(https://cdn.livechatinc.com/img/sprite.20111206.png)%7D#extra%7Bdisplay:block;position:absolute;top:0;right:0;bottom:0;left:0;width:100%25;height:100%25;z-index:5;border-radius:15px%2015px%200%200%7D") + t,
                    t += this.styleForTheme(this.theme, this.color), this.custom_css.length && (t += this.custom_css), e = "", l || (e += '<style type="text/css">' + t + "</style>"), this.useLC2Theme() === !0 ? (_ = "display:" + n, h = a, s = '<span id="open-icon" class="icon-maximize"></span>') : (e += '<div id="extra"></div>', s = '<span id="open-icon"></span>'), e += '<div id="content-container" ' + (_ ? 'style="' + _ + '" ' : "") + (h ? 'class="' + h + '"' : "") + '>\t<div id="content">\t<a id="full-view-button" href="javascript:void(null)"', __lc.mute_csp_errors || (e += " onclick=\"parent.LC_API.open_chat_window({source:'minimized'})\""), e += ">" + s + '<span id="open-label">' + this.escapeString(this.text_label) + "</span></a>\t</div></div>", this.supportRoundedInvitations()) {
                var f = "";
                Minimized.state === Minimized.STATE_CHATTING && !(Minimized.state === Minimized.STATE_CHAT_ENDED) && this.operator_avatar_url && "" !== this.operator_avatar_url && this.getDisplayAvatar();
                f = this.operator_avatar_url && "" !== this.operator_avatar_url && this.getDisplayAvatar() && (Minimized.state === Minimized.STATE_CHATTING || Minimized.state === Minimized.STATE_INVITATION_WITH_AGENT) ? '<span class="icon-agentonline"></span><img src="//' + this.operator_avatar_url + '">' : Minimized.state === Minimized.STATE_OFFLINE ? '<span class="icon-leavemessage"></span>' : '<span class="icon-agentonline"></span>', e = e + '<div id="mobile_invitation_container" style="display:' + r + '"><div', __lc.mute_csp_errors || (e += " onclick=\"parent.LC_API.open_chat_window({source:'minimized'}); return false\""), e += ' class="invitation_message" style="display:' + o + '"><div id="invitation_message_text">' + this.escapeString(this.mobileInvitationText) + '</div></div><div id="operator_avatar_container"><div id="operator_avatar"', __lc.mute_csp_errors || (e += " onclick=\"parent.LC_API.open_chat_window({source:'minimized'}); return false\""), e += ">" + f + "</div></div></div>"
            }
            u.push(this.useLC2Theme() ? "lc2" : "lc1"), u.push(window.location.protocol.indexOf("https") != -1 ? "https" : "http"), Utils.makeItDone(function () {
                m.$iframeBody.body.className = u.join(" "), m.$iframeBody.body.innerHTML = e, m.$iframeBody.body.style.margin = "0px", m.$iframeBody.body.style.padding = "0px", l && (i = document.createElement("style"), i.type = "text/css", m.$iframeBody.body.appendChild(i), i.styleSheet ? i.styleSheet.cssText = t : i.appendChild(document.createTextNode(t))), m.rendered = !0, "function" == typeof m._onRender && m._onRender()
            }).when(function () {
                return m.$iframeBody.body
            })
        },
        updateWindowHTML: function () {
            var e, t, i, n, o, a, r;
            return this.inited !== !1 && (this.rendered !== !1 && (this.invitationOpened = this.invitationOpened || Cookie.get("lc_invitation_opened"), circleInvitation = Minimized.shouldRenderRoundedMinimized(Minimized.getPlatform(), this.state, this.getMinimizedTheme(), "opened" === Minimized.invitationOpened), circleInvitationText = Minimized.shouldRenderRoundedMinimizedText(Minimized.getPlatform(), this.state, this.getMinimizedTheme(), "opened" === Minimized.invitationOpened), e = circleInvitationText ? "table-cell" : "none", circleInvitation ? (t = "none", i = "block", this.setCompactSize(circleInvitationText), circleInvitationText ? Mobile.setContainerSize("normal") : Mobile.setContainerSize("small")) : (t = "block", i = "none", this.setNormalSize(), Mobile.setContainerSize("normal")), n = this.$iframeBody.getElementById("content-container"), n && (n.style.display = t), n = this.$iframeBody.getElementById("mobile_invitation_container"), n && (n.style.display = i, circleInvitationText && !LC_API.chat_window_maximized() && LC_Invite.embedded_chat_hidden_by_api && LC_API.minimize_chat_window()), n = this.$iframeBody.getElementById("operator_avatar"), n && (o = "", this.operator_avatar_url && "" !== this.operator_avatar_url && this.getDisplayAvatar() && (Minimized.state === Minimized.STATE_CHATTING || Minimized.state === Minimized.STATE_INVITATION_WITH_AGENT) ? (o = '<span class="icon-agentonline"></span><img src="//' + this.operator_avatar_url + '"', __lc.mute_csp_errors ? LC_API._add_minimized_body_class("avatar-loaded") : o += " onload=\"(function(){parent.LC_API._add_minimized_body_class('avatar-loaded')})()\"", o += ">") : Minimized.state === Minimized.STATE_OFFLINE ? (Minimized.removeMinimizedClass("avatar-loaded"), o = '<span class="icon-leavemessage"></span>') : (Minimized.removeMinimizedClass("avatar-loaded"), o = '<span class="icon-agentonline"></span>'), n.innerHTML = o), r = this.mobileInvitationText || Minimized.getWelcomeMessage(), void(document.getElementById && document.getElementsByClassName && (n = this.$iframeBody.getElementById("invitation_message_text"), n && (n.innerHTML = this.escapeString(r)), a = this.$iframeBody.getElementsByClassName("invitation_message")[0], a && (a.style.display = e)))))
        },
        setState: function (e) {
            return this.inited !== !1 && (this.previous_state = this.state, this.state = parseInt(e, 10), this.onStateChanged && this.onStateChanged(this.state === Minimized.STATE_OFFLINE ? "offline" : "online"), this.state === Minimized.STATE_CHATTING ? Chat.running("1") : "1" === Chat.running() && Cookie.erase("chat_running"), this.state === Minimized.STATE_QUEUE ? Chat.waitingInQueue("1") : Cookie.erase("waiting_in_queue"), void this.updateWindowHTML())
        },
        setStateCallback: function (e) {
            this.onStateChanged = e
        },
        getState: function () {
            return this.state
        },
        disableMobileInvitationText: function () {
            this.showMobileInvitationText = !1
        },
        getPreviousState: function () {
            return this.previous_state
        },
        setOperatorDisplayName: function (e) {
            return this.inited !== !1 && (this.operator_display_name = e, this.setOperatorName(e), this.updateText(), this.updateWindowHTML(), void(this.titleNotification = this.__t("Embedded_new_message", {operator: this.operator_display_name})))
        },
        setOperatorAvatarUrl: function (e) {
            return this.inited !== !1 && (this.operator_avatar_url = e.replace(/^(\/)+/, ""), void this.updateWindowHTML())
        },
        setOperatorsOnline: function (e) {
            e ? void 0 === typeof this.getState() && this.setState(Minimized.STATE_PRE_CHAT) : this.setState(Minimized.STATE_OFFLINE), this.updateText()
        },
        displayLoadingMessage: function () {
            this._setText(this.__t("Loading") + "...")
        },
        updateText: function () {
            if (this.inited === !1)return !1;
            switch (Minimized.state) {
                case Minimized.STATE_OFFLINE:
                    this._setText(this.__t("Embedded_leave_message"));
                    break;
                case Minimized.STATE_PRE_CHAT:
                case Minimized.STATE_INVITATION:
                case Minimized.STATE_INVITATION_WITH_AGENT:
                    this._setText(this.__t("Embedded_chat_now"));
                    break;
                case Minimized.STATE_QUEUE:
                    this._setText(this.__t("Embedded_waiting_for_operator"));
                    break;
                case Minimized.STATE_CHATTING:
                    this._setText(this.__t("Embedded_chat_with", {operator: this.operator_display_name}));
                    break;
                case Minimized.STATE_POST_CHAT:
                    this._setText(this.__t("Embedded_chat_ended"));
                    break;
                case Minimized.STATE_CHAT_ENDED:
                    this._setText(this.__t("Embedded_chat_ended"))
            }
        },
        _setText: function (e) {
            var t;
            this.text_label = e, this.$iframeBody && (t = this.$iframeBody.getElementById("open-label"), t && (t.innerHTML = this.escapeString(e)))
        },
        setCustomCSS: function (e) {
            this.custom_css = e
        },
        newMessageNotification: function (e) {
            var t;
            return this.inited !== !1 && (this.tabActive === !0 && LC_API.chat_window_maximized() === !0 || (LC_API.chat_window_minimized() === !0 && this._setText(this.__t("Embedded_new_message", {operator: this.operator_display_name})), null === this.titleNotificationInterval && (this.titleNotificationInterval = setInterval(function () {
                    Minimized.animateTitleTag()
                }, this.titleNotificationAnimateSpeed)), t = $("livechat-badge"), t.innerHTML = e, LC_API.chat_window_minimized() === !0 && (t.style.visibility = "visible", t.style.opacity = 1, Mobile.isNewMobile() && (t.className = "new-mobile")), void(LC_API.mobile_is_detected() && Mobile.playSound())))
        },
        disableNewMessageNotification: function () {
            return this.inited !== !1 && ($("livechat-badge").innerHTML = "", $("livechat-badge").style.visibility = "hidden", $("livechat-badge").style.opacity = 0, this.animateTitleTag({force_hide: !0}), void this.updateText())
        },
        setFontSize: function (e) {
            this.$iframeBody && (this.$iframeBody.body.style.fontSize = e + "px")
        },
        animateTitleTag: function (e) {
            var e = {force_hide: e && e.force_hide || !1};
            this.titleNotificationFlag === Minimized.TITLE_NOTIFICATION_HIDDEN ? e.force_hide === !0 || Minimized.tabActive !== !1 && LC_API.chat_window_minimized() !== !0 || (document.title = this.titleNotification, this.titleNotificationFlag = Minimized.TITLE_NOTIFICATION_APPENDED) : (document.title = this.originalTitle, this.titleNotificationFlag = Minimized.TITLE_NOTIFICATION_HIDDEN), e.force_hide === !0 && (clearInterval(this.titleNotificationInterval), this.titleNotificationInterval = null)
        },
        hide: function () {
            var e = document.getElementById("livechat-compact-container");
            e.style.setProperty("display", "none")
        },
        show: function () {
            var e = document.getElementById("livechat-compact-container");
            e.style.setProperty("display", "block")
        },
        renderMobileInvitation: function (e, t, i) {
            if (!Minimized.supportRoundedInvitations())return !1;
            this.showMobileInvitation = !0, e && this.setOperatorAvatarUrl(e), this.setOperatorName(t), this.setMobileInvitationText(i), LC_API.hide_eye_catcher(), this.updateWindowHTML()
        },
        shortenTooLongText: function (e, t) {
            for (var i = e.split(" "), n = 0, o = "", a = 0; a < i.length; a++) {
                if (!(n + i[a].length < t)) {
                    o += "...";
                    break
                }
                o = o + " " + i[a], n += i[a].length
            }
            return o
        },
        setMobileInvitationText: function (e) {
            var t = this.parseMinimizedMessage(e);
            this.mobileInvitationText = t
        },
        getMobileInvitationText: function () {
            return this.mobileInvitationText
        },
        setVisitorName: function (e) {
            this.visitor_name = e, this.reparseMinimizedMessages()
        },
        getVisitorName: function () {
            return this.visitor_name
        },
        setOperatorName: function (e) {
            this.operator_name = e, this.reparseMinimizedMessages()
        },
        getOperatorName: function () {
            return this.operator_name
        },
        setSupportsChatting: function (e) {
            this.__supportsChatting = e
        },
        isChattingSupported: function () {
            return this.__supportsChatting
        }
    }, Mixpanel = {
        enabled: null,
        setEnabled: function (e) {
            var t = this;
            this.enabled = e, AnalyticsIntegrations.subscribe({
                name: "Mixpanel",
                events: ["Standard greeting", "Personal greeting", "Automated greeting", "Chat", "Ticket form", "Ticket form filled in", "After-hours form", "Pre-chat survey", "Pre-chat survey filled in", "Post-chat survey", "Post-chat survey filled in"],
                callback: function () {
                    t.track.apply(t, arguments)
                }
            })
        },
        eventsMapper: {
            "Standard greeting": "LiveChat Standard greeting displayed",
            "Personal greeting": "LiveChat Personal greeting displayed",
            "Automated greeting": "LiveChat Automated greeting displayed",
            Chat: "LiveChat Chat started",
            "Ticket form": "LiveChat Ticket form displayed",
            "Ticket form filled in": "LiveChat Ticket form filled in",
            "After-hours form": "LiveChat After-hours form displayed",
            "Pre-chat survey": "LiveChat Pre-chat survey displayed",
            "Pre-chat survey filled in": "LiveChat Pre-chat survey filled in",
            "Post-chat survey": "LiveChat Post-chat survey displayed",
            "Post-chat survey filled in": "LiveChat Post-chat survey filled in"
        },
        track: function (e, t) {
            if ("object" == typeof mixpanel && "function" == typeof mixpanel.track) {
                var i = "(no group)";
                t = t || {}, t.event_data = t.event_data || {};
                var n = t.event_data && t.event_data.skill || __lc.skill;
                n > 0 && (i = "Group ID: " + parseInt(n, 10)), t.event_data.group = i, this.eventsMapper[e] && (e = this.eventsMapper[e]), t.user_data && mixpanel.register(t.user_data), mixpanel.track(e, t.event_data)
            }
        }
    }, Mobile = {
        CONTAINER_WITH_FACTOR: 5.3,
        $sound: null,
        $htmlTag: document.getElementsByTagName("html")[0],
        previousSoundTime: 0,
        hasAudioSupport: !!document.createElement("audio").canPlayType,
        preloadedOnMobile: !1,
        setWindowHeight: null,
        positionSet: !1,
        lockResize: !1,
        customStyle: new CustomStyle,
        storedDocumentHeight: null,
        storedDocumentWidth: null,
        minimizedContainerSize: "normal",
        mobileWebsite: null,
        storedBodyPosition: null,
        storedHeadPosition: null,
        storedBodyOverflowY: null,
        storedBodyWidth: null,
        storedBodyHeight: null,
        storedBodyLeft: null,
        storedBodyRight: null,
        storedBodyTop: null,
        storedBodyBottom: null,
        storedInnerWidth: null,
        storedInnerHeight: null,
        storedBottomPosition: null,
        storedHorizontalPosition: null,
        lockTimeout: null,
        userAgent: function () {
            return navigator && navigator.userAgent ? navigator.userAgent : null
        }(),
        isDetected: function () {
            return Mobile.userAgent && /mobile/gi.test(Mobile.userAgent)
        },
        isNewMobile: function () {
            return LC_Invite.embedded_chat_enabled() && LC_Invite.conf.chat_window.beta && LC_Invite.conf.chat_window.use_lc2_theme && Mobile.userAgent && /mobile/gi.test(Mobile.userAgent) && !this.isWindowsPhone() && !this.isOldAndroid() && !this.isIOSChromeAndNonMobileWebsite() && (/(Chrome).*(Mobile)/gi.test(Mobile.userAgent) || /(Android).*/gi.test(Mobile.userAgent) || /(iPhone|iPod).*Apple.*Mobile/g.test(Mobile.userAgent) || /(Android).*(Mobile)/gi.test(Mobile.userAgent))
        },
        isOldMobile: function () {
            return this.isDetected() && !this.isNewMobile()
        },
        isIOSChromeAndNonMobileWebsite: function () {
            return !this.isWebsiteMobile() && this.isiOSChrome() && this.getChromeVersion() < 48
        },
        getAndroidVersion: function () {
            var e = Mobile.userAgent.toLowerCase(), t = e.match(/android\s([0-9\.]*)/);
            return !!t && t[1]
        },
        isAndroid: function () {
            return Mobile.userAgent && /android/gi.test(Mobile.userAgent)
        },
        isSamsung: function () {
            return Mobile.userAgent && /samsung/i.test(Mobile.userAgent)
        },
        isOldAndroid: function () {
            if (!this.isAndroid())return !1;
            var e = (parseInt(this.getAndroidVersion(), 10), parseFloat(this.getAndroidVersion())), t = Mobile.userAgent && Mobile.isAndroid() && (Mobile.getAppleWebkitVersion() < 537 || Mobile.isSamsung() && e < 4.4);
            return t
        },
        getPixelRatio: function () {
            return window.devicePixelRatio ? window.devicePixelRatio : 1
        },
        isiOSSafari: function () {
            return Mobile.userAgent && /(iPad|iPhone|iPod).*Apple(?!.*CriOS).*Mobile/g.test(Mobile.userAgent)
        },
        isiOSChrome: function () {
            return Mobile.userAgent && /(iPad|iPhone|iPod).*Apple.*CriOS/g.test(Mobile.userAgent)
        },
        getAppleWebkitVersion: function () {
            var e = new RegExp(/AppleWebKit\/([\d.]+)/), t = e.exec(Mobile.userAgent), i = null === t ? null : parseFloat(e.exec(Mobile.userAgent)[1]);
            return i
        },
        getChromeVersion: function () {
            var e = new RegExp(/Chrome|CriOS\/([\d.]+)/), t = e.exec(Mobile.userAgent), i = null === t ? null : parseFloat(e.exec(Mobile.userAgent)[1]);
            return i
        },
        isWindowsPhone: function () {
            return Mobile.userAgent && /Windows Phone/gi.test(Mobile.userAgent)
        },
        isiOS: function () {
            return Mobile.userAgent && !this.isWindowsPhone() && /(?!.*IEMobile).*(iPad|iPhone|iPod)/g.test(Mobile.userAgent)
        },
        isIOS8: function () {
            return Mobile.userAgent && /Apple(?!.*CriOS).*Mobile/g.test(Mobile.userAgent) && (/OS 8_/g.test(Mobile.userAgent) || /Version\/8\./g.test(Mobile.userAgent))
        },
        isIOS7: function () {
            return Mobile.userAgent && /Apple(?!.*CriOS).*Mobile/g.test(Mobile.userAgent) && (/OS 7_/g.test(Mobile.userAgent) || /Version\/7\./g.test(Mobile.userAgent))
        },
        isLandscapeMode: function () {
            return window.orientation && (window.orientation === -90 || 90 === window.orientation)
        },
        isTablet: function () {
            return !!(screen && screen.width > 500)
        },
        setContainerSize: function (e) {
            this.minimizedContainerSize = e, this.resizeMobileWindow({force: !0})
        },
        getContainerSize: function () {
            return this.minimizedContainerSize
        },
        getWindowSize: function (e) {
            var t = {full: {}, minimized: {}};
            Mobile.getDocumentWidth(), Mobile.getDocumentHeight();
            return e = e || {}, t.width = window.innerWidth, t.height = window.innerHeight, Mobile.storedInnerWidth = window.innerWidth, Mobile.storedInnerHeight = window.innerHeight, t.fontHeight = t.width / 24, t.addBackground = !0, e.landscapeMode ? (t.width > 3 * t.height ? (t.height = t.width, t.fontHeight = t.width / 25) : (t.width = 1.2 * t.height, t.fontHeight = t.height / 24), t.addBackground = !1) : e.tablet && (t.width = .85 * t.width, t.height = .7 * t.height, t.fontHeight = .7 * t.fontHeight, t.addBackground = !1), t.fontHeight = Math.floor(t.fontHeight), t
        },
        getDocumentHeight: function () {
            return "offsetHeight" === Mobile.storedDocumentHeight || document.body.offsetHeight === document.body.scrollHeight ? (Mobile.storedDocumentHeight = "offsetHeight", document.body.offsetHeight) : Mobile.isWebsiteMobile() && Mobile.storedDocumentHeight ? Mobile.storedDocumentHeight : (Mobile.storedDocumentHeight = document.body.scrollHeight, Mobile.storedDocumentHeight)
        },
        getDocumentWidth: function () {
            return Mobile.storedDocumentWidth = Mobile.storedDocumentWidth || window.innerWidth, Math.max(document.body.offsetWidth, Mobile.storedDocumentWidth)
        },
        getWindowsPosition: function (e) {
            var t = Mobile.getDocumentHeight(), i = Mobile.getDocumentWidth(), n = function () {
                return document.compatMode && "BackCompat" === document.compatMode ? document.body.clientHeight : document.documentElement.clientHeight
            }(), o = function () {
                return document.body.offsetHeight > 0 ? n : 0
            }(), a = (Math.max(window.innerHeight, t) - o) * -1, r = Math.floor(i - e.windowWidth), s = Math.floor(Math.max(n - (window.pageYOffset + e.windowHeight), a)), l = s, c = Math.floor(Math.min(window.innerWidth - e.windowWidth + window.pageXOffset, r)), d = {
                full: {},
                minimized: {}
            };
            return e = e || {}, Mobile.storedBottomPosition = window.pageYOffset, Mobile.storedHorizontalPosition = window.pageXOffset, (LC_API.chat_window_minimized() || LC_API.chat_window_hidden()) && (l = 0, a = 0), d.full.top = "auto", d.full.position = "fixed", d.full.bottom = 0, d.full.right = 0, d.full.left = "auto", e.mobileSite ? (d.minimized.left = "auto", d.minimized.bottom = 0, d.minimized.right = 0, d.minimized.position = "fixed") : (d.minimized.left = c, "small" === Mobile.getContainerSize() && (d.minimized.left = Math.floor(c + (e.windowWidth - e.fontHeight * Mobile.CONTAINER_WITH_FACTOR))), "relative" === window.getComputedStyle(document.body).position && (s = s + parseInt(window.getComputedStyle(document.body).height) - n), d.minimized.bottom = s, d.minimized.right = "auto", d.minimized.position = "absolute"), d
        },
        checkIfResizeIsNeeded: function () {
            if (Mobile.isWebsiteMobile()) {
                if (Mobile.lockResize || Mobile.storedInnerWidth && Mobile.storedInnerWidth === window.innerWidth && Mobile.storedInnerHeight === window.innerHeight)return !1
            } else if (Mobile.lockResize || Mobile.storedInnerWidth && Mobile.storedInnerWidth === window.innerWidth && Mobile.storedInnerHeight === window.innerHeight && Mobile.storedBottomPosition === window.pageYOffset && Mobile.storedHorizontalPosition === window.pageXOffset)return !1;
            return !0
        },
        resizeMobileWindow: function (e) {
            var e = e || {};
            if (!Mobile.isNewMobile())return !1;
            if (!Mobile.checkIfResizeIsNeeded() && !e.force)return !1;
            var t, i, n, o = document.getElementById("livechat-compact-container"), a = document.getElementById("livechat-full"), r = document.getElementById("livechat-badge");
            return e.orientationReset ? (Mobile.customStyle.cssProperties(a, {
                    width: 0,
                    left: 0
                }), Mobile.customStyle.cssProperties(o, {
                    width: 0,
                    left: 0
                }), void(Mobile.positionSet = !1)) : (t = Mobile.getWindowSize({
                    landscapeMode: Mobile.isLandscapeMode(),
                    tablet: Mobile.isTablet(),
                    iOS: Mobile.isiOS()
                }), i = Mobile.getWindowsPosition({
                    landscapeMode: Mobile.isLandscapeMode(),
                    tablet: Mobile.isTablet(),
                    iOS: Mobile.isiOS(),
                    mobileSite: Mobile.isWebsiteMobile(),
                    windowWidth: t.width,
                    windowHeight: t.height,
                    fontHeight: t.fontHeight
                }), n = "small" === Mobile.getContainerSize() ? t.fontHeight * Mobile.CONTAINER_WITH_FACTOR : t.width, i.minimized.left === parseInt(i.minimized.left, 10) && (i.minimized.left = i.minimized.left + "px"), i.minimized.right === parseInt(i.minimized.right, 10) && (i.minimized.right = i.minimized.right + "px"), i.full.top === parseInt(i.full.top, 10) && (i.full.top = i.full.top + "px"), i.full.bottom === parseInt(i.full.bottom, 10) && (i.full.bottom = i.full.bottom + "px"), i.full.right === parseInt(i.full.right, 10) && (i.full.right = i.full.right + "px"), i.full.left === parseInt(i.full.left, 10) && (i.full.left = i.full.left + "px"), Mobile.setWindowHeight = t.height, Mobile.customStyle.cssProperties(o, {
                    left: i.minimized.left,
                    right: i.minimized.right,
                    bottom: i.minimized.bottom + "px",
                    position: i.minimized.position,
                    width: n + "px",
                    height: 5.5 * t.fontHeight + "px"
                }), Mobile.customStyle.cssProperties(a, {
                    left: i.full.left,
                    right: i.full.right,
                    position: i.full.position,
                    bottom: i.full.bottom,
                    top: i.full.top,
                    width: t.width + "px",
                    height: t.height + "px"
                }), Mobile.customStyle.cssProperties(r, {
                    width: t.fontHeight + "px",
                    height: t.fontHeight + "px",
                    "font-size": t.fontHeight / 1.3 + "px",
                    "line-height": t.fontHeight + "px",
                    border: t.fontHeight / 5 + "px solid #ffffff",
                    right: t.fontHeight / 4 + "px",
                    top: 0
                }), void LC_API.update_height(t.fontHeight, t.addBackground))
        },
        initNewMobile: function () {
            var e = this;
            Mobile.storedInnerWidth = null, Mobile.storedInnerHeight = null, window.addEventListener("scroll", function (e) {
                Mobile.onScroll()
            }), setInterval(function () {
                Mobile.resizeMobileWindow()
            }, 200), window.addEventListener("orientationchange", function (t) {
                NotifyChild.send("mobile_input_blur"), e.resizeMobileWindow({orientationReset: !0})
            })
        },
        setWindowStyle: function () {
            Mobile.customStyle.cssProperties("livechat-compact-container", {
                position: "absolute",
                left: 0,
                right: "auto",
                padding: 0,
                "box-sizing": "border-box",
                top: "auto",
                "-webkit-transition": "none",
                "-moz-transition": "none",
                "-o-transition": "none",
                transition: "none"
            }), Mobile.customStyle.cssProperties("livechat-compact-view", {
                top: 0,
                width: "100%",
                height: "inherit"
            }), Mobile.customStyle.cssProperties("livechat-full-view", {
                width: "100%",
                height: "100%"
            }), Mobile.customStyle.cssProperties("livechat-badge", {
                background: "#D93328",
                padding: 0,
                "border-radius": "50%",
                "text-align": "center",
                "box-shadow": "none",
                left: "auto"
            }), Mobile.resizeMobileWindow()
        },
        isWebsiteMobile: function () {
            if (null != Mobile.mobileWebsite)return Mobile.mobileWebsite;
            var e, t = document.querySelector('meta[name="viewport"]');
            if (!t)return Mobile.mobileWebsite = !1, !1;
            if (e = t.content.replace(/\s/gi, ""), e.indexOf("width=device-width") !== -1)return Mobile.mobileWebsite = !0, !0;
            if (e.indexOf("user-scalable=no") !== -1)return Mobile.mobileWebsite = !0, !0;
            if (e.indexOf("user-scalable=0") !== -1)return Mobile.mobileWebsite = !0, !0;
            var i = e.match(/width=([0-9]*)/);
            return i && i[1] && 1 * i[1] <= 320 ? (Mobile.mobileWebsite = !0, !0) : (Mobile.mobileWebsite = !1, !1)
        },
        onMinimizeChatWindow: function () {
            var e = document.querySelector('meta[name="viewport"]'), t = document.getElementById("livechat-full");
            Mobile.lockResize = !1, e && this.storedViewport && ("no-viewport" === this.storedViewport ? e.content = "user-scalable=yes" : e.content = this.storedViewport), Mobile.customStyle.cssProperties(t, {bottom: 0}), Mobile.customStyle.cssProperties(document.body, "position", Mobile.storedBodyPosition || "", !0), Mobile.customStyle.cssProperties(document.body, "overflow-y", Mobile.storedBodyOverflowY || "", !0), Mobile.customStyle.cssProperties(document.body, "width", Mobile.storedBodyWidth || "", !0), Mobile.customStyle.cssProperties(document.body, "height", Mobile.storedBodyHeight || "", !0), Mobile.customStyle.cssProperties(document.body, "left", Mobile.storedBodyLeft || "", !0), Mobile.customStyle.cssProperties(document.body, "right", Mobile.storedBodyRight || "", !0), Mobile.customStyle.cssProperties(document.body, "top", Mobile.storedBodyTop || "", !0), Mobile.customStyle.cssProperties(document.body, "bottom", Mobile.storedBodyBottom || "", !0), Mobile.$htmlTag.style.position = Mobile.storedHeadPosition, Mobile.resizeMobileWindow({force: !0})
        },
        onShowFullView: function () {
            var e = document.querySelector('meta[name="viewport"]');
            this.storedPosition = document.body.scrollTop, Mobile.storedDocumentHeight = null, this.storedViewport || (e ? this.storedViewport = e.content : (e = document.createElement("meta"), e.name = "viewport", document.getElementsByTagName("head")[0].appendChild(e), this.storedViewport = "no-viewport")), e.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no", Mobile.storedBodyPosition = Mobile.customStyle.cssProperties(document.body, "position"), Mobile.storedBodyOverflowY = Mobile.customStyle.cssProperties(document.body, "overflow-y"), Mobile.storedBodyWidth = Mobile.customStyle.cssProperties(document.body, "width"), Mobile.storedBodyHeight = Mobile.customStyle.cssProperties(document.body, "height"), Mobile.storedBodyLeft = Mobile.customStyle.cssProperties(document.body, "left"), Mobile.storedBodyRight = Mobile.customStyle.cssProperties(document.body, "right"), Mobile.storedBodyTop = Mobile.customStyle.cssProperties(document.body, "top"), Mobile.storedBodyBottom = Mobile.customStyle.cssProperties(document.body, "bottom"), Mobile.storedHeadPosition = Mobile.$htmlTag.ownerDocument.defaultView.getComputedStyle(Mobile.$htmlTag, null).position, document.body.style.setProperty("position", "fixed", "important"), document.body.style.setProperty("overflow-y", "hidden", "important"), document.body.style.setProperty("width", "100%", "important"), document.body.style.setProperty("height", "100%", "important"), document.body.style.setProperty("left", "0", "important"), document.body.style.setProperty("right", "0", "important"), document.body.style.setProperty("top", "0", "important"), document.body.style.setProperty("bottom", "0", "important"), Minimized.showMobileInvitation && (Minimized.mobileInvitationOpened = "opened", Minimized.invitationOpened = "opened", Cookie.set("lc_mobile_invitation_opened", "opened"), Cookie.set("lc_invitation_opened", "opened"), Minimized.updateWindowHTML()), Mobile.resizeMobileWindow()
        },
        onScroll: function () {
            Mobile.resizeMobileWindow()
        },
        onMessageInputFocus: function () {
            Mobile.lockResize = !0, clearTimeout(Mobile.lockTimeout)
        },
        onMessageInputBlur: function () {
            Mobile.lockTimeout = setTimeout(function () {
                Mobile.lockResize = !1
            }, 200)
        },
        preloadSound: function () {
            var e, t = this;
            return !$("livechat_sound") && (e = document.createElement("audio"), e.setAttribute("id", "livechat_sound"), e.setAttribute("style", "position:absolute;top:-9999em;left:-9999em;visibility:hidden"), e.innerHTML = ['<source src="//cdn.livechatinc.com/sounds/message.ogg" type="audio/ogg" />', '<source src="//cdn.livechatinc.com/sounds/message.mp3" type="audio/mp3" />', '<source src="//cdn.livechatinc.com/sounds/message.wav" type="audio/wav" />'].join("\n"), void DOM.appendToBody(e, function () {
                    t.$sound = $("livechat_sound")
                }))
        },
        playSound: function (e) {
            if (!this.disabledSounds) {
                var t = this;
                if (null == e && (e = {preloadOnMobile: !1}), !$("livechat_sound"))return !1;
                if (+new Date - this.previousSoundTime < 2e3)return !0;
                if (this.previousSoundTime = +new Date, this.hasAudioSupport === !0) {
                    if (e.preloadOnMobile && this.preloadedOnMobile)return !1;
                    this.$sound.play(), e.preloadOnMobile && !this.preloadedOnMobile && (this.preloadedOnMobile = !0, setTimeout(function () {
                        t.$sound.pause(), t.$sound.currentTime = 0
                    }, 10))
                }
            }
        },
        disableSounds: function () {
            this.disabledSounds = !0
        }
    }, NotifyChild = {
        chat_reloaded: !1,
        welcome_message: null,
        maximize_on_init: !1,
        set_mobile_invitation_after_message: !1,
        init: function () {
            this.bindReceive()
        },
        send: function (e) {
            var t = LC_Invite.windowRef || frames["livechat-full-view"];
            return !!t && (XD.postMessage(encodeURIComponent(e), __lc_iframe_src_hash, t), !1)
        },
        bindReceive: function () {
            var e, t = this;
            e = Loader.getChatHost(), XD.receiveMessage(function (e) {
                t.receive(e)
            }, e.replace(/^http:/, "https:")), XD.receiveMessage(function (e) {
                t.receive(e)
            }, e.replace(/^https/, "http"))
        },
        receive: function (e) {
            var t, i, n, o, a, r, s, l = this, c = function (e) {
                null == LC_Invite.invoked_callbacks[e] && (LC_Invite.invoked_callbacks[e] = !0, LC_API[e]())
            };
            if (Loader.is_iframe_loaded = !0, t = e.data, t = decodeURIComponent(t), "load_languages" === t) {
                if (null == LC_Invite.conf.lang_phrases)return !1;
                LC_Invite.sendLangPhrasesToEmbedded()
            } else if ("load_window_config" === t) this.manualInvitation && (s = {skipPrechat: !0}), LC_Invite.sendWindowConfigToEmbedded(s); else if (/^force_ping;/.test(t)) {
                var d = t.split(";");
                LC_Invite.pinger.ping({forcePing: "true" === d[1]})
            } else if (/^new_messages;/.test(t)) o = parseInt(t.split(";")[1], 10), Minimized.newMessageNotification(o); else if (/^message_sent;/.test(t)) window.LC_AutoInvite && window.LC_AutoInvite.ignoreFirstMessage ? (window.LC_AutoInvite.ignoreFirstMessage = !1, window.LC_AutoInvite.autoInvited = !1) : LC_API.on_message({
                    text: decodeURIComponent(t.split(";")[1]),
                    user_type: "visitor",
                    visitor_name: decodeURIComponent(t.split(";")[2]),
                    timestamp: Math.round(decodeURIComponent(t.split(";")[3]) / 1e3)
                }), window.LC_AutoInvite && window.LC_AutoInvite.autoInvited && (window.LC_AutoInvite.ignoreFirstMessage = !0); else if (/^ticket_created;/.test(t)) {
                var u = t.split(";"), _ = {
                    ticket_id: u[1],
                    text: decodeURIComponent(u[2]),
                    visitor_name: decodeURIComponent(u[5]),
                    visitor_email: decodeURIComponent(u[3]),
                    form_data: JSON.parse(decodeURIComponent(u[7]))
                };
                "null" !== decodeURIComponent(u[6]) && (_.ticket_subject = decodeURIComponent(u[6])), LC_API.on_ticket_created(_)
            } else if (/^prechat_sent;/.test(t)) {
                var u = t.split(";"), _ = {};
                _.form_data = JSON.parse(decodeURIComponent(u[1])), LC_API.on_prechat_survey_submitted(_)
            } else if (/^postchat_sent;/.test(t)) {
                var u = t.split(";"), _ = {};
                _.form_data = JSON.parse(decodeURIComponent(u[1])), LC_API.on_postchat_survey_submitted(_)
            } else if (/^rating_sent;/.test(t)) {
                var h = t.split(";")[1];
                LC_API.on_rating_submitted(h)
            } else if (/^rating_comment_sent;/.test(t)) {
                var m = t.split(";")[1];
                LC_API.on_rating_comment_submitted(m)
            } else if (/^message_received;/.test(t)) window.LC_AutoInvite && window.LC_AutoInvite.ignoreFirstMessage || LC_API.on_message({
                text: decodeURIComponent(t.split(";")[1]),
                user_type: "agent",
                agent_login: decodeURIComponent(t.split(";")[2]),
                agent_name: decodeURIComponent(t.split(";")[4]),
                timestamp: Math.round(decodeURIComponent(t.split(";")[3]) / 1e3)
            }), this.set_mobile_invitation_after_message && (Minimized.renderMobileInvitation(!1, decodeURIComponent(t.split(";")[4]), decodeURIComponent(t.split(";")[1])), this.set_mobile_invitation_after_message = !1); else if (/autoinvitation_data/.test(t)) {
                var f = t.split(";"), p = JSON.parse(decodeURIComponent(f[2]));
                Minimized.renderMobileInvitation(p.avatar_url, p.name, decodeURIComponent(f[1]))
            } else if (/^welcome_message/.test(t)) Minimized.setWelcomeMessage(decodeURIComponent(t.split(";")[1])), Minimized.updateWindowHTML(); else if ("minimize" == t) LC_API.chat_window_hidden() === !1 && LC_API.minimize_chat_window(); else if ("maximize" == t) LC_API.show_full_view(); else if ("resize_mobile_window" == t) Mobile.resizeMobileWindow(); else if ("message_input_focus" === t) Mobile.isNewMobile() && Mobile.onMessageInputFocus(); else if ("message_input_blur" === t) Mobile.isNewMobile() && Mobile.onMessageInputBlur(); else if ("invitation_refused" == t || "invitation_operators_offline" == t) "invitation_refused" == t && (document.createElement("img").src = LC_Invite.httpp + LC_Invite.conf.serv + "/licence/" + LC_Invite.conf.lic + "/tunnel.cgi?IWCS0014C^inviterefused^" + LC_API.get_visitor_id() + "^$^&rand=" + Math.floor(1e3 * Math.random())), LC_Invite.getVisitorInteraction() || LC_API.minimize_chat_window(); else if ("chose_destination_skill" === t) LC_Invite.destinationSkillChosen = !0; else if (/^new_chat;/.test(t)) {
                var g;
                try {
                    g = JSON.parse(decodeURIComponent(t.split(";")[1]))
                } catch (e) {
                    g = {agent_name: decodeURIComponent(t.split(";")[1])}
                }
                LC_API.on_chat_started(g), t.split(";")[2] && (Minimized.setOperatorAvatarUrl(decodeURIComponent(t.split(";")[2])), Mobile.isNewMobile() && (this.set_mobile_invitation_after_message = !0))
            } else if (/^chat_ended$/.test(t)) LC_Invite.chat_ended = !0, LC_API.on_chat_ended(); else if (/^chat_reload;/.test(t)) {
                if (LC_API.embedded_chat_enabled() === !1)return !1;
                LC_Invite.invoked_callbacks = {};
                var e = t.split(";");
                this.welcome_message = decodeURIComponent(e[1]), this.manualInvitation = "true" === e[2], "" === this.welcome_message && (this.welcome_message = null), $("livechat-full").style.visibility = "hidden", $("livechat-full").style.opacity = 0, this.chat_reloaded = !0, Loader.pendingScriptDataRequest = !0, Loader.loadData()
            } else if ("main_window" == t) LC_Invite.is_main_window = !0; else if (/^operator;/.test(t)) a = decodeURIComponent(t.split(";")[1]), avatar_url = decodeURIComponent(t.split(";")[2]), Minimized.setOperatorDisplayName(a), Minimized.setOperatorAvatarUrl(avatar_url); else if (/^chat_id;/.test(t)) r = decodeURIComponent(t.split(";")[1]), r ? LC_Invite.chat_id = r : LC_Invite.chat_id = null; else if (/^visitor_name;/.test(t)) i = t.split(";"), Minimized.setVisitorName(i[1]); else if (/^state;/.test(t)) i = t.split(";"), Minimized.setState(i[1]), Minimized.updateText(), LC_Invite.embedded_hide_when_offline() !== !0 || LC_Invite.getVisitorInteraction() || (Minimized.getState() === Minimized.STATE_OFFLINE ? LC_Invite.hideChatWindow() : Minimized.getPreviousState() !== Minimized.STATE_OFFLINE || LC_Invite.embedded_chat_hidden_by_api || LC_API.minimize_chat_window()); else if (/^firefly_request_url;/.test(t)) LC_Invite.init_firefly({
                callback: function () {
                    window.fireflyAPI.set("message", "Waiting for the agent..."), i = t.split(";"), window.fireflyAPI.startAPI(LC_Invite.conf.integrations.firefly.api_key, function (e) {
                        NotifyChild.send("firefly_url;" + encodeURIComponent(e) + ";" + encodeURIComponent(decodeURIComponent(i[1])))
                    })
                }
            }); else if ("firefly_load_script" === t) LC_Invite.init_firefly(); else if (/^pushpage;/.test(t)) i = t.split(";"), window.location.href = i[1]; else if (/^message_read$/.test(t)) Minimized.disableNewMessageNotification(); else if (/^ga_enabled;/.test(t)) {
                var b = "1" === t.split(";")[1];
                GoogleAnalytics.setEnabled(b)
            } else if (/^ga;/.test(t)) {
                i = t.split(";");
                var v = decodeURIComponent(i[1]), y = decodeURIComponent(i[2]);
                if (y)var w = JSON.parse(y);
                var A = decodeURIComponent(i[3]);
                if (A)var C = JSON.parse(A);
                AnalyticsIntegrations.trackPageView(v, {event_data: w, user_data: C})
            } else if (/^init;/.test(t)) {
                var I = function () {
                    if (LC_Invite.setEmbeddedLoaded(), LC_API.embedded_chat_enabled() === !1)return !1;
                    var e, o, a;
                    return i = t.split(";"), Minimized.setDisplayAvatar(LC_Invite.conf.chat_window.display_avatar), "" !== i[7] && (Minimized.setState(i[7]),
                        Minimized.updateText()), e = i[7] == Minimized.STATE_CHATTING, o = i[7] == Minimized.STATE_QUEUE, a = LC_Invite.embedded_hide_when_offline(), "" !== i[8] && Minimized.setOperatorDisplayName(decodeURIComponent(i[8])), "" !== i[10] && Minimized.setOperatorAvatarUrl(decodeURIComponent(i[10])), NotifyChild.send("navigation_start;" + Utils.getNavigationStart()), "" !== __lc_settings.nick && "$" !== __lc_settings.nick && NotifyChild.send("nick;" + encodeURIComponent(__lc_settings.nick)), "" !== __lc_settings.email && NotifyChild.send("email;" + encodeURIComponent(__lc_settings.email)), "" !== __lc_settings.lc.params && __lc_settings.lc.params !== !1 && NotifyChild.send("params;" + encodeURIComponent(__lc_settings.lc.params)), l.chat_reloaded === !0 && (l.manualInvitation && NotifyChild.send("manual_invitation"), NotifyChild.send("welcome_message;" + encodeURIComponent(l.welcome_message || "")), LC_API.show_full_view(), l.welcome_message = null, l.manualInvitation = !1), __lc_settings.client_limit_exceeded === !0 && NotifyChild.send("client_limit_exceeded"), __lc.wix && NotifyChild.send("wix;" + encodeURIComponent(Loader.pageData.url)), __lc.always_start_chat && NotifyChild.send("always_start_chat"), c("on_before_load"), Minimized.getState() === Minimized.STATE_OFFLINE && a === !0 ? (LC_API.hide_chat_window(), c("on_after_load"), Full.onload(), !0) : LC_Invite.embedded_chat_hidden_by_api === !0 ? (c("on_after_load"), Full.onload(), !0) : (__lc_settings.automatic_greeting && ("full" === Cookie.get("lc_window_state") && (l.maximize_on_init = !0), LC_Invite.trackAndRenderAutoInvitation(__lc_settings.automatic_greeting)), e === !0 || o === !0 || l.maximize_on_init === !0 ? (n = Cookie.get("lc_window_state"), "full" === n || l.maximize_on_init === !0 ? (LC_Invite.open_chat_window({source: "stored chat window state"}), l.maximize_on_init = !1) : LC_API.minimize_chat_window({callAPI: !1})) : l.chat_reloaded !== !0 && LC_API.minimize_chat_window({callAPI: !1}), c("on_after_load"), Full.onload(), LC_API.new_mobile_is_detected() && Mobile.setWindowStyle(), void Events.sendStoredMetrics())
                };
                Utils.makeItDone(I).when(function () {
                    return !Loader.pendingScriptDataRequest
                })
            } else if (/^supports_chatting;/.test(t)) {
                var M = "true" === t.split(";")[1];
                Minimized.setSupportsChatting(M)
            }
        },
        maximizeOnInit: function () {
            this.maximize_on_init = !0
        }
    }, PersonalInvitation = {
        render: function (e) {
            function t() {
                this.construct_invite = function () {
                    var e, t = this.config.greeting_message.message, i = "";
                    return e = /op\.cgi/.test(this.config.operator.picture.url) ? LC_Invite.httpp + this.config.serv + this.config.operator.picture.url : LC_Invite.httpp + this.config.operator.picture.url, i += '<div style="top:0px;left:0px;width:100%;height:100%;position:relative;overflow:hidden">', i += '<a style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;cursor:pointer;background:url(//cdn.livechatinc.com/img/pixel.gif);z-index:16777262" href="#" onclick="LC_Invite.lc_open_chat(\'manual\');return false"></a>', i += '<a style="position:absolute;top:' + this.config.close_button.top + "px;left:" + this.config.close_button.left + "px;width:" + this.config.close_button.width + "px;height:" + this.config.close_button.height + 'px;display:block;cursor:pointer;z-index:16777262;background:url(//cdn.livechatinc.com/img/pixel.gif)" href="#" onclick="LC_Invite.lc_popup_close();return false"></a>', i += '<img src="' + e + '" height="120" style="top:' + this.config.operator.picture.top + "px;left:" + this.config.operator.picture.left + 'px;position:absolute;overflow:hidden;padding:1px;border:1px solid #999;z-index:16777261" id="div_operator-picture" alt="">', i += '<div style="top:' + this.config.operator.name.top + "px;left:" + this.config.operator.name.left + "px;width:" + this.config.operator.name.width + "px;height:" + this.config.operator.name.height + 'px;position:absolute;overflow:hidden;white-space:nowrap;color:#000000;font-size:12px;font-size:12px;line-height:19px;font-family:Arial,sans-serif;z-index:16777261" id="div_operator-name">', i += this.config.operator.name.name, i += "</div>", i += '<div style="top:' + this.config.greeting_message.top + "px;left:" + this.config.greeting_message.left + "px;width:" + this.config.greeting_message.width + "px;height:" + this.config.greeting_message.height + 'px;position:absolute;overflow:hidden;color:#000000;font-size:12px;line-height:19px;font-family:Arial,sans-serif;z-index:16777261" id="div_greeting-message">', i += t, i += "</div>", i += '<span><img border="0" src="' + LC_Invite.httpp + this.config.image_url + '" id="lc_personal_invitation_img"></span></div>'
                }, this.load_invite = function () {
                    var e = this.construct_invite();
                    LC_Invite.display_invitation(e, this.config.position)
                }
            }

            return !e.error && (window.LC_PrivateInvite = new t, window.LC_PrivateInvite.config = e, window.LC_PrivateInvite.config.position = {
                    arg1: e.position.y,
                    arg2: e.position.x,
                    option: e.position.h_align
                }, void window.LC_PrivateInvite.load_invite())
        }
    };
    window.PersonalInvitation = PersonalInvitation;
    var XD = function () {
        var e, t = this;
        return {
            postMessage: function (e, i, n) {
                if (i && (n = n || parent, t.postMessage)) {
                    if (Loader.is_iframe_loaded !== !0)return !1;
                    try {
                        n.postMessage(e, Utils.extractDomain(i))
                    } catch (e) {
                    }
                }
            }, receiveMessage: function (i, n) {
                t.postMessage && (i && (e = function (e) {
                    return !("string" == typeof n && e.origin !== n || "[object Function]" === Object.prototype.toString.call(n) && n(e.origin) === !1) && void i(e)
                }), t.addEventListener ? t[i ? "addEventListener" : "removeEventListener"]("message", e, !1) : t[i ? "attachEvent" : "detachEvent"]("onmessage", e))
            }
        }
    }(), StatusChecker = function () {
        var e, t, i, n, o, a = 3e3, r = function (e) {
            o !== e.status && (o = e.status, LC_API.on_chat_state_changed({state: e.status}))
        };
        return {
            init: function (e) {
                t = e.protocol, i = e.hostname, n = e.licence
            }, startChecking: function () {
                if (!e) {
                    var o = function () {
                        Utils.jsonpRequest({
                            protocol: t,
                            hostname: i,
                            endpoint: "/licence/" + n + "/group_status",
                            queryParams: {group: __lc.skill},
                            requestName: "__lc_status_check",
                            callback: r
                        })
                    };
                    e = setInterval(o, a), o()
                }
            }, stopChecking: function () {
                clearInterval(e), e = void 0
            }
        }
    }(), Timer = {
        time: +new Date, checkpoint: function () {
            return +new Date - this.time
        }
    }, VisitorDetailsParser = {
        parse: function (e) {
            return "object" == typeof e && (e.constructor === Object && ("undefined" != typeof e.name && (e.name = String(e.name), __lc_settings.nick = IncorrectCharactersStripper.strip(e.name)), void("undefined" != typeof e.email && (e.email = String(e.email), __lc_settings.email = IncorrectCharactersStripper.strip(e.email)))))
        }
    }, i, col, src, matches, query_matches, __lc_settings = {}, __lc_iframe_src = "", __lc_iframe_src_hash = "", __script_data_response, __lc_script_tracking_version = {};
    if (__lc.license = parseInt(__lc.license, 10) || null, __lc.skill = function () {
            return "undefined" != typeof __lc.group ? __lc.group : "undefined" != typeof __lc.skill ? __lc.skill : void 0
        }(), __lc.params = __lc.params || "", __lc.visitor = __lc.visitor || {}, 0 != __lc.chat_between_groups && (__lc.chat_between_groups = !0), __lc.mute_csp_errors = __lc.mute_csp_errors || !1, __lc_script_version = {
            tracking_env: "production",
            tracking_version: "20170203081819"
        }, null == __lc.license)for (col = document.getElementsByTagName("script"), i = 0; i < col.length; i++)if (src = col[i].src, src && (matches = src.match(/licence\/(\d+)\/script.cgi(.*)$/), matches && (__lc.license = parseInt(matches[1], 10), query_matches = matches[2].match(/groups=(\d+)/), query_matches && (__lc.skill = parseInt(query_matches[1], 10)), query_matches = matches[2].match(/params=([^&]+)/))))try {
        __lc.params = CustomVariablesParser.getArrayByString(decodeURIComponent(query_matches[1]))
    } catch (e) {
    }
    switch (String(__lc.license)) {
        case"1520":
            __lc.hostname = "secure-lc.livechatinc.com";
            break;
        default:
            null == __lc.hostname && (__lc.hostname = "secure.livechatinc.com")
    }
    var Loader = {
        protocol: window.location.protocol.indexOf("https") != -1 ? "https://" : "http://",
        pageData: {title: document.title, url: document.location.toString(), referrer: document.referrer},
        requestTime: null,
        is_iframe_loaded: !1,
        usedCallbackIDs: {},
        init: function () {
            var e;
            if (__lc.wix) Wix.getSiteInfo(function (e) {
                Loader.pageData.title = e.pageTitle, "undefined" != typeof e.referrer ? Loader.pageData.referrer = e.referrer : Loader.pageData.referrer = e.referer, e.baseUrl.length > 0 && e.url.indexOf(e.baseUrl) === -1 ? Loader.pageData.url = e.baseUrl : Loader.pageData.url = e.url, Loader.loadData()
            }); else if (__lc.embedded_in_iframe === !0) {
                e = document.location.hash.replace(/^#/, "");
                try {
                    e && (e = JSON.parse(decodeURIComponent(e))), Loader.pageData.title = e.title || "", Loader.pageData.referrer = e.referrer || "", Loader.pageData.url = document.referrer, Loader.loadData()
                } catch (e) {
                }
            } else Loader.loadData()
        },
        parseResponseError: function (e) {
            "object" == typeof console && ("License expired" === e ? console.log("[LiveChat] Your account has expired. Visit www.livechatinc.com to sign in and renew your subscription.") : /is banned!/.test(e) && console.log("[LiveChat] " + e))
        },
        parseScriptDataResponse: function (e, t, i) {
            var n = __lc.params || e.visitor && e.visitor.params, o = {
                automatic_greeting: e.automatic_greeting,
                buttons: function () {
                    var t;
                    for (t = 0; t < e.buttons.length; t++)e.buttons[t].value = e.buttons[t].value.replace("livechat.s3.amazonaws.com", "cdn.livechatinc.com/s3");
                    return e.buttons
                }(),
                position: {
                    option: e.invitation.align,
                    arg1: parseInt(e.invitation.y, 10),
                    arg2: parseInt(e.invitation.x, 10)
                },
                overlay: {enabled: !0, opacity: .8, color: "#000"},
                embedded: {
                    enabled: Boolean(Number(e.embedded_chat.enabled)),
                    hide_when_offline: Boolean(Number(e.embedded_chat.hide_when_offline)),
                    eye_grabber: {
                        enabled: Boolean(Number(e.embedded_chat.eye_grabber.enabled)),
                        x: parseInt(e.embedded_chat.eye_grabber.x, 10),
                        y: parseInt(e.embedded_chat.eye_grabber.y, 10),
                        path: e.embedded_chat.eye_grabber.path.replace("livechat.s3.amazonaws.com", "cdn.livechatinc.com/s3"),
                        point_zero: {x: 15, y: 0}
                    },
                    dimensions: {margin: t, width: i.w, height: i.h, width_minimized: i.w_minimized}
                },
                chat_window: e.chat_window,
                skills: e.skills || [],
                group_properties: e.group_properties,
                lc: {
                    last_visit: e.visitor.last_visit,
                    session: e.visitor.session,
                    page_view: e.visitor.page_view,
                    visit_number: e.visitor.visit_number,
                    chat_number: e.visitor.chat_number,
                    all_invitation: e.visitor.all_invitation,
                    ok_invitation: e.visitor.ok_invitation,
                    last_operator_id: e.visitor.last_operator_id,
                    client_version: e.visitor.client_version,
                    params: CustomVariablesParser.parse(n),
                    groups: parseInt(__lc.skill, 10)
                },
                lic: __lc.license,
                lc2: e.lc2,
                serv: e.serv,
                nick: e.visitor.nick,
                email: "",
                hostname: e.visitor.hostname,
                status: e.status,
                invite_img_name: e.invitation.image.replace("livechat.s3.amazonaws.com", "cdn.livechatinc.com/s3"),
                redirect_url: e.redirect_url,
                lang: e.lang,
                client_limit_exceeded: "undefined" != typeof e.client_limit_exceeded && Boolean(Number(e.client_limit_exceeded)),
                domain_whitelist: e.domain_whitelist,
                integrations: e.integrations,
                localization_basic: e.localization_basic,
                offline_form: e.offline_form,
                pre_chat_survey: e.pre_chat_survey
            };
            return o
        },
        initMainScript: function (e, t) {
            "undefined" != typeof t.visitor.groups && (__lc_settings.lc.groups = t.visitor.groups, __lc.group = t.visitor.groups, __lc.skill = t.visitor.groups), VisitorDetailsParser.parse(__lc.visitor), __lc_iframe_src = Loader.getChatUrl({
                groups: e.lc.groups,
                embedded: e.embedded.enabled ? "1" : "0"
            }), __lc_iframe_src_hash = __lc_iframe_src + "#" + document.location.toString(), __lc_iframe_current_skill = e.lc.groups, "undefined" == typeof LC_Invite ? LC_Invite = new LiveChat(e) : LC_Invite.setConfig(e), LC_Invite.init(), __lc.license != e.lic && Events.track("chat_window", "script_data.js incorrect data - received license " + e.lic + " instead of " + __lc.license)
        },
        scriptDataRequest: function (e, t, i, n, o, a, r, s) {
            var l = document.createElement("script"), c = "";
            Loader.requestTime = (new Date).getTime(), c += "t=" + +new Date, c += "&referrer=" + encodeURIComponent(IncorrectCharactersStripper.strip(a)), c += "&url=" + encodeURIComponent(n), c += "&params=" + encodeURIComponent(CustomVariablesParser.parse(o)), c += "&jsonp=__lc_data_" + i, 1 === r && (c += "&test=1"), "undefined" != typeof t && (t = parseInt(t, 10), c += "&groups=" + (t || 0)), s === !1 && "undefined" != typeof t ? l.src = Loader.protocol + __lc.hostname + "/licence/g" + e + "_" + t + "/script_data.js?" + c : l.src = Loader.protocol + __lc.hostname + "/licence/" + e + "/script_data.js?" + c, DOM.appendToBody(l)
        },
        loadData: function () {
            var e, t = this;
            if (e = Math.ceil(1e6 * Math.random()), __lc.chat_between_groups === !1) {
                var i, n = Math.ceil(1e6 * Math.random());
                window["__lc_data_" + n] = function (o) {
                    if (!t.wasIDUsed(n)) {
                        if (t.addUsedID(n), i = o, "undefined" != typeof o.error)return t.parseResponseError(i.error), !1;
                        if (i.visitor.groups === __lc.group)return void window["__lc_data_" + e](o);
                        __lc.skill = i.visitor.groups, __lc.group = i.visitor.groups, t.scriptDataRequest(__lc.license, __lc.skill, e, Loader.pageData.url, __lc.params, Loader.pageData.referrer, __lc.test, __lc.chat_between_groups)
                    }
                }, this.scriptDataRequest(__lc.license, __lc.skill, n, Loader.pageData.url, __lc.params, Loader.pageData.referrer, __lc.test, __lc.chat_between_groups)
            }
            window["__lc_data_" + e] = function (i) {
                if (!t.wasIDUsed(e)) {
                    if ("3" === i.license_properties.lc_version)return void LC4.init(i);
                    var n, o, a, r = 15;
                    if (t.addUsedID(e), a = (new Date).getTime() - Loader.requestTime, Events.trackSpeed("first_time_init", {request_length: a}), "undefined" != typeof i.error)return t.parseResponseError(i.error), !1;
                    n = t.calculateWindowDimensions(r), window.__lc_lang = function (e) {
                        var t = e.localization;
                        LC_Invite.conf.lang_phrases = t, LC_Invite.sendLangPhrasesToEmbedded(t)
                    }, o = document.createElement("script"), o.src = Loader.protocol + __lc.hostname + i.localization_url + "?jsonp=__lc_lang", DOM.appendToBody(o), __script_data_response = i, __lc_settings = t.parseScriptDataResponse(__script_data_response, r, n), t.initMainScript(__lc_settings, __script_data_response), t.pendingScriptDataRequest = !1
                }
            }, __lc.chat_between_groups !== !1 && this.scriptDataRequest(__lc.license, __lc.skill, e, Loader.pageData.url, __lc.params, Loader.pageData.referrer, __lc.test, __lc.chat_between_groups)
        },
        calculateWindowDimensions: function (e) {
            var t, i = 400;
            return window.screen && window.screen.availWidth ? i = window.screen.availWidth : window.innerWidth ? i = window.innerWidth : document.body && document.body.clientWidth && (i = document.body.clientWidth), i = parseInt(i, 10), i < 400 ? (t = i - 2 * e, {
                    w: t,
                    w_minimized: t,
                    h: 350
                }) : {w: 400, h: 450, w_minimized: 250}
        },
        getChatHost: function () {
            return null != __lc.chat_absolute_url ? Utils.extractDomain(__lc.chat_absolute_url) : Utils.extractDomain(Loader.protocol + __lc_settings.serv)
        },
        getChatUrl: function (e, t) {
            var i, n, o, a, r;
            e = e || {}, t = t || {}, o = "?", null != __lc.chat_absolute_url ? (/\?/.test(__lc.chat_absolute_url) && (o = "&"), i = __lc.chat_absolute_url + o + "license=" + __lc_settings.lic, o = "&") : (i = t.force_ssl ? "https://" : Loader.protocol, skillUrlPart = "", "undefined" != typeof __lc.skill && (r = parseInt(__lc.skill, 10), skillUrlPart = "_" + (r || 0)), i += __lc.chat_between_groups === !1 ? __lc_settings.serv + "/licence/g" + __lc_settings.lic + skillUrlPart + "/open_chat.cgi" : __lc_settings.serv + "/licence/" + __lc_settings.lic + "/open_chat.cgi"), __lc.chat_between_groups === !1 && (e.unique_group = "1"), a = [];
            for (n in e)e.hasOwnProperty(n) && a.push(n + "=" + encodeURIComponent(e[n]));
            return i += o + a.join("&"), o = "&", i += o + "session_id=" + LC_API.get_visitor_id(), __lc.hostname && /^(server\d+\.labs|labs|server-lc|secure|secure-labs)\.livechatinc\.com(:\d+)?$/.test(__lc.hostname) && (i += "&server=" + __lc.hostname), t.include_current_page_address && (i += "#" + encodeURIComponent(Loader.pageData.url)), i
        },
        wasIDUsed: function (e) {
            if (this.usedCallbackIDs[e])return !0
        },
        addUsedID: function (e) {
            return this.usedCallbackIDs[e] = !0, this
        }
    };
    DOM.ready(Loader.init), LC_API = {
        on_before_load: function () {
            return "object" == typeof LC_API && "function" == typeof LC_API.on_before_load ? LC_API.on_before_load : "object" == typeof LC_API && "function" == typeof LC_API.on_load ? LC_API.on_load : function () {
                    }
        }(),
        on_after_load: "object" == typeof LC_API && "function" == typeof LC_API.on_after_load ? LC_API.on_after_load : function () {
            },
        on_chat_window_opened: "object" == typeof LC_API && "function" == typeof LC_API.on_chat_window_opened ? LC_API.on_chat_window_opened : function () {
            },
        on_chat_window_minimized: "object" == typeof LC_API && "function" == typeof LC_API.on_chat_window_minimized ? LC_API.on_chat_window_minimized : function () {
            },
        on_chat_window_hidden: "object" == typeof LC_API && "function" == typeof LC_API.on_chat_window_hidden ? LC_API.on_chat_window_hidden : function () {
            },
        on_chat_state_changed: "object" == typeof LC_API && "function" == typeof LC_API.on_chat_state_changed ? LC_API.on_chat_state_changed : function () {
            },
        on_chat_started: "object" == typeof LC_API && "function" == typeof LC_API.on_chat_started ? LC_API.on_chat_started : function () {
            },
        on_chat_ended: "object" == typeof LC_API && "function" == typeof LC_API.on_chat_ended ? LC_API.on_chat_ended : function () {
            },
        on_message: "object" == typeof LC_API && "function" == typeof LC_API.on_message ? LC_API.on_message : function () {
            },
        on_ticket_created: "object" == typeof LC_API && "function" == typeof LC_API.on_ticket_created ? LC_API.on_ticket_created : function () {
            },
        on_prechat_survey_submitted: "object" == typeof LC_API && "function" == typeof LC_API.on_prechat_survey_submitted ? LC_API.on_prechat_survey_submitted : function () {
            },
        on_postchat_survey_submitted: "object" == typeof LC_API && "function" == typeof LC_API.on_postchat_survey_submitted ? LC_API.on_postchat_survey_submitted : function () {
            },
        on_rating_submitted: "object" == typeof LC_API && "function" == typeof LC_API.on_rating_submitted ? LC_API.on_rating_submitted : function () {
            },
        on_rating_comment_submitted: "object" == typeof LC_API && "function" == typeof LC_API.on_rating_comment_submitted ? LC_API.on_rating_comment_submitted : function () {
            },
        get_window_type: function () {
            return this.embedded_chat_enabled() === !0 ? "embedded" : "popup"
        },
        chat_window_maximized: function () {
            var e = $("livechat-full");
            return !!(e && "visible" === e.style.visibility && e.offsetWidth && e.offsetHeight)
        },
        chat_window_minimized: function () {
            var e = $("livechat-compact-container");
            return !!(e && "visible" === e.style.visibility && e.offsetWidth && e.offsetHeight)
        },
        chat_window_hidden: function () {
            return this.chat_window_maximized() === !1 && this.chat_window_minimized() === !1
        },
        visitor_queued: function () {
            return Minimized.getState() === Minimized.STATE_QUEUE
        },
        chat_running: function () {
            return Minimized.getState() === Minimized.STATE_CHATTING
        },
        visitor_engaged: function () {
            return this.visitor_queued() || this.chat_running() || Minimized.getState() === Minimized.STATE_INVITATION_WITH_AGENT
        },
        agents_are_available: function () {
            return Minimized.getState() !== Minimized.STATE_OFFLINE
        },
        show_full_view: function (e) {
            e = e || {}, e.source = e.source || "?", LC_Invite.show_full_view(e)
        },
        minimize_chat_window: function (e) {
            LC_Invite.minimize_chat_window(e)
        },
        hide_eye_catcher: function () {
            var e = $("livechat-eye-catcher");
            e && (Cookie.set("hide_eye_catcher", "1"), e.parentNode.removeChild(e))
        },
        hide_chat_window: function () {
            Mobile.isNewMobile() && LC_API.chat_window_maximized() && LC_API.minimize_chat_window({callAPI: !1}), LC_Invite.embedded_chat_hidden_by_api = !0, LC_Invite.hideChatWindow()
        },
        set_custom_variables: function (e) {
            LC_Invite.set_custom_variables(e)
        },
        set_visitor_name: Client.setName,
        set_visitor_email: Client.setEmail,
        open_chat_window: function (e) {
            e = e || {}, LC_Invite.setVisitorInteraction(!0), LC_Invite.open_chat_window(e)
        },
        open_mobile_window: function (e) {
            LC_Invite.open_mobile_window(e)
        },
        get_visitor_id: function () {
            var e, t;
            return t = __lc.chat_between_groups === !1 ? "__lc.visitor_id.g" + __lc.license + "_" + __lc.skill : "__lc.visitor_id." + __lc.license, e = Cookie.get(t), e || (e = __lc_settings.lc.session, Cookie.set(t, e, 1e3)), e
        },
        get_chat_id: function () {
            return LC_Invite.chat_id
        },
        get_last_visit_timestamp: function () {
            return parseInt(__lc_settings.lc.last_visit, 10)
        },
        get_chats_number: function () {
            return parseInt(__lc_settings.lc.chat_number, 10)
        },
        get_page_views_number: function () {
            return parseInt(__lc_settings.lc.page_view, 10)
        },
        get_visits_number: function () {
            return parseInt(__lc_settings.lc.visit_number, 10)
        },
        get_invitations_number: function () {
            return parseInt(__lc_settings.lc.all_invitation, 10)
        },
        get_accepted_invitations_number: function () {
            return parseInt(__lc_settings.lc.ok_invitation, 10)
        },
        get_last_operator_login: function () {
            return __lc_settings.lc.last_operator_id.replace(/^\$$/, "")
        },
        embedded_chat_supported: function () {
            return "undefined" == typeof LC_Invite || LC_Invite.embeddedWindowSupported !== !1
        },
        embedded_chat_enabled: function () {
            return "undefined" != typeof LC_Invite && LC_Invite.embedded_chat_enabled() === !0
        },
        display_embedded_invitation: function (e, t, i, n, o) {
            var a, r, s = this;
            return this.embedded_chat_enabled() === !1 && "undefined" != typeof LC_AutoInvite ? (a = "function" == typeof LC_AutoInvite.get_layer_html ? LC_AutoInvite.get_layer_html() : "function" == typeof LC_AutoInvite.construct_invite ? LC_AutoInvite.construct_invite() : "", LC_Invite.display_invitation(a, LC_AutoInvite.config.position), !0) : LC_Invite.getEmbeddedLoaded() ? this.embedded_chat_supported() !== !1 && (this.chat_window_maximized() === !0 && null == n || (this.chat_running() === !0 || (Minimized.supportRoundedInvitations() || Mobile.isNewMobile() ? (Minimized.renderMobileInvitation(n.avatar_url, n.name, e), NotifyChild.send("invitation_with_agent;" + encodeURIComponent(t) + ";" + encodeURIComponent(e) + ";" + encodeURIComponent(JSON.stringify(n)) + ";0"), !0) : !!Mobile.isDetected() || ("undefined" == typeof t && (t = ""), i = "undefined" == typeof i ? "" : parseInt(i, 10), void(null == n ? (NotifyChild.send("invitation;" + encodeURIComponent(t) + ";" + i + ";" + encodeURIComponent(e)), this.show_full_view({source: "embedded invitation"})) : (r = "0", NotifyChild.send("invitation_with_agent;" + encodeURIComponent(t) + ";" + encodeURIComponent(e) + ";" + encodeURIComponent(JSON.stringify(n)) + ";" + encodeURIComponent(r)), o && this.show_full_view({source: "embedded invitation"}))))))) : (setTimeout(function () {
                        s.display_embedded_invitation(e, t, i, n, o)
                    }, 500), !1)
        },
        start_chat: function (e) {
            "undefined" != typeof e ? NotifyChild.send("start_chat;" + encodeURIComponent(e)) : NotifyChild.send("start_chat"), Mobile.isDetected() === !1 && this.open_chat_window()
        },
        close_chat: function () {
            NotifyChild.send("close_chat")
        },
        reload_window: function () {
            NotifyChild.send("reload_window")
        },
        repaint_window: function () {
            NotifyChild.send("update_body_height")
        },
        mobile_is_detected: function () {
            return Mobile.isDetected()
        },
        new_mobile_is_detected: function () {
            return Mobile.isNewMobile()
        },
        update_height: function (e, t) {
            NotifyChild.send("new_font_height;" + e + ";" + t), Minimized.setFontSize(e)
        },
        diagnose: function () {
            var e = [], t = "\nscript version: " + __lc_script_version.trackingVersion + ", env: " + __lc_script_version.env, i = GoogleAnalytics.getGaType() ? "\nGA: " + GoogleAnalytics.getGaType() : "";
            return /native code/.test(window.open) || e.push("window.open() overridden"), window.location.hostname !== document.domain && e.push("document.domain overridden"), window.frames != window && e.push('global variable "frames" or "window.frames" overridden'), /native code/.test(window.JSON.stringify) && /native code/.test(window.JSON.parse) || e.push("JSON object overridden"), (e.length ? e.join("\n") : "all OK") + i + t
        },
        _add_minimized_body_class: Minimized.addMinimizedClass,
        _remove_minimized_body_class: Minimized.removeMinimizedClass,
        disable_sounds: function () {
            NotifyChild.send("disable_sounds")
        }
    }, "undefined" != typeof __define && (define = __define), "undefined" != typeof __exports && (exports = __exports)
}();