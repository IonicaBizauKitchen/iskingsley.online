'use strict';

var request = require('request');

(function($) {

    var App = function() {

        var timeout;

        var $url = $("#url__value");
        var $interval = $("#interval__value");
        var $enabled = $("#enabled__value");
        var $author = $(".author__url");
        var $heartbeat = $(".heartbeat__value");

        /**
         * Get settings from localstorage
         * @return void
         */
        var getSettings = function() {
            if (localStorage.getItem('is_online--url')) {
                $url.val(localStorage.getItem('is_online--url'));
            }
            if (localStorage.getItem('is_online--interval')) {
                $interval.val(localStorage.getItem('is_online--interval'));
            }
            if (localStorage.getItem('is_online--enabled')) {
                if (localStorage.getItem('is_online--enabled') == "true") {
                    $enabled.prop('checked', true);
                }
            }
        };


        /**
         * Send heartbeat to specified URL
         * @return void
         */
        var sendHeartBeat = function() {
            request(localStorage.getItem('is_online--url'), function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var body = $.parseJSON(body);
                    if (body.success === true) {
                        updateHeartbeat(body.expires_on);
                    }
                } else {
                    alert("Ooops! There was a problem with the URL you've supplied. Please check it and try again!");
                    $enabled.prop('checked', false);
                    clearInterval(timeout);
                    timeout = 0;
                }
            });
        };

        /**
         * On Form save
         * @return void
         */
        var saveSettings = function() {
            $('#settings').submit(function(e) {
                e.preventDefault();

                var error = false;
                clearInterval(timeout);
                timeout = 0;

                $url.removeClass('input-error').parent().removeClass('has-error');
                $interval.removeClass('input-error').parent().parent().removeClass('has-error');

                if ($enabled.is(":checked")) {
                    if ($.trim($url.val()) == "") {
                        $url.addClass('input-error').parent().addClass('has-error');
                        error = true;
                    }
                    if ($.trim($interval.val()) == "") {
                        $interval.addClass('input-error').parent().parent().addClass('has-error');
                        error = true;
                    }
                }

                if (!error) {
                    setSettings();
                    sendHeartBeat();
                    performCPR();
                }
            });
        };

        /**
         * Send timed heartbeats
         * @return void
         */
        var performCPR = function() {
            if ($enabled.is(":checked")) {
                timeout = setInterval(function() {
                    sendHeartBeat();
                }, localStorage.getItem('is_online--interval') * 60000);
            }
        };


        /**
         * Set settings to localstorage
         * @return void
         */
        var setSettings = function() {
            localStorage.setItem('is_online--url', $.trim($url.val()));
            localStorage.setItem('is_online--interval', $.trim($interval.val()));
            localStorage.setItem('is_online--enabled', $enabled.is(":checked"));
            alert('Settings saved');
        };

        /**
         * Update last ping timestamp
         * @return void
         */
        function updateHeartbeat(expires_on) {
            $heartbeat.html(getDateTime());
            $heartbeat.prop('title', 'Expires: ' + expires_on);
        };

        /**
         * Get date time
         * @return string
         */
        function getDateTime() {
            var now = new Date();
            return [
                [AddZero(now.getDate()), AddZero(now.getMonth() + 1), now.getFullYear()].join("/"), [AddZero(now.getHours()), AddZero(now.getMinutes())].join(":"), now.getHours() >= 12 ? "PM" : "AM"
            ].join(" ");
        };

        /**
         * Add a 0 for single-digit date/time values
         * @param int
         * @return string
         */
        function AddZero(num) {
            return (num >= 0 && num < 10) ? "0" + num : num + "";
        };

        return {
            init: function() {
                getSettings();
                saveSettings();

                if ($enabled.is(":checked")) {
                    sendHeartBeat();
                    performCPR();
                }
            }
        };
    }();

    $(document).ready(function() {

        App.init();
    });

})(jQuery);