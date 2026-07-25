import express from "express";
import fs from "fs";
import pino from "pino";

import {
    makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    jidNormalizedUser,
    fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";

import pn from "awesome-phonenumber";
import { upload } from "./mega.js";


const router = express.Router();



function removeFile(filePath){

    try{

        if(fs.existsSync(filePath)){

            fs.rmSync(
                filePath,
                {
                    recursive:true,
                    force:true
                }
            );

        }

    }
    catch(err){

        console.log(
            "Remove error:",
            err
        );

    }

}




function getMegaFileId(url){

    try{

        const parts =
        url.split("/file/");


        if(parts[1]){

            return parts[1]
            .replace("/","");

        }


        return null;

    }
    catch{

        return null;

    }

}





router.get("/", async(req,res)=>{


    let num = req.query.number;



    if(!num){

        return res.status(400).send({

            code:
            "Phone number required"

        });

    }




    let dirs =
    "./session_" + num;




    await removeFile(dirs);



    num =
    num.replace(
        /[^0-9]/g,
        ""
    );



    const phone =
    pn("+" + num);



    if(!phone.valid){

        return res.status(400).send({

            code:
            "Invalid phone number"

        });

    }




    num =
    phone.number
    .e164
    .replace("+","");







async function initiateSession(){



const {
    state,
    saveCreds
}
=
await useMultiFileAuthState(
    dirs
);




const {
    version
}
=
await fetchLatestBaileysVersion();





const NIMIRA_PAIR =
makeWASocket({

    version,

    auth:{

        creds:
        state.creds,

        keys:
        makeCacheableSignalKeyStore(
            state.keys,
            pino({
                level:"fatal"
            })
        )

    },


    logger:
    pino({
        level:"fatal"
    }),


    browser:
    Browsers.windows(
        "Chrome"
    ),


    printQRInTerminal:false,


    markOnlineOnConnect:false

});







NIMIRA_PAIR.ev.on(
"creds.update",
saveCreds
);







NIMIRA_PAIR.ev.on(
"connection.update",
async(update)=>{


const {
    connection,
    lastDisconnect
}
=
update;





if(connection==="open"){



console.log(
"✅ WhatsApp Connected"
);




try{


const credsPath =
dirs + "/creds.json";



const megaUrl =
await upload(

    credsPath,

    `NIMIRA_SESSION_${Date.now()}.json`

);



const sessionId =
getMegaFileId(
    megaUrl
);





console.log(
"MEGA:",
megaUrl
);



console.log(
"SESSION:",
sessionId
);





if(sessionId){


await NIMIRA_PAIR.sendMessage(

    jidNormalizedUser(
        num + "@s.whatsapp.net"
    ),

    {

        text:

`🤖 NIMIRA MD SESSION ID


${sessionId}


Copy this to:

SESSION_ID=`

    }

);


}

else{


console.log(
"❌ Session ID not generated"
);


}






await delay(2000);


removeFile(dirs);


process.exit(0);



}
catch(err){


console.log(
"Upload Error:",
err
);


removeFile(dirs);


process.exit(1);


}



}






if(connection==="close"){


console.log(
"Connection closed"
);



initiateSession();


}





});








if(!NIMIRA_PAIR.authState?.creds?.registered){


await delay(3000);



try{


let code =
await NIMIRA_PAIR.requestPairingCode(
    num
);



code =
code
.match(/.{1,4}/g)
.join("-");




if(!res.headersSent){


res.send({

    code

});


}





}
catch(err){


console.log(
"Pair code error:",
err
);



res.status(500).send({

code:
"Failed to generate pair code"

});


}



}




}




await initiateSession();



});






process.on(
"uncaughtException",
(err)=>{


console.log(
"Exception:",
err.message
);


});





export default router;
