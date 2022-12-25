# Note
(If you prefer English Language, Please Use [fca-horizon-remake](https://npmjs.com/package/fca-horizon-remake), Make By Kanzu Wakazaki)

## Abiso!
Tandaan! Ito ay isang Horizon Remake na Produkto (Sa pamamagitan ng Facebook-Chat-Api ni Schmavery, Hindi Responsable ang May-akda!), Kung May Error, Subukang Gumamit ng Ibang Produkto!

## Suporta Para sa :

+ Suportahan ang English, Vietnamese, Filipino !,
+ Lahat ng bot kung gumagamit muna ng listenMqtt.

# Api ChatBot Messenger

Ang Facebook ay Mayroon Na At Para sa Mga Gumagamit Upang Gumawa ng Api Para sa Mga Chatbot Sa => [Dito](https://developers.facebook.com/docs/messenger-platform).

### Ang Api na Ito ay Maaring Magbayad sa Iyo ng Acc na Hindi Mo Nararanasan, Mangyaring Bigyang-pansin=))

Tandaan! Kung Gusto Mong Ipadala Itong Api Tingnan Ang Dokumento Sa [Dito](https://github.com/Schmavery/facebook-chat-api).

## I-download

Kung Gusto Mo Ito Gamitin, I-download Ito Sa pamamagitan ng:
```bash
npm i fca-tanjiro-remake
```
o
```bash
npm install fca-tanjiro-remake
```

Maglo-load Ito Sa node_modules (Your Lib) - Ang Note Replit ay Hindi Magpapakita Kahit Saan Mahanap 😪

### I-download ang Pinakabagong Bersyon O Update

Kung Gusto Mong Gamitin Ang Pinakabagong Bersyon O Update Pagkatapos Pumunta Sa Terminal O Command Prompt Enter:
```bash
npm install fca-tanjiro-remake@latest
```
O kaya
```bash
npm i fca-tanjiro-remake@latest
```

## Kung Gusto Mong Subukan ang Api

Mga Benepisyo Para Dito Hindi Ka Maggugugol ng Oras sa Pagbayad ng Acc At Magkaroon Ng Acc
Gamitin ito sa isang Demo Account => [Facebook Whitehat Accounts](https://www.facebook.com/whitehat/accounts/).

## Gumagamit

```javascript
const login = require("fca-tanjiro-remake"); // kunin mo sa lib

// log in
login({email: "Gmail Account", password: "Facebook Password"}, (err, api) => {

    if(err) return console.error(err); // error case

    // lumikha ng mga bot na awtomatikong kinokopya ka:
    api.listenMqtt((err, message) => {
        api.sendMessage(message.body, message.threadID);
    });

});
```

Bilang resulta, kokopyahin ka nito tulad ng ipinapakita sa ibaba:
<img width="517" alt="screen shot 2016-11-04 at 14 36 00" src="https://cloud.githubusercontent.com/assets/4534692/20023545/f8c24130-a29d-11e6-9ef7-47568bdbc1f2.png">

Kung Gusto Mo ng Masusing Paggamit Pagkatapos Gamitin Ang Mga Bot na Nakalista sa Itaas!

## Listahan

Mababasa Mo ang Buong Api Sa => [dito](DOCS.md).

## Mga Setting Para sa Mirai:

Kailangan Mong Pumunta sa Mirai.js File, Pagkatapos Hanapin Ang Linya
```js
    var login = require('fca-horizon-remake'); 
    /* Maaring :
        var login = require('@maihuybao/fca-Unofficial');
        var login = require('fca-xuyen-get');
        var login = require('fca-unofficial-force');
    ...   
    */
```

At Palitan Ito Ng:

```js
    var login = require('fca-tanjiro-remake');
```

Tapos Run As Normal lang!

## Sariling pag-aaral

Kung Gusto Mong Magsaliksik O Gumawa ng Iyong Sariling Bot Pagkatapos, Pumunta Dito Basahin Ang Pag-andar Nito At Paano Ito Gamitin=> [Link](https://github.com/Schmavery/facebook-chat-api#Unofficial%20Facebook%20Chat%20API)

------------------------------------

### I-save ang Impormasyon sa Pag-login.

Para I-save Kailangan Mo ng 1 Apstate Type (Cookie, etc,..) Para I-save O Gamitin ang Login Code Tulad ng Nasa Itaas Upang Mag-login!

At Ang Mode na Ito ay Magagamit Sa Ilang Bot Sa Vietnam Para Makatitiyak Ka!

__Mga Tagubilin Sa Appstate__

```js
const fs = require("fs-extra");
const login = require("fca-tanjiro-remake");

var credentials = {email: "FB_EMAIL", password: "FB_PASSWORD"}; // fb information

login(credentials, (err, api) => {
    if(err) return console.error(err);
    // log in
    fs.writeFileSync('fbstate.json', JSON.stringify(api.getAppState(), null,'\t')); // fbstate.json or appstate.json
});
```

O Mas Madali (Propesyonal) Maaari Mong Gamitin => [c3c-fbstate](https://github.com/c3cbot/c3c-fbstate) Upang Kumuha ng Fbstate At Palitan ang Pangalan Upang Apstate Ay Gayundin ! (fbstate.json o appstate.json)

------------------------------------

## FAQ

FAQ => [Link](https://github.com/Schmavery/facebook-chat-api#FAQS)
