// ==UserScript==
// @name         PixelPlanet Captcha Solver
// @namespace    vermei
// @version      1.0
// @description  Solve PixelPlanet Captcha automatically
// @match        https://www.canvaspixel.net/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    function do_url_to_svg(url) {
        return fetch(url)
            .then(function(response) {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    return;
                }
                return response.text();
            })
            .catch(function(err) {
                console.log('Fetch Error :-S', err);
            });
    }

    function solveCaptcha() {
        const captchaElement = document.querySelector("#app > div.Alert.show > form > div > img");
        const url = captchaElement.src;
        const svgelement = do_url_to_svg(url);
        svgelement.then(function(svgData) {
            const postData = {
                data:[svgData]
            };

            fetch('https://hentinel-pixelplanet-captcha-preprocess.hf.space/api/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            })
            .then(function(response) {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    return;
                }
                response.json().then(function(data) {
                        const captchafield = document.querySelector("#app > div.Alert.show > form > input:nth-child(4)");
                        captchafield.value = data.data[0];
                        console.log(data.data[0]); // answer
                        const sendcaptcha = document.querySelector('#app > div.Alert.show > form > p:nth-child(6) > button:nth-child(2)');
                        sendcaptcha.click();
                    })
                });
            })
            .catch(function(err) {
                console.log('Fetch Error :-S', err);
            });
    };

    const observer = new MutationObserver(function(mutationsList, observer) {
        for (let mutation of mutationsList) {
            if (mutation.target.querySelector('img')) {
                solveCaptcha();
                observer.disconnect();
                break;
            }
        }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });

})();
