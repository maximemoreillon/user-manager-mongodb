# User manager Mongoose
A user management system build around Mongoose

## API
| Route | Method | query/body | Description |
| --- | --- | --- | --- |
| / | GET | - | Show application configuration |
| /users | GET | limit | Get the list of users |
| /users | POST | user properties | Creates a user. Mandatory properties are username (or email_address) and password |
| /users/{user_id} | GET | - | Get the user with the given user ID. Use 'self' for user currently logged in |
| /users/{user_id} | DELETE | - | Delete user with the given user ID. Use 'self' for user currently logged in |
| /users/{user_id} | PATCH | new user properties | Update user with the given user ID. Use 'self' for user currently logged in |
| /users/{user_id}/password | PUT | current password, new_password, new_password_confirm | Update the password of user with the given user ID. Use 'self' for user currently logged in |
| /auth/login | POST | username, password | Login, returns a jwt |

## Environment variables
| Variable  | Description |
| --- | --- |
| MONGODB_URL | The URL of the MongoDB database |
| JWT_SECRET | Secret used to sign Tokens |
| ADMIN_USERNAME | The default username for the administrator account, defaults to 'admin' |
| ADMIN_PASSWORD | The default password for the administrator account, defaults to 'admin' |
