const http = require("http"),
    express = require("express"),
    cookies = require("cookies"),
    cookieParser = require("cookie-parser"),
    expressSanitizer = require("express-sanitizer"),
    methodOverride = require("method-override"),
    bodyParser = require("body-parser"),
    DiscordOauth2 = require("discord-oauth2"),
    oauth = new DiscordOauth2(),
    Base64 = require("js-base64").Base64,
    axios = require('axios'),
    dotenv = require("dotenv"),
    querystring = require('querystring'),
    loggedCommands = require('./schemas/loggedCommands'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    {fetch, update} = require('./helpers'),
    dashboard = require('./controllers/dashboard')

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config();

const clientID = process.env.client_id;
const redirectUri = process.env.redirectUri;
const guildRedirectUri = process.env.guildRedirectUri;
const apiURL = process.env.apiURL;
const apiKey = process.env.apiKey;
const apiUser = process.env.apiUser;

mongoose.connect(process.env.db, { useNewUrlParser: true, useUnifiedTopology: true }).then(db => {
    console.log(`[Argon-Web] Loaded database.`)
})

const client_secret = process.env.client_secret;
const authURL = `https://discordapp.com/api/oauth2/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(process.env.redirectUri)}&response_type=code&scope=identify%20guilds`;

const app = express();
const server = http.Server(app);

app.set("view engine", "ejs");
app.use('/assets', express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(cookies.express(["normies big gay"]));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.enable("trust proxy");
app.use(methodOverride("_method"));
app.use(session({
    secret: 'Argon',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https')
            res.redirect(`https://${req.header('host')}${req.url}`)
        else
            next()
    })
}

app.use((req, res, next) => {
    res.set('Content-Language', 'en-us');
    next();
});

// RANK CARD COLOR MIDDLEWARE

app.use(async (req, res, next) => {
    let token = req.cookies.get("access_token");
    if (token) {
        let user = await oauth.getUser(token).catch(err => { return res.redirect("/logout"); });
        if(!user) { return res.redirect("/logout"); }
        let botUser = await fetch({ type: "users/fetch", id: user.id }).catch();
        if (user && botUser) res.locals.rankCardColor = botUser ? botUser.settings.colors.rankcard : "#136db5"; 
        else {res.locals.rankCardColor = undefined}
    }
    return next();
});


app.get("/", async (req, res) => {
    let token = req.cookies.get("access_token");
    if (token) {
        let user = await oauth.getUser(token).catch(err => res.redirect(authURL))
        res.render("index", { title: "Home", css: "index", user: user, authURL: authURL });
    } else {
        res.render("index", { title: "Home", css: "index", authURL: authURL });
    }
});

app.get("/support", async (req, res) => {
    let token = req.cookies.get("access_token");
    if (token) {
        let user = await oauth.getUser(token).catch(err => res.redirect(authURL))
        res.render("support", { title: "Support", css: "support", user: user, authURL: authURL });
    } else {
        res.render("support", { title: "Support", css: "support", authURL: authURL });
    }
});

// ===================
// Profile Routes
// ===================

app.get("/profiles/:id", async (req, res) => {
    let token = req.cookies.get("access_token");
    let botUser = await fetch({ type: "users/fetch", id: req.params.id }).catch(console.error)
    let leaderboardData = await fetch({ type: `users`, id: req.params.id, action: "leaderboard" }).catch(console.error)
    let commandLog = botUser.settings.commandLog
    if (token) {
        let user = await oauth.getUser(token).catch(err => res.redirect(authURL))
        if (typeof botUser !== undefined && !botUser.error) return res.render("profile", { title: `${botUser.username}'s Profile`, css: "profile", user: user, authURL: authURL, fetchedProfile: botUser, commandLog: commandLog, stats: leaderboardData });
        return res.render("404", { title: "Not Found", css: "404", user: user, authURL: authURL })
    } else {
        if (typeof botUser !== undefined && !botUser.error) return res.render("profile", { title: `${botUser.username}'s Profile`, css: "profile", authURL: authURL, fetchedProfile: botUser, commandLog: commandLog, stats: leaderboardData });
        return res.render("404", { title: "Not Found", css: "404", authURL: authURL })
    }
});

app.post("/profiles/:id", loggedIn, async (req, res) => {
    let token = req.cookies.get("access_token");
    let user = await oauth.getUser(token).catch(console.error);
    if (user.id === req.params.id) {
        let medias = Object.keys(req.body.socialMedia);
        for (var i = 0; i < medias.length; i++) {
            if (req.body.socialMedia[medias[i]] === "" || req.body.socialMedia[medias[i]] === " ") {
                req.body.socialMedia[medias[i]] = null;
            }
            req.body.socialMedia[medias[i]] = req.sanitize(req.body.socialMedia[medias[i]]);
        }
        if (req.body.profile.description === "" || req.body.profile.description === " ") {
            req.body.profile.description = null;
        }
        req.body.profile.description = req.sanitize(req.body.profile.description);
        await update({ type: "users", id: req.params.id }, { settings: { socialMedia: req.body.socialMedia, description: req.body.profile.description } })
        res.redirect(`/profiles/${req.params.id}`);
    } else {
        res.redirect(`/profiles/${req.params.id}`);
    }
});

// ===============
// Leaderboard(s)
// ===============

app.get("/leaderboards/:id", async (req, res) => {
    let guild = await fetch({ type: "guilds", id: req.params.id });
    let token = req.cookies.get("access_token");
    if (guild.error) {
        console.log(guild.error);
        return res.redirect(`/`);
    }
    // Fetch leaderboard
    let leaderboard = await fetch({ type: "guilds", id: req.params.id, action: "leaderboard" });
    if (!leaderboard) {
        return res.redirect('/')
    }
    // Check for oauth token
    if (token) {
        let user = await oauth.getUser(token).catch(err => res.redirect(authURL));
        res.render("leaderboard", { title: `Leaderboard for ${guild.name}`, css: "leaderboard", guild: guild, data: leaderboard, authURL: authURL, user: user });
    } else {
        res.render("leaderboard", { title: `Leaderboard for ${guild.name}`, css: "leaderboard", guild: guild, data: leaderboard, authURL: authURL });
    }
});

// ================
// Dashboard Routes
// ================

app.get("/dashboard", loggedIn, dashboard.index);

app.get("/dashboard/:id", loggedIn, authorized, dashboard.getGuild);

app.get("/dashboard/:id/leaderboard", loggedIn, authorized, dashboard.getLeaderboard);

app.get("/dashboard/:id/commands", loggedIn, authorized, dashboard.getCommands);

app.post("/dashboard/:id/commands", loggedIn, authorized, dashboard.postCommands);

app.get("/dashboard/:id/tickets", loggedIn, authorized, dashboard.getTickets);

app.get("/dashboard/:id/tickets/:tid", loggedIn, authorized, dashboard.getTicket);

app.get("/dashboard/:id/:module", loggedIn, authorized, dashboard.getModule);

app.post("/dashboard/:id/:module", loggedIn, authorized, dashboard.postModule);

// ==============
// Rank Card POST
// ==============

app.post("/users/:id/settings", loggedIn, async (req, res) => {
    if (!req.body) {
        return res.status(400);
    }
    let token = req.cookies.get("access_token");
    let user = await oauth.getUser(token);
    if (user.id === req.params.id) {
        let settings = { settings: req.body.settings }
        await update({ type: "users", id: req.params.id }, settings);
        return res.status(200);
    }
    res.status(401).json({ error: "User ID didn't match token's ID." });
});

// ====
// AUTH
// ====

app.get("/login", async (req, res) => {
    let token = await oauth.tokenRequest({
        clientId: clientID,
        clientSecret: client_secret,

        code: req.query.code,
        scope: "identify guilds",
        grantType: "authorization_code",

        redirectUri: redirectUri
    }).catch(console.error);
    req.cookies.set("access_token", token.access_token, { expires: token.exires_in });
    req.cookies.set("refresh_token", token.refresh_token)
    res.redirect("/");
});

app.get("/guildAuth", async (req, res) => {
    res.redirect(`/dashboard/${req.query.guild_id}`);
});

app.get("/logout", (req, res) => {
    let token = req.cookies.get("access_token");
    req.cookies.set("access_token");
    req.cookies.set("refresh_token");
    const credentials = Base64.encode(`${clientID}:${client_secret}`);
    oauth.revokeToken(token, credentials).catch();
    res.redirect("/");
});

// ===
// 404
// ===

app.get("*", async function notFound(req, res) {
    let token = req.cookies.get("access_token");
    if (token) {
        let user = await oauth.getUser(token).catch(err => res.redirect(authURL))
        res.render("404", { title: "Not Found", css: "404", user: user, authURL: authURL });
    } else {
        res.render("404", { title: "Not Found", css: "404", authURL: authURL });
    }
});

// PAYMENT/CHECKOUT
app.post("/subscriptions/update", (req, res) => {
    // check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json({ error: 'Missing Authorization Header' });
    }

    // verify auth credentials
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    if (username === apiUser && password === apiKey) {
        if (req.body.list) {
            req.body.list.forEach(async item => {
                checkSubscription(item);
            });
        } else {
            checkSubscription({ event: req.body });
        }

        async function checkSubscription(item) {
            let data = { statuses: {} };
            // Check for new sub
            if (item.event.event_type === ("subscription_created" || "subscription_reactivated" || "subscription_resumed" || "subscription_activated")) {
                if (item.event.content.subscription.plan_id === "supporter") data.statuses.supporter = true;
                await update({ type: "users", id: item.event.content.customer.cf_discord_id }, { settings: data })
            }
            // Check for cancelled sub
            if (item.event.event_type === ("subscription_cancelled" || "subscription_deleted" || "subscription_paused")) {
                if (item.event.content.subscription.plan_id === "supporter") data.statuses.supporter = false;
                await update({ type: "users", id: item.event.content.customer.cf_discord_id }, { settings: data })
            }
        }

        res.status(200).json({ message: "Database updated" });
    }
});


// =======================
// Production Error Hander
// =======================

// app.use(async (err, req, res, next) => {
//   let token = req.cookies.get("access_token");
//   if (token) {
//     let user = await oauth.getUser(token).catch(err => res.redirect(authURL))
//     res.render("404", { title: "Not Found", css: "404", user: user, authURL: authURL });
//   } else {
//     res.render("404", { title: "Not Found", css: "404", authURL: authURL });
//   }
// });

function loggedIn(req, res, next) {
    let token = req.cookies.get("access_token");
    if (!token) {
        res.redirect(authURL)
    } else {
        next();
    }
}

async function authorized(req, res, next) {
    let token = req.cookies.get("access_token");
    let guilds = await oauth.getUserGuilds(token);
    let guild = guilds.filter(g => g.id === req.params.id)[0]
    if (!guild) return res.redirect('/dashboard');
    if (guild && (guild.permissions & 0x20) == 0x20) {
        return next();
    }
    return res.redirect('/dashboard');
}

app.listen(process.env.PORT || 8080, function () {
    console.log(`[Argon-Web] Web server is listening!`)
});