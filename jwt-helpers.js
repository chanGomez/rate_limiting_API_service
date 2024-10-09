const jwt = require("jsonwebtoken");
//rename this function? -- Khalid
function jwtTokens({ id, name, email }) {
  const user = { id, name, email };
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30d",
  });
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
}

module.exports = jwtTokens;
