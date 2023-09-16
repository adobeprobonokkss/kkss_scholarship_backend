# kkss_scholarship_backend

# setup

# checks

- should be a config folder and defult.ts, Currently not in repo

- git clone -b https://github.com/adobeprobonokkss/kkss_scholarship_backend.git
- npm install package.json
- npm start

# How Backend is working :

- Currentyl backend is hosting to firebase (kumarp) - Update required
- OAtuh is also with kumarp - Update required
- On success Auth by google it will redirect to to authhandler controlleer in backend
- Oauth Handler will create json web token for verifying subsequent request,automatically attached the cookies to request
- Current accessToken expriry time is set to 15 mins
- Will have to validate json web token each time and if it has expired - Generate refersh token - Currently not implemented
- Cors Enabled alread Already

- Command to deploy backend:
  - yarn run deploy - will clean the dist folder and build the entire project (will not work on windows, Need to manually copy some file see cpsetup1 2 3)
  - yarn run start - will start server locally
    - Make sure for this you are chagning redirection URL in config and goolge console oauth as well and also chang the fronENd Url part
  -

#Nvm for node 16
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Known Issue

- Promotion of user will not be reflected in same session , user will have to logout and login again to seet the updated role
