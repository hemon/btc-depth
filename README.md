DepthMonkey
===========

在火币网，Okcoin挂单页显示深度，请安装浏览器插件：  
Firefox  : GreaseMonkey  
Chrome : Tampermonkey

在下单页添加新脚本，复制粘贴Depth.js源代码，并启用。  
比如，在Okcoin的BTC挂单页 https://www.okcoin.com/trade/btc.do 启用深度显示，就去掉代码行前的双斜杠 ：  
```
// OkcoinBTC.update();   
OkcoinBTC.update();
```
