module.exports = {
    "extends": [ "standard", "standard-react" ],
    "globals": {
      "React": true
    },
    "ecmaFeatures": {
      "jsx": true
    },
    "plugins": [
      "react"
    ],
    "env": {
      "browser": true
    },
    "rules": {
      "react/jsx-filename-extension": [
        1,
        {
          "extensions": [".js", ".jsx"]
        }
      ],
      "react/prop-types": [ 1 ],
      "react/jsx-uses-react": "error"
    },

};
