# User manager (MongoDB version)

[![pipeline status](https://gitlab.com/moreillon_ci/user_manager_mongoose/badges/master/pipeline.svg)](https://gitlab.com/moreillon_ci/user_manager_mongoose/-/commits/master)
[![coverage report](https://gitlab.com/moreillon_ci/user_manager_mongoose/badges/master/coverage.svg)](https://gitlab.com/moreillon_ci/user_manager_mongoose/-/commits/master)
![Docker Pulls](https://img.shields.io/docker/pulls/moreillon/user-manager-mongoose)
[![Artifact Hub](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/moreillon)](https://artifacthub.io/packages/search?repo=moreillon)

A user management and authentication microservice.

User data is stored in a MongoDB database and accessed using Mongoose.
Interaction with user records is achieved via a REST API, built using Express.

For more information, see this [Medium article](https://moreillon.medium.com/a-pluggable-user-management-and-authentication-service-for-web-applications-a6f23ae5816b)

## API

| Route                     | Method | query/body                                           | Description                                                                                 |
| ------------------------- | ------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| /                         | GET    | -                                                    | Show application configuration                                                              |
| /users                    | GET    | limit                                                | Get the list of users                                                                       |
| /users                    | POST   | user properties                                      | Creates a user. Mandatory properties are username (or email_address) and password           |
| /users/{user_id}          | GET    | -                                                    | Get the user with the given user ID. Use 'self' for user currently logged in                |
| /users/{user_id}          | DELETE | -                                                    | Delete user with the given user ID. Use 'self' for user currently logged in                 |
| /users/{user_id}          | PATCH  | new user properties                                  | Update user with the given user ID. Use 'self' for user currently logged in                 |
| /users/{user_id}/password | PUT    | current password, new_password, new_password_confirm | Update the password of user with the given user ID. Use 'self' for user currently logged in |
| /auth/login               | POST   | username, password                                   | Login, returns a jwt                                                                        |

## Environment variables

| Variable                  | Description                                                             |
| ------------------------- | ----------------------------------------------------------------------- |
| MONGODB_CONNECTION_STRING | The connection string for the MongoDB database                          |
| JWT_SECRET                | Secret used to sign Tokens                                              |
| ADMIN_USERNAME            | The default username for the administrator account, defaults to 'admin' |
| ADMIN_PASSWORD            | The default password for the administrator account, defaults to 'admin' |
| ALLOW_REGISTRATION        | Allows unregistered users to create an account                          |
| SMTP_HOST                 | Host of the SMTP server (only used for registration)                    |
| SMTP_PORT                 | PORT of the SMTP server (only used for registration)                    |
| SMTP_USERNAME             | Username for the SMTP server (only used for registration)               |
| SMTP_PASSWORD             | Password for the SMTP server (only used for registration)               |
| SMTP_FROM                 | E-mail from (only used for registration)                                |
