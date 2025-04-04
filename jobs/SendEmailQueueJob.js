import { Queue,Worker } from "bullmq";
import { redisConnection } from "../config/queue.js";
import logger from "../config/logger.js";
import { sendEmail } from "../config/mailer.js";
export const EmailQueueName = "email-queue"
export const emailQueue = new Queue(EmailQueueName,{
    connection:redisConnection,
    defaultJobOptions:{
        delay:5000,
        removeOnComplete:{
            count:100,
            age:60*60*24
        },
        attempts:3,
        backoff:{
            type:"exponential",
            delay:1000
        },
        removeOnFail:{
            count:1000
        }
    }
});

// Workers
export const handler = new Worker(EmailQueueName,async(job)=>{
    console.log("The email worker data is ", job.data);
    const data = job.data;
    data?.map(async(item)=>{
        await sendEmail(item.toEmail,item.subject,item.body)
    })
},{
    connection:redisConnection
})


//worker listeners
handler.on("completed",(job)=>{
    logger.info({job:job,message:"Job completed"})
    console.log(`The Job ${job.id} is completed`)

})


handler.on("failed",(job)=>{
     logger.error({job:job,message:"Job failed"})
    console.log(`The Job ${job.id} is failed`)
})
