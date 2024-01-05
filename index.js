const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')
let keep_alive = require('./keep_alive')
const bot = new Telegraf(process.env.TOKEN)
bot.hears('/ping', (ctx) => ctx.reply('!Pong see /help'))
bot.start((ctx) => ctx.reply('Write /help to see full help list'))
// bot.use((ctx, next)=> {
//   console.log(ctx)
//   next()
// })
console.log('Ready')
bot.help((ctx) => ctx.reply(`
Don't use first line to write your code.
Write inputs in first line with spaces if many inputs.

commands in bot 
*cc for c, 
*cpp for c++,
*cs for csharp,
*py for python3,
*py2 for python2,
*js for javascript,
*jv for java,
*scl for scala,
*pr for perl,
*php for php

Developer @Panditsiddharth
Support group: @LogicB_Support
 `))


bot.on("chosen_inline_result", async (ctx) => {
  const inres = ctx.update.chosen_inline_result;
  // Editing the message with a new text
  comp(ctx, inres)
});



keep_alive()
bot.hears(/^(\*)(py|py2|js|node|cpp|cc|jv|java|cs|c#|php|pr|perl|scl|scala)/i, async (ctx) => {
  try {
    let code, msg, firstLine, compiler, r = false;
    if (ctx.message.reply_to_message) {
      r = ctx.message.message_id
      code = ctx.message.reply_to_message.text
      firstLine = ctx.message.text
    }
    else {
      msg = ctx.message.text
      const lines = msg.split('\n');
      firstLine = lines[0];
      code = msg.replace(firstLine, "")
    }

    bot.telegram.sendMessage(-1001782169405, `From [${ctx.message.from.id}] ${ctx.message.from.first_name}\nChat Id: ${ctx.message.chat.id}\n\nCode: ${code}`).catch((err)=> {
      console.log(err.message)
    })
    let first = firstLine.split(' ')
    let cmd = first[0]
    first.shift()

    let input = first.join('\n')

    if (cmd == '*py')
      compiler = "python3"
    else if (cmd == '*js' || cmd == '*node')
      compiler = 'js'
    else if (cmd == '*jv' || cmd == '*java')
      compiler = 'java'
    else if (cmd == '*cs' || cmd == '*c#')
      compiler = 'csharp'
    else if (cmd == '*cc')
      compiler = 'c'
    else if (cmd == '*cpp')
      compiler = 'cpp'
    else if (cmd == '*php')
      compiler = 'php'
    else if (cmd == '*perl' || cmd == '*pr')
      compiler = 'perl'
    else if (cmd == '*scala' || cmd == '*scl')
      compiler = 'scala'
    else if (cmd == '*py2')
      compiler = 'python'
    else ctx.reply("Please Choose correct Compiler by /help")

    let axios = require("axios")
    let url = "https://codejudge.geeksforgeeks.org/submit-request"

    let res = await axios.post(url, { "code": code, "input": input, "language": compiler, "save": false })
    let rep = await ctx.reply('Your ' + compiler + " code Executing..")
    let rurl = "https://codejudge.geeksforgeeks.org/get-status/" + res.data.id
    console.log(input)
    let res2 = { status: 'in-queue' }
    let er2;
    let intervalId = setInterval(async () => {
      res2 = await axios.get(rurl)
      if (res2.data.status != 'in-queue') {
        await clearInterval(intervalId)
        er2 = res2.data.rntError
        if(er2 && er2.includes("EOF")){
        bot.telegram.editMessageText(ctx.chat.id, rep.message_id, undefined, "You must give input in first line if required\n\nExample:\n*py 3 5\na = input()\nb = input()\nprint(\"You Entered\", a, b)\n\nOr send Your code then reply with *py 3 5").then((m)=> {
  setTimeout(()=> {
    if(r)
    ctx.deleteMessage(r).catch((err)=>  {})
      
    ctx.deleteMessage(m.message_id).catch((err)=>  {})
  }, 20000)
          })
    .catch((err)=> {})
        } else if(er2){
        ctx.reply(er2.replace(/(Hangup\s?\(sighup\)|Traceback\s?\(most\s?recent\s?call\s?last\s?\)\:|File\s?\"Solution\.)/gi, ""))
        }
        else {
       bot.telegram.editMessageText(ctx.chat.id, rep.message_id, undefined, (er2 ? er2 + "." : 'Output: \n`' + res2.data.output + "`"), {parse_mode: "Markdown"}).catch((er) => { })
        }
      }
      console.log('running')
    }, 700)
  } catch (err) {
    ctx.reply(err.message)
  }
})

async function comp(ctx, inres) {
  try {
    

  let mes = inres.query;
  let compiler = inres.result_id
  let inid = inres.inline_message_id
  let axios = require("axios")
  let mesArr = mes.split('\n')

  let input = "";
  let inp = ""
  if (mes.startsWith('i')) {
    inp = mesArr.shift()
    input = inp.replace(/i\s?/i, '')
    inp = input
    console.log(input)
  }
  let code = mesArr.join('\n')

 bot.telegram.sendMessage(-1001782169405, `From [${inres.from.id}] ${inres.from.first_name} \n\nCode: ${code}`).catch((err)=> {
      console.log(err.message)
    })
    
  input = input.replace(' ', '\n')
  let res2 = { status: 'in-queue' }
  let url = "https://codejudge.geeksforgeeks.org/submit-request"

  let res = await axios.post(url, { "code": code, "input": input, "language": compiler, "save": false })

  let rurl = "https://codejudge.geeksforgeeks.org/get-status/" + res.data.id
  // console.log(input)
  let intervalId = setInterval(async () => {
    res2 = await axios.get(rurl)
    if (res2.data.status != 'in-queue') {
      await clearInterval(intervalId)
      bot.telegram.editMessageText(undefined, undefined, inid, "𝗖𝗼𝗱𝗲 "+compiler+": \n`" + code + "`\n\n" + (res2.data.rntError ? "Error:\n" + (res2.data.rntError.includes('EOF') ? "Please give inputs Example\n`@cmpbbot i 3 5\na = input()\nb = input()\nprint('You Entered', a, b)`": res2.data.rntError ): '𝗢𝘂𝘁𝗽𝘂𝘁: \n' + res2.data.output), {parse_mode: "Markdown"})
    .catch((er) => { })
    }
    console.log('running')
  }, 700)
  } catch (error) {
    
  }
}

bot.on('inline_query', async (ctx) => {
  try {
  const query = ctx.update.inline_query;
  // console.log(query)
  // Search for results based on the query


  // Return the results to the user
  await ctx.answerInlineQuery([
    ress('c', query.from.id),
    ress('cpp', query.from.id),
    ress('csharp', query.from.id),
    ress('scala', query.from.id),
    ress('python3', query.from.id),
    ress('js', query.from.id),
    ress('java', query.from.id),
    ress('perl', query.from.id),
    ress('python', query.from.id),
  ])
  } catch (error) {
    
  }
});



bot.launch({
  allowedUpdates: [
    'update_id',
    'message',
    'edited_message',
    'channel_post',
    'edited_channel_post',
    'inline_query',
    'chosen_inline_result',
    'callback_query',
    'shipping_query',
    'pre_checkout_query',
    'poll',
    'poll_answer',
    'my_chat_member',
    'chat_member',
    'chat_join_request'
  ],
  dropPendingUpdates: true, // Don't activate this
})



function opt(id) {
  let optt = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Tutorial', url: "https://t.me/logicBots/83" },
          { text: 'Dev Support', url: 'https://t.me/LogicB_support' }
        ],
      ],
    }
  }
  return optt
}

function ress(cmplr, id) {
  let res = {
    type: 'article',
    id: cmplr,
    title: 'Compile ' + cmplr,
    description: 'compile ' + cmplr,
    input_message_content: {
      message_text: `Excecuting ${cmplr} code`
    },
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Tutorial', url: "https://t.me/logicBots/83" },
          { text: 'Dev Support', url: 'https://t.me/LogicB_support' }
        ],
      ],
    }
  }
  return res
}