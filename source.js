// ==UserScript==
// @name       BtcDepth
// @namespace  http://www.hemono.com/
// @version    0.1
// @include     https://www.okcoin.com/trade/btc.do*
// @include     https://www.okcoin.com/trade/ltc.do*
// @include     https://www.huobi.com/trade/index.php
// @include     https://ltc.huobi.com/ltc/trade.php
// @copyright  2014+, hemono@gmail.com
// @grant      none
// ==/UserScript==

(function() {
    function Depth(options) {
        var i;
        for (i in options) {
            if (options.hasOwnProperty(i)) {
                this[i] = options[i];
            }
        }
    }
    
    Depth.prototype = {
        api : '',
        limit : 60,
        step : 5,
        interval : 1000,
        containner : '',
        depth : [],
        level : [],
        trim : function (data, limit) {
            var length = data.asks.length, 
                asks = [], 
                bids = [], 
                i = 0;
            limit = (limit>length ? length : limit);
            
            for (i = length-limit; i < length ; i++) {
                asks.push([parseFloat(data.asks[i][0]), parseFloat(data.asks[i][1])]);
            }
            for (i = 0; i < limit; i++ ) {
                bids.push([parseFloat(data.bids[i][0]), parseFloat(data.bids[i][1])]);
            }
            return {'asks':asks, 'bids':bids};
        },
        sum : function (data, step) {
            var length = data.asks.length,
                j = length/step,
                i = 0,
                asks = [],
                bids = [],
                sum = 0;
            
            for (i = length-1; i >= 0; i--) {
                sum += data.asks[i][1];
                if ( i % j == 0 ) {
                    asks.push([data.asks[i][0].toFixed(2), sum.toFixed(2)]);
                }
            }
    
            sum = 0;
            for (i = 1; i <= length; i++) {
                sum += data.bids[i-1][1];
                if ( i % j == 0 ) {
                    bids.push([data.bids[i-1][0].toFixed(2), sum.toFixed(2)]);
                }
            }
    
            return {'asks':asks, 'bids':bids};
        },
        update : function () {
            var $this = this;
            jQuery.ajax({
                url : $this.api,
                dataType : 'json',
                cache : false,
                success : function(data) {
                    $this.depth = $this.trim(data, $this.limit);
                    $this.level = $this.sum($this.depth, $this.step);
                    jQuery($this.containner).html($this.display($this.depth, $this.level));
                },
                complete : function() {
                    setTimeout(function(){
                        $this.update();
                    }, $this.interval);
                }
            });
        },
        display : function (depth, level) {
            var max_value = Math.max(level.asks[this.step-1][1], level.bids[this.step-1][1]),
                max_width = 80,
                tmp = 0,
                width = 0,
                i = 0,
                length = depth.asks.length,
                html = '<style>.orderlist .c-1{width:40%;padding-left:15px}.orderlist .c-2{display:inline-block;height:15px;margin:0 5px}.orderlist .center{text-align:center} .orderlist{margin:0;padding:0} .orderlist li span{display:inline-block} .orderlist li{margin: 0;padding: 0;list-style: none; line-height:30px;border-bottom:1px solid #e4e4e4}.orderlist .green{color: #4d9e33;}</style>'
                     + '<ul class="orderlist"><li class="borderbtm black"><span class="height-40 c-1 fontsize">价格/单量</span><span class="height-40 c-2 fontsize">深度</span></li>';
            for (i = length-this.step; i < length; i++) {
                tmp = level.asks.pop();
                width = tmp[1]/max_value * max_width;
                html += '<li class="red"><span class="c-1">'+depth.asks[i][0].toFixed(2)+' | '+depth.asks[i][1]+'</span>'+tmp[0]+'<span class="c-2" style="background:#ff0000;width:'+width+'px;"></span>'+tmp[1]+'</li>';
            }

            for (i = 0; i < this.step; i++) {
                tmp = level.bids.shift();
                width = tmp[1]/max_value * max_width;
                html += '<li class="green"><span class="c-1">'+depth.bids[i][0].toFixed(2)+' | '+depth.bids[i][1]+'</span>'+tmp[0]+'<span class="c-2" style="background:#068814;width:'+width+'px;"></span>'+tmp[1]+'</li>';
            }

            html += '<li class="center">'+(new Date()).toLocaleString()+'</li></ul>';
            return html;
        }
    };

    var Depths = {
        HoubiBTC : new Depth({
            url : 'https://www.huobi.com/trade/index.php',
            api : 'https://market.huobi.com/staticmarket/depth_btc_json.js',
            limit : 50,
            step : 5,
            interval : 1000,
            containner : '.unit-delegation-co'
        }),
        HuobiLTC : new Depth({
            url : 'https://ltc.huobi.com/ltc/trade.php',
            api : 'https://market.huobi.com/staticmarket/depth_ltc_json.js',
            limit : 50,
            step : 5,
            interval : 1000,
            containner : '.unit-delegation-co'
        }),
        OkcoinBTC : new Depth({
            url : 'https://www.okcoin.com/trade/btc.do',
            api : 'https://www.okcoin.com/api/depth.do?symbol=btc_cny',
            limit : 50,
            step : 5,
            interval : 1000,
            containner : '.buybtcbody2'
        }),
        OkcoinLTC : new Depth({
            url : 'https://www.okcoin.com/trade/ltc.do',
            api : 'https://www.okcoin.com/api/depth.do?symbol=ltc_cny',
            limit : 50,
            step : 5,
            interval : 1000,
            containner : '.buybtcbody2'
        })
    };
    
    for ( var i in Depths ) {
        if ( location.href.indexOf(Depths[i].url) == 0 ) {
            Depths[i].update();
            break;
        }
    }
}());

