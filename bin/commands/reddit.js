module.exports.run = async (bot, message, args) => {
    const v = require("../vars.js")
    const i = require("../index.js")
    
    //checks for nsfw channel, if the user provided a sub and a sort and if not sets it to random and sets the counter to 0 for later message checks
    if (!message.channel.nsfw) return message.channel.send("🔞 You have to use this in a nsfw channel!");
    var subreddit = args[0] || "random";
    var sort = args[1] || "random";
    var counter = 0;

    //adds r/ if t is not in the message
    if (!subreddit.toLowerCase().startsWith("r/")) {
      var subreddit = "r/" + subreddit
    }

    try {
      var { body } = await v.superagent
      .get('https://www.reddit.com/' + subreddit + '/' + sort + '.json')
  
      //posts loading message
      const msg = await message.channel.send("`Searching in " + sort + " from " + subreddit + "...`")

      //Randomizer made by https://github.com/NotAWeebDev/Misaki/blob/master/commands/fun/reddit.js
      let post;
      try {
        if (body[0]) {
            post = body[0].data.children[Math.floor(Math.random() * body[0].data.children.length)].data;
          } else {
            post = body.data.children[Math.floor(Math.random() * body.data.children.length)].data;
        }
      } catch (err) {
        msg.edit("Nothing found!");
        return;
      }
      //Randomizer end
  
      //adds an :over18: emoji to the title if it is marked as nsfw
      var over18 = ""
      if (post.over_18) { var over18 = "🔞 "; }
  
      //checks if no thumbnail is being provided to prevent errors, checks for missing post description and if the title length is above the embed limit
      msg.edit("`Getting data from reddit...`")
      if (post.thumbnail == "self") { var thumbnail = null } else { var thumbnail = post.thumbnail; }
      if (post.selftext == "") { var selftext = "No Description." } else { var selftext = post.selftext }
      if (post.title.length >= 250) { var title = post.title.substring(0, 250) + '...' } else { var title = post.title }
  
      msg.edit("`Loading message...`")
      //Calculates date
      var posted = (v.d() - new Date(post.created_utc * 1000)) / 60000;
      if (posted > 525949) {
        var posted = v.round(posted / 525949, 0) + " year(s)"
      } else if (posted > 43829) {
        var posted = v.round(posted / 43829, 0) + " month(s)"
      } else if (posted > 1440) {
        var posted = v.round(posted / 1440, 0) + " day(s)" 
      } else if (posted > 60) { 
        var posted = v.round(posted / 60, 0) + " hour(s)" 
      } else { 
        var posted = v.round(posted, 0) + " min"
      }
  
      //gets one random color for all messages if more than one is being send and sets the additional info to the description
      var color = v.randomhex();
      var description = "\n\nPosted by: `" + post.author + "` " + posted + " ago\nSubreddit: `" + post.subreddit_name_prefixed + "` with `" + post.subreddit_subscribers + "` subscribers\n" + post.score + " upvotes\n" + post.num_comments + " comments\n[Link [Click me]](https://reddit.com" + post.permalink + ")" 
  
      //if the description is short enough for one message then post it directly without splitting it up
      if (selftext.length < 1800) { //using 1800 because of the additional description
        await msg.edit({embed:{
          title: over18 + title,
          url: `https://reddit.com${post.permalink}`,
          image: {
              url: thumbnail
          },
          description: selftext + description,
          color: color,
          footer: {
              icon_url: message.author.displayAvatarURL,
              text: `Requested by ${message.author.username}`
          },
          timestamp: message.createdAt
        }})
        return;
      }
      
      var textbeensend = 0;

      //splits the description up into few messages and checks for first and last message to add title and footer
      for(let i = 0; i < selftext.length; i += 1800) {
          var counter = counter + 1;
          const texttosend = selftext.substring(i, Math.min(selftext.length, i + 1800));

          if (counter == 1) {
            //edit loading msg with title
            msg.edit({embed:{
              title: over18 + title,
              url: `https://reddit.com${post.permalink}`,
              description: texttosend,
              color: color
            }})
            var textbeensend = texttosend.length;
          } else {
            if (texttosend.length >= textbeensend) {
              //post new message without footer and without title
              message.channel.send({embed:{
                description: texttosend,
                color: color
              }})
              var textbeensend = texttosend.length;
            } else {
              //post new message with footer but without title
              await message.channel.send({embed:{
                image: {
                    url: thumbnail
                },
                description: texttosend + description,
                color: color,
                footer: {
                    icon_url: message.author.displayAvatarURL,
                    text: `Requested by ${message.author.username}`
                },
                timestamp: message.createdAt
              }})
          }}
      }
    
      } catch (err) {
          console.log("Reddit Error: " + err + "\n")
          message.channel.send("Reddit Error: " + err)
      }
  }
  
  module.exports.config = {
      command: "reddit"
  }
