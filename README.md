
# User manager Mongoose

[![pipeline status](https://gitlab.com/moreillon_ci/user_manager_mongoose/badges/master/pipeline.svg)](https://gitlab.com/moreillon_ci/user_manager_mongoose/-/commits/master)
[![coverage report](https://gitlab.com/moreillon_ci/user_manager_mongoose/badges/master/coverage.svg)](https://gitlab.com/moreillon_ci/user_manager_mongoose/-/commits/master)
[![Artifact Hub](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/user-manager-mongoose)](https://artifacthub.io/packages/search?repo=user-manager-mongoose)

[![dockeri.co](https://dockeri.co/image/moreillon/user-manager-mongoose)](https://hub.docker.com/r/moreillon/user-manager-mongoose)


A user management and authentication microservice.

User data is stored in a MongoDB database and accessed using Mongoose.
Interaction with user records is achieved via a REST API, built using Express.

For more information, see this [Medium article](https://moreillon.medium.com/a-pluggable-user-management-and-authentication-service-for-web-applications-a6f23ae5816b)


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
| MONGODB_DB | The name of the DB to use, defaults to user_manager_mongoose |
| JWT_SECRET | Secret used to sign Tokens |
| ADMIN_USERNAME | The default username for the administrator account, defaults to 'admin' |
| ADMIN_PASSWORD | The default password for the administrator account, defaults to 'admin' |
| ALLOW_REGISTRATION | Allows unregistered users to create an account |
| SMTP_HOST | Host of the SMTP server (only used for registration) |
| SMTP_PORT | PORT of the SMTP server (only used for registration) |
| SMTP_USERNAME | Username for the  SMTP server (only used for registration) |
| SMTP_PASSWORD | Password for the SMTP server (only used for registration) |
| SMTP_FROM | E-mail from (only used for registration) |
