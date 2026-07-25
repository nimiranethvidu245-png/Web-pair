import mega from "megajs";
import fs from "fs";



const auth = {

    email:
    process.env.nimiranethvidu245@gmail.com,

    password:
    process.env.nimira@2009,


    userAgent:
    "Mozilla/5.0"

};





function upload(filePath, fileName){


    return new Promise(
    (resolve,reject)=>{


        try{


            const storage =
            new mega.Storage(
                auth,
                ()=>{


                    console.log(
                        "✅ Mega connected"
                    );



                    const uploadFile =
                    storage.upload({

                        name:fileName

                    });



                    fs.createReadStream(
                        filePath
                    )
                    .pipe(
                        uploadFile
                    );





                    uploadFile.on(
                    "complete",
                    (file)=>{


                        file.link(
                        (err,url)=>{


                            if(err){

                                storage.close();

                                return reject(err);

                            }



                            console.log(
                                "✅ Upload complete"
                            );



                            storage.close();



                            resolve(url);



                        });


                    });



                });


        }
        catch(err){


            reject(err);


        }


    });


}





export {
    upload
};
