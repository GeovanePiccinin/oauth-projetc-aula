import "dotenv/config";
import session from "express-session";
import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";

/* atividade 1
 depois de instalar a dependência, importe-a: 
import { Strategy as GitHubStrategy } from "passport-github2";
*/

const app = express();

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

/* atividade 2
Lembre-se de configurar essas constantes com os 
valores obtidos no registro do app OAuth do github 

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
*/

/* não precisa alterar esse ponto */
/*função que verifica se está autenticado, pois, o passport inclui a
função isAuthenticated no request depois de autenticado */
const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("./login");
};

/* não precisa alterar esse ponto */
/* esta função é chamada pela lib passport quando a autenticação procede */
const authUser = (request, accessToken, refreshToken, profile, done) => {
  console.log("profile", profile);
  return done(null, profile);
};

//configura a estratégia de autenticação com o google
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/google/callback",
      passReqToCallback: true,
    },
    authUser
  )
);

/* atividade 3
configure a estratégia de autenticação com o github
chame aqui a função do passport.use... utilizando o código acima como referência.

Os pontos que mudam são:

"new GoogleStrategy" agora deve ser "new GitHubStrategy"
clientID e secretID devem apontar para as contantes referentes ao github
callbackURL apontar para: "http://localhost:3000/github/callback"

Exemplo:

passport.use(
  "aqui deve ser o nome da estratégia" (
    {
      clientID: "constante com o ID",
      clientSecret: "constante com o secret",
      callbackURL: "http://localhost:3000/github/callback",
      passReqToCallback: true,
    },
    authUser
  )
);

*/

/* não precisa alterar esse ponto */
/* função usada pelo passport para colocar os objetos no request */
passport.serializeUser((user, done) => {
  done(null, user);
});

/* não precisa alterar esse ponto */
/* função usada pelo passport para acessar objetos do request */
passport.deserializeUser((user, done) => {
  done(null, user);
});

/* não precisa alterar esse ponto */
app.get("/", (req, res) => {
  res.render("pages/index.ejs");
});

/* não precisa alterar esse ponto */
app.get("/login", (req, res) => {
  res.render("pages/login.ejs");
});

/* não precisa alterar esse ponto */
//chama a função de logout colocada pelo passport no request
app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

/* não precisa alterar esse ponto */
app.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

/* atividade 4 */
/* seguindo o código acima como exemplo defina o endpoint que irá começar
o processo de autenticação com o github 

Exemplo:

onde está "nome_do_serviço", troque para github

app.get("/nome_do_serviço", passport.authenticate("nome_do_serviço", { scope: ["user:email"] }));

*/

/* não precisa alterar esse ponto */
app.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/google/profile",
    failureRedirect: "./login",
  })
);

/* atividade 5 - define a url de callback que irá receber o token de autenticação
de volta do provedor de autenticação, fazendo com que o passport identifique que
está autenticado.

use o código acima como referência para implementar essa função.

Exemplo:

app.get(
  "/github/callback", //url que recebe o retorno do provedor de identidade
  passport.authenticate("github", {
    successRedirect: "/github/profile",  //caso sucesso, redireciona para profile
    failureRedirect: "./login", //caso falha, redireciona para login
  })
);

*/

app.get("/google/profile", checkAuthenticated, (req, res) => {
  console.log("user", req.user);

  res.render("pages/profile.ejs", {
    name: req.user.displayName,
    pic: req.user.picture,
    email: req.user.emails[0].value,
    profile: "google",
  });
});

/* atividade 6 
implemente a rota que redireciona para a página de perfil passando as variáveis
recebidas do servidor de identidade para serem exibidas na tela.

utilize o código acima como referência para essa implementação.

Exemplo:

app.get("/github/profile", checkAuthenticated, (req, res) => {
  console.log("user", req.user); //imprime todas as variáveis retornadas pelo servidor de identidade

  res.render("pages/profile.ejs", {
    username: req.user.username, //passando p parâmetro username
    profileUrl: req.user.profileUrl, //passando o parâmetro profileURL
    profile: "github", //passando o parâmetro "github"
  });
});
*/

app.listen(3000, () => console.log("App is running "));
