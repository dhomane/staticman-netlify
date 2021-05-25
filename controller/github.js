const { Octokit } = require("@octokit/rest");
const { createOAuthAppAuth } = require("@octokit/auth-oauth-app");

const GITHUB_APP_CLIENT_ID = "bc27cd2859301269f316";
const GITHUB_APP_CLIENT_SECRET = "ba80e0ea48ef84185e34e579e2724eea9c01142f";

module.exports = (originalFunction) => {
  return async (req, res, next) => {
    try {
      const code = req.params.code;
      console.log(code)
      const userEmail = await processGitHub(code);
      req.body.fields.name = userEmail.name;
      req.body.fields.email = userEmail.email;
      req.body.fields.avatar = userEmail.avatar;
      return originalFunction.call(this, req, res, next);
    } catch (e) {
      console.log(e)
      next(e);
    }
  };
}


const processGitHub = async (code) => {
  async function getToken(code) {
    const auth = createOAuthAppAuth({
      clientId: GITHUB_APP_CLIENT_ID,
      clientSecret: GITHUB_APP_CLIENT_SECRET
    });
    return await auth({
      type: "token",
      code: code,
    });
  }

  const getUser = async (token) => {
    const octokit = new Octokit({
      auth: token
    });
    const processUserEmail = (user, emails) => {
      let name = user.data.name || user.data.login
      let avatar = user.data.avatar_url
      let email = emails.data.find(el => {
        return el.primary == true
      }).email
      return { name: name, email: email, avatar: avatar }
    }
    const user = await octokit.request("/user")
    const emails = await octokit.request("/user/emails")
    return processUserEmail(user, emails)
  }

  const doIt = async () => {
    const token = await getToken(code)
    return await getUser(token.token)
  }
  return await doIt()
}