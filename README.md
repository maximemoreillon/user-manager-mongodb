# User manager Mongoose
A user management system build around Mongoose

## API
| Route | Method | query/body | Description |
| --- | --- | --- | --- |
| /info | GET | - | Show application configuration |
| /users | GET | limit | Get the list of users |
| /users | POST | user properties | Creates a user. Mandatory properties are username (or email_address) and password |
| /users/{user_id} | GET | - | Get the user with the given user ID |
| /users/{user_id} | DELETE | - | Delete user with the given user ID |
| /users/{user_id} | PATCH | new user properties | Update user with the given user ID |
| /users/{user_id}/password | PUT | current password, new_password, new_password_confirm | Updatethe password of user with the given user ID |


## Environment variables
| Variable  | Description |
| --- | --- |
| MONGODB_URL | The URL of the MongoDB database |
| JWT_SECRET | Secret used to sign Tokens |
| ADMIN_PASSWORD | The default password for the administrator account, defaults to 'admin' |
